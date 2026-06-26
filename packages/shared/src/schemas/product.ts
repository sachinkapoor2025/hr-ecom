import { z } from "zod";

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
  inventory: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  published: z.boolean().default(true),
  popularity: z.number().int().min(0).optional(),
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
  inventory: z.coerce.number().int().min(0).default(0),
  tags: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  published: z.coerce.boolean().default(true),
});

export type Product = z.infer<typeof productSchema> & {
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type BulkProductRow = z.infer<typeof bulkProductRowSchema>;
