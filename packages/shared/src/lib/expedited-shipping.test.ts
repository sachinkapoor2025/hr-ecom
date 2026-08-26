import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHECKOUT_SHIPPING_OPTIONS,
  EXPEDITED_THREE_DAY_SHIPPING_USD,
  EXPEDITED_TWO_DAY_SHIPPING_USD,
  USARAKHI_THREE_DAY_ARRIVAL_YMD,
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
  it("defines $19 3-day (1 packing + 3 transit) and keeps 2-day only for history", () => {
    const three = getCheckoutShippingOption("three_day");
    const two = getCheckoutShippingOption("two_day");
    const standard = getCheckoutShippingOption("standard");
    assert.equal(three?.priceUsd, EXPEDITED_THREE_DAY_SHIPPING_USD);
    assert.equal(three?.priceUsd, 19);
    assert.equal(three?.packingBusinessDays, 1);
    assert.equal(three?.transitBusinessDays, 3);
    assert.equal(expeditedLeadBusinessDays(three!), 4);
    assert.equal(two?.priceUsd, EXPEDITED_TWO_DAY_SHIPPING_USD);
    assert.equal(CHECKOUT_SHIPPING_OPTIONS.length, 3);
    assert.match(standard?.detail ?? "", /Free shipping on \$25 minimum/);
    assert.match(three?.detail ?? "", /August 29–30/);
  });

  it("replaces standard threshold charge with flat 3-day fee", () => {
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
      expeditedOptionPriceInCurrency("three_day", "INR", 80),
      1520
    );
  });

  it("never confirms Rakhi-day delivery; 3-day window is August 29–30", () => {
    const early = new Date("2026-08-21T16:00:00.000Z");
    assert.equal(canConfirmDeliveryByRakhi("standard", early), false);
    assert.equal(canConfirmDeliveryByRakhi("three_day", early), false);
    assert.equal(canConfirmDeliveryByRakhi("two_day", early), false);

    const fromMon = new Date("2026-08-24T16:00:00.000Z");
    assert.equal(
      estimateShippingArrival("three_day", fromMon).toISOString().slice(0, 10),
      USARAKHI_THREE_DAY_ARRIVAL_YMD
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

  it("lists 3-day only for UsaRakhi carts; OC and mixed are standard only", async () => {
    const {
      RAKHI_DELIVERY_MESSAGING,
      checkoutShippingOptionsForCart,
      defaultCheckoutShippingOption,
      shippingBulletsForCart,
    } = await import("./expedited-shipping");

    assert.match(RAKHI_DELIVERY_MESSAGING.shippingBullets.join(" "), /Free shipping on \$25 minimum/);
    assert.match(RAKHI_DELIVERY_MESSAGING.shippingBullets.join(" "), /August 29–30/);
    assert.doesNotMatch(RAKHI_DELIVERY_MESSAGING.shippingBullets.join(" "), /2-day/);
    assert.doesNotMatch(
      RAKHI_DELIVERY_MESSAGING.shippingBullets.join(" "),
      /Guaranteed delivery by Rakhi/i
    );

    const usaItems = [{ vendorSlug: undefined }, { vendorSlug: "usarakhi" }];
    assert.deepEqual(
      checkoutShippingOptionsForCart(usaItems).map((o) => o.id),
      ["standard", "three_day"]
    );
    assert.equal(defaultCheckoutShippingOption(usaItems), "standard");

    const ocItems = [{ vendorSlug: "orange-county" }, { vendorSlug: "orange-county" }];
    assert.deepEqual(
      checkoutShippingOptionsForCart(ocItems).map((o) => o.id),
      ["standard"]
    );
    assert.equal(defaultCheckoutShippingOption(ocItems), "standard");
    assert.deepEqual([...shippingBulletsForCart(ocItems)], [
      "Standard USA delivery · 5 business days · Free shipping on $25 minimum cart value",
      "Orders under $25: remaining amount added as shipping at checkout",
    ]);

    const mixed = [{ vendorSlug: "orange-county" }, {}];
    assert.deepEqual(
      checkoutShippingOptionsForCart(mixed).map((o) => o.id),
      ["standard"]
    );
    assert.equal(defaultCheckoutShippingOption(mixed), "standard");
    assert.match(shippingBulletsForCart(mixed).join(" "), /each vendor/i);
  });
});
