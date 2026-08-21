import { z } from "zod";
import { PAYMENT_PROVIDERS, PAYMENT_REGIONS, STRIPE_PAYMENTS_ENABLED } from "../constants";

export const paymentConfigSchema = z.object({
  defaultRegion: z.enum([PAYMENT_REGIONS.US, PAYMENT_REGIONS.IN]),
  regions: z.object({
    US: z.object({
      provider: z.literal(PAYMENT_PROVIDERS.STRIPE),
      currency: z.literal("USD"),
      enabled: z.boolean().default(true),
    }),
    IN: z.object({
      provider: z.literal(PAYMENT_PROVIDERS.RAZORPAY),
      currency: z.literal("INR"),
      enabled: z.boolean().default(true),
    }),
  }),
});

export type PaymentConfig = z.infer<typeof paymentConfigSchema>;

export const defaultPaymentConfig: PaymentConfig = {
  defaultRegion: "US",
  regions: {
    US: { provider: "stripe", currency: "USD", enabled: STRIPE_PAYMENTS_ENABLED },
    IN: { provider: "razorpay", currency: "INR", enabled: true },
  },
};

/** Apply the temporary Stripe kill switch on top of stored / default payment config. */
export function withStripePaymentsGate(config: PaymentConfig): PaymentConfig {
  return {
    ...config,
    regions: {
      ...config.regions,
      US: { ...config.regions.US, enabled: STRIPE_PAYMENTS_ENABLED },
    },
  };
}
