import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BELOW_THRESHOLD_SHIPPING_USD,
  FREE_SHIPPING_MIN_SUBTOTAL_USD,
  quoteFreeShippingThreshold,
} from "./free-shipping";

describe("quoteFreeShippingThreshold", () => {
  it("charges $6.99 when cart is under $7", () => {
    const quote = quoteFreeShippingThreshold({
      subtotal: 6.99,
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(quote.qualifiesForFreeShipping, false);
    assert.equal(quote.charge, BELOW_THRESHOLD_SHIPPING_USD);
    assert.ok(Math.abs(quote.amountAwayFromFreeShipping - 0.01) < 0.001);
  });

  it("is free at exactly $7", () => {
    const quote = quoteFreeShippingThreshold({
      subtotal: FREE_SHIPPING_MIN_SUBTOTAL_USD,
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(quote.qualifiesForFreeShipping, true);
    assert.equal(quote.charge, 0);
    assert.equal(quote.amountAwayFromFreeShipping, 0);
  });

  it("applies the same USD threshold for INR carts", () => {
    const rate = 100;
    const quote = quoteFreeShippingThreshold({
      subtotal: 600,
      currency: "INR",
      usdInrRate: rate,
    });
    assert.equal(quote.qualifiesForFreeShipping, false);
    assert.equal(quote.charge, Math.round(BELOW_THRESHOLD_SHIPPING_USD * rate));
    assert.equal(quote.thresholdInCurrency, FREE_SHIPPING_MIN_SUBTOTAL_USD * rate);
  });
});
