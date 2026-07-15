import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  LOAD_TEST_PRESETS,
  loadTestRunRequestSchema,
  type LoadTestRunResult,
} from "@hr-ecom/shared";
import { requireSuperAdmin } from "../lib/auth";
import { isLoadTestMode } from "../lib/load-test";
import { badRequest, forbidden, ok } from "../lib/response";

/** Leave headroom under API Gateway's ~29s integration timeout. */
const MAX_WALL_MS = 22_000;
const FAIL_RATE_LIMIT = 0.01;
const P95_LIMIT_MS = 2000;

type StepTiming = { name: string; ms: number; status: number };

function resolveApiBase(event: APIGatewayProxyEventV2): string {
  const fromEnv = process.env.API_PUBLIC_URL?.trim() || process.env.API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const domain = event.requestContext?.domainName;
  const stage = event.requestContext?.stage;
  if (domain) {
    const proto =
      event.headers?.["x-forwarded-proto"] ||
      event.headers?.["X-Forwarded-Proto"] ||
      "https";
    if (stage && stage !== "$default") {
      return `${proto}://${domain}/${stage}`;
    }
    return `${proto}://${domain}`;
  }

  return "http://127.0.0.1:3001";
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const i = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[i]!;
}

async function runJourney(
  apiBase: string,
  session: string,
  categorySlug: string
): Promise<StepTiming[]> {
  const headers = {
    "X-Session-Id": session,
    "Content-Type": "application/json",
    "X-Load-Test": "1",
  };
  const times: StepTiming[] = [];

  const mark = async (name: string, fn: () => Promise<Response>) => {
    const t0 = Date.now();
    const res = await fn();
    const ms = Date.now() - t0;
    times.push({ name, ms, status: res.status });
    if (res.status >= 500) throw new Error(`${name} ${res.status}`);
    return res;
  };

  await mark("health", () => fetch(`${apiBase}/health`));
  await mark("categories", () => fetch(`${apiBase}/categories`, { headers }));
  const list = await mark("products", () =>
    fetch(`${apiBase}/products?category=${encodeURIComponent(categorySlug)}`, { headers })
  );
  const body = (await list.json().catch(() => ({}))) as { products?: { slug?: string }[] };
  const slug = body.products?.[0]?.slug;
  if (slug) {
    await mark("pdp", () => fetch(`${apiBase}/products/${encodeURIComponent(slug)}`, { headers }));
    await mark("cart_add", () =>
      fetch(`${apiBase}/cart/items`, {
        method: "POST",
        headers,
        body: JSON.stringify({ productSlug: slug, quantity: 1 }),
      })
    );
    await mark("cart_get", () => fetch(`${apiBase}/cart`, { headers }));
  }
  await mark("events", () =>
    fetch(`${apiBase}/events`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        events: [
          {
            type: "page_view",
            sessionId: session,
            path: "/products",
            at: new Date().toISOString(),
          },
        ],
      }),
    })
  );

  return times;
}

/**
 * Super-admin only: run a bounded concurrent shopper smoke against this API.
 * Not a full k6 1000-VU test — use scripts/load for that. Safe to trigger from Admin UI.
 */
export async function runLoadTest(event: APIGatewayProxyEventV2) {
  if (!requireSuperAdmin(event)) return forbidden("Super admin required");

  let body: unknown = {};
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = loadTestRunRequestSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const preset = parsed.data.preset;
  const defaults = LOAD_TEST_PRESETS[preset];
  const concurrency = Math.min(50, parsed.data.concurrency ?? defaults.concurrency);
  const loops = Math.min(3, parsed.data.loops ?? defaults.loops);
  const categorySlug = parsed.data.categorySlug?.trim() || "single-rakhi";
  const apiBase = resolveApiBase(event);
  const loadTestMode = isLoadTestMode();

  const started = Date.now();
  const allMs: number[] = [];
  let errors = 0;
  let journeys = 0;
  let truncated = false;
  const sampleErrors: string[] = [];

  // Quick reachability check
  try {
    const health = await fetch(`${apiBase}/health`, { signal: AbortSignal.timeout(5000) });
    if (!health.ok) {
      return badRequest(`API health check failed at ${apiBase} (${health.status})`);
    }
  } catch (err) {
    return badRequest(
      `API not reachable at ${apiBase}: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  for (let loop = 0; loop < loops; loop++) {
    if (Date.now() - started > MAX_WALL_MS) {
      truncated = true;
      break;
    }

    const batch = Array.from({ length: concurrency }, (_, i) => {
      const session = `admin-lt-${preset}-${loop}-${i}-${started}`;
      return runJourney(apiBase, session, categorySlug)
        .then((times) => {
          journeys += 1;
          for (const t of times) allMs.push(t.ms);
          return times;
        })
        .catch((err: unknown) => {
          errors += 1;
          const msg = err instanceof Error ? err.message : String(err);
          if (sampleErrors.length < 5) sampleErrors.push(msg);
          return [] as StepTiming[];
        });
    });

    await Promise.all(batch);
  }

  allMs.sort((a, b) => a - b);
  const planned = concurrency * loops;
  const failedRate = planned > 0 ? errors / planned : 1;
  const p50 = percentile(allMs, 50);
  const p95 = percentile(allMs, 95);
  const p99 = percentile(allMs, 99);
  const durationMs = Date.now() - started;
  const pass = !truncated && failedRate < FAIL_RATE_LIMIT && p95 < P95_LIMIT_MS;

  const result: LoadTestRunResult = {
    preset,
    concurrency,
    loops,
    apiBase,
    loadTestMode,
    durationMs,
    journeys,
    requestsApprox: allMs.length,
    errors,
    failedRate,
    p50,
    p95,
    p99,
    pass,
    truncated: truncated || undefined,
    sampleErrors: sampleErrors.length ? sampleErrors : undefined,
  };

  return ok({ result });
}

/** Super-admin: report whether payment/email stubs are active. */
export async function getLoadTestInfo(_event: APIGatewayProxyEventV2) {
  if (!requireSuperAdmin(_event)) return forbidden("Super admin required");
  return ok({
    loadTestMode: isLoadTestMode(),
    presets: LOAD_TEST_PRESETS,
    limits: { maxConcurrency: 50, maxLoops: 3, maxWallMs: MAX_WALL_MS },
    note: "Admin run is a bounded smoke. For ~1000 VU use scripts/load with k6 against staging.",
  });
}
