import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_RAKHI_ADDON_PIECES,
  MINI_RAKHI_ADDONS,
  MINI_RAKHI_SET_COMBOS,
  allMiniRakhiComboProducts,
  detectRakhiSetSize,
  isMiniRakhiComboSlug,
  rakhiAddonBundlePriceUsd,
} from "../index";

describe("mini rakhi combos", () => {
  it("prices 1–5 extra rakhis at the bundle table", () => {
    assert.equal(rakhiAddonBundlePriceUsd(0), 0);
    assert.equal(rakhiAddonBundlePriceUsd(1), 3.99);
    assert.equal(rakhiAddonBundlePriceUsd(2), 5.99);
    assert.equal(rakhiAddonBundlePriceUsd(3), 6.99);
    assert.equal(rakhiAddonBundlePriceUsd(4), 7.99);
    assert.equal(rakhiAddonBundlePriceUsd(5), 8.5);
    assert.equal(MAX_RAKHI_ADDON_PIECES, 5);
    assert.equal(MINI_RAKHI_ADDONS.length, 8);
  });

  it("builds 2–5 piece set products at those same prices", () => {
    const products = allMiniRakhiComboProducts();
    assert.equal(products.length, MINI_RAKHI_SET_COMBOS.length);
    assert.ok(isMiniRakhiComboSlug("designer-rakhi-set-of-5-classic-collection"));
    for (const product of products) {
      assert.equal(product.couponExcluded, true);
      assert.ok(product.images.length >= 2);
      const size = detectRakhiSetSize(product);
      assert.ok(size === 2 || size === 3 || size === 4 || size === 5);
      if (size === 2) assert.equal(product.price, 5.99);
      if (size === 3) assert.equal(product.price, 6.99);
      if (size === 4) assert.equal(product.price, 7.99);
      if (size === 5) assert.equal(product.price, 8.5);
    }
  });
});
