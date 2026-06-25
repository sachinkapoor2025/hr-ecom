import Razorpay from "razorpay";
import crypto from "crypto";
import type { Order } from "@hr-ecom/shared";
import { ORDER_STATUS } from "@hr-ecom/shared";
import { UpdateCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { docClient, TABLE_NAME, now } from "../../lib/db";
import { ok, badRequest, serverError, unauthorized } from "../../lib/response";
import { getUserOrSessionKey } from "../../lib/auth";
import { userKeys } from "@hr-ecom/shared";

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
    };
  }

  const rpOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100),
    currency: order.currency,
    receipt: order.orderId,
    notes: { orderId: order.orderId },
  });

  return {
    razorpayOrderId: rpOrder.id,
    keyId: publishableKeyId,
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

  const orderResult = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: userKeys.pk(userKey), SK: userKeys.orderSk(orderId) },
    })
  );

  const order = orderResult.Item;
  if (!order) return badRequest("Order not found");
  if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
    return badRequest("Payment order mismatch");
  }

  const { keySecret } = getRazorpayCredentials();
  if (!keySecret) {
    await markOrderPaid(orderId, razorpayPaymentId);
    return ok({ verified: true, mode: "dev" });
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expected !== razorpaySignature) {
    return badRequest("Invalid payment signature");
  }

  await markOrderPaid(orderId, razorpayPaymentId);
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
      if (orderId) await markOrderPaid(orderId, paymentId);
    }
    return ok({ received: true });
  } catch (err) {
    return serverError(String(err));
  }
}

async function markOrderPaid(orderId: string, razorpayPaymentId?: string) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI2",
      KeyConditionExpression: "GSI2PK = :pk",
      FilterExpression: "orderId = :oid",
      ExpressionAttributeValues: { ":pk": "ENTITY#ORDER", ":oid": orderId },
    })
  );

  const order = result.Items?.[0];
  if (!order) return;

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: order.PK, SK: order.SK },
      UpdateExpression: "SET #status = :status, razorpayPaymentId = :pid, updatedAt = :now",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": ORDER_STATUS.PAID,
        ":pid": razorpayPaymentId,
        ":now": now(),
      },
    })
  );
}
