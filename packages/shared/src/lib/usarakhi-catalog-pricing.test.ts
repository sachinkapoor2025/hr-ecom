import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  USARAKHI_PRICE_CHOCOLATE_USD,
  USARAKHI_PRICE_SET_USD,
  USARAKHI_PRICE_SINGLE_USD,
  resolveUsarakhiCatalogPriceUsd,
} from "./usarakhi-catalog-pricing";
import { VENDOR_ORANGE_COUNTY } from "../constants";
import { FLASH_COMBO_SALE_SLUG } from "./flash-sale";

describe("resolveUsarakhiCatalogPriceUsd", () => {
  it("prices a single rakhi at $1.99", () => {
    assert.equal(
      resolveUsarakhiCatalogPriceUsd({
        slug: "om-single-rakhi",
        name: "Om Single Rakhi",
        categorySlug: "single-rakhi",
      }),
      USARAKHI_PRICE_SINGLE_USD
    );
  });

  it("prices chocolate rakhis at $4.99", () => {
    assert.equal(
      resolveUsarakhiCatalogPriceUsd({
        slug: "blue-stone-rakhi-with-lindor-chocolates",
        name: "Blue Stone Rakhi with Lindor Chocolates",
        categorySlug: "rakhi-combo",
      }),
      USARAKHI_PRICE_CHOCOLATE_USD
    );
  });

  it("prices a 2-rakhi set at $2.50 and a 3-rakhi set at $2.99", () => {
    assert.equal(
      resolveUsarakhiCatalogPriceUsd({
        slug: "designer-rakhi-set-of-2-pearl-and-om",
        name: "Designer Rakhi Set of 2 — Pearl & Om",
        categorySlug: "rakhi-combo",
      }),
      USARAKHI_PRICE_SET_USD[2]
    );
    assert.equal(
      resolveUsarakhiCatalogPriceUsd({
        slug: "designer-rakhi-set-of-3-ganesh-pearl-om",
        name: "Designer Rakhi Set of 3 — Ganesh, Pearl & Om",
        categorySlug: "rakhi-combo",
      }),
      USARAKHI_PRICE_SET_USD[3]
    );
  });

  it("lets chocolate win over set size", () => {
    assert.equal(
      resolveUsarakhiCatalogPriceUsd({
        slug: "set-of-2-rakhi-with-ferrero",
        name: "Set of 2 Rakhis with Ferrero Rocher",
        categorySlug: "rakhi-combo",
      }),
      USARAKHI_PRICE_CHOCOLATE_USD
    );
  });

  it("ignores chocolate mentions that only appear in SEO description copy", () => {
    assert.equal(
      resolveUsarakhiCatalogPriceUsd({
        slug: "bro-kids-rakhi-for-little-brother",
        name: "BRO Kids Rakhi for Little Brother",
        categorySlug: "kids-rakhi",
        description: "Browse our Rakhi Combos with chocolates and Rakhi hampers.",
      }),
      USARAKHI_PRICE_SINGLE_USD
    );
  });

  it("prices a bhaiya-bhabhi set as two rakhis", () => {
    assert.equal(
      resolveUsarakhiCatalogPriceUsd({
        slug: "premium-peach-bhaiya-bhabhi-rakhi-set",
        name: "Premium Peach Bhaiya Bhabhi Rakhi Set",
        categorySlug: "bhaiya-bhabhi-rakhi",
      }),
      USARAKHI_PRICE_SET_USD[2]
    );
  });

  it("skips Orange County and flash combo", () => {
    assert.equal(
      resolveUsarakhiCatalogPriceUsd({
        slug: "elegant-pearl-designer-single-rakhi",
        name: "Elegant Pearl Designer Single Rakhi",
        vendorSlug: VENDOR_ORANGE_COUNTY,
      }),
      null
    );
    assert.equal(
      resolveUsarakhiCatalogPriceUsd({
        slug: FLASH_COMBO_SALE_SLUG,
        name: "Flash combo",
      }),
      null
    );
  });
});
