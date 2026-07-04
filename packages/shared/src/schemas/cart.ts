import { z } from "zod";

export const cartItemSchema = z.object({
  productSlug: z.string(),
  name: z.string(),
  price: z.number(),
  currency: z.enum(["USD", "INR"]),
  quantity: z.number().int().min(1),
  image: z.string().optional(),
});

export const addToCartSchema = z.object({
  productSlug: z.string(),
  quantity: z.number().int().min(1).default(1),
  name: z.string().max(120).optional(),
  email: z.string().max(254).optional(),
  phone: z.string().max(40).optional(),
});

export const cartSchema = z.object({
  items: z.array(cartItemSchema).default([]),
  updatedAt: z.string(),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
