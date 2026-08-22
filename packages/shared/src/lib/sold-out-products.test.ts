import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FORCE_OUT_OF_STOCK_SLUGS,
  filterInStockStorefrontProducts,
  isForceOutOfStockSlug,
  withForcedOutOfStockInventory,
} from "./sold-out-products";

describe("sold-out-products (Ek Omkar)", () => {
  it("flags every Ek Omkar SKU as force out of stock", () => {
    assert.ok(FORCE_OUT_OF_STOCK_SLUGS.length >= 5);
    assert.equal(isForceOutOfStockSlug("ek-omkar-designer-rakhi-for-brother-with-roli-chawal"), true);
    assert.equal(
      isForceOutOfStockSlug("blue-sapphire-pearl-ek-omkar-rakhi-set-combo-spiritual-designer-rakhi"),
      true
    );
    assert.equal(isForceOutOfStockSlug("om-single-rakhi"), false);
  });

  it("zeros inventory and hides from storefront lists", () => {
    const zeroed = withForcedOutOfStockInventory({
      slug: "ek-omkar-rakhi-with-lindt-lindor-chocolates-combo",
      inventory: 199,
      published: true,
    });
    assert.equal(zeroed.inventory, 0);

    const visible = filterInStockStorefrontProducts([
      { slug: "ek-omkar-designer-rakhi-for-brother-with-roli-chawal", inventory: 200, published: true },
      { slug: "om-single-rakhi", inventory: 50, published: true },
    ]);
    assert.equal(visible.length, 1);
    assert.equal(visible[0]?.slug, "om-single-rakhi");
  });
});
