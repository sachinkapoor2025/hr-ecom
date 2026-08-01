import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BELOW_THRESHOLD_SHIPPING_USD,
  FREE_SHIPPING_MIN_SUBTOTAL_USD,
  quoteAddressShipmentShipping,
  quoteFreeShippingThreshold,
  quoteShipmentsShipping,
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

describe("quoteShipmentsShipping", () => {
  it("charges $6.99 only for under-$7 deliveries", () => {
    const { totalCharge, perShipment } = quoteShipmentsShipping({
      shipmentSubtotals: [10, 12, 3],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(perShipment[0].charge, 0);
    assert.equal(perShipment[1].charge, 0);
    assert.equal(perShipment[2].charge, BELOW_THRESHOLD_SHIPPING_USD);
    assert.equal(totalCharge, BELOW_THRESHOLD_SHIPPING_USD);
  });
});

describe("quoteAddressShipmentShipping", () => {
  it("charges per vendor when UsaRakhi and Orange County share an address", () => {
    const { totalCharge, perVendor } = quoteAddressShipmentShipping({
      items: [
        { price: 2.75, quantity: 1 }, // usarakhi default
        { price: 2.75, quantity: 1, vendorSlug: "orange-county" },
        { price: 50, quantity: 1, vendorSlug: "orange-county" },
      ],
      currency: "USD",
      usdInrRate: 96,
    });
    // UsaRakhi $2.75 → $6.99; Orange County $52.75 → free
    assert.equal(perVendor.length, 2);
    assert.equal(totalCharge, BELOW_THRESHOLD_SHIPPING_USD);
  });

  it("charges $6.99 twice when both vendors are under $7", () => {
    const { totalCharge } = quoteAddressShipmentShipping({
      items: [
        { price: 2.75, quantity: 1 },
        { price: 3, quantity: 1, vendorSlug: "orange-county" },
      ],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(totalCharge, BELOW_THRESHOLD_SHIPPING_USD * 2);
  });
});
