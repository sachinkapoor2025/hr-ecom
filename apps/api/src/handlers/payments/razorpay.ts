import Razorpay from "razorpay";
import crypto from "crypto";
import type { Order } from "@hr-ecom/shared";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { ok, badRequest, serverError, unauthorized } from "../../lib/response";
import { getUserOrSessionKey } from "../../lib/auth";
import { markOrderPaid, markOrderPaymentFailed, getOrderById } from "../orders";

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.RAZOR_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZOR_KEY_SECRET;
  return { keyId, keySecret };
}

function getRazorpay(): Razorpay | null {
  const { keyId, keySecret } = getRazorpayCredentials();
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createRazorpayOrder(order: Order) {
  const razorpay = getRazorpay();
  const { keyId } = getRazorpayCredentials();
  const publishableKeyId = keyId ?? "rzp_dev_key";

  if (!razorpay) {
    return {
      razorpayOrderId: `order_dev_${order.orderId}`,
      keyId: publishableKeyId,
      qrImageUrl: undefined as string | undefined,
      qrId: undefined as string | undefined,
    };
  }

  const rpOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100),
    currency: order.currency,
    receipt: order.orderId,
    notes: { orderId: order.orderId },
  });

  let qrImageUrl: string | undefined;
  let qrId: string | undefined;

  if (order.currency === "INR") {
    try {
      const qr = await razorpay.qrCode.create({
        type: "upi_qr",
        name: `UsaRakhi ${order.orderId.slice(0, 8)}`,
        usage: "single_use",
        fixed_amount: true,
        payment_amount: Math.round(order.total * 100),
        description: `Order ${order.orderId.slice(0, 8)}`,
        notes: { orderId: order.orderId },
      });
      qrImageUrl = qr.image_url;
      qrId = qr.id;
    } catch (err) {
      console.error("Razorpay QR create failed:", err);
    }
  }

  return {
    razorpayOrderId: rpOrder.id,
    keyId: publishableKeyId,
    qrImageUrl,
    qrId,
  };
}

export async function verifyRazorpayPayment(event: APIGatewayProxyEventV2) {
  const userKey = getUserOrSessionKey(event);
  if (!userKey) return unauthorized("Session or auth required");

  const body = JSON.parse(event.body ?? "{}");
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body as {
    orderId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return badRequest("Missing payment verification fields");
  }

  const order = await getOrderById(orderId);
  if (!order) return badRequest("Order not found");
  if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
    return badRequest("Payment order mismatch");
  }

  const { keySecret } = getRazorpayCredentials();
  if (!keySecret) {
    await markOrderPaid(orderId, { razorpayPaymentId });
    return ok({ verified: true, mode: "dev" });
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expected !== razorpaySignature) {
    return badRequest("Invalid payment signature");
  }

  await markOrderPaid(orderId, { razorpayPaymentId });
  return ok({ verified: true });
}

export async function razorpayWebhook(event: APIGatewayProxyEventV2) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return ok({ received: true, mode: "dev" });

  const signature = event.headers?.["x-razorpay-signature"];
  if (!signature) return badRequest("Missing signature");

  const expected = crypto
    .createHmac("sha256", secret)
    .update(event.body ?? "")
    .digest("hex");

  if (expected !== signature) return badRequest("Invalid signature");

  try {
    const payload = JSON.parse(event.body ?? "{}");
    if (payload.event === "payment.captured") {
      const orderId = payload.payload?.payment?.entity?.notes?.orderId;
      const paymentId = payload.payload?.payment?.entity?.id;
      if (orderId) await markOrderPaid(orderId, { razorpayPaymentId: paymentId });
    }
    if (payload.event === "payment.failed") {
      const orderId = payload.payload?.payment?.entity?.notes?.orderId;
      const reason = payload.payload?.payment?.entity?.error_description as string | undefined;
      if (orderId) await markOrderPaymentFailed(orderId, reason ?? "Razorpay payment failed");
    }
    if (payload.event === "qr_code.credited") {
      const orderId = payload.payload?.qr_code?.entity?.notes?.orderId;
      const paymentId = payload.payload?.payment?.entity?.id;
      if (orderId) await markOrderPaid(orderId, { razorpayPaymentId: paymentId });
    }
    return ok({ received: true });
  } catch (err) {
    return serverError(String(err));
  }
}
