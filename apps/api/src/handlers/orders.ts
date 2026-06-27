import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import {
  checkoutSchema,
  leadCaptureSchema,
  orderStatusUpdateSchema,
  orderKeys,
  customerKeys,
  ORDER_STATUS,
  ORDER_STATUS_TRANSITIONS,
  convertCartItemsToCurrency,
  cartSubtotal,
  type Order,
  type OrderStatusHistoryEntry,
} from "@hr-ecom/shared";
import { resolveCheckoutUsdInrRate } from "../lib/exchange-rate";
import { docClient, ORDERS_TABLE, CUSTOMERS_TABLE, now } from "../lib/db";
import { ok, created, badRequest, unauthorized, forbidden, notFound } from "../lib/response";
import { getAuth, getSessionId, getUserOrSessionKey, requireAdmin } from "../lib/auth";
import { getCartHandler, clearCartForUser } from "./cart";

type StoredOrder = Order & {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: string;
  GSI3PK: string;
  GSI3SK: string;
};

function buildOrderItem(order: Order, userKey: string): StoredOrder {
  return {
    ...order,
    PK: orderKeys.pk(order.orderId),
    SK: orderKeys.sk(),
    GSI1PK: orderKeys.gsi1pk(userKey),
    GSI1SK: orderKeys.gsi1sk(order.createdAt),
    GSI2PK: orderKeys.gsi2pk(),
    GSI2SK: orderKeys.gsi2sk(order.createdAt),
    GSI3PK: orderKeys.gsi3pk(order.status),
    GSI3SK: orderKeys.gsi3sk(order.createdAt),
  };
}

function normalizeEmail(email?: string): string | undefined {
  const trimmed = email?.trim();
  if (!trimmed || !trimmed.includes("@")) return undefined;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : undefined;
}

function pickContactField(incoming?: string, existing?: string): string | undefined {
  const next = incoming?.trim();
  if (next) return next;
  return existing;
}

