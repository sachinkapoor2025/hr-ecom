import { z } from "zod";
import { DEFAULT_PRODUCT_INVENTORY } from "../constants";

export const productSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  currency: z.enum(["USD", "INR"]).default("USD"),
  categorySlug: z.string().min(1),
  images: z.array(z.string().url()).default([]),
  sku: z.string().optional(),
  inventory: z.number().int().min(0).default(DEFAULT_PRODUCT_INVENTORY),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  published: z.boolean().default(true),
  /** Set when low-stock email sent; cleared when restocked above threshold. */
  lowStockAlertSentAt: z.string().optional(),
  /** Lifetime units sold (incremented when order is paid). */
  unitsSold: z.number().int().min(0).optional(),
  /** Shipping weight in ounces (recommended for accurate USPS rates). */
  weightOz: z.number().positive().optional(),
  /** Package dimensions in inches (recommended for accurate USPS rates). */
  lengthIn: z.number().positive().optional(),
  widthIn: z.number().positive().optional(),
  heightIn: z.number().positive().optional(),
});

export const createProductSchema = productSchema.omit({ slug: true }).extend({
  name: z.string().min(1),
});

export const updateProductSchema = productSchema.partial().omit({ slug: true });

export const bulkProductRowSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional(),
  currency: z.enum(["USD", "INR"]).default("USD"),
  categorySlug: z.string().min(1),
  sku: z.string().optional(),
  inventory: z.coerce.number().int().min(0).default(DEFAULT_PRODUCT_INVENTORY),
  tags: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  published: z.coerce.boolean().default(true),
  weightOz: z.coerce.number().positive().optional(),
  lengthIn: z.coerce.number().positive().optional(),
  widthIn: z.coerce.number().positive().optional(),
  heightIn: z.coerce.number().positive().optional(),
});

export type Product = z.infer<typeof productSchema> & {
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type BulkProductRow = z.infer<typeof bulkProductRowSchema>;
