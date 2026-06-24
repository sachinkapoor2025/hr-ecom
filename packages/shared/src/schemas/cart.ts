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
});

export const cartSchema = z.object({
  items: z.array(cartItemSchema).default([]),
  updatedAt: z.string(),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
