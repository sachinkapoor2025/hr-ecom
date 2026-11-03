import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { STRIPE_PAYMENTS_ENABLED } from "../constants";
import { paymentMethodsForCheckoutCurrency } from "./checkout-payment-methods";

describe("paymentMethodsForCheckoutCurrency", () => {
  it("offers Razorpay and Stripe for USD, and only Razorpay for INR", () => {
    const usd = paymentMethodsForCheckoutCurrency("USD");
    const inr = paymentMethodsForCheckoutCurrency("INR");

    assert.equal(usd.includes("razorpay"), true);
    assert.equal(inr.includes("razorpay"), true);
    assert.equal(inr.includes("stripe"), false);
    assert.equal(usd.includes("stripe"), STRIPE_PAYMENTS_ENABLED);
    assert.equal(usd[0], "razorpay");
  });
});
