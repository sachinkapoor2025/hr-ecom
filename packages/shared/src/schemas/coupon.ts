import { z } from "zod";

/** Discount-of-the-day coupon validity window. */
export const WELCOME_COUPON_HOURS = 1;

/** @deprecated Prefer weighted spin; kept as fallback average. */
export const WELCOME_DISCOUNT_PERCENT = 10;

/** Visual wheel segments (labels on the wheel). */
export const DAILY_DEAL_SEGMENTS = [5, 10, 15, 20, 5, 10, 15, 20] as const;

export type DailyDealPercent = 5 | 10 | 15 | 20;

/**
 * Spin odds:
 * 35% → 5% off, 45% → 10% off, 15% → 15% off, 5% → 20% off
 */
export const DAILY_DEAL_WEIGHTS: ReadonlyArray<{ percent: DailyDealPercent; weight: number }> = [
  { percent: 5, weight: 35 },
  { percent: 10, weight: 45 },
  { percent: 15, weight: 15 },
  { percent: 20, weight: 5 },
];

export function isValidDailyDealPercent(n: unknown): n is DailyDealPercent {
  return n === 5 || n === 10 || n === 15 || n === 20;
}

/** Pick a random discount using configured weights. */
export function pickDailyDealDiscount(): DailyDealPercent {
  const total = DAILY_DEAL_WEIGHTS.reduce((sum, row) => sum + row.weight, 0);
  let roll = Math.random() * total;
  for (const row of DAILY_DEAL_WEIGHTS) {
    roll -= row.weight;
    if (roll <= 0) return row.percent;
  }
  return 10;
}

/** Calendar day key in America/New_York for one-spin-per-email-per-day. */
export function dailyDealDayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export const couponSourceSchema = z.enum(["welcome", "abandoned"]);
export type CouponSource = z.infer<typeof couponSourceSchema>;

export const couponSchema = z.object({
  code: z.string(),
  email: z.string().email(),
  discountPercent: z.number().int().min(1).max(100),
  expiresAt: z.string(),
  createdAt: z.string(),
  sessionId: z.string().optional(),
  usedAt: z.string().optional(),
  orderId: z.string().optional(),
  source: couponSourceSchema,
  dayKey: z.string().optional(),
});

export type StoreCoupon = z.infer<typeof couponSchema>;

export const couponValidateSchema = z.object({
  code: z.string().min(4).max(32),
  email: z.string().email().max(254),
});

export const welcomeCouponSchema = couponSchema.extend({
  source: z.literal("welcome"),
});

export type CouponValidateInput = z.infer<typeof couponValidateSchema>;
export type WelcomeCoupon = z.infer<typeof welcomeCouponSchema>;

export type CouponValidationResult = {
  valid: boolean;
  code?: string;
  discountPercent?: number;
  expiresAt?: string;
  error?: string;
};
