import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync } from "fs";
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
});