export async function captureLead(event: APIGatewayProxyEventV2) {
  if ((event.body?.length ?? 0) > 16 * 1024) return badRequest("Payload too large");
  const body = JSON.parse(event.body ?? "{}");
  const parsed = leadCaptureSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const timestamp = now();
  const sessionId = parsed.data.sessionId;
  const email = normalizeEmail(parsed.data.email);

  // lead event (co-located under the session)
  await docClient.send(
    new PutCommand({
      TableName: CUSTOMERS_TABLE,
      Item: {
        ...parsed.data,
        ...(email ? { email } : {}),
        leadId: uuidv4(),
        PK: customerKeys.pk(sessionId),
        SK: customerKeys.leadSk(timestamp),
        GSI1PK: customerKeys.gsi1pk(),
        GSI1SK: customerKeys.gsi1sk(timestamp),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    })
  );

  const existing = await docClient.send(
    new GetCommand({
      TableName: CUSTOMERS_TABLE,
      Key: { PK: customerKeys.pk(sessionId), SK: customerKeys.profileSk() },
    })
  );
  const prev = existing.Item ?? {};

  // session identity rollup — merge so partial field updates don't wipe other fields
  await docClient.send(
    new PutCommand({
      TableName: CUSTOMERS_TABLE,
      Item: {
        sessionId,
        PK: customerKeys.pk(sessionId),
        SK: customerKeys.profileSk(),
        createdAt: (prev.createdAt as string) ?? timestamp,
        lastSeenAt: timestamp,
        updatedAt: timestamp,
        name: pickContactField(parsed.data.name, prev.name as string | undefined),
        email: email ?? (prev.email as string | undefined),
        phone: pickContactField(parsed.data.phone, prev.phone as string | undefined),
      },
    })
  );

  return created({ ok: true });
}

export async function checkout(event: APIGatewayProxyEventV2) {
  const userKey = getUserOrSessionKey(event);
  if (!userKey) return unauthorized("Session or auth required");

  const body = JSON.parse(event.body ?? "{}");
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const cartResponse = await getCartHandler(event);
  const cartBody = JSON.parse(
    typeof cartResponse === "string" ? cartResponse : (cartResponse.body ?? "{}")
  );
  const cart = cartBody.cart;

  if (!cart?.items?.length) return badRequest("Cart is empty");

  const cartCurrency = cart.items[0]?.currency ?? "USD";
  const checkoutCurrency = parsed.data.checkoutCurrency ?? cartCurrency;

  if (parsed.data.paymentMethod === "stripe" && checkoutCurrency !== "USD") {
    return badRequest("Stripe checkout requires USD. Switch currency to USD or pay with Razorpay.");
  }

  const orderItems =
    checkoutCurrency !== cartCurrency
      ? convertCartItemsToCurrency(
          cart.items,
          checkoutCurrency,
          await resolveCheckoutUsdInrRate(parsed.data.usdInrRate)
        )
      : cart.items;

  const subtotal = cartSubtotal(orderItems);
  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;
  const currency = checkoutCurrency;

  const orderId = uuidv4();
  const timestamp = now();
  const auth = getAuth(event);

  const order: Order = {
    orderId,
    userId: auth?.userId,
    sessionId: getSessionId(event),
    items: orderItems,
    subtotal,
    shipping,
    tax,
    total,
    currency,
    status: ORDER_STATUS.PENDING_PAYMENT,
    statusHistory: [{ status: ORDER_STATUS.PENDING_PAYMENT, at: timestamp }],
    shippingAddress: parsed.data.shippingAddress,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const { createStripePaymentIntent } = await import("./payments/stripe");
  const { createRazorpayOrder } = await import("./payments/razorpay");

  if (parsed.data.paymentMethod === "stripe") {
    const payment = await createStripePaymentIntent(order);
    order.paymentProvider = "stripe";
    order.paymentIntentId = payment.paymentIntentId;
    await docClient.send(new PutCommand({ TableName: ORDERS_TABLE, Item: buildOrderItem(order, userKey) }));
    await clearCartForUser(userKey);
    return created({ order, clientSecret: payment.clientSecret });
  }

  const payment = await createRazorpayOrder(order);
  order.paymentProvider = "razorpay";
  order.razorpayOrderId = payment.razorpayOrderId;
  await docClient.send(new PutCommand({ TableName: ORDERS_TABLE, Item: buildOrderItem(order, userKey) }));
  await clearCartForUser(userKey);
  return created({ order, razorpayOrderId: payment.razorpayOrderId, razorpayKeyId: payment.keyId });
}

export async function listOrders(event: APIGatewayProxyEventV2) {
  const auth = getAuth(event);
  if (!auth) return unauthorized();

  const result = await docClient.send(
    new QueryCommand({
      TableName: ORDERS_TABLE,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: { ":pk": orderKeys.gsi1pk(auth.userId) },
      ScanIndexForward: false,
    })
  );

  return ok({ orders: result.Items ?? [] });
}

export async function listAdminOrders(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();

  const status = event.queryStringParameters?.status;

  if (status) {
    const result = await docClient.send(
      new QueryCommand({
        TableName: ORDERS_TABLE,
        IndexName: "GSI3",
        KeyConditionExpression: "GSI3PK = :pk",
        ExpressionAttributeValues: { ":pk": orderKeys.gsi3pk(status) },
        ScanIndexForward: false,
      })
    );
    return ok({ orders: result.Items ?? [] });
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: ORDERS_TABLE,
      IndexName: "GSI2",
      KeyConditionExpression: "GSI2PK = :pk",
      ExpressionAttributeValues: { ":pk": orderKeys.gsi2pk() },
      ScanIndexForward: false,
    })
  );

  return ok({ orders: result.Items ?? [] });
}

async function fetchOrder(orderId: string): Promise<StoredOrder | undefined> {
  const result = await docClient.send(
    new GetCommand({
      TableName: ORDERS_TABLE,
      Key: { PK: orderKeys.pk(orderId), SK: orderKeys.sk() },
    })
  );
  return result.Item as StoredOrder | undefined;
}

