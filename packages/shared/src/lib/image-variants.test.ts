import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allVariantObjectKeys,
  isImageVariantKey,
  isOptimizableImageKey,
  productImageVariantUrl,
  variantObjectKey,
} from "./image-variants";

describe("image variant keys", () => {
  it("builds sibling webp keys next to the original", () => {
    assert.equal(
      variantObjectKey("products/slug/abc.png", "card"),
      "products/slug/abc.card.webp"
    );
    assert.equal(
      variantObjectKey("uploads/2026/03/photo.webp", "thumb"),
      "uploads/2026/03/photo.thumb.webp"
    );
    assert.equal(
      variantObjectKey("uploads/orange-county/TFUSA001/TFUSA001.jpg", "gallery"),
      "uploads/orange-county/TFUSA001/TFUSA001.gallery.webp"
    );
  });

  it("does not process variants, bills, or non-images", () => {
    assert.equal(isImageVariantKey("products/x.card.webp"), true);
    assert.equal(isOptimizableImageKey("products/x.card.webp"), false);
    assert.equal(isOptimizableImageKey("expenses/bill.jpg"), false);
    assert.equal(isOptimizableImageKey("uploads/notes.json"), false);
    assert.equal(isOptimizableImageKey("products/hero.png"), true);
    assert.equal(isOptimizableImageKey("uploads/2026/03/rakhi.webp"), true);
    assert.equal(isOptimizableImageKey("uploads/2026/03/rakhi-150x150.webp"), false);
    assert.equal(isOptimizableImageKey("uploads/wpforms/logo.png"), false);
  });

  it("rewrites managed CDN URLs and leaves hotlinked URLs alone", () => {
    assert.equal(
      productImageVariantUrl(
        "https://d301af4ndyn9qx.cloudfront.net/uploads/2026/03/om-rakhi.webp",
        "gallery"
      ),
      "https://d301af4ndyn9qx.cloudfront.net/uploads/2026/03/om-rakhi.gallery.webp"
    );
    assert.equal(
      productImageVariantUrl("https://images.example.com/hotlink.jpg", "card"),
      "https://images.example.com/hotlink.jpg"
    );
  });

  it("lists all four derivative keys for delete cleanup", () => {
    assert.deepEqual(allVariantObjectKeys("products/a.jpg"), [
      "products/a.thumb.webp",
      "products/a.card.webp",
      "products/a.gallery.webp",
      "products/a.zoom.webp",
    ]);
  });
});
