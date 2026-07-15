import { z } from "zod";

/** Preset profiles for admin-triggered concurrent smoke (fits API GW ~29s). */
export const LOAD_TEST_PRESETS = {
  smoke: { concurrency: 10, loops: 2, label: "Smoke", description: "~20 shopper journeys" },
  browse: { concurrency: 25, loops: 2, label: "Browse", description: "~50 concurrent browsers" },
  spike: { concurrency: 50, loops: 2, label: "Spike", description: "~100 concurrent browsers" },
} as const;

export type LoadTestPreset = keyof typeof LOAD_TEST_PRESETS;

export const loadTestPresetSchema = z.enum(["smoke", "browse", "spike"]);

export const loadTestRunRequestSchema = z.object({
  preset: loadTestPresetSchema.default("smoke"),
  /** Optional override; hard-capped by API. */
  concurrency: z.number().int().min(1).max(50).optional(),
  loops: z.number().int().min(1).max(3).optional(),
  categorySlug: z.string().min(1).max(80).optional(),
});

export type LoadTestRunRequest = z.infer<typeof loadTestRunRequestSchema>;

export const loadTestStepResultSchema = z.object({
  name: z.string(),
  ms: z.number(),
  status: z.number(),
});

export const loadTestRunResultSchema = z.object({
  preset: loadTestPresetSchema,
  concurrency: z.number(),
  loops: z.number(),
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
  truncated: z.boolean().optional(),
  sampleErrors: z.array(z.string()).optional(),
});

export type LoadTestRunResult = z.infer<typeof loadTestRunResultSchema>;
