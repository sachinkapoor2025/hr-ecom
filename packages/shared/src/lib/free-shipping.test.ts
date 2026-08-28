import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FREE_STANDARD_SHIPPING_TAG,
  USARAKHI_MIN_ORDER_USD,
  cartHasMultipleShippingVendors,
  isFreeStandardShippingProduct,
  quoteAddressShipmentShipping,
  quoteShipmentsShipping,
  quoteUsarakhiStandardShipping,
  shippingVendorKey,
} from "./free-shipping";

describe("quoteUsarakhiStandardShipping", () => {
  it("charges the difference when subtotal is below $15", () => {
    const quote = quoteUsarakhiStandardShipping({
      subtotal: 9,
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(quote.charge, 6);
    assert.equal(quote.qualifiesForFreeShipping, false);
    assert.equal(quote.tier, "low");
  });

  it("is free at or above $15", () => {
    for (const subtotal of [15, 20, 50]) {
      const quote = quoteUsarakhiStandardShipping({
        subtotal,
        currency: "USD",
        usdInrRate: 96,
      });
      assert.equal(quote.charge, 0);
      assert.equal(quote.qualifiesForFreeShipping, true);
    }
  });

  it("is free when every line is a selected free-shipping product", () => {
    const quote = quoteUsarakhiStandardShipping({
      subtotal: 10,
      currency: "USD",
      usdInrRate: 96,
      items: [
        { productSlug: "om-single-rakhi", tags: [FREE_STANDARD_SHIPPING_TAG] },
      ],
    });
    assert.equal(quote.charge, 0);
  });

  it("uses $15 minimum in INR", () => {
    const quote = quoteUsarakhiStandardShipping({
      subtotal: 1000,
      currency: "INR",
      usdInrRate: 100,
    });
    assert.equal(quote.charge, 500);
    assert.equal(USARAKHI_MIN_ORDER_USD, 15);
  });
});

describe("isFreeStandardShippingProduct", () => {
  it("detects tag and cart flag", () => {
    assert.equal(
      isFreeStandardShippingProduct({ tags: [FREE_STANDARD_SHIPPING_TAG] }),
      true
    );
    assert.equal(isFreeStandardShippingProduct({ freeStandardShipping: true }), true);
    assert.equal(isFreeStandardShippingProduct({ productSlug: "x" }), false);
  });
});

describe("shippingVendorKey / cartHasMultipleShippingVendors", () => {
  it("infers orange-county from image path", () => {
    assert.equal(
      shippingVendorKey({
        image: "/uploads/orange-county/foo.webp",
      }),
      "orange-county"
    );
  });

  it("detects mixed vendor carts", () => {
    assert.equal(
      cartHasMultipleShippingVendors([
        { vendorSlug: undefined },
        { vendorSlug: "orange-county" },
      ]),
      true
    );
    assert.equal(
      cartHasMultipleShippingVendors([{ vendorSlug: undefined }, {}]),
      false
    );
  });
});

describe("quoteShipmentsShipping", () => {
  it("tops up each subtotal bucket below $15", () => {
    const { totalCharge, perShipment } = quoteShipmentsShipping({
      shipmentSubtotals: [10, 5, 15],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(perShipment[0]!.charge, 5);
    assert.equal(perShipment[1]!.charge, 10);
    assert.equal(perShipment[2]!.charge, 0);
    assert.equal(totalCharge, 15);
  });
});

describe("quoteAddressShipmentShipping", () => {
  it("applies $15 minimum to UsaRakhi and free shipping to Orange County", () => {
    const { totalCharge, perVendor } = quoteAddressShipmentShipping({
      items: [
        { price: 9, quantity: 1 },
        { price: 8, quantity: 1, vendorSlug: "orange-county" },
      ],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(perVendor.length, 2);
    assert.equal(perVendor[0]!.charge, 6);
    assert.equal(perVendor[1]!.charge, 0);
    assert.equal(totalCharge, 6);
  });

  it("does not let Orange County dollars cover the UsaRakhi $15 minimum", () => {
    const { totalCharge, perVendor } = quoteAddressShipmentShipping({
      items: [
        { price: 5, quantity: 1, productSlug: "om-single-rakhi" },
        { price: 40, quantity: 1, vendorSlug: "orange-county" },
      ],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(perVendor.length, 2);
    assert.equal(totalCharge, 10);
  });

  it("gives Orange County-only carts free shipping", () => {
    const { totalCharge, perVendor } = quoteAddressShipmentShipping({
      items: [{ price: 8, quantity: 1, vendorSlug: "orange-county" }],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(perVendor.length, 1);
    assert.equal(perVendor[0]!.charge, 0);
    assert.equal(totalCharge, 0);
  });

  it("charges only UsaRakhi when a mixed cart is under $15 on that side", () => {
    const { totalCharge, perVendor } = quoteAddressShipmentShipping({
      items: [
        { price: 9, quantity: 1, productSlug: "om-single-rakhi" },
        { price: 8, quantity: 1, vendorSlug: "orange-county" },
      ],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(perVendor.length, 2);
    assert.equal(totalCharge, 6);
  });

  it("infers Orange County from image when vendorSlug is missing", () => {
    const { totalCharge } = quoteAddressShipmentShipping({
      items: [
        { price: 5, quantity: 1, productSlug: "om-single-rakhi" },
        {
          price: 40,
          quantity: 1,
          image: "https://cdn.example.com/uploads/orange-county/hamper.webp",
        },
      ],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(totalCharge, 10);
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

  it("includes add-ons in the UsaRakhi minimum calculation", () => {
    const { totalCharge } = quoteAddressShipmentShipping({
      items: [
        {
          price: 10,
          quantity: 1,
          addons: [{ price: 5, quantity: 1 }],
        },
      ],
      currency: "USD",
      usdInrRate: 96,
    });
    assert.equal(totalCharge, 0);
  });
});
