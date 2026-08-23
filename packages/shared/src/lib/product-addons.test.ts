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
  it("lists chocolates + rakhis only (no dry fruits / Hershey’s)", () => {
    // 3 chocolates + 8 mix-and-match rakhis
    assert.equal(PRODUCT_ADDONS.length, 11);
    assert.equal(PRODUCT_ADDONS.filter((a) => a.group === "dry-fruits").length, 0);
    assert.equal(getProductAddon("badam-100g"), undefined);
    assert.equal(getProductAddon("pista-100g"), undefined);
    assert.equal(getProductAddon("kaju-100g"), undefined);
    assert.equal(getProductAddon("hershey-2pc"), undefined);
    assert.equal(getProductAddon("lindt-5pc")?.priceUsd, 10.5);
    assert.equal(getProductAddon("lindt-5pc")?.detail, "3 pcs");
    assert.match(getProductAddon("lindt-5pc")?.name ?? "", /Lindor chocolates \(3 pcs\)/);
    assert.equal(getProductAddon("ferrero-3pc")?.priceUsd, 6.5);
    assert.match(getProductAddon("ferrero-3pc")?.name ?? "", /Ferrero Rocher/);
    assert.equal(getProductAddon("mixed-chocolates-3pc")?.priceUsd, 4.99);
    assert.match(getProductAddon("mixed-chocolates-3pc")?.name ?? "", /Mixed chocolates \(3 pcs\)/);
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
      { id: "ferrero-3pc", name: "Ferrero Rocher", price: 6.5, quantity: 2 },
      { id: "lindt-5pc", name: "Lindor", price: 10.5, quantity: 1 },
    ];
    assert.equal(sumAddonPrices(addons), 23.5);
    assert.equal(cartLineUnitTotal({ price: 20, addons }), 43.5);
    assert.equal(cartLineUnitTotal({ price: 20 }), 20);
  });

  it("builds stable addon signatures including quantity", () => {
    assert.equal(cartAddonSignature([{ id: "b", quantity: 1 }, { id: "a", quantity: 2 }]), "a:2,b:1");
    assert.equal(cartAddonSignature([]), "");
    assert.notEqual(
      cartAddonSignature([{ id: "ferrero-3pc", quantity: 1 }]),
      cartAddonSignature([{ id: "ferrero-3pc", quantity: 2 }])
    );
  });

  it("resolves selections with quantities", () => {
    const ok = resolveProductAddons([
      { id: "lindt-5pc", quantity: 3 },
      { id: "ferrero-3pc", quantity: 2 },
    ]);
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.addons.length, 2);
      assert.equal(ok.addons[0]!.id, "ferrero-3pc");
      assert.equal(ok.addons[0]!.quantity, 2);
      assert.equal(ok.addons[1]!.quantity, 3);
    }
    const fromIds = resolveProductAddonsFromIds(["lindt-5pc", "ferrero-3pc"]);
    assert.equal(fromIds.ok, true);
    if (fromIds.ok) {
      assert.equal(fromIds.addons.every((a) => a.quantity === 1), true);
    }
    const bad = resolveProductAddons([{ id: "not-a-real-addon", quantity: 1 }]);
    assert.equal(bad.ok, false);
    const removed = resolveProductAddons([{ id: "hershey-2pc", quantity: 1 }]);
    assert.equal(removed.ok, false);
    const tooMany = resolveProductAddons([{ id: "ferrero-3pc", quantity: 99 }]);
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
