import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildOrderShipments, validateShipmentsPartitionCart } from "./order-shipments";
import type { CartItem } from "../schemas/cart";
import type { CheckoutShipment } from "../schemas/order";

const addr = (name: string) => ({
  name,
  line1: "1 Main St",
  city: "Los Angeles",
  state: "CA",
  postalCode: "90001",
  country: "US",
  phone: "+15551234567",
  email: "a@example.com",
  senderName: "Sister",
  senderMessage: "Happy Raksha Bandhan to you my dear brother!",
});

describe("buildOrderShipments", () => {
  it("charges UsaRakhi minimum top-up per delivery address ($15 floor)", () => {
    const cart: CartItem[] = [
      { productSlug: "a", name: "A", price: 10, currency: "USD", quantity: 1 },
      { productSlug: "b", name: "B", price: 14, currency: "USD", quantity: 1 },
      { productSlug: "c", name: "C", price: 3, currency: "USD", quantity: 1 },
    ];
    const shipments: CheckoutShipment[] = [
      { shippingAddress: addr("One"), items: [{ productSlug: "a", quantity: 1 }] },
      { shippingAddress: addr("Two"), items: [{ productSlug: "b", quantity: 1 }] },
      { shippingAddress: addr("Three"), items: [{ productSlug: "c", quantity: 1 }] },
    ];
    const built = buildOrderShipments({
      cartItems: cart,
      checkoutShipments: shipments,
      currency: "USD",
      usdInrRate: 96,
    });
    assert.ok(!("error" in built));
    if ("error" in built) return;
    assert.equal(built.shipments[0].shipping, 5);
    assert.equal(built.shipments[1].shipping, 1);
    assert.equal(built.shipments[2].shipping, 12);
    assert.equal(built.shippingTotal, 18);
  });

  it("charges $15 minimum for UsaRakhi and free shipping for Orange County on a mixed cart", () => {
    const cart: CartItem[] = [
      { productSlug: "a", name: "A", price: 2.75, currency: "USD", quantity: 1 },
      {
        productSlug: "hamper",
        name: "Hamper",
        price: 2.75,
        currency: "USD",
        quantity: 1,
        vendorSlug: "orange-county",
      },
    ];
    const shipments: CheckoutShipment[] = [
      {
        shippingAddress: addr("One"),
        items: [
          { productSlug: "a", quantity: 1 },
          { productSlug: "hamper", quantity: 1 },
        ],
      },
    ];
    const built = buildOrderShipments({
      cartItems: cart,
      checkoutShipments: shipments,
      currency: "USD",
      usdInrRate: 96,
    });
    assert.ok(!("error" in built));
    if ("error" in built) return;
    assert.equal(built.shippingTotal, 12.25);
    assert.equal(built.shipments[0].shipping, 12.25);
  });

  it("rejects incomplete partitions", () => {
    const cart: CartItem[] = [
      { productSlug: "a", name: "A", price: 10, currency: "USD", quantity: 2 },
    ];
    const err = validateShipmentsPartitionCart(cart, [
      { shippingAddress: addr("One"), items: [{ productSlug: "a", quantity: 1 }] },
    ]);
    assert.ok(err);
  });

  it("applies flat expedited passThroughShipping ($19 / $39)", () => {
    const cart: CartItem[] = [
      { productSlug: "a", name: "A", price: 50, currency: "USD", quantity: 1 },
    ];
    for (const fee of [19, 39] as const) {
      const built = buildOrderShipments({
        cartItems: cart,
        checkoutShipments: [
          { shippingAddress: addr("One"), items: [{ productSlug: "a", quantity: 1 }] },
        ],
        currency: "USD",
        usdInrRate: 96,
        passThroughShipping: fee,
      });
      assert.ok(!("error" in built));
      if ("error" in built) return;
      assert.equal(built.shippingTotal, fee);
      assert.equal(built.shipments[0].shipping, fee);
    }
  });
});
