import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import {
  addToCartSchema,
  cartKeys,
  productKeys,
  applyCompetitivePriceReduction,
  DEV_TEST_PRICE_SLUG,
  devStorefrontTestPriceActive,
  withDevTestStorefrontPrice,
  cartAddonSignature,
  cartLineUnitTotal,
  getProductAddon,
  productAllowsAddons,
  resolveProductAddons,
  isFlashComboProduct,
  isFlashComboSaleActive,
  flashComboUnitPriceUsd,
  productUsesFixedStorefrontPrice,
  isForceOutOfStockSlug,
  isFreeStandardShippingProduct,
  isOrangeCountyVendorProduct,
  isUsarakhiStorefrontPaused,
  shippingVendorKey,
  VENDOR_ORANGE_COUNTY,
  type Cart,
  type CartItem,
  type Product,
} from "@hr-ecom/shared";
import { docClient, CARTS_TABLE, PRODUCTS_TABLE, now, ttlInDays } from "../lib/db";
import { healUsarakhiInventoryIfNeeded } from "../lib/usarakhi-inventory-heal";
import { ok, badRequest, unauthorized } from "../lib/response";
import { getUserOrSessionKey, getSessionId } from "../lib/auth";
import { resolveProductImageUrl } from "../lib/images";
import { upsertSessionProfile } from "../lib/customer-profile";
import { ensureOrangeCountyProductInDb } from "../lib/orange-county-catalog";
import { ensureProductInDb } from "../lib/ensure-product";

/** Stale carts auto-expire after this many days (TTL). */
const CART_TTL_DAYS = 30;

function ensureLineIds(items: CartItem[]): CartItem[] {
  return items.map((item) =>
    item.lineId ? item : { ...item, lineId: uuidv4() }
  );
}

type PricedProduct = {
  slug: string;
  price: number;
  currency: "USD" | "INR";
  vendorSlug?: string;
  categorySlug?: string;
};

/** Same unit price add-to-cart stores, so a later price edit replaces a stale cart snapshot. */
function sellingUnitPrice(product: PricedProduct): number {
  const skipCompetitive =
    Boolean(product.vendorSlug) ||
    product.categorySlug === "rakhi-hampers" ||
    productUsesFixedStorefrontPrice(product);
  if (isFlashComboProduct(product.slug)) return flashComboUnitPriceUsd();
  return skipCompetitive
    ? product.price
    : applyCompetitivePriceReduction(product.price, product.currency);
}

/**
 * The dev site shows ₹99 for one hamper without rewriting the shared catalog row.
 * Apply that price only on the cart payload used for display and payment.
 */
function presentCartItems(event: APIGatewayProxyEventV2, items: CartItem[]): CartItem[] {
  const active = devStorefrontTestPriceActive({
    origin: event.headers?.origin || event.headers?.referer,
    envFlag: process.env.DEV_TEST_PRICE,
  });
  if (!active) return items;
  return items.map((item) => withDevTestStorefrontPrice(item));
}

/** Replace a stale line for the reduced hamper with the current catalog selling price. */
async function syncReducedProductPrice(items: CartItem[]): Promise<{ items: CartItem[]; changed: boolean }> {
  if (!items.some((item) => item.productSlug === DEV_TEST_PRICE_SLUG)) {
    return { items, changed: false };
  }

  const result = await docClient.send(
    new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: productKeys.pk(DEV_TEST_PRICE_SLUG), SK: productKeys.sk() },
    })
  );
  const product = result.Item as PricedProduct | undefined;
  if (!product || typeof product.price !== "number" || !product.currency) {
    return { items, changed: false };
  }

  const price = sellingUnitPrice({ ...product, slug: DEV_TEST_PRICE_SLUG });
  let changed = false;
  const next = items.map((item) => {
    if (item.productSlug !== DEV_TEST_PRICE_SLUG) return item;
    if (item.price === price && item.currency === product.currency) return item;
    changed = true;
    return { ...item, price, currency: product.currency };
  });
  return { items: next, changed };
}

/** Backfill missing Orange County vendorSlug so $15 min never mixes OC + UsaRakhi. */
function ensureVendorSlugs(items: CartItem[]): CartItem[] {
  return items.map((item) => {
    const key = shippingVendorKey(item);
    if (key === VENDOR_ORANGE_COUNTY && item.vendorSlug !== VENDOR_ORANGE_COUNTY) {
      return { ...item, vendorSlug: VENDOR_ORANGE_COUNTY };
    }
    return item;
  });
}

