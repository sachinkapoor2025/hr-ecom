import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import {
  checkoutSchema,
  leadCaptureSchema,
  leadKeys,
  sessionKeys,
  userKeys,
  ORDER_STATUS,
  type Order,
} from "@hr-ecom/shared";
import { docClient, TABLE_NAME, now } from "../lib/db";
import { ok, created, badRequest, unauthorized, forbidden } from "../lib/response";
import { getAuth, getSessionId, getUserOrSessionKey } from "../lib/auth";
import { getCartHandler, clearCartForUser } from "./cart";
import { createStripePaymentIntent } from "./payments/stripe";
import { createRazorpayOrder } from "./payments/razorpay";

export async function captureLead(event: APIGatewayProxyEventV2) {
  const body = JSON.parse(event.body ?? "{}");
  const parsed = leadCaptureSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const leadId = uuidv4();
  const timestamp = now();
  const item = {
    ...parsed.data,
    leadId,
    PK: leadKeys.pk(leadId),
    SK: leadKeys.sk(),
    GSI2PK: "ENTITY#LEAD",
    GSI2SK: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

  if (parsed.data.sessionId) {
    const sessionItem = {
      sessionId: parsed.data.sessionId,
      PK: sessionKeys.pk(parsed.data.sessionId),
      SK: sessionKeys.sk(),
      lastSeenAt: timestamp,
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.email && { email: parsed.data.email }),
      ...(parsed.data.phone && { phone: parsed.data.phone }),
      updatedAt: timestamp,
    };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: sessionItem }));
  }

  return created({ leadId });
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
  if (parsed.data.paymentRegion === "IN" && cartCurrency !== "INR") {
    return badRequest("Razorpay is only available for INR-priced products. Please pay with Stripe (USA).");
  }
  if (parsed.data.paymentRegion === "US" && cartCurrency === "INR") {
    return badRequest("Stripe checkout is not available for INR-priced products.");
  }

  const subtotal = cart.items.reduce(
    (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;
  const currency = parsed.data.paymentRegion === "IN" ? "INR" : "USD";

  const orderId = uuidv4();
  const timestamp = now();
  const auth = getAuth(event);

  const order: Order & {
    PK: string;
    SK: string;
    GSI2PK: string;
    GSI2SK: string;
  } = {
    orderId,
    userId: auth?.userId,
    sessionId: getSessionId(event),
    items: cart.items,
    subtotal,
    shipping,
    tax,
    total,
    currency,
    status: ORDER_STATUS.PENDING_PAYMENT,
    shippingAddress: parsed.data.shippingAddress,
    PK: userKeys.pk(userKey),
    SK: userKeys.orderSk(orderId),
    GSI2PK: "ENTITY#ORDER",
    GSI2SK: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (parsed.data.paymentRegion === "US") {
    const payment = await createStripePaymentIntent(order);
    order.paymentProvider = "stripe";
    order.paymentIntentId = payment.paymentIntentId;
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: order }));
    await clearCartForUser(userKey);
    return created({ order, clientSecret: payment.clientSecret });
  }

  const payment = await createRazorpayOrder(order);
  order.paymentProvider = "razorpay";
  order.razorpayOrderId = payment.razorpayOrderId;
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: order }));
  await clearCartForUser(userKey);
  return created({ order, razorpayOrderId: payment.razorpayOrderId, razorpayKeyId: payment.keyId });
}

export async function listOrders(event: APIGatewayProxyEventV2) {
  const auth = getAuth(event);
  if (!auth) return unauthorized();

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": userKeys.pk(auth.userId),
        ":sk": "ORDER#",
      },
    })
  );

  return ok({ orders: result.Items ?? [] });
}

export async function listAdminOrders(event: APIGatewayProxyEventV2) {
  const auth = getAuth(event);
  if (!auth?.isAdmin) return forbidden();

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI2",
      KeyConditionExpression: "GSI2PK = :pk",
      ExpressionAttributeValues: { ":pk": "ENTITY#ORDER" },
      ScanIndexForward: false,
    })
  );

  return ok({ orders: result.Items ?? [] });
}

export async function getOrder(event: APIGatewayProxyEventV2) {
  const auth = getAuth(event);
  const orderId = event.pathParameters?.orderId;
  if (!orderId) return badRequest("Order ID required");

  const userKey = auth?.userId ?? getUserOrSessionKey(event);
  if (!userKey) return unauthorized();

  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: userKeys.pk(userKey), SK: userKeys.orderSk(orderId) },
    })
  );

  if (!result.Item) return badRequest("Order not found");
  return ok({ order: result.Item });
}

export async function listLeads(event: APIGatewayProxyEventV2) {
  const auth = getAuth(event);
  if (!auth?.isAdmin) return forbidden();

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI2",
      KeyConditionExpression: "GSI2PK = :pk",
      ExpressionAttributeValues: { ":pk": "ENTITY#LEAD" },
      ScanIndexForward: false,
      Limit: 100,
    })
  );

  return ok({ leads: result.Items ?? [] });
}
