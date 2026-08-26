import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADMIN_REVIEW_ORIGIN,
  ADMIN_REVIEW_STATUS,
  SITE_REVIEW_SLUG,
  type ProductReview,
} from "../schemas/review";
import {
  catalogReviewToAdmin,
  legacyLeadToAdminReview,
  mergeAdminReviews,
} from "./admin-reviews";

const catalogReview: ProductReview = {
  reviewId: "r-new",
  productSlug: SITE_REVIEW_SLUG,
  authorName: "Neha",
  rating: 5,
  body: "Delivery was on time and the Rakhi packaging was beautiful for my brother.",
  source: "site",
  published: true,
  authorEmail: "neha@example.com",
  city: "San Jose, CA",
  orderId: "OC10021",
  createdAt: "2026-08-25T20:00:00.000Z",
  updatedAt: "2026-08-25T20:00:00.000Z",
};

describe("admin review merge (catalog + historical leads)", () => {
  it("maps a catalog review as published and deletable", () => {
    const row = catalogReviewToAdmin(catalogReview);
    assert.equal(row.origin, ADMIN_REVIEW_ORIGIN.CATALOG);
    assert.equal(row.status, ADMIN_REVIEW_STATUS.PUBLISHED);
    assert.equal(row.canDelete, true);
    assert.equal(row.authorEmail, "neha@example.com");
    assert.equal(row.orderId, "OC10021");
  });

  it("maps a pre-admin lead review without rewriting fields", () => {
    const row = legacyLeadToAdminReview({
      leadId: "lead-1",
      source: "review",
      name: "Priya",
      email: "priya@example.com",
      createdAt: "2026-08-10T12:00:00.000Z",
      metadata: {
        message: "My brother loved the Rakhi. Packaging and delivery were excellent.",
        rating: "5",
        city: "Fremont, CA",
        orderId: "OC10005",
      },
    });
    assert.ok(row);
    assert.equal(row.origin, ADMIN_REVIEW_ORIGIN.LEGACY_LEAD);
    assert.equal(row.status, ADMIN_REVIEW_STATUS.HISTORICAL);
    assert.equal(row.canDelete, false);
    assert.equal(row.published, false);
    assert.equal(row.reviewId, "lead:lead-1");
    assert.equal(row.rating, 5);
    assert.equal(row.orderId, "OC10005");
    assert.equal(row.city, "Fremont, CA");
  });

  it("ignores non-review leads and empty review bodies", () => {
    assert.equal(
      legacyLeadToAdminReview({ leadId: "x", source: "contact", metadata: { message: "hi" } }),
      null
    );
    assert.equal(
      legacyLeadToAdminReview({ leadId: "y", source: "review", metadata: { message: "   " } }),
      null
    );
  });

  it("includes historical and new reviews together without duplicating the same customer text", () => {
    const historical = {
      leadId: "old-1",
      source: "review" as const,
      name: "Anjali",
      email: "anjali@example.com",
      createdAt: "2026-08-01T00:00:00.000Z",
      metadata: {
        message: "Would recommend UsaRakhi to other sisters sending Rakhi to the USA.",
        rating: "4",
        orderId: "US10010",
      },
    };
    const duplicateLead = {
      ...historical,
      leadId: "old-dup",
      createdAt: "2026-08-01T00:01:00.000Z",
    };

    const merged = mergeAdminReviews([catalogReview], [historical, duplicateLead]);
    assert.equal(merged.length, 2);
    assert.equal(
      merged.some((r) => r.reviewId === catalogReview.reviewId),
      true
    );
    assert.equal(
      merged.some((r) => r.reviewId === "lead:old-1"),
      true
    );
    assert.equal(
      merged.some((r) => r.reviewId === "lead:old-dup"),
      false
    );
  });

  it("keeps the catalog row when the same email and body were later stored as a product review", () => {
    const lead = {
      leadId: "same",
      source: "review" as const,
      name: "Neha",
      email: "neha@example.com",
      createdAt: "2026-08-20T00:00:00.000Z",
      metadata: { message: catalogReview.body, rating: "5" },
    };
    const merged = mergeAdminReviews([catalogReview], [lead]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.origin, ADMIN_REVIEW_ORIGIN.CATALOG);
    assert.equal(merged[0]?.reviewId, catalogReview.reviewId);
  });
});
