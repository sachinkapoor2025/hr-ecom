import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SITE_REVIEW_SLUG,
  submitCustomerReviewSchema,
  createProductReviewSchema,
  updateAdminReviewStatusSchema,
  toPublicReview,
  type ProductReview,
} from "./review";

describe("customer review submit", () => {
  it("accepts a valid submission and blanks optional fields", () => {
    const parsed = submitCustomerReviewSchema.parse({
      authorName: " Neha ",
      email: "neha@example.com",
      rating: "5",
      body: "Delivery was on time and the Rakhi was beautiful. My brother loved it.",
      city: "  ",
      orderId: "",
    });
    assert.equal(parsed.authorName, "Neha");
    assert.equal(parsed.rating, 5);
    assert.equal(parsed.city, undefined);
    assert.equal(parsed.orderId, undefined);
  });

  it("rejects a review that is too short", () => {
    const result = submitCustomerReviewSchema.safeParse({
      authorName: "Neha",
      email: "neha@example.com",
      rating: 5,
      body: "Too short",
    });
    assert.equal(result.success, false);
  });

  it("defaults admin-created reviews to published", () => {
    const parsed = createProductReviewSchema.parse({
      productSlug: SITE_REVIEW_SLUG,
      authorName: "Admin",
      rating: 5,
      body: "Imported review",
    });
    assert.equal(parsed.published, true);
  });

  it("strips author email from the public payload", () => {
    const review: ProductReview = {
      reviewId: "r1",
      productSlug: SITE_REVIEW_SLUG,
      authorName: "Neha",
      rating: 5,
      body: "Great delivery experience from UsaRakhi this year.",
      source: "site",
      published: true,
      authorEmail: "neha@example.com",
      createdAt: "2026-08-25T00:00:00.000Z",
      updatedAt: "2026-08-25T00:00:00.000Z",
    };
    const publicReview = toPublicReview(review);
    assert.equal("authorEmail" in publicReview, false);
    assert.equal(publicReview.authorName, "Neha");
  });

  it("accepts published and historical admin status updates", () => {
    assert.equal(updateAdminReviewStatusSchema.parse({ status: "published" }).status, "published");
    const historical = updateAdminReviewStatusSchema.parse({
      status: "historical",
      sessionId: "sess-1",
      createdAt: "2026-08-01T00:00:00.000Z",
    });
    assert.equal(historical.status, "historical");
    assert.equal(historical.sessionId, "sess-1");
  });
});
