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
  paymentRegion: z.enum(["US", "IN"]),
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
  status: z.enum([
    ORDER_STATUS.PENDING_PAYMENT,
    ORDER_STATUS.PAID,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.REFUNDED,
  ]),
  shippingAddress: shippingAddressSchema,
  paymentProvider: z.enum(["stripe", "razorpay"]).optional(),
  paymentIntentId: z.string().optional(),
  razorpayOrderId: z.string().optional(),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type Order = z.infer<typeof orderSchema> & {
  createdAt: string;
  updatedAt: string;
};
