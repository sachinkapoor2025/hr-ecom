import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { convertCurrency } from "./currency-display";
import {
  applyCompetitivePriceReduction,
  getCompetitiveDiscountPercent,
  withCompetitiveStorefrontPricing,
} from "./competitive-pricing";

describe("getCompetitiveDiscountPercent", () => {
  it("uses 8% under $25", () => {
    assert.equal(getCompetitiveDiscountPercent(17), 8);
    assert.equal(getCompetitiveDiscountPercent(24.99), 8);
  });

  it("uses 10% from $25 up to under $30", () => {
    assert.equal(getCompetitiveDiscountPercent(25), 10);
    assert.equal(getCompetitiveDiscountPercent(29.99), 10);
  });

  it("uses 12% at $30+", () => {
    assert.equal(getCompetitiveDiscountPercent(30), 12);
    assert.equal(getCompetitiveDiscountPercent(49), 12);
  });
});

describe("applyCompetitivePriceReduction", () => {
  it("reduces USD prices by the tier percent", () => {
    assert.equal(applyCompetitivePriceReduction(20, "USD"), 18.4); // 8%
    assert.equal(applyCompetitivePriceReduction(25, "USD"), 22.5); // 10%
    assert.equal(applyCompetitivePriceReduction(30, "USD"), 26.4); // 12%
  });
});

describe("withCompetitiveStorefrontPricing", () => {
  it("skips competitive cuts for vendor-priced products", () => {
    const result = withCompetitiveStorefrontPricing({
      price: 41.93,
      compareAtPrice: 53.91,
      currency: "USD" as const,
      vendorSlug: "orange-county",
    });
    assert.equal(result.price, 41.93);
    assert.equal(result.compareAtPrice, 53.91);
  });

  it("applies competitive cuts when only categorySlug is rakhi-hampers (UsaRakhi mis-tags)", () => {
    const result = withCompetitiveStorefrontPricing({
      price: 9.89,
      compareAtPrice: 28.3,
      currency: "USD" as const,
      categorySlug: "rakhi-hampers",
    });
    // 8% cut would be ~$9.10; storefront floor is $18
    assert.equal(result.price, 18);
    assert.equal(result.compareAtPrice, 28.3);
  });

  it("lowers price and preserves original as compare-at", () => {
    const result = withCompetitiveStorefrontPricing({
      price: 20,
      currency: "USD" as const,
    });
    assert.equal(result.price, 18.4);
    assert.equal(result.compareAtPrice, 20);
  });

  it("keeps a higher existing compare-at", () => {
    const result = withCompetitiveStorefrontPricing({
      price: 17,
      compareAtPrice: 22,
      currency: "USD" as const,
    });
    // 17 * 0.92 = 15.64 → floored to $18
    assert.equal(result.price, 18);
    assert.equal(result.compareAtPrice, 22);
  });

  it("does not stack competitive cuts when applied twice", () => {
    const once = withCompetitiveStorefrontPricing({
      price: 16,
      compareAtPrice: 22,
      currency: "USD" as const,
    });
    const twice = withCompetitiveStorefrontPricing(once);
    assert.equal(once.price, 18);
    assert.equal(twice.price, 18);
    assert.equal(twice.compareAtPrice, 22);
    assert.equal(twice.storefrontPricingApplied, true);
  });
});

describe("INR conversion keeps the same discount percent", () => {
  const rate = 96;

  it("applies ~8% after USD→INR for sub-$25 items", () => {
    const originalUsd = 20;
    const reducedUsd = applyCompetitivePriceReduction(originalUsd, "USD");
    const originalInr = convertCurrency(originalUsd, "USD", "INR", rate);
    const reducedInr = convertCurrency(reducedUsd, "USD", "INR", rate);
    const pctOff = ((originalInr - reducedInr) / originalInr) * 100;
    assert.ok(Math.abs(pctOff - 8) < 0.5, `expected ~8% INR off, got ${pctOff}`);
  });

  it("applies ~10% after USD→INR for $25–$29.99 items", () => {
    const originalUsd = 27;
    const reducedUsd = applyCompetitivePriceReduction(originalUsd, "USD");
    const originalInr = convertCurrency(originalUsd, "USD", "INR", rate);
    const reducedInr = convertCurrency(reducedUsd, "USD", "INR", rate);
    const pctOff = ((originalInr - reducedInr) / originalInr) * 100;
    assert.ok(Math.abs(pctOff - 10) < 0.5, `expected ~10% INR off, got ${pctOff}`);
  });

  it("applies ~12% after USD→INR for $30+ items", () => {
    const originalUsd = 35;
    const reducedUsd = applyCompetitivePriceReduction(originalUsd, "USD");
    const originalInr = convertCurrency(originalUsd, "USD", "INR", rate);
    const reducedInr = convertCurrency(reducedUsd, "USD", "INR", rate);
    const pctOff = ((originalInr - reducedInr) / originalInr) * 100;
    assert.ok(Math.abs(pctOff - 12) < 0.5, `expected ~12% INR off, got ${pctOff}`);
  });
});