async function getCart(userKey: string): Promise<Cart & { createdAt?: string }> {
  const result = await docClient.send(
    new GetCommand({
      TableName: CARTS_TABLE,
      Key: { PK: cartKeys.pk(userKey), SK: cartKeys.sk() },
    })
  );
  const raw = (result.Item as Cart & { createdAt?: string }) ?? { items: [], updatedAt: now() };
  return { ...raw, items: ensureVendorSlugs(ensureLineIds(raw.items ?? [])) };
}

/** Single Put — avoids a second Get on every cart write. */
async function saveCart(
  userKey: string,
  cart: Cart & { createdAt?: string },
  sessionId?: string
) {
  const timestamp = now();
  const createdAt = cart.createdAt ?? timestamp;
  const items = ensureVendorSlugs(ensureLineIds(cart.items ?? []));
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const value = items.reduce((sum, i) => sum + cartLineUnitTotal(i) * i.quantity, 0);

  await docClient.send(
    new PutCommand({
      TableName: CARTS_TABLE,
      Item: {
        PK: cartKeys.pk(userKey),
        SK: cartKeys.sk(),
        items,
        userKey,
        sessionId,
        createdAt,
        itemCount,
        value,
        currency: items[0]?.currency,
        updatedAt: timestamp,
        GSI1PK: cartKeys.gsi1pk(),
        GSI1SK: cartKeys.gsi1sk(timestamp),
        expiresAt: ttlInDays(CART_TTL_DAYS),
      },
    })
  );
  cart.items = items;
  cart.updatedAt = timestamp;
}

export async function getCartHandler(event: APIGatewayProxyEventV2) {
  const userKey = getUserOrSessionKey(event);
  if (!userKey) return unauthorized("Session or auth required");

  const raw = await getCart(userKey);
  const items = (raw.items ?? []).map((item) => ({
    ...item,
    image: item.image ? resolveProductImageUrl(item.image) : item.image,
  }));
  const healed = ensureVendorSlugs(items);
  const synced = await syncReducedProductPrice(healed);
  // Persist backfilled lineIds / vendorSlug and a catalog price drop.
  // The dev ₹99 overlay is applied only on the response so the shared cart row stays at the live price.
  const needsPersist =
    synced.changed ||
    (raw.items ?? []).some((i) => !i.lineId) ||
    healed.some((item, idx) => item.vendorSlug !== (raw.items ?? [])[idx]?.vendorSlug);
  if (needsPersist) {
    await saveCart(userKey, { ...raw, items: synced.items }, getSessionId(event));
  }
  return ok({
    cart: {
      items: presentCartItems(event, synced.items),
      updatedAt: raw.updatedAt ?? now(),
    },
  });
}

