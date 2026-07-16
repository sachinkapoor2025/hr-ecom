import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getProductIncludes, parseChocolateInclude } from "./product-includes";

describe("parseChocolateInclude", () => {
  it("reads Ferrero count from Includes sentence", () => {
    assert.equal(
      parseChocolateInclude("Gift set. Includes 3 Ferrero Rocher chocolates."),
      "3 Ferrero Rocher Chocolates"
    );
  });

  it("reads Hershey count from name", () => {
    assert.equal(
      parseChocolateInclude("Elegant Designer Rakhi with 2 HERSHEY'S Chocolates"),
      "2 Hershey's Chocolates"
    );
  });

  it("defaults Ferrero to 3 when brand only", () => {
    assert.equal(parseChocolateInclude("Rakhi with Ferrero Rocher"), "3 Ferrero Rocher Chocolates");
  });

  it("returns null when no chocolate", () => {
    assert.equal(parseChocolateInclude("Single Rakhi with Roli Chawal"), null);
  });
});

describe("getProductIncludes", () => {
  it("lists rakhi, roli, moli for single rakhi", () => {
    assert.deepEqual(
      getProductIncludes({
        name: "Om Rakhi with Roli Chawal for Brother",
        description: "Elegant single rakhi for brother.",
        categorySlug: "single-rakhi",
      }),
      ["1 Designer Rakhi", "Packet of Roli", "Packet of Moli"]
    );
  });

  it("adds chocolate pieces for combo", () => {
    assert.deepEqual(
      getProductIncludes({
        name: "Rakhi with Ferrero Rocher Chocolates & Roli Chawal",
        description: "Premium combo. Includes 3 Ferrero Rocher chocolates.",
        categorySlug: "rakhi-combo",
      }),
      [
        "1 Designer Rakhi",
        "Packet of Roli",
        "Packet of Moli",
        "3 Ferrero Rocher Chocolates",
      ]
    );
  });

  it("lists bhaiya + lumba for set", () => {
    const items = getProductIncludes({
      name: "Rakhi Combo for Bhai Bhabhi with Premium Chocolates Gift Set",
      description: "Includes 5 assorted chocolates.",
      categorySlug: "bhaiya-bhabhi-rakhi",
    });
    assert.ok(items.includes("1 Bhaiya Rakhi"));
    assert.ok(items.includes("1 Lumba Rakhi for Bhabhi"));
    assert.ok(items.includes("5 Assorted Chocolates"));
  });

  it("uses hamper HTML list items", () => {
    const items = getProductIncludes({
      name: "Classic Rakhi Double Delight Box",
      description:
        "<p>Intro</p><ul><li>Set of 2 designer Rakhis</li><li>200 g Besan Laddoo</li><li>Roli Chawal Designer Tikka Set</li></ul>",
      categorySlug: "rakhi-hampers",
    });
    assert.deepEqual(items, [
      "Set of 2 designer Rakhis",
      "200 g Besan Laddoo",
      "Roli Chawal Designer Tikka Set",
    ]);
  });
});
