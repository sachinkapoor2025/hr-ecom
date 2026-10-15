import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync, readFileSync } from "fs";
import bundledCatalog from "../data/festival-2026.json";
import { festivalCatalogPaths, getBundledFestivalProduct } from "./festival-catalog";

describe("festival catalog", () => {
  it("resolves the storefront festival file", () => {
    assert.ok(festivalCatalogPaths().some((path) => existsSync(path)));
  });

  it("finds a live festival slug and ignores unknown slugs", () => {
    const product = getBundledFestivalProduct("bhai-dooj-kaju-katli-and-kumkum-gift-box");
    assert.ok(product);
    assert.equal(product?.sku, "TFUSBD2601");
    assert.equal(product?.name, "Bhai Dooj Kaju Katli & Kumkum Gift Box");
    assert.equal(getBundledFestivalProduct("not-a-real-product"), undefined);
  });

  it("keeps the Lambda JSON bundle aligned with the storefront catalog", () => {
    const storefrontPath = festivalCatalogPaths().find(
      (path) => path.replace(/\\/g, "/").endsWith("scripts/data/festival-2026.json") && existsSync(path)
    );
    assert.ok(storefrontPath);
    const storefront = JSON.parse(readFileSync(storefrontPath, "utf8")) as {
      products?: Array<{ slug?: string }>;
    };
    const bundled = (bundledCatalog as { products?: Array<{ slug?: string }> }).products ?? [];
    const storeSlugs = (storefront.products ?? []).map((product) => product.slug).sort();
    const bundleSlugs = bundled.map((product) => product.slug).sort();
    assert.deepEqual(bundleSlugs, storeSlugs);
    assert.ok(bundleSlugs.includes("diwali-toran-rangoli-and-besan-laddoo-hamper"));
  });
});
