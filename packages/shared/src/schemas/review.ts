import { z } from "zod";

/** Reserved slug for site-wide customer reviews (not a catalog product). */
export const SITE_REVIEW_SLUG = "_site";

const optionalTrimmed = z
  .string()
  .trim()
  .max(120)
  .optional()
  .transform((v) => (v ? v : undefined));

/** Stored review attached to a product (self-hosted or imported from a widget). */
export const productReviewSchema = z.object({
  reviewId: z.string().min(1),
  productSlug: z.string().min(1),
  authorName: z.string().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(1).max(4000),
  source: z.enum(["site", "trustpilot", "judgeme", "yotpo", "import"]).default("site"),
  published: z.boolean().default(true),
  verifiedPurchase: z.boolean().optional(),
  authorEmail: z.string().email().optional(),
  city: z.string().max(120).optional(),
  orderId: z.string().max(80).optional(),
});

export type ProductReview = z.infer<typeof productReviewSchema> & {
  createdAt: string;
  updatedAt: string;
};

/** Storefront payload — never includes author email. */
export type PublicProductReview = Omit<ProductReview, "authorEmail">;

/** Aggregate denormalized on the product record for Product JSON-LD. */
export const productRatingAggregateSchema = z.object({
  ratingValue: z.number().min(1).max(5),
  reviewCount: z.number().int().min(0),
  bestRating: z.number().int().min(1).max(5).default(5),
  worstRating: z.number().int().min(1).max(5).default(1),
});

export type ProductRatingAggregate = z.infer<typeof productRatingAggregateSchema>;

export const createProductReviewSchema = productReviewSchema.omit({ reviewId: true });
export type CreateProductReviewInput = z.infer<typeof createProductReviewSchema>;

/** Public customer submit — always published immediately. */
export const submitCustomerReviewSchema = z.object({
  authorName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(20).max(4000),
  city: optionalTrimmed,
  orderId: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v ? v : undefined)),
  productSlug: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type SubmitCustomerReviewInput = z.infer<typeof submitCustomerReviewSchema>;

export function toPublicReview(review: ProductReview): PublicProductReview {
  const { authorEmail: _email, ...rest } = review;
  return rest;
}
