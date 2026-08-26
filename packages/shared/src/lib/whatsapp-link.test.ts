import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildWhatsAppDeepLink,
  formatWhatsAppDisplayNumber,
  whatsappDigitsForOrderPhone,
} from "./whatsapp-link";
import {
  buildReviewRequestWhatsAppDraft,
  defaultReviewRequestSettings,
} from "../schemas/review-request";

describe("whatsappDigitsForOrderPhone", () => {
  it("keeps a US E.164 number from checkout", () => {
    assert.equal(whatsappDigitsForOrderPhone("+1 408 555 0100", "US"), "14085550100");
  });

  it("adds +1 for a 10-digit USA number without a country prefix", () => {
    assert.equal(whatsappDigitsForOrderPhone("408-555-0100", "US"), "14085550100");
    assert.equal(whatsappDigitsForOrderPhone("(408) 555-0100"), "14085550100");
  });

  it("adds +91 for a 10-digit India number when the shipping country is IN", () => {
    assert.equal(whatsappDigitsForOrderPhone("9876543210", "IN"), "919876543210");
  });

  it("keeps an India E.164 number", () => {
    assert.equal(whatsappDigitsForOrderPhone("+91 98765 43210", "IN"), "919876543210");
  });

  it("returns null for missing or too-short phones", () => {
    assert.equal(whatsappDigitsForOrderPhone(""), null);
    assert.equal(whatsappDigitsForOrderPhone("12345"), null);
    assert.equal(whatsappDigitsForOrderPhone(undefined), null);
  });
});

describe("buildWhatsAppDeepLink", () => {
  it("opens wa.me for the order phone with the pre-filled message", () => {
    const href = buildWhatsAppDeepLink("14085550100", "Hi Priya! Leave a review");
    assert.equal(href.startsWith("https://wa.me/14085550100?text="), true);
    assert.equal(href.includes(encodeURIComponent("Hi Priya! Leave a review")), true);
  });
});

describe("buildReviewRequestWhatsAppDraft", () => {
  it("fills name, order number, review links from the saved template", () => {
    const text = buildReviewRequestWhatsAppDraft(
      {
        orderId: "abc",
        orderNumber: "US10360",
        status: "delivered",
        shippingAddress: { name: "Priya Sharma" },
      },
      {
        ...defaultReviewRequestSettings,
        googleReviewUrl: "https://search.google.com/local/writereview?placeid=abc",
      }
    );
    assert.match(text, /Hi Priya,/);
    assert.match(text, /Your UsaRakhi order #US10360 has been delivered!/);
    assert.match(text, /https:\/\/www\.usarakhi\.com\/reviews/);
    assert.match(text, /Thank you for choosing UsaRakhi/);
    assert.equal(text.includes("Google"), false);
    assert.equal(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text), false);
  });
});

describe("formatWhatsAppDisplayNumber", () => {
  it("formats NANP numbers for the admin UI", () => {
    assert.equal(formatWhatsAppDisplayNumber("14085550100"), "+1 408 555 0100");
  });
});
