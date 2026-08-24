import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isUsarakhiPlainRakhiProduct,
  pickUsarakhiCostRakhiPriceUsd,
  USARAKHI_COST_RAKHI_PRICES_USD,
} from "./usarakhi-plain-rakhi";
import { VENDOR_ORANGE_COUNTY } from "../constants";

describe("isUsarakhiPlainRakhiProduct", () => {
  it("includes UsaRakhi single rakhis", () => {
    assert.equal(
      isUsarakhiPlainRakhiProduct({
        slug: "rudraksha-single-rakhi",
        name: "Rudraksha Single Rakhi",
        categorySlug: "single-rakhi",
      }),
      true
    );
  });

  it("includes plain rakhi combos without chocolates", () => {
    assert.equal(
      isUsarakhiPlainRakhiProduct({
        slug: "pink-rakhi-combo-set",
        name: "Pink Rakhi Combo Set",
        categorySlug: "rakhi-combo",
        description: "Set of 2 designer rakhis with roli chawal.",
      }),
      true
    );
  });

  it("excludes chocolate combos", () => {
    assert.equal(
      isUsarakhiPlainRakhiProduct({
        slug: "blue-stone-rakhi-with-lindor-chocolates",
        name: "Blue Stone Rakhi with Lindor Chocolates",
        categorySlug: "rakhi-combo",
      }),
      false
    );
  });

  it("excludes dry fruit and hampers", () => {
    assert.equal(
      isUsarakhiPlainRakhiProduct({
        slug: "rakhi-dry-fruit-celebration-combo",
        name: "Rakhi Dry Fruit Celebration Combo",
        categorySlug: "rakhi-combo",
      }),
      false
    );
    assert.equal(
      isUsarakhiPlainRakhiProduct({
        slug: "nuts-love-rakhi-hamper",
        name: "Nuts Love Rakhi Hamper",
        categorySlug: "rakhi-hampers",
      }),
      false
    );
  });

  it("excludes Orange County products", () => {
    assert.equal(
      isUsarakhiPlainRakhiProduct({
        slug: "elegant-pearl-designer-single-rakhi",
        name: "Elegant Pearl Designer Single Rakhi",
        categorySlug: "single-rakhi",
        vendorSlug: VENDOR_ORANGE_COUNTY,
      }),
      false
    );
  });

  it("excludes kids-rakhi unless listed as single/combo category", () => {
    assert.equal(
      isUsarakhiPlainRakhiProduct({
        slug: "doraemon-kids-single-rakhi",
        name: "Doraemon Kids Single Rakhi",
        categorySlug: "kids-rakhi",
      }),
      false
    );
  });
});

describe("pickUsarakhiCostRakhiPriceUsd", () => {
  it("returns only $3, $5, or $7", () => {
    for (const slug of ["a", "om-single-rakhi", "pink-rakhi-combo-set", "test-123"]) {
      const price = pickUsarakhiCostRakhiPriceUsd(slug);
      assert.ok(USARAKHI_COST_RAKHI_PRICES_USD.includes(price));
    }
  });

  it("is stable for the same slug", () => {
    assert.equal(
      pickUsarakhiCostRakhiPriceUsd("rudraksha-single-rakhi"),
      pickUsarakhiCostRakhiPriceUsd("rudraksha-single-rakhi")
    );
  });
});