export async function getOrder(event: APIGatewayProxyEventV2) {
  const orderId = event.pathParameters?.orderId;
  if (!orderId) return badRequest("Order ID required");

  const order = await fetchOrder(orderId);
  if (!order) return notFound("Order not found");

  // ownership check: admin, matching user, or matching session
  const auth = getAuth(event);
  const sessionId = getSessionId(event);
  const isOwner =
    auth?.isAdmin ||
    (auth?.userId && order.userId === auth.userId) ||
    (sessionId && order.sessionId === sessionId);
  if (!isOwner) return forbidden();

  return ok({ order });
}

export async function getAdminOrder(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();

  const orderId = event.pathParameters?.orderId;
  if (!orderId) return badRequest("Order ID required");

  const order = await fetchOrder(orderId);
  if (!order) return notFound("Order not found");
  return ok({ order });
}

export async function updateOrderStatus(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();

  const orderId = event.pathParameters?.orderId;
  if (!orderId) return badRequest("Order ID required");

  const body = JSON.parse(event.body ?? "{}");
  const parsed = orderStatusUpdateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const order = await fetchOrder(orderId);
  if (!order) return notFound("Order not found");

  const nextStatus = parsed.data.status;
  if (nextStatus !== order.status) {
    const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      return badRequest(`Cannot change status from ${order.status} to ${nextStatus}`);
    }
  }

  const timestamp = now();
  const historyEntry: OrderStatusHistoryEntry = {
    status: nextStatus,
    at: timestamp,
    ...(parsed.data.note ? { note: parsed.data.note } : {}),
  };

  const updated: StoredOrder = {
    ...order,
    status: nextStatus,
    statusHistory: [...(order.statusHistory ?? []), historyEntry],
    ...(parsed.data.trackingNumber !== undefined && { trackingNumber: parsed.data.trackingNumber }),
    ...(parsed.data.carrier !== undefined && { carrier: parsed.data.carrier }),
    updatedAt: timestamp,
    GSI3PK: orderKeys.gsi3pk(nextStatus),
    GSI3SK: orderKeys.gsi3sk(order.createdAt),
  };

  await docClient.send(new PutCommand({ TableName: ORDERS_TABLE, Item: updated }));
  return ok({ order: updated });
}

/** Mark an order paid (called by Stripe/Razorpay webhooks + Razorpay verify). */
export async function markOrderPaid(
  orderId: string | undefined,
  payment: { paymentIntentId?: string; razorpayPaymentId?: string }
) {
  if (!orderId) return;
  const order = await fetchOrder(orderId);
  if (!order) return;
  if (order.status === ORDER_STATUS.PAID) return;

  const timestamp = now();
  const updated: StoredOrder = {
    ...order,
    status: ORDER_STATUS.PAID,
    statusHistory: [...(order.statusHistory ?? []), { status: ORDER_STATUS.PAID, at: timestamp }],
    ...(payment.paymentIntentId && { paymentIntentId: payment.paymentIntentId }),
    ...(payment.razorpayPaymentId && { razorpayPaymentId: payment.razorpayPaymentId }),
    updatedAt: timestamp,
    GSI3PK: orderKeys.gsi3pk(ORDER_STATUS.PAID),
    GSI3SK: orderKeys.gsi3sk(order.createdAt),
  };

  await docClient.send(new PutCommand({ TableName: ORDERS_TABLE, Item: updated }));
}

/** Lookup an order by id (used by Razorpay verify for ownership/amount checks). */
export async function getOrderById(orderId: string): Promise<StoredOrder | undefined> {
  return fetchOrder(orderId);
}

export async function listLeads(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();

  const result = await docClient.send(
    new QueryCommand({
      TableName: CUSTOMERS_TABLE,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: { ":pk": customerKeys.gsi1pk() },
      ScanIndexForward: false,
      Limit: 200,
    })
  );

  return ok({ leads: result.Items ?? [] });
}
