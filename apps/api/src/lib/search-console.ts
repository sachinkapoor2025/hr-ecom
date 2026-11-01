import { createSign } from "crypto";
import { readFileSync, existsSync } from "fs";
import type { GscPageMetric, GscQueryMetric } from "@hr-ecom/shared";

const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

const QUERY_FILTER =
  "(?i).*(rakhi|raksha|bhai[[:space:]]*dooj|bhaidooj|bhai[[:space:]]*duj|bhau[[:space:]]*beej|bhaiya[[:space:]]*dooj|diwali|deepavali).*";

const PAGE_FILTER =
  "(?i).*(rakhi|raksha|bhai-dooj|bhaiya-bhabhi|diwali|sweet-combo|dry-fruit|chocolate-combo|pooja-set|gifts-from-uk|gifts-from-canada|send-gifts-to).*";

export interface SearchConsoleReport {
  connected: boolean;
  siteUrl: string | null;
  error: string | null;
  queries: GscQueryMetric[];
  pages: GscPageMetric[];
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

let cachedToken: { token: string; exp: number } | null = null;

export function searchConsoleDateRange(days: number, now = new Date()): { startDate: string; endDate: string } {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - (days - 1));
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  return { startDate: iso(start), endDate: iso(end) };
}

function normalizePrivateKey(raw: string): string {
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

export function loadSearchConsoleServiceAccount(): ServiceAccount | null {
  const inline = process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS_JSON?.trim();
  if (inline) {
    try {
      const text = inline.startsWith("{")
        ? inline
        : existsSync(inline)
          ? readFileSync(inline, "utf8")
          : "";
      if (text) {
        const parsed = JSON.parse(text) as Partial<ServiceAccount>;
        if (parsed.client_email && parsed.private_key) {
          return {
            client_email: parsed.client_email,
            private_key: normalizePrivateKey(parsed.private_key),
          };
        }
      }
    } catch {
      return null;
    }
  }
  const email = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?.trim();
  const key = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.trim();
  if (!email || !key) return null;
  return { client_email: email, private_key: normalizePrivateKey(key) };
}

function siteCandidates(): string[] {
  const fromEnv = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.split(",")
    .map((value) => value.trim())
    .filter(Boolean) ?? [];
  const defaults = ["sc-domain:usarakhi.com", "https://www.usarakhi.com/", "https://usarakhi.com/"];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const site of [...fromEnv, ...defaults]) {
    if (seen.has(site)) continue;
    seen.add(site);
    out.push(site);
  }
  return out;
}

function base64url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

async function accessToken(account: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp > now + 60) return cachedToken.token;
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope: SEARCH_CONSOLE_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const unsigned = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(account.private_key).toString("base64url")}`;
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    signal: AbortSignal.timeout(15000),
  });
  const payload = (await response.json()) as { access_token?: string; error_description?: string; error?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || `Search Console auth failed (${response.status})`);
  }
  cachedToken = { token: payload.access_token, exp: now + 3600 };
  return payload.access_token;
}

interface AnalyticsRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

async function querySite(
  token: string,
  siteUrl: string,
  body: Record<string, unknown>
): Promise<{ ok: true; rows: AnalyticsRow[] } | { ok: false; status: number; message: string }> {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    rows?: AnalyticsRow[];
    error?: { message?: string };
  };
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: payload.error?.message || `Search Console query failed (${response.status})`,
    };
  }
  return { ok: true, rows: payload.rows ?? [] };
}

function toMetric(row: AnalyticsRow, key: string): { key: string; clicks: number; impressions: number; ctr: number; position: number } | null {
  if (!key) return null;
  const impressions = Number(row.impressions ?? 0);
  const clicks = Number(row.clicks ?? 0);
  return {
    key,
    clicks,
    impressions,
    ctr: Number(row.ctr ?? (impressions > 0 ? clicks / impressions : 0)),
    position: Number(row.position ?? 0),
  };
}

export async function fetchSearchConsoleReport(days: number, now = new Date()): Promise<SearchConsoleReport> {
  const account = loadSearchConsoleServiceAccount();
  if (!account) {
    return {
      connected: false,
      siteUrl: null,
      error: null,
      queries: [],
      pages: [],
    };
  }
  const range = searchConsoleDateRange(days, now);
  try {
    const token = await accessToken(account);
    let siteUrl: string | null = null;
    let lastError = "Search Console did not accept any configured property";
    let queryRows: AnalyticsRow[] = [];
    for (const candidate of siteCandidates()) {
      const result = await querySite(token, candidate, {
        startDate: range.startDate,
        endDate: range.endDate,
        dimensions: ["query"],
        rowLimit: 2500,
        dimensionFilterGroups: [
          { filters: [{ dimension: "query", operator: "includingRegex", expression: QUERY_FILTER }] },
        ],
      });
      if (result.ok) {
        siteUrl = candidate;
        queryRows = result.rows;
        break;
      }
      lastError = result.message;
      if (result.status !== 403 && result.status !== 404) break;
    }
    if (!siteUrl) {
      return { connected: false, siteUrl: null, error: lastError, queries: [], pages: [] };
    }
    const pageResult = await querySite(token, siteUrl, {
      startDate: range.startDate,
      endDate: range.endDate,
      dimensions: ["page"],
      rowLimit: 2500,
      dimensionFilterGroups: [
        { filters: [{ dimension: "page", operator: "includingRegex", expression: PAGE_FILTER }] },
      ],
    });
    const queries = queryRows
      .map((row) => toMetric(row, row.keys?.[0] ?? ""))
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .map((row) => ({
        query: row.key,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      }));
    const pages = (pageResult.ok ? pageResult.rows : [])
      .map((row) => toMetric(row, row.keys?.[0] ?? ""))
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .map((row) => ({
        page: row.key,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      }));
    return {
      connected: true,
      siteUrl,
      error: pageResult.ok ? null : pageResult.message,
      queries,
      pages,
    };
  } catch (error) {
    cachedToken = null;
    return {
      connected: false,
      siteUrl: null,
      error: error instanceof Error ? error.message : "Search Console request failed",
      queries: [],
      pages: [],
    };
  }
}
