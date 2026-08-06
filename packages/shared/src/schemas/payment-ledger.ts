import { z } from "zod";

export const PAYMENT_LEDGER_SOURCES = ["stripe", "razorpay", "other"] as const;

export type PaymentLedgerSource = (typeof PAYMENT_LEDGER_SOURCES)[number];

export const PAYMENT_LEDGER_SOURCE_LABELS: Record<PaymentLedgerSource, string> = {
  stripe: "Stripe",
  razorpay: "Razorpay",
  other: "Other",
};

export const createPaymentLedgerSchema = z.object({
  amount: z.number().positive(),
  receivedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "receivedDate must be YYYY-MM-DD"),
  paymentSource: z.enum(PAYMENT_LEDGER_SOURCES),
  notes: z.string().trim().max(2000).optional(),
});

export const updatePaymentLedgerSchema = createPaymentLedgerSchema.partial();

export type CreatePaymentLedgerInput = z.infer<typeof createPaymentLedgerSchema>;
export type UpdatePaymentLedgerInput = z.infer<typeof updatePaymentLedgerSchema>;

export type PaymentLedgerEntry = {
  paymentId: string;
  amount: number;
  currency: "USD";
  receivedDate: string;
  paymentSource: PaymentLedgerSource;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};
