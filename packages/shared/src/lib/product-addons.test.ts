import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PRODUCT_ADDONS,
  RAKHI_ADDON_PRICE_USD,
  addonsForProductPage,
  cartAddonSignature,
  cartLineUnitTotal,
  getProductAddon,
  productAllowsAddons,
  resolveProductAddons,
  resolveProductAddonsFromIds,
  selectedAddonsUsdTotal,
  sumAddonPrices,
} from "./product-addons";
import { VENDOR_ORANGE_COUNTY } from "../constants";

describe("product-addons", () => {
  it("lists catalog with expected prices", () => {
    assert.equal(PRODUCT_ADDONS.length, 17);
    assert.equal(getProductAddon("kaju-katli-200g"), undefined);
    assert.equal(getProductAddon("badam-100g")?.priceUsd, 10.5);
    assert.equal(getProductAddon("hershey-2pc")?.priceUsd, 6.5);
    assert.equal(getProductAddon("lindt-5pc")?.priceUsd, 10.5);
    assert.equal(getProductAddon("lindt-5pc")?.detail, "3 pcs");
    assert.match(getProductAddon("lindt-5pc")?.name ?? "", /Lindor chocolates \(3 pcs\)/);
    assert.equal(getProductAddon("ferrero-3pc")?.priceUsd, 6.5);
    const rakhiAddons = PRODUCT_ADDONS.filter((a) => a.group === "rakhis");
    assert.equal(rakhiAddons.length, 8);
    assert.ok(rakhiAddons.every((a) => a.priceUsd === RAKHI_ADDON_PRICE_USD));
    assert.equal(getProductAddon("rakhi-om-single-rakhi")?.image?.includes("cloudfront"), true);
    assert.equal(addonsForProductPage("om-single-rakhi").filter((a) => a.group === "rakhis").length, 7);
    assert.equal(
      addonsForProductPage("om-single-rakhi").some((a) => a.id === "rakhi-om-single-rakhi"),
      false
    );
  });

  it("allows addons only for non–Orange County products", () => {
    assert.equal(productAllowsAddons({}), true);
    assert.equal(productAllowsAddons({ vendorSlug: undefined }), true);
    assert.equal(productAllowsAddons({ categorySlug: "single-rakhi" }), true);
    assert.equal(productAllowsAddons({ vendorSlug: VENDOR_ORANGE_COUNTY }), false);
    assert.equal(productAllowsAddons({ categorySlug: "rakhi-hampers" }), true);
    assert.equal(
      productAllowsAddons({ images: ["/uploads/orange-county/TFUSA001/TFUSA001.jpg"] }),
      false
    );
  });

  it("sums addon prices and line unit totals", () => {
    const addons = [
      { id: "badam-100g", name: "Badam", price: 9, quantity: 2 },
      { id: "hershey-2pc", name: "Hershey", price: 5, quantity: 1 },
    ];
    assert.equal(sumAddonPrices(addons), 23);
    assert.equal(cartLineUnitTotal({ price: 20, addons }), 43);
    assert.equal(cartLineUnitTotal({ price: 20 }), 20);
  });

  it("builds stable addon signatures including quantity", () => {
    assert.equal(cartAddonSignature([{ id: "b", quantity: 1 }, { id: "a", quantity: 2 }]), "a:2,b:1");
    assert.equal(cartAddonSignature([]), "");
    assert.notEqual(
      cartAddonSignature([{ id: "badam-100g", quantity: 1 }]),
      cartAddonSignature([{ id: "badam-100g", quantity: 2 }])
    );
  });

  it("resolves selections with quantities", () => {
    const ok = resolveProductAddons([
      { id: "pista-100g", quantity: 3 },
      { id: "hershey-2pc", quantity: 2 },
    ]);
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.addons.length, 2);
      assert.equal(ok.addons[0]!.id, "hershey-2pc");
      assert.equal(ok.addons[0]!.quantity, 2);
      assert.equal(ok.addons[1]!.quantity, 3);
    }
    const fromIds = resolveProductAddonsFromIds(["pista-100g", "hershey-2pc"]);
    assert.equal(fromIds.ok, true);
    if (fromIds.ok) {
      assert.equal(fromIds.addons.every((a) => a.quantity === 1), true);
    }
    const bad = resolveProductAddons([{ id: "not-a-real-addon", quantity: 1 }]);
    assert.equal(bad.ok, false);
    const tooMany = resolveProductAddons([{ id: "badam-100g", quantity: 99 }]);
    assert.equal(tooMany.ok, false);
  });

  it("prices mixed extra rakhis as a 1–5 bundle", () => {
    const one = resolveProductAddons([{ id: "rakhi-ganesh-single-rakhi", quantity: 1 }]);
    assert.equal(one.ok, true);
    if (one.ok) assert.equal(sumAddonPrices(one.addons), 5.49);

    const two = resolveProductAddons([
      { id: "rakhi-ganesh-single-rakhi", quantity: 1 },
      { id: "rakhi-pearl-single-rakhi", quantity: 1 },
    ]);
    assert.equal(two.ok, true);
    if (two.ok) assert.equal(sumAddonPrices(two.addons), 7.49);

    const five = resolveProductAddons([{ id: "rakhi-ganesh-single-rakhi", quantity: 5 }]);
    assert.equal(five.ok, true);
    if (five.ok) assert.equal(sumAddonPrices(five.addons), 10);

    const six = resolveProductAddons([{ id: "rakhi-ganesh-single-rakhi", quantity: 6 }]);
    assert.equal(six.ok, false);

    assert.equal(selectedAddonsUsdTotal([{ id: "rakhi-om-single-rakhi", quantity: 3 }]), 8.49);
  });
});
