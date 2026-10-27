import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEV_TEST_PRICE_INR,
  DEV_TEST_PRICE_SLUG,
  devStorefrontTestPriceActive,
  isDevStorefrontHost,
  withDevTestStorefrontPrice,
} from "./dev-test-price";

describe("dev storefront test price", () => {
  it("replaces only the kumkum hamper price", () => {
    const priced = withDevTestStorefrontPrice({
      productSlug: DEV_TEST_PRICE_SLUG,
      price: 38.25,
      currency: "USD",
      name: "Bhai Dooj Kaju Katli & Kumkum Gift Box",
    });
    assert.equal(priced.price, DEV_TEST_PRICE_INR);
    assert.equal(priced.currency, "INR");
    assert.equal(priced.name, "Bhai Dooj Kaju Katli & Kumkum Gift Box");

    const other = withDevTestStorefrontPrice({
      slug: "bhai-dooj-almonds-and-pistachios-gift-box",
      price: 39.31,
      currency: "USD",
    });
    assert.equal(other.price, 39.31);
    assert.equal(other.currency, "USD");
  });

  it("turns on for the dev Amplify host and an explicit env flag", () => {
    assert.equal(isDevStorefrontHost("https://dev.d1vlvm5li37k6g.amplifyapp.com"), true);
    assert.equal(isDevStorefrontHost("https://www.usarakhi.com"), false);
    assert.equal(isDevStorefrontHost("http://localhost:3002"), false);
    assert.equal(
      devStorefrontTestPriceActive({
        origin: "https://dev.d1vlvm5li37k6g.amplifyapp.com",
      }),
      true
    );
    assert.equal(
      devStorefrontTestPriceActive({ origin: "https://www.usarakhi.com" }),
      false
    );
    assert.equal(devStorefrontTestPriceActive({ envFlag: "1", origin: "https://www.usarakhi.com" }), true);
  });
});
