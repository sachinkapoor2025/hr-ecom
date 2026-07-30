import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PRODUCT_ADDONS,
  cartAddonSignature,
  cartLineUnitTotal,
  getProductAddon,
  productAllowsAddons,
  resolveProductAddonsFromIds,
  sumAddonPrices,
} from "./product-addons";
import { VENDOR_ORANGE_COUNTY } from "../constants";

describe("product-addons", () => {
  it("lists catalog with expected prices", () => {
    assert.equal(PRODUCT_ADDONS.length, 10);
    assert.equal(getProductAddon("kaju-katli-200g")?.priceUsd, 11.99);
    assert.equal(getProductAddon("hershey-2pc")?.priceUsd, 5);
    assert.equal(getProductAddon("lindt-5pc")?.priceUsd, 6);
    assert.equal(getProductAddon("ferrero-3pc")?.priceUsd, 5);
  });

  it("allows addons only for non–Orange County products", () => {
    assert.equal(productAllowsAddons({}), true);
    assert.equal(productAllowsAddons({ vendorSlug: undefined }), true);
    assert.equal(productAllowsAddons({ vendorSlug: VENDOR_ORANGE_COUNTY }), false);
  });

  it("sums addon prices and line unit totals", () => {
    const addons = [
      { id: "badam-100g", price: 9, quantity: 1 },
      { id: "hershey-2pc", price: 5, quantity: 1 },
    ];
    assert.equal(sumAddonPrices(addons), 14);
    assert.equal(cartLineUnitTotal({ price: 20, addons }), 34);
    assert.equal(cartLineUnitTotal({ price: 20 }), 20);
  });

  it("builds stable addon signatures and resolves ids", () => {
    assert.equal(cartAddonSignature([{ id: "b" }, { id: "a" }]), "a,b");
    assert.equal(cartAddonSignature([]), "");
    const ok = resolveProductAddonsFromIds(["pista-100g", "hershey-2pc"]);
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.addons.length, 2);
      assert.equal(ok.addons[0]!.id, "hershey-2pc");
    }
    const bad = resolveProductAddonsFromIds(["not-a-real-addon"]);
    assert.equal(bad.ok, false);
  });
});
