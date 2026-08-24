import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VENDOR_ORANGE_COUNTY } from "../constants";
import {
  FORCE_OUT_OF_STOCK_SLUGS,
  USARAKHI_STOREFRONT_PAUSED,
  filterInStockStorefrontProducts,
  isForceOutOfStockSlug,
  isUsarakhiStorefrontPaused,
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
    assert.equal(isForceOutOfStockSlug("kids-rakhi-with-hersheys-chocolates"), true);
    assert.equal(isForceOutOfStockSlug("blue-beads-om-pista-flash-combo"), true);
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
      {
        slug: "oc-hamper",
        inventory: 50,
        published: true,
        vendorSlug: VENDOR_ORANGE_COUNTY,
      },
      { slug: "om-single-rakhi", inventory: 50, published: true },
    ]);
    // UsaRakhi paused + Ek Omkar force-OOS → only Orange County remains
    assert.equal(visible.length, 1);
    assert.equal(visible[0]?.slug, "oc-hamper");
  });
});

describe("USARAKHI_STOREFRONT_PAUSED", () => {
  it("is enabled and zeros non–Orange County inventory", () => {
    assert.equal(USARAKHI_STOREFRONT_PAUSED, true);
    assert.equal(isUsarakhiStorefrontPaused({ slug: "om-single-rakhi" }), true);
    assert.equal(
      isUsarakhiStorefrontPaused({ slug: "hamper", vendorSlug: VENDOR_ORANGE_COUNTY }),
      false
    );
    assert.equal(
      withForcedOutOfStockInventory({ slug: "om-single-rakhi", inventory: 40 }).inventory,
      0
    );
    assert.equal(
      withForcedOutOfStockInventory({
        slug: "hamper",
        inventory: 40,
        vendorSlug: VENDOR_ORANGE_COUNTY,
      }).inventory,
      40
    );
  });
});
