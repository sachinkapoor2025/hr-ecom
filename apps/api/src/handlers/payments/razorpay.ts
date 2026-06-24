import Razorpay from "razorpay";
import crypto from "crypto";
import type { Order } from "@hr-ecom/shared";
import { ORDER_STATUS } from "@hr-ecom/shared";
import { UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { docClient, TABLE_NAME, now } from "../../lib/db";
import { ok, badRequest, serverError } from "../../lib/response";

function getRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createRazorpayOrder(order: Order) {
  const razorpay = getRazorpay();
  const keyId = process.env.RAZORPAY_KEY_ID ?? "rzp_dev_key";

  if (!razorpay) {
    return {
      razorpayOrderId: `order_dev_${order.orderId}`,
      keyId,
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
    keyId,
  };
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
