import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { containsEmoji, stripEmojis } from "./strip-emojis";

describe("stripEmojis", () => {
  it("removes emoji from review-request style copy and keeps the wording", () => {
    const input = `Hi Priya ❤️

Your UsaRakhi order #US10360 has been delivered! 🎁

We hope your brother loved the Rakhi and that our little surprise made your celebration more special. 😊

Could you take just a minute to share your experience with us? ⭐ Your feedback means a lot to us and helps other families shop with confidence.

👉 Share Your Review:
https://www.usarakhi.com/reviews

Thank you for choosing UsaRakhi and being a part of our journey! ❤️`;
    const out = stripEmojis(input);
    assert.equal(containsEmoji(out), false);
    assert.match(out, /^Hi Priya$/m);
    assert.match(out, /has been delivered!$/m);
    assert.match(out, /more special\.$/m);
    assert.match(out, /shop with confidence\.$/m);
    assert.match(out, /^Share Your Review:$/m);
    assert.match(out, /part of our journey!$/m);
  });

  it("does not remove arrows, dashes, or order punctuation", () => {
    const input = "Order #US10001 — shipped.\nTrack → https://www.usarakhi.com/orders/abc";
    assert.equal(stripEmojis(input), input);
    assert.equal(containsEmoji(input), false);
  });

  it("leaves copy unchanged when there are no emojis", () => {
    const input = "Hi Priya,\n\nThank you for your order!";
    assert.equal(stripEmojis(input), input);
  });
});
