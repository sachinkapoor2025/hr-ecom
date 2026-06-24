import Stripe from "stripe";
import type { Order } from "@hr-ecom/shared";
import { ORDER_STATUS } from "@hr-ecom/shared";
import { UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { docClient, TABLE_NAME, now } from "../../lib/db";
import { ok, badRequest, serverError } from "../../lib/response";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export async function createStripePaymentIntent(order: Order) {
  const stripe = getStripe();
  if (!stripe) {
    return {
      paymentIntentId: `pi_dev_${order.orderId}`,
      clientSecret: `pi_dev_${order.orderId}_secret`,
    };
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100),
    currency: order.currency.toLowerCase(),
    metadata: { orderId: order.orderId },
    automatic_payment_methods: { enabled: true },
  });

  return {
    paymentIntentId: intent.id,
    clientSecret: intent.client_secret!,
  };
}

export async function stripeWebhook(event: APIGatewayProxyEventV2) {
  const stripe = getStripe();
  if (!stripe) return ok({ received: true, mode: "dev" });

  const sig = event.headers?.["stripe-signature"];
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return badRequest("Missing webhook signature");
  }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body ?? "",
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (stripeEvent.type === "payment_intent.succeeded") {
      const intent = stripeEvent.data.object as Stripe.PaymentIntent;
      await markOrderPaid(intent.metadata.orderId, intent.id);
    }

    return ok({ received: true });
  } catch (err) {
    return serverError(String(err));
  }
}

async function markOrderPaid(orderId: string | undefined, paymentIntentId: string) {
  if (!orderId) return;

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
      UpdateExpression: "SET #status = :status, paymentIntentId = :pid, updatedAt = :now",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": ORDER_STATUS.PAID,
        ":pid": paymentIntentId,
        ":now": now(),
      },
    })
  );
}
