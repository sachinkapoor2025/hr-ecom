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

/** Where an admin-list row was loaded from. Catalog writes are never copied from leads. */
export const ADMIN_REVIEW_ORIGIN = {
  CATALOG: "catalog",
  LEGACY_LEAD: "legacy_lead",
} as const;
export type AdminReviewOrigin = (typeof ADMIN_REVIEW_ORIGIN)[keyof typeof ADMIN_REVIEW_ORIGIN];

/** Display / editable status in Admin → Reviews. */
export const ADMIN_REVIEW_STATUS = {
  PUBLISHED: "published",
  HISTORICAL: "historical",
} as const;
export type AdminReviewStatus = (typeof ADMIN_REVIEW_STATUS)[keyof typeof ADMIN_REVIEW_STATUS];

/** Admin toggle: Published (on the website) or Historical (admin-only). */
export const updateAdminReviewStatusSchema = z.object({
  status: z.enum([ADMIN_REVIEW_STATUS.PUBLISHED, ADMIN_REVIEW_STATUS.HISTORICAL]),
  origin: z.enum([ADMIN_REVIEW_ORIGIN.CATALOG, ADMIN_REVIEW_ORIGIN.LEGACY_LEAD]).optional(),
  sessionId: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .transform((v) => (v ? v : undefined)),
  createdAt: z
    .string()
    .trim()
    .min(1)
    .optional()
    .transform((v) => (v ? v : undefined)),
});
export type UpdateAdminReviewStatusInput = z.infer<typeof updateAdminReviewStatusSchema>;

export type AdminReviewOrderItem = {
  name: string;
  productSlug: string;
  quantity: number;
};

/**
 * Unified admin row: live catalog reviews plus pre–Review Management lead submissions.
 * Read-only mapping — does not persist or rewrite DynamoDB items.
 */
export type AdminReview = {
  reviewId: string;
  productSlug: string;
  authorName: string;
  rating?: number;
  title?: string;
  body: string;
  source: ProductReview["source"] | "lead";
  published: boolean;
  verifiedPurchase?: boolean;
  authorEmail?: string;
  city?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
  origin: AdminReviewOrigin;
  status: AdminReviewStatus;
  canDelete: boolean;
  leadId?: string;
  sessionId?: string;
  orderNumber?: string;
  resolvedOrderId?: string;
  orderStatus?: string;
  orderItems?: AdminReviewOrderItem[];
};

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
  const { authorEmail: _omit, ...rest } = review;
  void _omit;
  return rest;
}
