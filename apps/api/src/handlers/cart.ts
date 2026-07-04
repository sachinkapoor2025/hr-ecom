import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { addToCartSchema, cartKeys, productKeys, type Cart, type CartItem } from "@hr-ecom/shared";
import { docClient, CARTS_TABLE, PRODUCTS_TABLE, now, ttlInDays } from "../lib/db";
import { ok, badRequest, unauthorized } from "../lib/response";
import { getUserOrSessionKey, getSessionId } from "../lib/auth";
import { resolveProductImageUrl } from "../lib/images";
import { upsertSessionProfile } from "../lib/customer-profile";

/** Stale carts auto-expire after this many days (TTL). */
const CART_TTL_DAYS = 30;

async function getCart(userKey: string): Promise<Cart & { createdAt?: string }> {
  const result = await docClient.send(
    new GetCommand({
      TableName: CARTS_TABLE,
      Key: { PK: cartKeys.pk(userKey), SK: cartKeys.sk() },
    })
  );
  return (result.Item as Cart & { createdAt?: string }) ?? { items: [], updatedAt: now() };
}

async function saveCart(userKey: string, cart: Cart, sessionId?: string) {
  const timestamp = now();
  const existing = await docClient.send(
    new GetCommand({
      TableName: CARTS_TABLE,
      Key: { PK: cartKeys.pk(userKey), SK: cartKeys.sk() },
    })
  );
  const createdAt = (existing.Item?.createdAt as string | undefined) ?? timestamp;
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const value = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  await docClient.send(
    new PutCommand({
      TableName: CARTS_TABLE,
      Item: {
        PK: cartKeys.pk(userKey),
        SK: cartKeys.sk(),
        ...cart,
        userKey,
        sessionId,
        createdAt,
        itemCount,
        value,
        currency: cart.items[0]?.currency,
        updatedAt: timestamp,
        GSI1PK: cartKeys.gsi1pk(),
        GSI1SK: cartKeys.gsi1sk(timestamp),
        expiresAt: ttlInDays(CART_TTL_DAYS),
      },
    })
  );
}

export async function getCartHandler(event: APIGatewayProxyEventV2) {
  const userKey = getUserOrSessionKey(event);
  if (!userKey) return unauthorized("Session or auth required");

  const raw = await getCart(userKey);
  const items = (raw.items ?? []).map((item) => ({
    ...item,
    image: item.image ? resolveProductImageUrl(item.image) : item.image,
  }));
  return ok({ cart: { items, updatedAt: raw.updatedAt ?? now() } });
}

export async function addToCart(event: APIGatewayProxyEventV2) {
  const userKey = getUserOrSessionKey(event);
  if (!userKey) return unauthorized("Session or auth required");

  const body = JSON.parse(event.body ?? "{}");
  const parsed = addToCartSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const productResult = await docClient.send(
    new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: productKeys.pk(parsed.data.productSlug), SK: productKeys.sk() },
    })
  );
  if (!productResult.Item) return badRequest("Product not found");

  const product = productResult.Item as {
    slug: string;
    name: string;
    price: number;
    currency: "USD" | "INR";
    images?: string[];
    inventory: number;
  };

  if (product.inventory < parsed.data.quantity) {
    return badRequest("Insufficient inventory");
  }

  const cart = await getCart(userKey);
  const existingIdx = cart.items.findIndex((i) => i.productSlug === parsed.data.productSlug);

  const item: CartItem = {
    productSlug: product.slug,
    name: product.name,
    price: product.price,
    currency: product.currency,
    quantity: parsed.data.quantity,
    image: resolveProductImageUrl(product.images?.[0]),
  };

  if (existingIdx >= 0) {
    const newQty = cart.items[existingIdx].quantity + parsed.data.quantity;
    if (newQty > product.inventory) return badRequest("Insufficient inventory");
    cart.items[existingIdx].quantity = newQty;
  } else {
    cart.items.push(item);
  }

  await saveCart(userKey, cart, getSessionId(event));

  const sessionId = getSessionId(event);
  if (sessionId && (parsed.data.name || parsed.data.email || parsed.data.phone)) {
    await upsertSessionProfile(sessionId, {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
    });
  }

  return ok({ cart });
}

export async function removeFromCart(event: APIGatewayProxyEventV2) {
  const userKey = getUserOrSessionKey(event);
  if (!userKey) return unauthorized("Session or auth required");

  const productSlug = event.pathParameters?.productSlug;
  if (!productSlug) return badRequest("Product slug required");

  const cart = await getCart(userKey);
  cart.items = cart.items.filter((i) => i.productSlug !== productSlug);
  await saveCart(userKey, cart, getSessionId(event));
  return ok({ cart });
}

export async function updateCartItem(event: APIGatewayProxyEventV2) {
  const userKey = getUserOrSessionKey(event);
  if (!userKey) return unauthorized("Session or auth required");

  const productSlug = event.pathParameters?.productSlug;
  if (!productSlug) return badRequest("Product slug required");

  const body = JSON.parse(event.body ?? "{}");
  const quantity = Number(body.quantity);
  if (!quantity || quantity < 1) return badRequest("Valid quantity required");

  const cart = await getCart(userKey);
  const item = cart.items.find((i) => i.productSlug === productSlug);
  if (!item) return badRequest("Item not in cart");

  const productResult = await docClient.send(
    new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: productKeys.pk(productSlug), SK: productKeys.sk() },
    })
  );
  const product = productResult.Item as { inventory: number } | undefined;
  if (!product) return badRequest("Product not found");
  if (quantity > product.inventory) return badRequest("Insufficient inventory");

  item.quantity = quantity;
  await saveCart(userKey, cart, getSessionId(event));
  return ok({ cart });
}

export async function clearCartForUser(userKey: string) {
  await saveCart(userKey, { items: [], updatedAt: now() });
}

export async function clearCart(event: APIGatewayProxyEventV2) {
  const userKey = getUserOrSessionKey(event);
  if (!userKey) return unauthorized("Session or auth required");

  await clearCartForUser(userKey);
  return ok({ cart: { items: [] } });
}
