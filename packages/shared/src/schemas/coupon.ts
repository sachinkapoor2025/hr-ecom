import { z } from "zod";

/** Discount-of-the-day coupon validity window. */
export const WELCOME_COUPON_HOURS = 1;

/** @deprecated Prefer spin segments; kept as fallback average. */
export const WELCOME_DISCOUNT_PERCENT = 10;

/** Wheel segments (percent off). Duplicates weight the odds. */
export const DAILY_DEAL_SEGMENTS = [5, 10, 15, 20, 5, 10, 15, 20] as const;

export type DailyDealPercent = (typeof DAILY_DEAL_SEGMENTS)[number];

/** Pick a random discount from the wheel segments (server-side). */
export function pickDailyDealDiscount(): DailyDealPercent {
  const idx = Math.floor(Math.random() * DAILY_DEAL_SEGMENTS.length);
  return DAILY_DEAL_SEGMENTS[idx]!;
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
