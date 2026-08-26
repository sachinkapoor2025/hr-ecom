import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { containsEmoji, ORDER_STATUS } from "@hr-ecom/shared";
import { orderPaidWhatsAppMessage, orderStatusWhatsAppMessage } from "./whatsapp";

const STATUSES = [
  ORDER_STATUS.PAID,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.ON_HOLD,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.COMPLETE,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.REFUNDED,
];

describe("order status WhatsApp copy has no emoji", () => {
  it("paid confirmation has no emoji", () => {
    const text = orderPaidWhatsAppMessage({
      name: "Priya",
      orderId: "abc12345-uuid",
      totalLabel: "USD 42.00",
    });
    assert.equal(containsEmoji(text), false);
    assert.match(text, /Hi Priya!/);
    assert.match(text, /Payment received/);
  });

  it("every status template is emoji-free and keeps order details", () => {
    for (const status of STATUSES) {
      const text = orderStatusWhatsAppMessage({
        name: "Priya",
        orderId: "abc12345-uuid",
        status,
        totalLabel: "USD 42.00",
        carrier: "USPS",
        trackingNumber: "9400",
      });
      assert.ok(text, `expected WhatsApp copy for ${status}`);
      assert.equal(containsEmoji(text!), false, `emoji found in ${status} WhatsApp copy`);
      assert.match(text!, /ABC12345/);
    }
  });
});
