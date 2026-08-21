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
  getReviewEmailChannelStatus,
  getReviewWhatsAppChannelStatus,
  getReviewRequestOverallStatus,
  getReviewRequestOverallLabel,
  canRetryReviewChannel,
  REVIEW_EMAIL_UNAVAILABLE_LABEL,
  REVIEW_WHATSAPP_UNAVAILABLE_LABEL,
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

  it("treats missing email as email done without marking it sent", () => {
    const missingEmail = {
      ...base,
      reviewEmailUnavailableAt: "2026-08-20T12:02:00.000Z",
    };
    assert.equal(isReviewEmailChannelDone(missingEmail), true);
    assert.equal(getReviewEmailChannelStatus(missingEmail).status, "not_available");
    assert.equal(getReviewEmailChannelStatus(missingEmail).label, REVIEW_EMAIL_UNAVAILABLE_LABEL);
    assert.equal(reviewRequestStillNeeded(missingEmail), true);
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

describe("review-request admin display status", () => {
  const delivered = {
    status: ORDER_STATUS.DELIVERED,
    deliveredAt: "2026-08-20T12:00:00.000Z",
    reviewEmailDueAt: "2026-08-20T12:00:00.000Z",
  };

  it("shows Sent only when provider success timestamps are set", () => {
    const bothSent = {
      ...delivered,
      reviewEmailSentAt: "2026-08-20T12:02:00.000Z",
      reviewEmailProvider: "smtp",
      reviewEmailMessageId: "<abc@mail.usarakhi.com>",
      reviewEmailProviderStatus: "250 2.0.0 OK",
      reviewWhatsAppSentAt: "2026-08-20T12:02:01.000Z",
      reviewWhatsAppProvider: "twilio",
      reviewWhatsAppMessageId: "SM123",
      reviewWhatsAppProviderStatus: "queued",
    };
    assert.equal(getReviewEmailChannelStatus(bothSent).status, "sent");
    assert.equal(getReviewWhatsAppChannelStatus(bothSent).status, "sent");
    assert.equal(getReviewRequestOverallStatus(bothSent), "sent");
    assert.equal(getReviewRequestOverallLabel(bothSent), "Review Request: Sent");
    assert.equal(canRetryReviewChannel(bothSent, "email"), false);
    assert.equal(canRetryReviewChannel(bothSent, "whatsapp"), false);
  });

  it("shows Partially Sent when email succeeded and WhatsApp failed", () => {
    const order = {
      ...delivered,
      reviewEmailSentAt: "2026-08-20T12:02:00.000Z",
      reviewWhatsAppLastError: "Twilio 63007: From number is not a WhatsApp sender",
      reviewWhatsAppLastAttemptAt: "2026-08-20T12:02:01.000Z",
    };
    assert.equal(getReviewEmailChannelStatus(order).status, "sent");
    assert.equal(getReviewWhatsAppChannelStatus(order).status, "failed");
    assert.equal(getReviewRequestOverallStatus(order), "partially_sent");
    assert.equal(getReviewRequestOverallLabel(order), "Review Request: Partially Sent");
    assert.equal(canRetryReviewChannel(order, "email"), false);
    assert.equal(canRetryReviewChannel(order, "whatsapp"), true);
    assert.equal(reviewRequestStillNeeded(order), true);
  });

  it("shows Partially Sent when email failed and WhatsApp succeeded", () => {
    const order = {
      ...delivered,
      reviewEmailLastError: "SMTP connection failed",
      reviewEmailLastAttemptAt: "2026-08-20T12:02:00.000Z",
      reviewWhatsAppSentAt: "2026-08-20T12:02:01.000Z",
    };
    assert.equal(getReviewEmailChannelStatus(order).status, "failed");
    assert.equal(getReviewWhatsAppChannelStatus(order).status, "sent");
    assert.equal(getReviewRequestOverallStatus(order), "partially_sent");
    assert.equal(canRetryReviewChannel(order, "email"), true);
    assert.equal(canRetryReviewChannel(order, "whatsapp"), false);
  });

  it("shows Failed when both channels failed", () => {
    const order = {
      ...delivered,
      reviewEmailLastError: "Daily send limit",
      reviewEmailLastAttemptAt: "2026-08-20T12:02:00.000Z",
      reviewWhatsAppLastError: "Meta WhatsApp 400",
      reviewWhatsAppLastAttemptAt: "2026-08-20T12:02:01.000Z",
    };
    assert.equal(getReviewEmailChannelStatus(order).status, "failed");
    assert.equal(getReviewWhatsAppChannelStatus(order).status, "failed");
    assert.equal(getReviewRequestOverallStatus(order), "failed");
    assert.equal(getReviewRequestOverallLabel(order), "Review Request: Failed");
    assert.equal(canRetryReviewChannel(order, "email"), true);
    assert.equal(canRetryReviewChannel(order, "whatsapp"), true);
  });

  it("shows Not Available for missing phone instead of Failed", () => {
    const order = {
      ...delivered,
      reviewEmailSentAt: "2026-08-20T12:02:00.000Z",
      reviewWhatsAppSkippedAt: "2026-08-20T12:02:01.000Z",
      reviewWhatsAppLastError: "No valid WhatsApp number",
    };
    assert.equal(getReviewWhatsAppChannelStatus(order).status, "not_available");
    assert.equal(getReviewWhatsAppChannelStatus(order).label, REVIEW_WHATSAPP_UNAVAILABLE_LABEL);
    assert.equal(getReviewRequestOverallStatus(order), "sent");
    assert.notEqual(getReviewWhatsAppChannelStatus(order).status, "failed");
  });

  it("shows Not Available for missing email instead of Failed or Sent", () => {
    const order = {
      ...delivered,
      reviewEmailUnavailableAt: "2026-08-20T12:02:00.000Z",
      reviewEmailLastError: "Invalid/Missing email",
      reviewWhatsAppSentAt: "2026-08-20T12:02:01.000Z",
    };
    assert.equal(getReviewEmailChannelStatus(order).status, "not_available");
    assert.equal(getReviewEmailChannelStatus(order).label, REVIEW_EMAIL_UNAVAILABLE_LABEL);
    assert.notEqual(getReviewEmailChannelStatus(order).status, "sent");
    assert.notEqual(getReviewEmailChannelStatus(order).status, "failed");
    assert.equal(getReviewRequestOverallStatus(order), "sent");
  });

  it("shows Not Sent overall when both channels are not available", () => {
    const order = {
      ...delivered,
      reviewEmailUnavailableAt: "2026-08-20T12:02:00.000Z",
      reviewWhatsAppSkippedAt: "2026-08-20T12:02:01.000Z",
    };
    assert.equal(getReviewRequestOverallStatus(order), "not_sent");
    assert.equal(getReviewRequestOverallLabel(order), "Not Sent");
  });

  it("does not send again after Delivered → Complete when both channels succeeded", () => {
    const completed = {
      ...delivered,
      status: ORDER_STATUS.COMPLETE,
      reviewEmailSentAt: "2026-08-20T12:02:00.000Z",
      reviewWhatsAppSentAt: "2026-08-20T12:02:00.000Z",
    };
    assert.equal(reviewRequestStillNeeded(completed), false);
    assert.equal(canRetryReviewChannel(completed, "email"), false);
    assert.equal(canRetryReviewChannel(completed, "whatsapp"), false);
  });

  it("allows retrying only the failed channel after a partial send", () => {
    const order = {
      ...delivered,
      status: ORDER_STATUS.COMPLETE,
      reviewEmailSentAt: "2026-08-20T12:02:00.000Z",
      reviewWhatsAppLastError: "WhatsApp send failed",
      reviewWhatsAppLastAttemptAt: "2026-08-20T12:02:01.000Z",
    };
    assert.equal(reviewRequestStillNeeded(order), true);
    assert.equal(canRetryReviewChannel(order, "email"), false);
    assert.equal(canRetryReviewChannel(order, "whatsapp"), true);
  });

  it("does not treat a lastError as Sent when sentAt is missing", () => {
    const triggeredButFailed = {
      ...delivered,
      reviewEmailLastError: "SMTP connection failed",
      reviewEmailLastAttemptAt: "2026-08-20T12:02:00.000Z",
    };
    assert.equal(getReviewEmailChannelStatus(triggeredButFailed).status, "failed");
    assert.equal(getReviewRequestOverallStatus(triggeredButFailed), "failed");
  });

  it("does not treat a legacy missing-email claim as Sent", () => {
    const legacy = {
      ...delivered,
      reviewEmailSentAt: "2026-08-20T12:02:00.000Z",
      reviewEmailLastError: "No customer email",
    };
    assert.equal(getReviewEmailChannelStatus(legacy).status, "not_available");
    assert.equal(getReviewEmailChannelStatus(legacy).label, REVIEW_EMAIL_UNAVAILABLE_LABEL);
    assert.equal(canRetryReviewChannel(legacy, "email"), true);
  });
});
