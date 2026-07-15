import {
  LOAD_TEST_PRESETS,
  type LoadTestPreset,
  type LoadTestRunResult,
} from "@hr-ecom/shared";
import { getApiUrl } from "@/lib/env";

const FAIL_RATE_LIMIT = 0.01;
const P95_LIMIT_MS = 2000;
const MAX_WALL_MS = 55_000;

type StepTiming = { name: string; ms: number; status: number };

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
  const headers: Record<string, string> = {
    "X-Session-Id": session,
    "Content-Type": "application/json",
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
 * Runs the smoke from the browser against the public API.
 * Avoids Lambda self-invocation (API calling itself), which causes 503s under concurrency.
 */
export async function runBrowserLoadTest(options: {
  preset: LoadTestPreset;
  categorySlug?: string;
}): Promise<LoadTestRunResult> {
  const preset = options.preset;
  const defaults = LOAD_TEST_PRESETS[preset];
  const concurrency = defaults.concurrency;
  const loops = defaults.loops;
  const categorySlug = options.categorySlug?.trim() || "single-rakhi";
  const apiBase = getApiUrl().replace(/\/$/, "");
  const started = Date.now();
  const allMs: number[] = [];
  let errors = 0;
  let journeys = 0;
  let truncated = false;
  const sampleErrors: string[] = [];

  const health = await fetch(`${apiBase}/health`).catch(() => null);
  if (!health?.ok) {
    throw new Error(`API health check failed at ${apiBase}`);
  }

  for (let loop = 0; loop < loops; loop++) {
    if (Date.now() - started > MAX_WALL_MS) {
      truncated = true;
      break;
    }

    const batch = Array.from({ length: concurrency }, (_, i) => {
      const session = `browser-lt-${preset}-${loop}-${i}-${started}`;
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

  return {
    preset,
    concurrency,
    loops,
    apiBase,
    loadTestMode: false,
    durationMs: Date.now() - started,
    journeys,
    requestsApprox: allMs.length,
    errors,
    failedRate,
    p50,
    p95,
    p99,
    pass: !truncated && failedRate < FAIL_RATE_LIMIT && p95 < P95_LIMIT_MS,
    truncated: truncated || undefined,
    sampleErrors: sampleErrors.length ? sampleErrors : undefined,
  };
}
