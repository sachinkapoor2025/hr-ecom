import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Product } from "../schemas/product";
import {
  isHamperProduct,
  pickFastSellingHomeProducts,
  pickTopSellingHampers,
} from "./product-sales";

function product(overrides: Partial<Product> & Pick<Product, "slug" | "name">): Product {
  return {
    description: "",
    price: 29,
    currency: "USD",
    categorySlug: "single-rakhi",
    images: [],
    inventory: 50,
    tags: [],
    published: true,
    ...overrides,
  };
}

describe("isHamperProduct", () => {
  it("matches primary and extra hamper categories", () => {
    assert.equal(isHamperProduct(product({ slug: "a", name: "A", categorySlug: "rakhi-hampers" })), true);
    assert.equal(
      isHamperProduct(
        product({
          slug: "b",
          name: "B",
          categorySlug: "single-rakhi",
          additionalCategorySlugs: ["rakhi-hampers"],
        })
      ),
      true
    );
    assert.equal(isHamperProduct(product({ slug: "c", name: "C" })), false);
  });
});

describe("pickTopSellingHampers", () => {
  it("returns the 3 in-stock hampers with the most paid orders", () => {
    const picked = pickTopSellingHampers([
      product({ slug: "h1", name: "Hamper 1", categorySlug: "rakhi-hampers", unitsSold: 4 }),
      product({ slug: "h2", name: "Hamper 2", categorySlug: "rakhi-hampers", unitsSold: 21 }),
      product({ slug: "h3", name: "Hamper 3", categorySlug: "rakhi-hampers", unitsSold: 12 }),
      product({ slug: "h4", name: "Hamper 4", categorySlug: "rakhi-hampers", unitsSold: 18 }),
      product({ slug: "r1", name: "Rakhi", unitsSold: 80 }),
      product({ slug: "sold-out", name: "Sold out", categorySlug: "rakhi-hampers", unitsSold: 99, inventory: 0 }),
    ]);
    assert.deepEqual(
      picked.map((p) => p.slug),
      ["h2", "h4", "h3"]
    );
  });
});

describe("pickFastSellingHomeProducts", () => {
  it("pins top hampers ahead of other fast sellers", () => {
    const picked = pickFastSellingHomeProducts([
      product({ slug: "h-low", name: "Hamper low", categorySlug: "rakhi-hampers", unitsSold: 3 }),
      product({ slug: "h-mid", name: "Hamper mid", categorySlug: "rakhi-hampers", unitsSold: 8 }),
      product({ slug: "h-high", name: "Hamper high", categorySlug: "rakhi-hampers", unitsSold: 15 }),
      product({ slug: "fast-rakhi", name: "Fast rakhi", unitsSold: 40 }),
    ]);
    assert.deepEqual(
      picked.map((p) => p.slug),
      ["h-high", "h-mid", "h-low", "fast-rakhi"]
    );
  });
});
