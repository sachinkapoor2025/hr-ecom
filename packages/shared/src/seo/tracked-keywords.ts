/**
 * Occasion classification and Bhai Dooj / Diwali keyword tracking.
 * Rakhi queries stay in the storefront keyword sheet; this module adds the
 * other two festivals and joins either list to Search Console metrics.
 */

export const SEO_OCCASIONS = ["rakhi", "bhai-dooj", "diwali"] as const;
export type SeoOccasion = (typeof SEO_OCCASIONS)[number];

export const SEO_OCCASION_LABELS: Record<SeoOccasion, string> = {
  rakhi: "Rakhi",
  "bhai-dooj": "Bhai Dooj",
  diwali: "Diwali",
};

export type SeoKeywordPriority = "head" | "supporting";

export interface TrackedSeoKeyword {
  keyword: string;
  occasion: SeoOccasion;
  targetPath: string;
  priority: SeoKeywordPriority;
}

export interface GscMetricRow {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscQueryMetric extends GscMetricRow {
  query: string;
}

export interface GscPageMetric extends GscMetricRow {
  page: string;
}

export interface SeoLandingPage {
  path: string;
  label: string;
  occasions: SeoOccasion[];
}

export interface SeoDashboardKeywordRow extends TrackedSeoKeyword {
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
  /** True when Search Console reported the query and it was not in the tracked list. */
  discovered: boolean;
}

export interface SeoDashboardPageRow {
  path: string;
  label: string;
  occasions: SeoOccasion[];
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
  discovered: boolean;
}

export interface SeoMetricSummary {
  keywords: number;
  withData: number;
  clicks: number;
  impressions: number;
  ctr: number | null;
  position: number | null;
}

export function normalizeSeoKeyword(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const RAKHI_QUERY = /\brakhis?\b|\braksha\b/;
const BHAI_DOOJ_QUERY = /\bbhai\s*dooj\b|\bbhaidooj\b|\bbhai\s*duj\b|\bbhau\s*beej\b|\bbhaiya\s*dooj\b/;
const DIWALI_QUERY = /\bdiwali\b|\bdeepavali\b|\blakshmi\s+puja\b|\blaxmi\s+puja\b/;

/** Which of the three tracked festivals a query or URL names. A query can match more than one. */
export function classifySeoOccasions(value: string): SeoOccasion[] {
  const text = normalizeSeoKeyword(value);
  if (!text) return [];
  const occasions: SeoOccasion[] = [];
  if (RAKHI_QUERY.test(text)) occasions.push("rakhi");
  if (BHAI_DOOJ_QUERY.test(text)) occasions.push("bhai-dooj");
  if (DIWALI_QUERY.test(text)) occasions.push("diwali");
  return occasions;
}

export function mentionsFestiveKeyword(value: string): boolean {
  return classifySeoOccasions(value).some((occasion) => occasion !== "rakhi");
}

export function resolvePageKeywords(input: {
  explicit?: string;
  rakhiHidden: boolean;
  rakhiDefault: string;
  festiveDefault: string;
}): string {
  const trimmed = input.explicit?.trim() ?? "";
  if (!trimmed) return input.rakhiHidden ? input.festiveDefault : input.rakhiDefault;
  if (!input.rakhiHidden) return trimmed;
  const withoutBrand = trimmed.replace(/usarakhi/gi, " ");
  const rakhiOnly = RAKHI_QUERY.test(normalizeSeoKeyword(withoutBrand)) && !mentionsFestiveKeyword(trimmed);
  return rakhiOnly ? input.festiveDefault : trimmed;
}

function tracked(
  occasion: SeoOccasion,
  targetPath: string,
  priority: SeoKeywordPriority,
  keywords: string[]
): TrackedSeoKeyword[] {
  return keywords.map((keyword) => ({
    keyword: normalizeSeoKeyword(keyword),
    occasion,
    targetPath,
    priority,
  }));
}

const BHAI_DOOJ_HEAD = tracked("bhai-dooj", "/bhai-dooj-to-usa", "head", [
  "bhai dooj gifts usa",
  "send bhai dooj gifts to usa",
  "bhai dooj gifts to usa",
  "bhai dooj gifts for brother usa",
  "bhai dooj gift for brother in usa",
  "bhai dooj gifts for brother in america",
  "bhai dooj gift ideas usa",
  "best bhai dooj gifts usa",
  "buy bhai dooj gifts usa",
  "buy bhai dooj gifts online usa",
  "order bhai dooj gifts usa",
  "order bhai dooj gifts online usa",
  "bhai dooj gifts from india to usa",
  "bhai dooj gift delivery usa",
  "bhai dooj hamper usa",
  "send bhai dooj hamper to usa",
  "bhai dooj gift box usa",
  "bhai dooj gift combo usa",
  "bhai dooj sweets usa",
  "bhai dooj mithai usa",
  "send sweets for bhai dooj to usa",
  "bhai dooj kaju katli usa",
  "bhai dooj chocolate box usa",
  "bhai dooj dry fruit box usa",
  "bhai dooj kumkum gift usa",
  "bhaiya dooj gifts usa",
  "bhau beej gifts usa",
  "bhai duj gifts usa",
]);

const BHAI_DOOJ_SUPPORTING = [
  ...tracked("bhai-dooj", "/blog/bhai-dooj-gifts-for-a-brother-in-the-usa", "supporting", [
    "bhai dooj gift ideas for brother in usa",
    "what to send brother for bhai dooj usa",
  ]),
  ...tracked("bhai-dooj", "/blog/bhai-dooj-kaju-katli-kumkum-gifts-usa", "supporting", [
    "bhai dooj kaju katli gift box usa",
    "bhai dooj kumkum and sweets usa",
  ]),
  ...tracked("bhai-dooj", "/blog/bhai-dooj-chocolate-and-dry-fruit-boxes-usa", "supporting", [
    "bhai dooj chocolate and dry fruits usa",
    "bhai dooj dry fruit hamper usa",
  ]),
  ...tracked("bhai-dooj", "/blog/when-to-order-bhai-dooj-gifts-for-usa-delivery", "supporting", [
    "bhai dooj 2026",
    "bhai dooj 2026 usa",
    "when is bhai dooj 2026",
    "bhai dooj date 2026",
    "when to order bhai dooj gifts usa",
  ]),
  ...tracked("bhai-dooj", "/blog/bhai-dooj-or-diwali-hamper-which-to-send", "supporting", [
    "bhai dooj or diwali hamper",
    "bhai dooj vs diwali gifts",
  ]),
  ...tracked("bhai-dooj", "/sweet-combos-to-usa", "supporting", [
    "bhai dooj sweet box usa",
    "bhai dooj mithai box usa",
  ]),
  ...tracked("bhai-dooj", "/dry-fruit-combos-to-usa", "supporting", ["bhai dooj dry fruits usa"]),
  ...tracked("bhai-dooj", "/chocolate-combos-to-usa", "supporting", ["bhai dooj chocolates usa"]),
  ...tracked("bhai-dooj", "/pooja-sets-to-usa", "supporting", ["bhai dooj pooja gift usa"]),
  ...tracked("bhai-dooj", "/gifts-from-uk", "supporting", [
    "bhai dooj gifts from uk to usa",
    "send bhai dooj gifts from uk",
  ]),
  ...tracked("bhai-dooj", "/gifts-from-canada", "supporting", [
    "bhai dooj gifts from canada to usa",
    "send bhai dooj gifts from canada",
  ]),
];

const DIWALI_HEAD = tracked("diwali", "/diwali-to-usa", "head", [
  "diwali gifts usa",
  "send diwali gifts to usa",
  "diwali gifts to usa",
  "buy diwali gifts online usa",
  "order diwali gifts online usa",
  "order diwali gifts usa",
  "diwali gifts from india to usa",
  "diwali gift delivery usa",
  "diwali gift hampers usa",
  "diwali hamper usa",
  "send diwali hamper to usa",
  "diwali hamper delivery usa",
  "diwali gift box usa",
  "diwali gift combos usa",
  "diwali gift ideas usa",
  "best diwali gifts usa",
  "diwali gifts for family in usa",
  "diwali gifts for parents usa",
  "diwali sweets usa",
  "diwali sweets delivery usa",
  "send diwali sweets to usa",
  "indian sweets for diwali usa",
  "diwali mithai usa",
  "diwali dry fruits usa",
  "diwali dry fruit hamper usa",
  "diwali chocolate gifts usa",
  "diwali pooja set usa",
  "diwali puja items usa",
  "diwali 2026 gifts usa",
  "diwali 2026 usa",
]);

const DIWALI_SUPPORTING = [
  ...tracked("diwali", "/blog/send-diwali-gifts-to-usa", "supporting", [
    "how to send diwali gifts to usa",
    "when to order diwali gifts usa",
    "when is diwali 2026",
    "diwali date 2026",
  ]),
  ...tracked("diwali", "/blog/diwali-gift-hampers-for-family-in-america", "supporting", [
    "diwali gift hamper for family america",
    "diwali hampers for parents in usa",
  ]),
  ...tracked("diwali", "/blog/diwali-pooja-gift-box-usa-delivery", "supporting", [
    "diwali pooja gift box usa",
    "lakshmi puja gifts usa",
    "laxmi puja gifts usa",
  ]),
  ...tracked("diwali", "/blog/diwali-sweets-and-dry-fruits-shipped-in-the-usa", "supporting", [
    "diwali sweets and dry fruits usa",
    "diwali dry fruit gift box usa",
  ]),
  ...tracked("diwali", "/blog/order-diwali-gifts-online-from-india-to-usa", "supporting", [
    "order diwali gifts from india to usa",
    "send diwali gifts from india to usa",
  ]),
  ...tracked("diwali", "/sweet-combos-to-usa", "supporting", [
    "diwali sweet combos usa",
    "diwali sweet box usa",
  ]),
  ...tracked("diwali", "/dry-fruit-combos-to-usa", "supporting", [
    "diwali dry fruit combos usa",
    "dry fruit gifts for diwali usa",
  ]),
  ...tracked("diwali", "/chocolate-combos-to-usa", "supporting", [
    "diwali chocolate combos usa",
    "chocolate gifts for diwali usa",
  ]),
  ...tracked("diwali", "/pooja-sets-to-usa", "supporting", [
    "diwali pooja thali usa",
    "diwali puja set delivery usa",
  ]),
  ...tracked("diwali", "/blog/bhai-dooj-or-diwali-hamper-which-to-send", "supporting", [
    "diwali or bhai dooj hamper",
  ]),
  ...tracked("diwali", "/gifts-from-uk", "supporting", [
    "diwali gifts from uk to usa",
    "send diwali gifts from uk to usa",
  ]),
  ...tracked("diwali", "/gifts-from-canada", "supporting", [
    "diwali gifts from canada to usa",
    "send diwali gifts from canada to usa",
  ]),
];

function dedupeTracked(rows: TrackedSeoKeyword[]): TrackedSeoKeyword[] {
  const seen = new Set<string>();
  const out: TrackedSeoKeyword[] = [];
  for (const row of rows) {
    const key = `${row.occasion}:${row.keyword}`;
    if (!row.keyword || seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

/** Bhai Dooj and Diwali queries to track. Rakhi queries are not listed here. */
export const FESTIVAL_TRACKED_KEYWORDS: TrackedSeoKeyword[] = dedupeTracked([
  ...BHAI_DOOJ_HEAD,
  ...BHAI_DOOJ_SUPPORTING,
  ...DIWALI_HEAD,
  ...DIWALI_SUPPORTING,
]);

export function festiveFallbackKeywordMeta(limit = 16): string {
  const head = FESTIVAL_TRACKED_KEYWORDS.filter((row) => row.priority === "head");
  const picked: string[] = [];
  const seen = new Set<string>();
  for (const occasion of ["diwali", "bhai-dooj"] as const) {
    for (const row of head) {
      if (row.occasion !== occasion || seen.has(row.keyword)) continue;
      seen.add(row.keyword);
      picked.push(row.keyword);
      if (picked.filter((keyword) => classifySeoOccasions(keyword).includes(occasion)).length >= limit / 2) {
        break;
      }
    }
  }
  return picked.slice(0, limit).join(", ");
}

export function metaKeywordsForTarget(path: string, limit = 12): string {
  const own = FESTIVAL_TRACKED_KEYWORDS.filter((row) => row.targetPath === path);
  const occasions = new Set(own.map((row) => row.occasion));
  const pool = [
    ...own.filter((row) => row.priority === "head"),
    ...own.filter((row) => row.priority !== "head"),
    ...FESTIVAL_TRACKED_KEYWORDS.filter(
      (row) =>
        row.priority === "head" &&
        (occasions.size === 0 || occasions.has(row.occasion)) &&
        row.targetPath !== path
    ),
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of pool) {
    if (seen.has(row.keyword)) continue;
    seen.add(row.keyword);
    out.push(row.keyword);
    if (out.length >= limit) break;
  }
  return out.join(", ");
}

export function aggregateSeoMetrics(rows: GscMetricRow[]): GscMetricRow | null {
  if (rows.length === 0) return null;
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const position =
    impressions > 0
      ? rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions
      : rows.reduce((sum, row) => sum + row.position, 0) / rows.length;
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position,
  };
}

export function summarizeSeoMetrics(
  rows: Array<{ clicks: number | null; impressions: number | null; position: number | null }>
): SeoMetricSummary {
  const withMetrics = rows.filter((row) => row.impressions != null && row.clicks != null);
  const impressions = withMetrics.reduce((sum, row) => sum + (row.impressions ?? 0), 0);
  const clicks = withMetrics.reduce((sum, row) => sum + (row.clicks ?? 0), 0);
  const weighted = withMetrics.reduce(
    (sum, row) => sum + (row.position ?? 0) * (row.impressions ?? 0),
    0
  );
  return {
    keywords: rows.length,
    withData: withMetrics.length,
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : null,
    position: impressions > 0 ? weighted / impressions : null,
  };
}

function metricOrNull(metric: GscMetricRow | null): Pick<
  SeoDashboardKeywordRow,
  "clicks" | "impressions" | "ctr" | "position"
> {
  if (!metric) return { clicks: null, impressions: null, ctr: null, position: null };
  return metric;
}

function defaultPathForOccasion(occasion: SeoOccasion): string {
  if (occasion === "bhai-dooj") return "/bhai-dooj-to-usa";
  if (occasion === "diwali") return "/diwali-to-usa";
  return "/";
}

export function pathnameFromSearchConsolePage(page: string): string {
  const trimmed = page.trim();
  if (!trimmed) return "/";
  try {
    const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(trimmed, "https://www.usarakhi.com");
    const path = decodeURIComponent(url.pathname).replace(/\/+$/, "");
    return path || "/";
  } catch {
    return trimmed.startsWith("/") ? trimmed.replace(/\/+$/, "") || "/" : `/${trimmed}`;
  }
}

export function occasionsForPath(path: string): SeoOccasion[] {
  if (path === "/") return ["rakhi", "bhai-dooj", "diwali"];
  if (path.startsWith("/send-gifts-to-")) return ["diwali", "bhai-dooj"];
  const fromText = classifySeoOccasions(path.replace(/[-_/]+/g, " "));
  if (fromText.length) return fromText;
  if (/sweet|dry fruit|chocolate|pooja|gifts from/.test(path.replace(/[-_/]+/g, " "))) {
    return ["diwali", "bhai-dooj"];
  }
  return [];
}

function sortKeywords(rows: SeoDashboardKeywordRow[]): SeoDashboardKeywordRow[] {
  return [...rows].sort((a, b) => {
    const impressionsA = a.impressions ?? -1;
    const impressionsB = b.impressions ?? -1;
    if (impressionsB !== impressionsA) return impressionsB - impressionsA;
    if (a.priority !== b.priority) return a.priority === "head" ? -1 : 1;
    return a.keyword.localeCompare(b.keyword);
  });
}

export function buildSeoDashboard(
  trackedKeywords: TrackedSeoKeyword[],
  queries: GscQueryMetric[],
  pages: GscPageMetric[],
  landingPages: SeoLandingPage[]
): { keywords: SeoDashboardKeywordRow[]; pages: SeoDashboardPageRow[] } {
  const tracked = dedupeTracked(
    trackedKeywords.map((row) => ({ ...row, keyword: normalizeSeoKeyword(row.keyword) }))
  );
  const byQuery = new Map<string, GscQueryMetric[]>();
  for (const row of queries) {
    const key = normalizeSeoKeyword(row.query);
    if (!key) continue;
    const list = byQuery.get(key) ?? [];
    list.push(row);
    byQuery.set(key, list);
  }
  const metricsFor = (keyword: string) => aggregateSeoMetrics(byQuery.get(keyword) ?? []);
  const trackedKeys = new Set(tracked.map((row) => row.keyword));

  const keywords: SeoDashboardKeywordRow[] = tracked.map((row) => ({
    ...row,
    ...metricOrNull(metricsFor(row.keyword)),
    discovered: false,
  }));

  for (const [keyword, rows] of byQuery) {
    if (trackedKeys.has(keyword)) continue;
    const occasions = classifySeoOccasions(keyword);
    if (occasions.length === 0) continue;
    const metric = aggregateSeoMetrics(rows);
    for (const occasion of occasions) {
      keywords.push({
        keyword,
        occasion,
        targetPath: defaultPathForOccasion(occasion),
        priority: "supporting",
        ...metricOrNull(metric),
        discovered: true,
      });
    }
  }

  const byPath = new Map<string, GscPageMetric[]>();
  for (const row of pages) {
    const path = pathnameFromSearchConsolePage(row.page);
    const list = byPath.get(path) ?? [];
    list.push(row);
    byPath.set(path, list);
  }

  const pageRows: SeoDashboardPageRow[] = [];
  const seenPaths = new Set<string>();
  for (const page of landingPages) {
    const path = page.path.replace(/\/+$/, "") || "/";
    if (seenPaths.has(path)) continue;
    seenPaths.add(path);
    pageRows.push({
      path,
      label: page.label,
      occasions: page.occasions,
      ...metricOrNull(aggregateSeoMetrics(byPath.get(path) ?? [])),
      discovered: false,
    });
  }
  const discoveredPages: SeoDashboardPageRow[] = [];
  for (const [path, rows] of byPath) {
    if (seenPaths.has(path)) continue;
    const occasions = occasionsForPath(path);
    if (occasions.length === 0) continue;
    discoveredPages.push({
      path,
      label: path,
      occasions,
      ...metricOrNull(aggregateSeoMetrics(rows)),
      discovered: true,
    });
  }
  discoveredPages.sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0));

  return {
    keywords: sortKeywords(keywords),
    pages: [...pageRows, ...discoveredPages.slice(0, 40)].sort((a, b) => {
      const impressionsA = a.impressions ?? -1;
      const impressionsB = b.impressions ?? -1;
      if (impressionsB !== impressionsA) return impressionsB - impressionsA;
      return a.label.localeCompare(b.label);
    }),
  };
}
