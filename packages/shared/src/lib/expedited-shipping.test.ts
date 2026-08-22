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
  });

  it("replaces standard threshold charge with flat expedited fees", () => {
    assert.equal(
      resolveCheckoutShippingCharge({
        optionId: "standard",
        standardCharge: 3.99,
        currency: "USD",
        usdInrRate: 83,
      }),
      3.99
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
    // Friday Aug 21 2026 12:00 UTC ≈ morning NY — enough lead for both options.
    const early = new Date("2026-08-21T16:00:00.000Z");
    assert.equal(canConfirmDeliveryByRakhi("standard", early), false);
    assert.equal(canConfirmDeliveryByRakhi("three_day", early), true);
    assert.equal(canConfirmDeliveryByRakhi("two_day", early), true);

    // Wednesday Aug 26 — 3-day+pack (4 BD) slips past Aug 28; 2-day still fits.
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

  it("uses optimistic Rakhi urgency copy with Monday order-by and ~90% framing", async () => {
    const { RAKHI_DELIVERY_URGENCY_NOTICE, RAKHI_ORDER_BY_DATE } = await import("./expedited-shipping");
    assert.equal(RAKHI_ORDER_BY_DATE, "2026-08-24");
    assert.match(RAKHI_DELIVERY_URGENCY_NOTICE.title, /Monday/i);
    assert.match(RAKHI_DELIVERY_URGENCY_NOTICE.body, /90|9 in 10/i);
    assert.doesNotMatch(RAKHI_DELIVERY_URGENCY_NOTICE.body, /cannot confirm/i);
    assert.match(RAKHI_DELIVERY_URGENCY_NOTICE.weekendNote, /weekend/i);
  });
});
