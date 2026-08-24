import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { previewSesTemplateHtml, renderSesTemplate } from "../schemas/ses-email";
import { buildLastMinuteRakhiOrdersEmailHtml } from "./last-minute-rakhi-orders-email";

describe("last-minute rakhi orders email", () => {
  const html = buildLastMinuteRakhiOrdersEmailHtml();

  it("emits email-safe HTML with required placeholders", () => {
    assert.match(html, /<!DOCTYPE html>/i);
    assert.match(html, /\{\{CUSTOMER_NAME\}\}/);
    assert.match(html, /\{\{DELIVERY_OPTION_1\}\}/);
    assert.match(html, /\{\{DELIVERY_PRICE_1\}\}/);
    assert.match(html, /\{\{DELIVERY_OPTION_2\}\}/);
    assert.match(html, /\{\{DELIVERY_PRICE_2\}\}/);
    assert.match(html, /\{\{SHOP_URL\}\}/);
    assert.match(html, /\{\{UNSUBSCRIBE_URL\}\}/);
    assert.match(html, /LAST MINUTE/);
    assert.match(html, /WE DELIVER LOVE, ON TIME!/);
    assert.match(html, /ORDER NOW/);
    assert.match(html, /Because some bonds can&#39;t wait!/);
    assert.match(html, /SAFE &amp; SECURE DELIVERY/);
    assert.match(html, /banner-last-minute-rakhi-orders\.png/);
  });

  it("fills merge tags for send and preview without touching unknown tokens", () => {
    const sent = renderSesTemplate(html, { name: "Asha" });
    assert.match(sent, /Hi Asha,/);
    assert.match(sent, /2 DAYS DELIVERY/);
    assert.match(sent, /\$39/);
    assert.match(sent, /3 DAYS DELIVERY/);
    assert.match(sent, /\$19/);
    assert.match(sent, /https:\/\/www\.usarakhi\.com/);
    assert.match(sent, /\{\{UNSUBSCRIBE_URL\}\}/);

    const preview = previewSesTemplateHtml(html);
    assert.match(preview, /Hi Priya,/);
    assert.doesNotMatch(preview, /\{\{UNSUBSCRIBE_URL\}\}/);
    assert.doesNotMatch(preview, /\{\{SHOP_URL\}\}/);
  });

  it("keeps legacy {{name}} replacement working", () => {
    assert.equal(renderSesTemplate("Hello {{name}}", { name: "Ravi" }), "Hello Ravi");
    assert.equal(renderSesTemplate("Hello {{name}}", {}), "Hello there");
  });
});
