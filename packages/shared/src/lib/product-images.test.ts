import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PRODUCT_IMAGE_MIN_EDGE_PX,
  selectDisplayableProductImages,
} from "./product-images";
import { resolveProductImageUrl } from "./image-url";

describe("selectDisplayableProductImages", () => {
  it("drops tiny thumbnails when sharper frames exist", () => {
    const urls = selectDisplayableProductImages([
      { url: "/a.jpg", width: 500, height: 500 },
      { url: "/a-thumb.jpg", width: 100, height: 100 },
      { url: "/a-b.jpg", width: 100, height: 100 },
      { url: "/a2.jpg", width: 1500, height: 1500 },
    ]);
    assert.deepEqual(urls, ["/a.jpg", "/a2.jpg"]);
  });

  it("keeps the largest frame when all are below the min edge", () => {
    const urls = selectDisplayableProductImages([
      { url: "/tiny-a.jpg", width: 100, height: 100 },
      { url: "/tiny-b.jpg", width: 120, height: 120 },
    ]);
    assert.deepEqual(urls, ["/tiny-b.jpg"]);
  });

  it("keeps 300px masters used as the sole product image", () => {
    const urls = selectDisplayableProductImages([{ url: "/only.jpg", width: 300, height: 300 }]);
    assert.deepEqual(urls, ["/only.jpg"]);
    assert.ok(300 >= PRODUCT_IMAGE_MIN_EDGE_PX);
  });
});

describe("resolveProductImageUrl", () => {
  it("rewrites relative /uploads paths to the product CDN", () => {
    assert.equal(
      resolveProductImageUrl("/uploads/orange-county/TFUSA007/TFUSA007.jpg"),
      "https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSA007/TFUSA007.jpg"
    );
  });

  it("rewrites legacy WordPress upload URLs to the CDN", () => {
    assert.equal(
      resolveProductImageUrl("https://usarakhi.com/wp-content/uploads/2026/03/photo.jpg"),
      "https://d301af4ndyn9qx.cloudfront.net/uploads/2026/03/photo.jpg"
    );
  });
});
