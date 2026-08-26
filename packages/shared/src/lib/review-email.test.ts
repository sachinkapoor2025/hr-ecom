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
  DEFAULT_REVIEW_REQUEST_EMAIL_SUBJECT,
  DEFAULT_REVIEW_REQUEST_EMAIL_TEXT,
  DEFAULT_REVIEW_REQUEST_WHATSAPP,
  omitEmptyGoogleReviewLines,
  renderReviewRequestTemplate,
  withCurrentReviewCopy,
  defaultReviewRequestSettings,
} from "../schemas/review-request";
import { buildReviewRequestEmailHtml } from "./review-request-email-html";
import { containsEmoji } from "./strip-emojis";

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

  it("does not auto-send again after the review email succeeded (WhatsApp is manual)", () => {
    const emailSent = {
      ...base,
      reviewEmailSentAt: "2026-08-20T12:02:00.000Z",
    };
    assert.equal(reviewRequestStillNeeded(emailSent), false);
    assert.equal(isReviewEmailDue(emailSent, new Date("2026-08-21T12:00:00.000Z")), false);
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
    assert.equal(reviewRequestStillNeeded(missingEmail), false);
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

  it("uses the shared friendly review-request wording for email and WhatsApp", () => {
    const subject = renderReviewRequestTemplate(DEFAULT_REVIEW_REQUEST_EMAIL_SUBJECT, vars);
    assert.equal(subject, "Your UsaRakhi order #US10360 has been delivered!");
    const body = renderReviewRequestTemplate(DEFAULT_REVIEW_REQUEST_EMAIL_TEXT, vars);
    assert.match(body, /^Hi Priya,/);
    assert.match(body, /Your UsaRakhi order #US10360 has been delivered!/);
    assert.match(body, /We hope your brother loved the Rakhi/);
    assert.match(body, /share your experience/);
    assert.match(body, /Share Your Review:\nhttps:\/\/www\.usarakhi\.com\/reviews/);
    assert.match(body, /Thank you for choosing UsaRakhi/);
    assert.equal(body.includes("Google"), false);
    assert.equal(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(body), false);
  });

  it("upgrades stored legacy templates to the current shared copy", () => {
    const upgraded = withCurrentReviewCopy({
      ...defaultReviewRequestSettings,
      emailSubjectTemplate: "Order {{statusLabel}} — #{{orderNumber}} | UsaRakhi",
      emailTextTemplate: `Hi {{name}},

Your order #{{orderNumber}} has been {{statusLabel}}.

We hope your brother loves his Rakhi! If you have a moment, we would love to hear how the delivery went. Your review helps other families send Rakhi with confidence.

Leave a Review:
{{websiteReviewUrl}}

Review us on Google:
{{googleReviewUrl}}

This is optional — only share if you would like to.

Questions? Reply to this email or WhatsApp us.

— UsaRakhi Team
{{siteUrl}}`,
      whatsappTemplate: `Hi {{name}}! Thank you — your UsaRakhi order {{orderNumber}} is {{statusLabel}}.

Leave a review: {{websiteReviewUrl}}
Review us on Google: {{googleReviewUrl}}

We hope your brother loved his Rakhi.`,
    });
    assert.equal(upgraded.emailSubjectTemplate, DEFAULT_REVIEW_REQUEST_EMAIL_SUBJECT);
    assert.equal(upgraded.emailTextTemplate, DEFAULT_REVIEW_REQUEST_EMAIL_TEXT);
    assert.equal(upgraded.whatsappTemplate, DEFAULT_REVIEW_REQUEST_WHATSAPP);
  });

  it("upgrades the previous emoji review template and strips leftover emoji from custom copy", () => {
    const emojiTemplate = `Hi {{name}} ❤️

Your UsaRakhi order #{{orderNumber}} has been delivered! 🎁

We hope your brother loved the Rakhi and that our little surprise made your celebration more special. 😊

Could you take just a minute to share your experience with us? ⭐ Your feedback means a lot to us and helps other families shop with confidence.

👉 Share Your Review:
{{websiteReviewUrl}}

Thank you for choosing UsaRakhi and being a part of our journey! ❤️`;
    const upgraded = withCurrentReviewCopy({
      ...defaultReviewRequestSettings,
      emailTextTemplate: emojiTemplate,
      whatsappTemplate: emojiTemplate,
    });
    assert.equal(upgraded.emailTextTemplate, DEFAULT_REVIEW_REQUEST_EMAIL_TEXT);
    assert.equal(upgraded.whatsappTemplate, DEFAULT_REVIEW_REQUEST_WHATSAPP);
    assert.equal(containsEmoji(upgraded.emailTextTemplate), false);
    assert.equal(containsEmoji(DEFAULT_REVIEW_REQUEST_EMAIL_TEXT), false);

    const custom = withCurrentReviewCopy({
      ...defaultReviewRequestSettings,
      emailTextTemplate: "Hi {{name}} 🎁 — thanks for your order.",
    });
    assert.equal(custom.emailTextTemplate, "Hi {{name}} — thanks for your order.");
    assert.equal(containsEmoji(custom.emailTextTemplate), false);
  });

  it("drops Google CTA from the default template when no Google URL is set", () => {
    const text = omitEmptyGoogleReviewLines(DEFAULT_REVIEW_REQUEST_EMAIL_TEXT, "");
    assert.equal(text.includes("Google"), false);
    assert.equal(text.includes("{{websiteReviewUrl}}"), true);
  });

  it("renders review HTML with the Share Your Review button", () => {
    const body = renderReviewRequestTemplate(DEFAULT_REVIEW_REQUEST_EMAIL_TEXT, vars);
    const html = buildReviewRequestEmailHtml({
      bodyText: body,
      websiteReviewUrl: vars.websiteReviewUrl,
    });
    assert.equal(html.includes("<!DOCTYPE"), false);
    assert.match(html, /Hi Priya,/);
    assert.match(html, /Your UsaRakhi order #US10360 has been delivered!/);
    assert.match(html, /Share Your Review/);
    assert.equal(html.includes(vars.websiteReviewUrl), true);
    assert.equal(html.includes("Review us on Google"), false);
    assert.equal(/[\u{1F300}-\u{1FAFF}]/u.test(html), false);
  });

  it("omits the Google button when no Google URL is provided", () => {
    const html = buildReviewRequestEmailHtml({
      bodyText: "Hi Priya,\n\nThanks\n\nShare Your Review:\nhttps://www.usarakhi.com/reviews\n\nThank you",
      websiteReviewUrl: "https://www.usarakhi.com/reviews",
    });
    assert.equal(html.includes("Review us on Google"), false);
    assert.equal(html.includes("Share Your Review"), true);
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
    assert.equal(reviewRequestStillNeeded(order), false);
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

  it("treats Twilio 63038 daily limit as Failed so WhatsApp can be retried after the cap resets", () => {
    const order = {
      ...delivered,
      reviewEmailSentAt: "2026-08-20T12:02:00.000Z",
      reviewWhatsAppLastError:
        "Twilio 63038: Account exceeded the 50 daily WhatsApp messages limit (sandbox/trial cap).",
      reviewWhatsAppLastAttemptAt: "2026-08-20T12:02:01.000Z",
    };
    assert.equal(getReviewWhatsAppChannelStatus(order).status, "failed");
    assert.notEqual(getReviewWhatsAppChannelStatus(order).status, "sent");
    assert.equal(canRetryReviewChannel(order, "whatsapp"), true);
    assert.equal(reviewRequestStillNeeded(order), false);
  });

  it("allows retrying only the failed channel after a partial send", () => {
    const order = {
      ...delivered,
      status: ORDER_STATUS.COMPLETE,
      reviewEmailSentAt: "2026-08-20T12:02:00.000Z",
      reviewWhatsAppLastError: "WhatsApp send failed",
      reviewWhatsAppLastAttemptAt: "2026-08-20T12:02:01.000Z",
    };
    assert.equal(reviewRequestStillNeeded(order), false);
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
