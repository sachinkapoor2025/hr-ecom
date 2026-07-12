import { z } from "zod";
import { cartItemSchema } from "./cart";
import { ORDER_STATUS } from "../constants";

/** International phone: 10–15 digits; allows +, spaces, dashes, parentheses. */
export function isValidShippingPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  if (!/^\+?[\d\s().-]{10,22}$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine(isValidShippingPhone, {
    message: "Enter a valid phone number with country code (e.g. +1 408 555 0100 or +91 98765 43210)",
  });

export const shippingAddressSchema = z.object({
  name: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(2).max(2),
  phone: phoneSchema,
  email: z.string().email(),
  /** Sister / buyer name — shown on shipping label so brother knows who sent the Rakhi. */
  senderName: z.string().trim().max(80).optional(),
});

export const checkoutShippingAddressSchema = shippingAddressSchema.extend({
  senderName: z
    .string()
    .trim()
    .min(1, "Sender name is required")
    .max(80, "Sender name is too long"),
});

export const checkoutSchema = z.object({
  shippingAddress: checkoutShippingAddressSchema,
  paymentMethod: z.enum(["stripe", "razorpay"]),
  /** Customer-selected display/checkout currency (from currency switcher). */
  checkoutCurrency: z.enum(["USD", "INR"]).optional(),
  /** Live USD→INR rate shown to the customer (optional; server validates). */
  usdInrRate: z.number().positive().max(200).optional(),
  /** Welcome or promo coupon (e.g. RAKHI-ABC123). */
  couponCode: z.string().min(4).max(32).optional(),
});

const orderStatusEnum = z.enum([
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PAID,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.COMPLETE,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.REFUNDED,
]);

export const orderStatusHistoryEntrySchema = z.object({
  status: orderStatusEnum,
  at: z.string(),
  note: z.string().optional(),
});

export const orderSchema = z.object({
  orderId: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  items: z.array(cartItemSchema),
  subtotal: z.number(),
  discount: z.number().default(0),
  couponCode: z.string().optional(),
  shipping: z.number().default(0),
  tax: z.number().default(0),
  total: z.number(),
  currency: z.enum(["USD", "INR"]),
  status: orderStatusEnum,
  statusHistory: z.array(orderStatusHistoryEntrySchema).optional(),
  shippingAddress: shippingAddressSchema,
  paymentProvider: z.enum(["stripe", "razorpay"]).optional(),
  paymentIntentId: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  adminNotes: z.string().max(2000).optional(),
  estimatedDeliveryAt: z.string().optional(),
  deliveredAt: z.string().optional(),
  /** ISO timestamp when post-delivery review email should send (deliveredAt + 1 day). */
  reviewEmailDueAt: z.string().optional(),
  /** Set after review request email is sent (idempotency). */
  reviewEmailSentAt: z.string().optional(),
});

/** Super-admin bulk delete (testing cleanup). */
export const bulkDeleteOrdersSchema = z.object({
  orderIds: z.array(z.string().min(1)).min(1).max(100),
});

/** Admin order status update payload. */
export const orderStatusUpdateSchema = z.object({
  status: orderStatusEnum.optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  note: z.string().max(500).optional(),
  adminNotes: z.string().max(2000).optional(),
  estimatedDeliveryAt: z.string().optional(),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;
export type OrderStatusHistoryEntry = z.infer<typeof orderStatusHistoryEntrySchema>;
export type Order = z.infer<typeof orderSchema> & {
  createdAt: string;
  updatedAt: string;
};
