import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHECKOUT_SHIPPING_OPTIONS,
  EXPEDITED_THREE_DAY_SHIPPING_USD,
  EXPEDITED_TWO_DAY_SHIPPING_USD,
  canConfirmDeliveryByRakhi,
  estimateShippingArrival,
  expeditedLeadBusinessDays,
  expeditedOptionPriceInCurrency,
  getCheckoutShippingOption,
  resolveCheckoutShippingCharge,
  shippingOptionServiceCode,
  shippingOptionServiceName,
} from "./expedited-shipping";
import { addBusinessDays } from "./delivery";

describe("expedited-shipping", () => {
  it("defines $19 3-day (with packing) and $39 2-day options", () => {
    const three = getCheckoutShippingOption("three_day");
    const two = getCheckoutShippingOption("two_day");
    const standard = getCheckoutShippingOption("standard");
    assert.equal(three?.priceUsd, EXPEDITED_THREE_DAY_SHIPPING_USD);
    assert.equal(three?.priceUsd, 19);
    assert.equal(three?.packingBusinessDays, 1);
    assert.equal(three?.transitBusinessDays, 3);
    assert.equal(expeditedLeadBusinessDays(three!), 4);
    assert.equal(two?.priceUsd, EXPEDITED_TWO_DAY_SHIPPING_USD);
    assert.equal(two?.priceUsd, 39);
    assert.equal(two?.packingBusinessDays, 0);
    assert.equal(two?.transitBusinessDays, 2);
    assert.equal(CHECKOUT_SHIPPING_OPTIONS.length, 3);
    assert.match(standard?.detail ?? "", /\$22 minimum/);
    assert.match(standard?.detail ?? "", /Aug 28/);
  });

  it("replaces standard threshold charge with flat expedited fees", () => {
    assert.equal(
      resolveCheckoutShippingCharge({
        optionId: "standard",
        standardCharge: 7,
        currency: "USD",
        usdInrRate: 83,
      }),
      7
    );
    assert.equal(
      resolveCheckoutShippingCharge({
        optionId: "three_day",
        standardCharge: 0,
        currency: "USD",
        usdInrRate: 83,
      }),
      19
    );
    assert.equal(
      resolveCheckoutShippingCharge({
        optionId: "two_day",
        standardCharge: 7.99,
        currency: "USD",
        usdInrRate: 83,
      }),
      39
    );
    assert.equal(
      expeditedOptionPriceInCurrency("three_day", "INR", 80),
      1520
    );
  });

  it("never confirms standard shipping for Rakhi; expedited uses business days", () => {
    const early = new Date("2026-08-21T16:00:00.000Z");
    assert.equal(canConfirmDeliveryByRakhi("standard", early), false);
    assert.equal(canConfirmDeliveryByRakhi("three_day", early), true);
    assert.equal(canConfirmDeliveryByRakhi("two_day", early), true);

    const late = new Date("2026-08-26T16:00:00.000Z");
    assert.equal(canConfirmDeliveryByRakhi("three_day", late), false);
    assert.equal(canConfirmDeliveryByRakhi("two_day", late), true);

    const fromMon = new Date("2026-08-24T16:00:00.000Z");
    assert.equal(
      estimateShippingArrival("three_day", fromMon).toDateString(),
      addBusinessDays(fromMon, 4).toDateString()
    );
    assert.equal(
      estimateShippingArrival("two_day", fromMon).toDateString(),
      addBusinessDays(fromMon, 2).toDateString()
    );
  });

  it("maps service codes/names for orders", () => {
    assert.equal(shippingOptionServiceCode("three_day"), "EXPEDITED_3_DAY");
    assert.equal(shippingOptionServiceName("two_day"), "2-Day Delivery");
    assert.equal(shippingOptionServiceCode("standard"), "STANDARD");
  });

  it("lists UsaRakhi standard + expedited options at checkout", async () => {
    const {
      RAKHI_DELIVERY_MESSAGING,
      checkoutShippingOptionsForCart,
      defaultCheckoutShippingOption,
      shippingBulletsForCart,
    } = await import("./expedited-shipping");

    assert.match(RAKHI_DELIVERY_MESSAGING.shippingBullets.join(" "), /\$22 minimum/);
    assert.match(RAKHI_DELIVERY_MESSAGING.shippingBullets.join(" "), /selected products/i);

    const usaItems = [{ vendorSlug: undefined }, { vendorSlug: "usarakhi" }];
    assert.deepEqual(
      checkoutShippingOptionsForCart(usaItems).map((o) => o.id),
      ["standard", "three_day", "two_day"]
    );
    assert.equal(defaultCheckoutShippingOption(usaItems), "standard");

    const ocItems = [{ vendorSlug: "orange-county" }, { vendorSlug: "orange-county" }];
    assert.deepEqual(
      checkoutShippingOptionsForCart(ocItems).map((o) => o.id),
      ["three_day", "two_day"]
    );
    assert.equal(defaultCheckoutShippingOption(ocItems), "three_day");
    assert.deepEqual([...shippingBulletsForCart(ocItems)], [
      "Last-minute orders are accepted — Guaranteed delivery by Rakhi",
      "3-day delivery — $19",
      "2-day delivery — $39",
    ]);

    const mixed = [{ vendorSlug: "orange-county" }, {}];
    assert.deepEqual(
      checkoutShippingOptionsForCart(mixed).map((o) => o.id),
      ["standard", "three_day", "two_day"]
    );
    assert.equal(defaultCheckoutShippingOption(mixed), "standard");
  });
});
