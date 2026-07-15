import { z } from "zod";

/**
 * Admin browser load-test presets.
 * `parallel` caps in-flight journeys (browser-safe); `users` is total shopper journeys.
 * p95 limits scale with load — cold Lambda without provisioned concurrency is expected to be slower at higher N.
 */
export const LOAD_TEST_PRESETS = {
  smoke: {
    users: 20,
    parallel: 10,
    label: "Smoke",
    description: "~20 journeys · quick check",
    p95LimitMs: 4_000,
    failRateLimit: 0.01,
  },
  u100: {
    users: 100,
    parallel: 50,
    label: "100 users",
    description: "100 journeys · up to 50 parallel",
    p95LimitMs: 8_000,
    failRateLimit: 0.01,
  },
  u250: {
    users: 250,
    parallel: 75,
    label: "250 users",
    description: "250 journeys · up to 75 parallel",
    p95LimitMs: 12_000,
    failRateLimit: 0.015,
  },
  u500: {
    users: 500,
    parallel: 100,
    label: "500 users",
    description: "500 journeys · up to 100 parallel",
    p95LimitMs: 16_000,
    failRateLimit: 0.02,
  },
  u750: {
    users: 750,
    parallel: 100,
    label: "750 users",
    description: "750 journeys · up to 100 parallel",
    p95LimitMs: 20_000,
    failRateLimit: 0.02,
  },
  u1000: {
    users: 1000,
    parallel: 100,
    label: "1000 users",
    description: "1000 journeys · up to 100 parallel",
    p95LimitMs: 25_000,
    failRateLimit: 0.025,
  },
} as const;

export type LoadTestPreset = keyof typeof LOAD_TEST_PRESETS;

export const loadTestPresetSchema = z.enum([
  "smoke",
  "u100",
  "u250",
  "u500",
  "u750",
  "u1000",
]);

export const loadTestRunRequestSchema = z.object({
  preset: loadTestPresetSchema.default("smoke"),
  categorySlug: z.string().min(1).max(80).optional(),
});

export type LoadTestRunRequest = z.infer<typeof loadTestRunRequestSchema>;

export const LOAD_TEST_FAIL_RATE_LIMIT = 0.01;

/** @deprecated Use per-preset p95LimitMs from LOAD_TEST_PRESETS */
export const LOAD_TEST_P95_LIMIT_MS = LOAD_TEST_PRESETS.smoke.p95LimitMs;

export function loadTestLimits(preset: LoadTestPreset) {
  const p = LOAD_TEST_PRESETS[preset];
  return {
    users: p.users,
    parallel: p.parallel,
    p95LimitMs: p.p95LimitMs,
    failRateLimit: p.failRateLimit,
  };
}

export const loadTestRunResultSchema = z.object({
  preset: loadTestPresetSchema,
  concurrency: z.number(),
  loops: z.number(),
  users: z.number().optional(),
  parallel: z.number().optional(),
  apiBase: z.string(),
  loadTestMode: z.boolean(),
  durationMs: z.number(),
  journeys: z.number(),
  requestsApprox: z.number(),
  errors: z.number(),
  failedRate: z.number(),
  p50: z.number(),
  p95: z.number(),
  p99: z.number(),
  pass: z.boolean(),
  reliabilityPass: z.boolean(),
  latencyPass: z.boolean(),
  p95LimitMs: z.number(),
  failRateLimit: z.number().optional(),
  reasons: z.array(z.string()).optional(),
  truncated: z.boolean().optional(),
  sampleErrors: z.array(z.string()).optional(),
});

export type LoadTestRunResult = z.infer<typeof loadTestRunResultSchema>;
