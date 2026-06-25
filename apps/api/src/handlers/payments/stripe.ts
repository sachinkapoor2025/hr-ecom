import Stripe from "stripe";
import type { Order } from "@hr-ecom/shared";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { ok, badRequest, serverError } from "../../lib/response";
import { markOrderPaid } from "../orders";

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
      await markOrderPaid(intent.metadata.orderId, { paymentIntentId: intent.id });
    }

    return ok({ received: true });
  } catch (err) {
    return serverError(String(err));
  }
}
