import { z } from "zod";

/** Discount-of-the-day coupon validity window. */
export const WELCOME_COUPON_HOURS = 1;

/** @deprecated Prefer weighted spin; kept as fallback average. */
export const WELCOME_DISCOUNT_PERCENT = 10;

/** Underlying discount values for each wheel slice (not shown on the wheel). */
export const DAILY_DEAL_SEGMENTS = [6, 7, 8, 10, 6, 7, 8, 10] as const;

/**
 * Mystery labels shown on the wheel — never reveal the % until the prize reveal.
 * Length must match DAILY_DEAL_SEGMENTS.
 */
export const DAILY_DEAL_WHEEL_LABELS = [
  "Lucky",
  "Surprise",
  "Bonus",
  "Mystery",
  "Lucky",
  "Surprise",
  "Bonus",
  "Mystery",
] as const;

export type DailyDealPercent = 6 | 7 | 8 | 10;

/**
 * Spin odds:
 * 20% → 6% off, 40% → 7% off, 20% → 8% off, 20% → 10% off
 */
export const DAILY_DEAL_WEIGHTS: ReadonlyArray<{ percent: DailyDealPercent; weight: number }> = [
  { percent: 6, weight: 20 },
  { percent: 7, weight: 40 },
  { percent: 8, weight: 20 },
  { percent: 10, weight: 20 },
];

export function isValidDailyDealPercent(n: unknown): n is DailyDealPercent {
  return n === 6 || n === 7 || n === 8 || n === 10;
}

/** Pick a random discount using configured weights. */
export function pickDailyDealDiscount(): DailyDealPercent {
  const total = DAILY_DEAL_WEIGHTS.reduce((sum, row) => sum + row.weight, 0);
  let roll = Math.random() * total;
  for (const row of DAILY_DEAL_WEIGHTS) {
    roll -= row.weight;
    if (roll <= 0) return row.percent;
  }
  return 7;
}

/** Calendar day key in America/New_York for one-spin-per-phone-per-day. */
export function dailyDealDayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export const couponSourceSchema = z.enum(["welcome", "abandoned", "admin"]);
export type CouponSource = z.infer<typeof couponSourceSchema>;

/** Admin manual abandoned-cart coupons (WhatsApp / phone outreach). */
export const ADMIN_MANUAL_COUPON_HOURS = 1;
/** Higher % for customers who already confirmed they will buy — longer validity so the code is not wasted. */
export const ADMIN_CONFIRMED_SALE_DISCOUNT_PERCENT = 20;
export const ADMIN_CONFIRMED_SALE_COUPON_HOURS = 24;
export const ADMIN_COUPON_DISCOUNT_OPTIONS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 20] as const;
export type AdminCouponDiscountPercent = (typeof ADMIN_COUPON_DISCOUNT_OPTIONS)[number];

export function isAdminConfirmedSaleDiscount(percent: number): boolean {
  return percent === ADMIN_CONFIRMED_SALE_DISCOUNT_PERCENT;
}

export function adminCouponHoursForDiscount(percent: number): number {
  return isAdminConfirmedSaleDiscount(percent)
    ? ADMIN_CONFIRMED_SALE_COUPON_HOURS
    : ADMIN_MANUAL_COUPON_HOURS;
}

export const createAdminCouponSchema = z
  .object({
    email: z
      .string()
      .trim()
      .max(254)
      .optional()
      .or(z.literal("")),
    /** Local mobile digits only — used for coupon binding / checkout match (no country code). */
    phone: z.string().trim().max(22).optional().or(z.literal("")),
    /** Full E.164 for WhatsApp outreach only; never used for coupon validation. */
    whatsappPhone: z.string().trim().max(22).optional().or(z.literal("")),
    discountPercent: z
      .number()
      .int()
      .refine(
        (n): n is AdminCouponDiscountPercent =>
          (ADMIN_COUPON_DISCOUNT_OPTIONS as readonly number[]).includes(n),
        { message: "Discount must be 7%–15% (outreach) or 20% (confirmed sale)" }
      ),
    /**
     * Optional explicit flag. When omitted, 20% is treated as confirmed sale.
     * Confirmed-sale coupons get a longer validity window.
     */
    confirmedSale: z.boolean().optional(),
  })
  .superRefine((v, ctx) => {
    const email = v.email?.trim() ?? "";
    const phoneDigits = (v.phone ?? "").replace(/\D/g, "");
    const hasEmail = Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    const hasPhone = phoneDigits.length >= 7 && phoneDigits.length <= 12;
    if (!hasEmail && !hasPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a customer email or mobile number",
        path: ["email"],
      });
    }
    if (email && !hasEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid email address",
        path: ["email"],
      });
    }
    if ((v.phone ?? "").trim() && !hasPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid mobile number",
        path: ["phone"],
      });
    }
  });

export type CreateAdminCouponInput = z.infer<typeof createAdminCouponSchema>;

export const couponSchema = z.object({
  code: z.string(),
  /** Optional when coupon is bound to phone (spin-the-wheel). */
  email: z.string().email().optional(),
  discountPercent: z.number().int().min(1).max(100),
  expiresAt: z.string(),
  createdAt: z.string(),
  sessionId: z.string().optional(),
  usedAt: z.string().optional(),
  orderId: z.string().optional(),
  source: couponSourceSchema,
  dayKey: z.string().optional(),
  /** Customer phone (welcome spin / admin abandoned outreach). */
  phone: z.string().optional(),
  /** Cognito email of admin who created the coupon. */
  createdBy: z.string().email().optional(),
  /**
   * Admin 20% coupons for customers who confirmed they will buy.
   * Longer expiry so the code is less likely to expire unused.
   */
  confirmedSale: z.boolean().optional(),
});

export type StoreCoupon = z.infer<typeof couponSchema>;

export const couponValidateSchema = z
  .object({
    code: z.string().min(4).max(32),
    email: z.string().max(254).optional(),
    phone: z.string().max(40).optional(),
  })
  .refine((v) => Boolean(v.email?.trim()) || Boolean(v.phone?.trim()), {
    message: "Email or phone is required to apply a coupon",
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
