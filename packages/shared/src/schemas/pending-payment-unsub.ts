import { z } from "zod";
import { emailAddressSchema } from "../lib/email-address";

export const pendingPaymentUnsubscribeSchema = z.object({
  email: emailAddressSchema,
});

export type PendingPaymentUnsubscribeInput = z.infer<typeof pendingPaymentUnsubscribeSchema>;

export const PENDING_PAYMENT_UNSUB_SOURCES = ["payment_reminder", "admin"] as const;
export type PendingPaymentUnsubSource = (typeof PENDING_PAYMENT_UNSUB_SOURCES)[number];

export type PendingPaymentUnsubRecord = {
  email: string;
  unsubscribedAt: string;
  source: PendingPaymentUnsubSource;
};
