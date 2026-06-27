import { z } from "zod";
import { cartItemSchema } from "./cart";
import { ORDER_STATUS } from "../constants";

export const shippingAddressSchema = z.object({
  name: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(2).max(2),
  phone: z.string().optional(),
  email: z.string().email(),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["stripe", "razorpay"]),
  /** Customer-selected display/checkout currency (from currency switcher). */
  checkoutCurrency: z.enum(["USD", "INR"]).optional(),
  /** Live USD→INR rate shown to the customer (optional; server validates). */
  usdInrRate: z.number().positive().max(200).optional(),
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
});

/** Admin order status update payload. */
export const orderStatusUpdateSchema = z.object({
  status: orderStatusEnum,
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  note: z.string().max(500).optional(),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;
export type OrderStatusHistoryEntry = z.infer<typeof orderStatusHistoryEntrySchema>;
export type Order = z.infer<typeof orderSchema> & {
  createdAt: string;
  updatedAt: string;
};
