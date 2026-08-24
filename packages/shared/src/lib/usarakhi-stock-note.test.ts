import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VENDOR_ORANGE_COUNTY } from "../constants";
import {
  USARAKHI_STOCK_SHORTAGE_NOTE,
  productIncludesChocolates,
  shouldShowUsarakhiStockShortageNote,
  withUsarakhiStockShortageNote,
} from "./usarakhi-stock-note";

describe("productIncludesChocolates", () => {
  it("detects chocolate from product name and slug", () => {
    assert.equal(
      productIncludesChocolates({
        name: "Blue Stone Rakhi with Lindor Chocolates",
        slug: "blue-stone-rakhi-with-lindor-chocolates",
        categorySlug: "rakhi-combo",
      }),
      true
    );
    assert.equal(
      productIncludesChocolates({
        name: "Om Single Rakhi",
        slug: "om-single-rakhi",
        categorySlug: "single-rakhi",
      }),
      false
    );
  });

  it("detects chocolate from image filenames when name is generic", () => {
    assert.equal(
      productIncludesChocolates({
        name: "Designer Pink Thread Rakhi",
        slug: "designer-pink-thread-rakhi",
        categorySlug: "single-rakhi",
        images: [
          "https://cdn.example.com/Designer-Pink-Thread-Rakhi-with-Multi-Stones-Chocolates.webp",
        ],
      }),
      true
    );
    assert.equal(
      productIncludesChocolates({
        name: "Elegant Red Rakhi Gift Set",
        slug: "elegant-red-rakhi-gift-set",
        categorySlug: "rakhi-combo",
        images: ["https://cdn.example.com/Elegant-Red-Rakhi-Gift-Set-with-Chocolates.webp"],
      }),
      true
    );
  });
});

describe("shouldShowUsarakhiStockShortageNote", () => {
  it("shows for chocolate combo products", () => {
    assert.equal(
      shouldShowUsarakhiStockShortageNote({
        name: "BRO Rakhi with Lindor Chocolates Combo",
        categorySlug: "rakhi-combo",
        description: "Includes 5 Lindor chocolates",
      }),
      true
    );
    assert.equal(
      shouldShowUsarakhiStockShortageNote({
        name: "Om Rakhi with chocolate and roli chawal",
        slug: "om-rakhi-with-chocolate-and-roli-chawal",
        categorySlug: "single-rakhi",
      }),
      true
    );
  });

  it("hides for plain single and multi rakhi-only products", () => {
    assert.equal(
      shouldShowUsarakhiStockShortageNote({
        name: "Om Single Rakhi",
        categorySlug: "single-rakhi",
        description: "Designer rakhi with complimentary roli and chawal.",
      }),
      false
    );
    assert.equal(
      shouldShowUsarakhiStockShortageNote({
        name: "Designer Rakhi Set of 3",
        categorySlug: "3-set-rakhi",
        tags: ["mini-rakhi-set"],
      }),
      false
    );
    assert.equal(
      shouldShowUsarakhiStockShortageNote({
        name: "Pink Rakhi Combo Set",
        categorySlug: "rakhi-combo",
        description: "Set of 2 designer rakhis with roli chawal.",
      }),
      false
    );
  });

  it("hides dry-fruit-only hampers without chocolate", () => {
    assert.equal(
      shouldShowUsarakhiStockShortageNote({
        name: "Rakhi Dry Fruit Celebration Combo",
        categorySlug: "rakhi-hampers",
        description: "Designer rakhi with cashews and almonds.",
      }),
      false
    );
  });

  it("hides Orange County", () => {
    assert.equal(
      shouldShowUsarakhiStockShortageNote({
        name: "Hamper with chocolates",
        categorySlug: "rakhi-hampers",
        vendorSlug: VENDOR_ORANGE_COUNTY,
      }),
      false
    );
  });
});

describe("withUsarakhiStockShortageNote", () => {
  it("appends updated note only to chocolate products", () => {
    const result = withUsarakhiStockShortageNote({
      name: "Kids Rakhi with Lindor Chocolates",
      categorySlug: "kids-rakhi",
      description: "Cute kids rakhi with Lindor chocolates.",
      vendorSlug: "usarakhi",
    });
    assert.ok(result.description?.includes(USARAKHI_STOCK_SHORTAGE_NOTE));
    assert.match(result.description ?? "", /mixed chocolates instead/);
    assert.match(result.description ?? "", /piece count stays the same/);
  });

  it("does not append to single rakhi-only products", () => {
    const result = withUsarakhiStockShortageNote({
      name: "Pearl Single Rakhi",
      categorySlug: "single-rakhi",
      description: "A designer rakhi for brother.",
    });
    assert.equal(result.description, "A designer rakhi for brother.");
  });

  it("strips a previously appended note from rakhi-only products", () => {
    const result = withUsarakhiStockShortageNote({
      name: "Om Single Rakhi",
      categorySlug: "single-rakhi",
      description:
        "Designer rakhi.\n\nRakhi stock about to end — any shortage of product will be replaced by 3 Ferrero Rocher / Lindor chocolates.",
    });
    assert.equal(result.description, "Designer rakhi.");
    assert.doesNotMatch(result.description ?? "", /Rakhi stock about to end/);
  });

  it("is idempotent for chocolate products", () => {
    const once = withUsarakhiStockShortageNote({
      name: "Ferrero Rocher Combo",
      categorySlug: "rakhi-combo",
      description: "With Ferrero Rocher chocolates.",
    });
    const twice = withUsarakhiStockShortageNote(once);
    assert.equal(once.description, twice.description);
  });

  it("skips Orange County products", () => {
    const result = withUsarakhiStockShortageNote({
      description: "Hamper box with chocolates",
      categorySlug: "rakhi-hampers",
      vendorSlug: VENDOR_ORANGE_COUNTY,
    });
    assert.equal(result.description, "Hamper box with chocolates");
  });
});
