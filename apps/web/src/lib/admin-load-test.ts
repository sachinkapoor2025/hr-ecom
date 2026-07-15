import {
  LOAD_TEST_PRESETS,
  loadTestLimits,
  type LoadTestPreset,
  type LoadTestRunResult,
} from "@hr-ecom/shared";
import { getApiUrl } from "@/lib/env";

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

/** Run `total` tasks with at most `parallel` in flight. */
async function runPool<T>(total: number, parallel: number, worker: (index: number) => Promise<T>) {
  const results: T[] = new Array(total);
  let next = 0;

  async function runOne() {
    while (next < total) {
      const i = next++;
      results[i] = await worker(i);
    }
  }

  const runners = Array.from({ length: Math.min(parallel, total) }, () => runOne());
  await Promise.all(runners);
  return results;
}

/**
 * Runs load from the browser against the public API.
 * High user counts use a parallel pool (not 1000 tabs) so the browser stays usable.
 */
export async function runBrowserLoadTest(options: {
  preset: LoadTestPreset;
  categorySlug?: string;
}): Promise<LoadTestRunResult> {
  const preset = options.preset;
  const limits = loadTestLimits(preset);
  const { users, parallel, p95LimitMs, failRateLimit } = limits;
  const categorySlug = options.categorySlug?.trim() || "single-rakhi";
  const apiBase = getApiUrl().replace(/\/$/, "");
  const started = Date.now();
  // Allow larger presets enough wall time (waves of parallel journeys).
  const maxWallMs = Math.min(180_000, 20_000 + users * 80);
  const allMs: number[] = [];
  let errors = 0;
  let journeys = 0;
  let truncated = false;
  const sampleErrors: string[] = [];

  const health = await fetch(`${apiBase}/health`).catch(() => null);
  if (!health?.ok) {
    throw new Error(`API health check failed at ${apiBase}`);
  }

  await runPool(users, parallel, async (i) => {
    if (Date.now() - started > maxWallMs) {
      truncated = true;
      errors += 1;
      if (sampleErrors.length < 5) sampleErrors.push("truncated: wall-clock limit");
      return;
    }
    const session = `browser-lt-${preset}-${i}-${started}`;
    try {
      const times = await runJourney(apiBase, session, categorySlug);
      journeys += 1;
      for (const t of times) allMs.push(t.ms);
    } catch (err: unknown) {
      errors += 1;
      const msg = err instanceof Error ? err.message : String(err);
      if (sampleErrors.length < 5) sampleErrors.push(msg);
    }
  });

  allMs.sort((a, b) => a - b);
  const planned = users;
  const failedRate = planned > 0 ? errors / planned : 1;
  const p50 = percentile(allMs, 50);
  const p95 = percentile(allMs, 95);
  const p99 = percentile(allMs, 99);
  const reliabilityPass = !truncated && failedRate <= failRateLimit;
  const latencyPass = p95 > 0 && p95 <= p95LimitMs;
  const reasons: string[] = [];
  if (truncated) reasons.push("Run truncated before all journeys finished — try a smaller preset");
  if (failedRate > failRateLimit) {
    reasons.push(
      `Error rate ${(failedRate * 100).toFixed(2)}% exceeds ${(failRateLimit * 100).toFixed(1)}% for this preset`
    );
  }
  if (!latencyPass) {
    reasons.push(
      `p95 ${p95} ms exceeds ${p95LimitMs} ms limit for ${LOAD_TEST_PRESETS[preset].label}`
    );
  }

  return {
    preset,
    concurrency: parallel,
    loops: 1,
    users,
    parallel,
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
    pass: reliabilityPass && latencyPass,
    reliabilityPass,
    latencyPass,
    p95LimitMs,
    failRateLimit,
    reasons: reasons.length ? reasons : undefined,
    truncated: truncated || undefined,
    sampleErrors: sampleErrors.length ? sampleErrors : undefined,
  };
}
