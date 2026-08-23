import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  quoteAddressShipmentShipping,
  quoteFreeShippingThreshold,
  quoteShipmentsShipping,
} from "./free-shipping";

describe("quoteFreeShippingThreshold", () => {
  it("is free with no cart minimum", () => {
    for (const subtotal of [0, 3.99, 10, 19.99, 20, 50]) {
      const quote = quoteFreeShippingThreshold({
        subtotal,
        currency: "USD",
        usdInrRate: 96,
      });
      assert.equal(quote.qualifiesForFreeShipping, true);
      assert.equal(quote.tier, "free");
      assert.equal(quote.charge, 0);
      assert.equal(quote.amountAwayFromFreeShipping, 0);
    }
  });

  it("is free for INR carts with no minimum", () => {
    const quote = quoteFreeShippingThreshold({
      subtotal: 100,
      currency: "INR",
      usdInrRate: 100,
    });
    assert.equal(quote.qualifiesForFreeShipping, true);
    assert.equal(quote.charge, 0);
  });
});

describe("quoteShipmentsShipping", () => {
  it("charges $0 for every delivery bucket", () => {
    const { totalCharge, perShipment } = quoteShipmentsShipping({
      shipmentSubtotals: [20, 10, 3],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(perShipment.every((q) => q.charge === 0), true);
    assert.equal(totalCharge, 0);
  });
});

describe("quoteAddressShipmentShipping", () => {
  it("is free even when vendors share an address with small subtotals", () => {
    const { totalCharge, perVendor } = quoteAddressShipmentShipping({
      items: [
        { price: 3.99, quantity: 1 },
        { price: 3.99, quantity: 1, vendorSlug: "orange-county" },
        { price: 50, quantity: 1, vendorSlug: "orange-county" },
      ],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(perVendor.length, 2);
    assert.equal(totalCharge, 0);
  });

  it("is free for small single-vendor carts", () => {
    const { totalCharge } = quoteAddressShipmentShipping({
      items: [{ price: 3.99, quantity: 1 }],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(totalCharge, 0);
  });

  it("charges flat $0.99 shipping for flash-combo-only buckets", () => {
    const { totalCharge, perVendor } = quoteAddressShipmentShipping({
      items: [
        {
          price: 12.97,
          quantity: 1,
          productSlug: "blue-beads-om-pista-flash-combo",
        },
      ],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(totalCharge, 0.99);
    assert.equal(perVendor[0]?.charge, 0.99);
  });

  it("keeps standard free when add-ons are present", () => {
    const { totalCharge } = quoteAddressShipmentShipping({
      items: [
        {
          price: 3.99,
          quantity: 1,
          addons: [{ price: 20, quantity: 1 }],
        },
      ],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(totalCharge, 0);
  });
});
