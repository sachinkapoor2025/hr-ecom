import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Stripe from "stripe";
import type { Order } from "@hr-ecom/shared";
import { stripeIntentMatchesOrder, stripeSecretKeyMode } from "./stripe";

function order(partial: Partial<Order> = {}): Order {
  return {
    orderId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    items: [],
    subtotal: 20,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 20,
    currency: "USD",
    status: "pending_payment",
    shippingAddress: {
      name: "A",
      line1: "1 Main",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "US",
      phone: "5555555555",
      email: "a@example.com",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

function intent(partial: Partial<Stripe.PaymentIntent>): Stripe.PaymentIntent {
  return partial as Stripe.PaymentIntent;
}

describe("stripeIntentMatchesOrder", () => {
  it("accepts a succeeded USD intent for the same order and amount", () => {
    assert.equal(
      stripeIntentMatchesOrder(
        intent({
          amount: 2000,
          currency: "usd",
          metadata: { orderId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
        }),
        order()
      ),
      true
    );
  });

  it("rejects a different amount, currency, or order", () => {
    const base = order();
    assert.equal(
      stripeIntentMatchesOrder(
        intent({
          amount: 1999,
          currency: "usd",
          metadata: { orderId: base.orderId },
        }),
        base
      ),
      false
    );
    assert.equal(
      stripeIntentMatchesOrder(
        intent({
          amount: 2000,
          currency: "inr",
          metadata: { orderId: base.orderId },
        }),
        base
      ),
      false
    );
    assert.equal(
      stripeIntentMatchesOrder(
        intent({
          amount: 2000,
          currency: "usd",
          metadata: { orderId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" },
        }),
        base
      ),
      false
    );
  });
});

describe("stripeSecretKeyMode", () => {
  it("reads only the test or live prefix", () => {
    const previous = process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_SECRET_KEY = "sk_test_example";
    assert.equal(stripeSecretKeyMode(), "test");
    process.env.STRIPE_SECRET_KEY = "sk_live_example";
    assert.equal(stripeSecretKeyMode(), "live");
    process.env.STRIPE_SECRET_KEY = "not-a-stripe-key";
    assert.equal(stripeSecretKeyMode(), null);
    if (previous === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previous;
  });
});
