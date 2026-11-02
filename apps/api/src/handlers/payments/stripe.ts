import Stripe from "stripe";
import { z } from "zod";
import type { Order } from "@hr-ecom/shared";
import { isOrderPaymentSettled, ORDER_STATUS, STRIPE_PAYMENTS_ENABLED } from "@hr-ecom/shared";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { ok, badRequest, forbidden, serverError, unauthorized } from "../../lib/response";
import { getAuth, getSessionId, getUserOrSessionKey } from "../../lib/auth";
import { getOrderById, markOrderPaid, markOrderPaymentFailed } from "../orders";
import { isLoadTestMode } from "../../lib/load-test";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

function getRawBody(event: APIGatewayProxyEventV2): string {
  if (!event.body) return "";
  if (event.isBase64Encoded) return Buffer.from(event.body, "base64").toString("utf8");
  return event.body;
}

function getHeader(event: APIGatewayProxyEventV2, name: string): string | undefined {
  const headers = event.headers ?? {};
  const lower = name.toLowerCase();
  return headers[lower] ?? headers[name];
}

function stripeChargeAmount(order: Order): number {
  return Math.round(order.total * 100);
}

export function stripeIntentMatchesOrder(intent: Stripe.PaymentIntent, order: Order): boolean {
  return (
    intent.metadata?.orderId === order.orderId &&
    intent.amount === stripeChargeAmount(order) &&
    intent.currency.toLowerCase() === order.currency.toLowerCase()
  );
}

function isSyntheticIntentId(paymentIntentId: string | undefined): boolean {
  if (!paymentIntentId) return true;
  return paymentIntentId.includes("_dev_") || paymentIntentId.includes("_loadtest_");
}

const REUSABLE_INTENT_STATUSES = new Set<Stripe.PaymentIntent.Status>([
  "requires_payment_method",
  "requires_confirmation",
  "requires_action",
]);

export type StripeIntentLookup =
  | { state: "none" }
  | { state: "succeeded"; paymentIntentId: string }
  | { state: "reusable"; paymentIntentId: string; clientSecret: string };

/** Read an existing intent. Does not create a charge. */
export async function lookupStripeIntent(order: Order): Promise<StripeIntentLookup> {
  const paymentIntentId = order.paymentIntentId;
  if (isSyntheticIntentId(paymentIntentId)) return { state: "none" };

  const stripe = getStripe();
  if (!stripe) return { state: "none" };

  try {
    const existing = await stripe.paymentIntents.retrieve(paymentIntentId!);
    if (existing.status === "succeeded" && stripeIntentMatchesOrder(existing, order)) {
      return { state: "succeeded", paymentIntentId: existing.id };
    }
    if (
      REUSABLE_INTENT_STATUSES.has(existing.status) &&
      stripeIntentMatchesOrder(existing, order) &&
      existing.client_secret
    ) {
      return {
        state: "reusable",
        paymentIntentId: existing.id,
        clientSecret: existing.client_secret,
      };
    }
  } catch (err) {
    console.error("Stripe intent lookup failed:", err);
  }
  return { state: "none" };
}

export async function createStripePaymentIntent(order: Order) {
  if (!STRIPE_PAYMENTS_ENABLED) {
    throw new Error("Stripe card payments are temporarily unavailable. Please pay with Razorpay.");
  }

  if (order.currency !== "USD") {
    throw new Error("Stripe checkout requires USD. Switch currency to USD or pay with Razorpay.");
  }

  if (isLoadTestMode()) {
    return {
      paymentIntentId: `pi_loadtest_${order.orderId}`,
      clientSecret: `pi_loadtest_${order.orderId}_secret`,
    };
  }

  const stripe = getStripe();
  if (!stripe) {
    return {
      paymentIntentId: `pi_dev_${order.orderId}`,
      clientSecret: `pi_dev_${order.orderId}_secret`,
    };
  }

  const intent = await stripe.paymentIntents.create({
    amount: stripeChargeAmount(order),
    currency: order.currency.toLowerCase(),
    metadata: { orderId: order.orderId },
    automatic_payment_methods: { enabled: true },
    ...(order.shippingAddress.email
      ? { receipt_email: order.shippingAddress.email.trim() }
      : {}),
  });

  if (!intent.client_secret) {
    throw new Error("Stripe did not return a client secret.");
  }

  return {
    paymentIntentId: intent.id,
    clientSecret: intent.client_secret,
  };
}

/** Reuse an open intent for this order, or create one. Never creates a second charge if the first already succeeded. */
export async function prepareStripePayment(order: Order) {
  const existing = await lookupStripeIntent(order);
  if (existing.state === "succeeded") {
    return { alreadyPaid: true as const, paymentIntentId: existing.paymentIntentId };
  }
  if (existing.state === "reusable") {
    return {
      alreadyPaid: false as const,
      paymentIntentId: existing.paymentIntentId,
      clientSecret: existing.clientSecret,
    };
  }
  const created = await createStripePaymentIntent(order);
  return { alreadyPaid: false as const, ...created };
}