export async function addToCart(event: APIGatewayProxyEventV2) {
  const userKey = getUserOrSessionKey(event);
  if (!userKey) return unauthorized("Session or auth required");

  const body = JSON.parse(event.body ?? "{}");
  const parsed = addToCartSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);
  const productSlug = parsed.data.productSlug.trim();
  if (!productSlug) return badRequest("Product slug required");

  const [productResult, cart] = await Promise.all([
    docClient.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { PK: productKeys.pk(productSlug), SK: productKeys.sk() },
      })
    ),
    getCart(userKey),
  ]);

  // Storefront may show catalog fallback before DynamoDB import — upsert on first add.
  let productItem = productResult.Item as Record<string, unknown> | undefined;
  if (!productItem) {
    productItem = (await ensureProductInDb(productSlug)) ?? undefined;
  } else if (
    productItem.vendorSlug === "orange-county" ||
    productItem.categorySlug === "rakhi-hampers"
  ) {
    productItem = (await ensureOrangeCountyProductInDb(productSlug)) ?? productItem;
  }
  if (!productItem) return badRequest("Product not found");

  const healedItem = await healUsarakhiInventoryIfNeeded(productItem as Product);
  const product = healedItem as {
    slug: string;
    name: string;
    price: number;
    currency: "USD" | "INR";
    images?: string[];
    inventory: number;
    vendorSlug?: string;
    vendorCost?: number;
    sku?: string;
    couponExcluded?: boolean;
    tags?: string[];
    categorySlug?: string;
  };

  if (isForceOutOfStockSlug(product.slug) || isUsarakhiStorefrontPaused(product) || product.inventory <= 0) {
    return badRequest("This product is sold out");
  }

  if (product.inventory < parsed.data.quantity) {
    return badRequest("Insufficient inventory");
  }

  if (isFlashComboProduct(product.slug) && !isFlashComboSaleActive()) {
    return badRequest("This 24-hour flash offer has ended");
  }

  const requestedAddons = parsed.data.addons ?? [];
  if (requestedAddons.length && !productAllowsAddons(product)) {
    return badRequest("Add-ons are not available for this product");
  }
  const resolved = resolveProductAddons(requestedAddons);
  if (!resolved.ok) return badRequest(resolved.error);
  const addons = resolved.addons;
  if (addons.some((a) => getProductAddon(a.id)?.productSlug === product.slug)) {
    return badRequest("This rakhi cannot be added as an add-on to itself");
  }
  const signature = cartAddonSignature(addons);

  // Vendor / hamper / flash fixed-price deals — do not stack competitive cuts.
  const unitPrice = sellingUnitPrice(product);
  const couponExcluded =
    Boolean(product.couponExcluded) || isFlashComboProduct(product.slug);

  const existingIdx = cart.items.findIndex(
    (i) => i.productSlug === productSlug && cartAddonSignature(i.addons) === signature
  );

  const vendorSlug =
    product.vendorSlug?.trim() ||
    (isOrangeCountyVendorProduct(product) ? VENDOR_ORANGE_COUNTY : undefined);

  const item: CartItem = {
    lineId: uuidv4(),
    productSlug: product.slug,
    name: product.name,
    price: unitPrice,
    currency: product.currency,
    quantity: parsed.data.quantity,
    image: resolveProductImageUrl(product.images?.[0]),
    ...(vendorSlug ? { vendorSlug } : {}),
    ...(typeof product.vendorCost === "number" && product.vendorCost >= 0
      ? { vendorCost: product.vendorCost }
      : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(couponExcluded ? { couponExcluded: true } : {}),
    ...(isFreeStandardShippingProduct({
      productSlug: product.slug,
      tags: product.tags,
    })
      ? { freeStandardShipping: true }
      : {}),
    ...(addons.length ? { addons } : {}),
  };

  if (existingIdx >= 0) {
    const newQty = cart.items[existingIdx].quantity + parsed.data.quantity;
    if (newQty > product.inventory) return badRequest("Insufficient inventory");
    cart.items[existingIdx].quantity = newQty;
    cart.items[existingIdx].price = item.price;
    if (addons.length) cart.items[existingIdx].addons = addons;
    else delete cart.items[existingIdx].addons;
    if (!cart.items[existingIdx].lineId) cart.items[existingIdx].lineId = uuidv4();
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

  const lineId = event.pathParameters?.lineId ?? event.pathParameters?.productSlug;
  if (!lineId) return badRequest("Cart line id required");

  const cart = await getCart(userKey);
  const before = cart.items.length;
  cart.items = cart.items.filter(
    (i) => i.lineId !== lineId && i.productSlug !== lineId
  );
  if (cart.items.length === before) return badRequest("Item not in cart");
  await saveCart(userKey, cart, getSessionId(event));
  return ok({ cart });
}

export async function updateCartItem(event: APIGatewayProxyEventV2) {
  const userKey = getUserOrSessionKey(event);
  if (!userKey) return unauthorized("Session or auth required");

  const lineId = event.pathParameters?.lineId ?? event.pathParameters?.productSlug;
  if (!lineId) return badRequest("Cart line id required");

  const body = JSON.parse(event.body ?? "{}");
  const quantity = Number(body.quantity);
  if (!quantity || quantity < 1) return badRequest("Valid quantity required");

  const cart = await getCart(userKey);
  const item =
    cart.items.find((i) => i.lineId === lineId) ??
    cart.items.find((i) => i.productSlug === lineId);
  if (!item) return badRequest("Item not in cart");

  const productSlug = item.productSlug;
  let product = (
    await docClient.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { PK: productKeys.pk(productSlug), SK: productKeys.sk() },
      })
    )
  ).Item as { inventory: number; vendorSlug?: string; categorySlug?: string } | undefined;

  if (!product) {
    product =
      ((await ensureProductInDb(productSlug)) as {
        inventory: number;
        vendorSlug?: string;
        categorySlug?: string;
      } | null) ?? undefined;
  } else if (product.vendorSlug === "orange-county" || product.categorySlug === "rakhi-hampers") {
    product =
      ((await ensureOrangeCountyProductInDb(productSlug)) as {
        inventory: number;
        vendorSlug?: string;
        categorySlug?: string;
      } | null) ?? product;
  }
  if (!product) return badRequest("Product not found");
  const healed = await healUsarakhiInventoryIfNeeded({ ...product, slug: productSlug } as Product);
  product = healed;
  if (isForceOutOfStockSlug(productSlug) || isUsarakhiStorefrontPaused(product) || product.inventory <= 0) {
    return badRequest("This product is sold out");
  }
  if (quantity > product.inventory) return badRequest("Insufficient inventory");

  item.quantity = quantity;
  if (!item.lineId) item.lineId = uuidv4();
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
