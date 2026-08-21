import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ORDER_STATUS } from "../constants";
import {
  isDeliveredStatus,
  isReviewEmailChannelDone,
  isReviewWhatsAppChannelDone,
  isReviewEmailDue,
  reviewRequestStillNeeded,
  resolveReviewEmailDueAt,
} from "./review-email";
import {
  omitEmptyGoogleReviewLines,
  renderReviewRequestTemplate,
} from "../schemas/review-request";

describe("review-request eligibility", () => {
  const base = {
    status: ORDER_STATUS.DELIVERED,
    deliveredAt: "2026-08-20T12:00:00.000Z",
    reviewEmailDueAt: "2026-08-20T12:00:00.000Z",
  };

  it("treats delivered and complete as review-eligible statuses", () => {
    assert.equal(isDeliveredStatus(ORDER_STATUS.DELIVERED), true);
    assert.equal(isDeliveredStatus(ORDER_STATUS.COMPLETE), true);
    assert.equal(isDeliveredStatus(ORDER_STATUS.SHIPPED), false);
  });

  it("needs a request the first time an order is delivered", () => {
    assert.equal(reviewRequestStillNeeded(base), true);
    assert.equal(isReviewEmailDue(base, new Date("2026-08-20T12:01:00.000Z")), true);
  });

  it("does not send again after email + WhatsApp succeeded", () => {
    const sent = {
      ...base,
      reviewEmailSentAt: "2026-08-20T12:02:00.000Z",
      reviewWhatsAppSentAt: "2026-08-20T12:02:00.000Z",
    };
    assert.equal(reviewRequestStillNeeded(sent), false);
    assert.equal(isReviewEmailDue(sent, new Date("2026-08-21T12:00:00.000Z")), false);
  });

  it("does not send again after Delivered → Complete when already sent", () => {
    const completed = {
      ...base,
      status: ORDER_STATUS.COMPLETE,
      reviewEmailSentAt: "2026-08-20T12:02:00.000Z",
      reviewWhatsAppSentAt: "2026-08-20T12:02:00.000Z",
    };
    assert.equal(reviewRequestStillNeeded(completed), false);
  });

  it("treats missing-phone skip as WhatsApp done without blocking email retry", () => {
    const skippedWa = {
      ...base,
      reviewWhatsAppSkippedAt: "2026-08-20T12:02:00.000Z",
    };
    assert.equal(isReviewWhatsAppChannelDone(skippedWa), true);
    assert.equal(isReviewEmailChannelDone(skippedWa), false);
    assert.equal(reviewRequestStillNeeded(skippedWa), true);
  });

  it("is not due before the due stamp", () => {
    assert.equal(
      isReviewEmailDue(base, new Date("2026-08-20T11:59:00.000Z")),
      false
    );
  });

  it("resolves dueAt from the stored stamp first", () => {
    assert.equal(resolveReviewEmailDueAt(base), "2026-08-20T12:00:00.000Z");
    assert.equal(
      resolveReviewEmailDueAt({
        ...base,
        reviewEmailSentAt: "2026-08-20T12:02:00.000Z",
        reviewWhatsAppSentAt: "2026-08-20T12:02:00.000Z",
      }),
      null
    );
  });
});

describe("review-request templates", () => {
  const vars = {
    name: "Priya",
    orderNumber: "US10360",
    statusLabel: "Delivered",
    websiteReviewUrl: "https://www.usarakhi.com/reviews",
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=abc",
    siteUrl: "https://www.usarakhi.com",
  };

  it("interpolates placeholders", () => {
    const out = renderReviewRequestTemplate(
      "Hi {{name}}, order {{orderNumber}} is {{statusLabel}}.",
      vars
    );
    assert.equal(out, "Hi Priya, order US10360 is Delivered.");
  });

  it("omits Google lines when the URL is empty", () => {
    const text = omitEmptyGoogleReviewLines(
      "Leave a review: {{websiteReviewUrl}}\nReview us on Google: {{googleReviewUrl}}\nThanks",
      ""
    );
    assert.equal(text.includes("Google"), false);
    assert.equal(text.includes("Leave a review"), true);
  });
});
