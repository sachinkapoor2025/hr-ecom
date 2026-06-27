import { z } from "zod";

export const WELCOME_DISCOUNT_PERCENT = 10;
export const WELCOME_COUPON_HOURS = 4;

export const couponValidateSchema = z.object({
  code: z.string().min(4).max(32),
  email: z.string().email().max(254),
});

export const welcomeCouponSchema = z.object({
  code: z.string(),
  email: z.string().email(),
  discountPercent: z.number().int().min(1).max(100),
  expiresAt: z.string(),
  createdAt: z.string(),
  sessionId: z.string().optional(),
  usedAt: z.string().optional(),
  orderId: z.string().optional(),
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
