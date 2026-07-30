import { z } from "zod";

export const cartItemAddonSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(160),
  /** Unit price in the cart line currency. */
  price: z.number().nonnegative(),
  quantity: z.number().int().min(1).default(1),
});

export const cartItemSchema = z.object({
  /** Stable cart line id (required for update/delete when add-ons differ). */
  lineId: z.string().min(1).optional(),
  productSlug: z.string(),
  name: z.string(),
  price: z.number(),
  currency: z.enum(["USD", "INR"]),
  quantity: z.number().int().min(1),
  image: z.string().optional(),
  /** Copied from product at add-to-cart for vendor order feeds. */
  vendorSlug: z.string().min(1).max(80).optional(),
  sku: z.string().optional(),
  /** Optional UsaRakhi dry-fruit / chocolate extras on this line. */
  addons: z.array(cartItemAddonSchema).max(20).optional(),
});

export const addToCartSchema = z.object({
  productSlug: z.string(),
  quantity: z.number().int().min(1).default(1),
  name: z.string().max(120).optional(),
  email: z.string().max(254).optional(),
  phone: z.string().max(40).optional(),
  /** Product add-on catalog ids (server resolves name/price). */
  addons: z.array(z.string().min(1).max(80)).max(20).optional(),
});

export const cartSchema = z.object({
  items: z.array(cartItemSchema).default([]),
  updatedAt: z.string(),
});

export type CartItemAddon = z.infer<typeof cartItemAddonSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
