import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { previewSesTemplateHtml } from "../schemas/ses-email";
import { buildDiwaliBhaiDoojEmailHtml, DIWALI_BHAI_DOOJ_EMAIL_CONFIG } from "./diwali-bhai-dooj-email";

describe("diwali and bhai dooj email", () => {
  const html = buildDiwaliBhaiDoojEmailHtml();
  const cfg = DIWALI_BHAI_DOOJ_EMAIL_CONFIG;

  it("uses the requested name, subject, and preview text", () => {
    assert.equal(cfg.name, "Diwali & Bhai Dooj Gift Collection 2026");
    assert.equal(
      cfg.subject,
      "Celebrate Diwali & Bhai Dooj – Shop Thoughtful Gifts for Your Loved Ones"
    );
    assert.equal(
      cfg.preheader,
      "Make this festive season special with beautiful gifts for your family. Explore the collection today!"
    );
    assert.match(html, /Make this festive season special/);
  });

  it("links the banner, shop button, catalog, and each product", () => {
    assert.match(html, /href="https:\/\/www\.usarakhi\.com\/banners\/banner-diwali-bhai-dooj\.jpg"|src="https:\/\/www\.usarakhi\.com\/banners\/banner-diwali-bhai-dooj\.jpg"/);
    assert.match(html, />Shop Now</);
    assert.match(html, /href="https:\/\/www\.usarakhi\.com"/);
    assert.match(html, /href="https:\/\/www\.usarakhi\.com\/products"/);
    assert.equal(cfg.products.length, 4);
    for (const product of cfg.products) {
      assert.match(html, new RegExp(product.href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      assert.match(html, new RegExp(product.imageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      assert.match(html, new RegExp(product.priceLabel.replace("$", "\\$")));
      assert.match(html, /View Product/);
    }
    assert.match(html, /Explore All Gifts/);
    assert.doesNotMatch(html, /href=""/);
    assert.doesNotMatch(html, /href="#"/);
    assert.doesNotMatch(html, /free shipping/i);
    assert.doesNotMatch(html, /placeholder/i);
  });

  it("previews the unsubscribe link without sending", () => {
    const preview = previewSesTemplateHtml(html);
    assert.match(preview, /https:\/\/www\.usarakhi\.com\/email\/unsubscribe\/preview/);
    assert.doesNotMatch(preview, /\{\{unsubscribe\}\}/);
  });
});
