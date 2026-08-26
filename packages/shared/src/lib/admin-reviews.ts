import {
  ADMIN_REVIEW_ORIGIN,
  ADMIN_REVIEW_STATUS,
  SITE_REVIEW_SLUG,
  type AdminReview,
  type ProductReview,
} from "../schemas/review";

/** Lead row as stored on CUSTOMERS_TABLE (SESSION# / LEAD#). */
export type LegacyReviewLead = {
  leadId?: string;
  sessionId?: string;
  name?: string;
  email?: string;
  page?: string;
  productSlug?: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, string | undefined>;
};

function trimText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseLeadRating(raw: unknown): number | undefined {
  const n = typeof raw === "number" ? raw : Number(String(raw ?? "").trim());
  if (!Number.isInteger(n) || n < 1 || n > 5) return undefined;
  return n;
}

function leadReviewBody(lead: LegacyReviewLead): string {
  const meta = lead.metadata ?? {};
  return trimText(meta.message) || trimText(meta.body) || trimText(meta.review);
}

/** Collapse whitespace so the same customer text is not listed twice. */
export function adminReviewDedupeKey(review: {
  authorEmail?: string;
  authorName?: string;
  body: string;
}): string {
  const email = (review.authorEmail ?? "").trim().toLowerCase();
  const body = review.body.trim().toLowerCase().replace(/\s+/g, " ");
  if (email) return `e:${email}|${body}`;
  const name = (review.authorName ?? "").trim().toLowerCase();
  return `n:${name}|${body}`;
}

export function catalogReviewToAdmin(review: ProductReview): AdminReview {
  const published = review.published !== false;
  return {
    reviewId: review.reviewId,
    productSlug: review.productSlug || SITE_REVIEW_SLUG,
    authorName: review.authorName,
    rating: review.rating,
    title: review.title,
    body: review.body,
    source: review.source,
    published,
    verifiedPurchase: review.verifiedPurchase,
    authorEmail: review.authorEmail,
    city: review.city,
    orderId: review.orderId,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    origin: ADMIN_REVIEW_ORIGIN.CATALOG,
    status: published ? ADMIN_REVIEW_STATUS.PUBLISHED : ADMIN_REVIEW_STATUS.UNPUBLISHED,
    canDelete: true,
  };
}

/**
 * Map a pre–Review Management `/leads` submission into an admin row.
 * Returns null when the lead is not a customer review (wrong source or empty body).
 */
export function legacyLeadToAdminReview(lead: LegacyReviewLead): AdminReview | null {
  if (lead.source !== "review") return null;
  const body = leadReviewBody(lead);
  if (!body) return null;

  const createdAt = trimText(lead.createdAt) || new Date(0).toISOString();
  const leadId = trimText(lead.leadId) || createdAt;
  const authorName = trimText(lead.name) || "Customer";
  const city = trimText(lead.metadata?.city) || undefined;
  const orderId = trimText(lead.metadata?.orderId) || undefined;
  const productSlug = trimText(lead.productSlug) || SITE_REVIEW_SLUG;

  return {
    reviewId: `lead:${leadId}`,
    productSlug,
    authorName,
    rating: parseLeadRating(lead.metadata?.rating),
    body,
    source: "lead",
    published: false,
    authorEmail: trimText(lead.email) || undefined,
    city,
    orderId,
    createdAt,
    updatedAt: trimText(lead.updatedAt) || createdAt,
    origin: ADMIN_REVIEW_ORIGIN.LEGACY_LEAD,
    status: ADMIN_REVIEW_STATUS.HISTORICAL,
    canDelete: false,
    leadId,
  };
}

/**
 * Combine catalog reviews and historical lead reviews for the admin list.
 * Catalog rows win on duplicate customer+body; nothing is written back to DynamoDB.
 */
export function mergeAdminReviews(
  catalog: ProductReview[],
  leads: LegacyReviewLead[]
): AdminReview[] {
  const byReviewId = new Map<string, AdminReview>();
  const fingerprints = new Set<string>();

  for (const review of catalog) {
    if (!review.reviewId || byReviewId.has(review.reviewId)) continue;
    const row = catalogReviewToAdmin(review);
    byReviewId.set(row.reviewId, row);
    fingerprints.add(adminReviewDedupeKey(row));
  }

  for (const lead of leads) {
    const row = legacyLeadToAdminReview(lead);
    if (!row) continue;
    if (byReviewId.has(row.reviewId)) continue;
    const key = adminReviewDedupeKey(row);
    if (fingerprints.has(key)) continue;
    byReviewId.set(row.reviewId, row);
    fingerprints.add(key);
  }

  return [...byReviewId.values()].sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || "")
  );
}