function canAccessOrder(event: APIGatewayProxyEventV2, order: Order): boolean {
  const auth = getAuth(event);
  const sessionId = getSessionId(event);
  return Boolean(
    auth?.isAdmin ||
      (auth?.userId && order.userId === auth.userId) ||
      (sessionId && order.sessionId === sessionId)
  );
}

const confirmStripeSchema = z.object({
  orderId: z.string().uuid(),
  paymentIntentId: z.string().min(3).max(255),
});

/**
 * Confirm a Stripe PaymentIntent after the customer returns from checkout.
 * The secret key stays on the server. markOrderPaid is idempotent, so the webhook can also settle the same intent.
 */
export async function confirmStripePayment(event: APIGatewayProxyEventV2) {
  if (!getUserOrSessionKey(event)) return unauthorized("Session or auth required");

  const parsed = confirmStripeSchema.safeParse(JSON.parse(event.body ?? "{}"));
  if (!parsed.success) return badRequest("Missing Stripe confirmation fields");

  const { orderId, paymentIntentId } = parsed.data;
  const order = await getOrderById(orderId);
  if (!order) return badRequest("Order not found");
  if (!canAccessOrder(event, order)) return forbidden();

  if (isOrderPaymentSettled(order.status)) {
    return ok({ status: "paid", orderStatus: order.status });
  }

  if (order.paymentProvider && order.paymentProvider !== "stripe") {
    return badRequest("This order is not a Stripe payment");
  }
  if (order.paymentIntentId && order.paymentIntentId !== paymentIntentId) {
    return badRequest("Payment does not match this order");
  }
  if (order.currency !== "USD") {
    return badRequest("Stripe checkout requires USD");
  }

  if (isSyntheticIntentId(paymentIntentId)) {
    if (!isLoadTestMode()) return badRequest("Stripe payment could not be confirmed");
    await markOrderPaid(orderId, { paymentIntentId });
    return ok({ status: "paid", orderStatus: ORDER_STATUS.PAID });
  }

  const stripe = getStripe();
  if (!stripe) return badRequest("Stripe is not configured");

  let intent: Stripe.PaymentIntent;
  try {
    intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    console.error("Stripe intent retrieve failed:", err);
    return badRequest("Stripe payment could not be confirmed");
  }

  if (!stripeIntentMatchesOrder(intent, order)) {
    console.error("Stripe intent does not match order", { orderId, paymentIntentId });
    return badRequest("Payment does not match this order");
  }

  if (intent.status === "succeeded") {
    await markOrderPaid(orderId, { paymentIntentId: intent.id });
    return ok({ status: "paid", orderStatus: ORDER_STATUS.PAID });
  }

  if (
    intent.status === "processing" ||
    intent.status === "requires_action" ||
    intent.status === "requires_confirmation" ||
    intent.status === "requires_capture"
  ) {
    return ok({ status: "pending", orderStatus: order.status });
  }

  if (intent.status === "canceled") {
    return ok({ status: "cancelled", orderStatus: order.status });
  }

  return ok({ status: "failed", orderStatus: order.status });
}

async function settleSucceededStripeIntent(intent: Stripe.PaymentIntent) {
  const orderId = intent.metadata?.orderId;
  if (!orderId) return;
  const order = await getOrderById(orderId);
  if (!order) return;
  if (!stripeIntentMatchesOrder(intent, order)) {
    console.error("Stripe success ignored — intent does not match order", {
      orderId,
      paymentIntentId: intent.id,
    });
    return;
  }
  await markOrderPaid(orderId, { paymentIntentId: intent.id });
}

async function settleFailedStripeIntent(intent: Stripe.PaymentIntent, note: string) {
  const orderId = intent.metadata?.orderId;
  if (!orderId) return;
  const order = await getOrderById(orderId);
  if (!order) return;
  if (order.status !== ORDER_STATUS.PENDING_PAYMENT) return;
  if (order.paymentProvider !== "stripe") return;
  // A newer checkout choice replaced this intent. Do not cancel that order.
  if (!order.paymentIntentId || order.paymentIntentId !== intent.id) return;
  await markOrderPaymentFailed(orderId, note);
}

export async function stripeWebhook(event: APIGatewayProxyEventV2) {
  const stripe = getStripe();
  if (!stripe) return ok({ received: true, mode: "dev" });

  const sig = getHeader(event, "stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!sig || !webhookSecret) {
    return badRequest("Missing webhook signature");
  }

  const rawBody = getRawBody(event);

  try {
    const stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    if (stripeEvent.type === "payment_intent.succeeded") {
      const intent = stripeEvent.data.object as Stripe.PaymentIntent;
      await settleSucceededStripeIntent(intent);
    }

    if (stripeEvent.type === "payment_intent.payment_failed") {
      const intent = stripeEvent.data.object as Stripe.PaymentIntent;
      await settleFailedStripeIntent(intent, "Stripe payment failed");
    }

    if (stripeEvent.type === "payment_intent.canceled") {
      const intent = stripeEvent.data.object as Stripe.PaymentIntent;
      await settleFailedStripeIntent(intent, "Stripe payment cancelled");
    }

    return ok({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return serverError(String(err));
  }
}
