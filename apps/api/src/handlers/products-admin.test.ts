process.env.USE_MEMORY_DB = "true";
process.env.ENVIRONMENT = "local";
process.env.DEV_AUTH_ENABLED = "true";

import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { productKeys } from "@hr-ecom/shared";

type ProductsMod = typeof import("./products");
type CartMod = typeof import("./cart");
let products: ProductsMod;
let cart: CartMod;
let docClient: typeof import("../lib/db").docClient;
let PRODUCTS_TABLE: string;

const SLUG = "bhai-dooj-kaju-katli-and-kumkum-gift-box";

before(async () => {
  products = await import("./products");
  cart = await import("./cart");
  const db = await import("../lib/db");
  docClient = db.docClient;
  PRODUCTS_TABLE = db.PRODUCTS_TABLE;
  await docClient.send(
    new PutCommand({
      TableName: PRODUCTS_TABLE,
      Item: {
        PK: productKeys.pk(SLUG),
        SK: productKeys.sk(),
        slug: SLUG,
        name: "Stored festival hamper",
        description: "Existing row",
        price: 38.25,
        currency: "USD",
        categorySlug: "bhai-dooj",
        images: ["https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2601/TFUSBD2601_1.jpg"],
        sku: "TFUSBD2601",
        inventory: 500,
        vendorSlug: "orange-county",
        published: true,
        updatedAt: "2026-10-13T00:00:00.000Z",
        createdAt: "2026-10-10T00:00:00.000Z",
      },
    })
  );
  await docClient.send(
    new PutCommand({
      TableName: PRODUCTS_TABLE,
      Item: {
        PK: productKeys.pk(SLUG),
        SK: "REVIEW#example",
        body: "Not a product",
      },
    })
  );
});

function event(opts: {
  method?: string;
  body?: unknown;
  admin?: boolean;
  sessionId?: string;
}): APIGatewayProxyEventV2 {
  const headers: Record<string, string> = {};
  if (opts.admin) headers.authorization = "Bearer dev:owner@usarakhi.com:admin";
  if (opts.sessionId) headers["x-session-id"] = opts.sessionId;
  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: "/admin/products",
    rawQueryString: "",
    headers,
    requestContext: {
      accountId: "local",
      apiId: "local",
      domainName: "localhost",
      domainPrefix: "local",
      http: {
        method: opts.method ?? "GET",
        path: "/admin/products",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "test",
      },
      requestId: "test",
      routeKey: "$default",
      stage: "$default",
      time: "",
      timeEpoch: Date.now(),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    isBase64Encoded: false,
  };
}

function bodyOf(result: APIGatewayProxyResultV2): Record<string, unknown> {
  const raw = typeof result === "string" ? result : result.body;
  return JSON.parse(raw ?? "{}") as Record<string, unknown>;
}

describe("admin products and cart lookup", () => {
  it("lists stored products and ignores review rows", async () => {
    const result = await products.listAdminProducts(event({ admin: true }));
    assert.equal(typeof result === "string" ? 200 : result.statusCode, 200);
    const payload = bodyOf(result);
    const listed = payload.products as Array<Record<string, unknown>>;
    const match = listed.find((product) => product.slug === SLUG);
    assert.ok(match);
    assert.equal(match?.name, "Stored festival hamper");
    assert.equal(match?.sku, "TFUSBD2601");
    assert.equal(match?.price, 38.25);
    assert.equal(match?.categorySlug, "bhai-dooj");
    assert.equal(match?.inventory, 500);
    assert.equal((match?.images as string[])[0]?.includes("TFUSBD2601"), true);
    assert.equal(
      listed.some((product) => product.SK === "REVIEW#example"),
      false
    );
  });

  it("adds an existing product without replacing its stored price or name", async () => {
    const result = await cart.addToCart(
      event({
        method: "POST",
        sessionId: "admin-cart-test-session",
        body: { productSlug: SLUG, quantity: 2 },
      })
    );
    assert.equal(typeof result === "string" ? 200 : result.statusCode, 200);
    const payload = bodyOf(result);
    const items = ((payload.cart as { items: Array<Record<string, unknown>> }).items);
    const line = items.find((item) => item.productSlug === SLUG);
    assert.equal(line?.name, "Stored festival hamper");
    assert.equal(line?.price, 38.25);
    assert.equal(line?.quantity, 2);
    assert.equal(line?.sku, "TFUSBD2601");

    const stored = await docClient.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { PK: productKeys.pk(SLUG), SK: productKeys.sk() },
      })
    );
    assert.equal(stored.Item?.name, "Stored festival hamper");
    assert.equal(stored.Item?.price, 38.25);

    const lineId = String(line?.lineId);
    const updatedWithPath = await cart.updateCartItem({
      ...event({
        method: "PUT",
        sessionId: "admin-cart-test-session",
        body: { quantity: 3 },
      }),
      pathParameters: { lineId },
    });
    assert.equal(typeof updatedWithPath === "string" ? 200 : updatedWithPath.statusCode, 200);
    const updatedItems = (
      bodyOf(updatedWithPath).cart as { items: Array<Record<string, unknown>> }
    ).items;
    assert.equal(updatedItems.find((item) => item.lineId === lineId)?.quantity, 3);

    const removed = await cart.removeFromCart({
      ...event({
        method: "DELETE",
        sessionId: "admin-cart-test-session",
      }),
      pathParameters: { lineId },
    });
    assert.equal(typeof removed === "string" ? 200 : removed.statusCode, 200);
    const remaining = (bodyOf(removed).cart as { items: unknown[] }).items;
    assert.equal(remaining.length, 0);
  });

  it("adds a festival catalog slug that is not stored yet, without touching other products", async () => {
    const missingSlug = "bhai-dooj-pistachio-gift-box";
    const { getBundledFestivalProduct } = await import("../lib/festival-catalog");
    const bundled = getBundledFestivalProduct(missingSlug);
    assert.ok(bundled);

    const result = await cart.addToCart(
      event({
        method: "POST",
        sessionId: "festival-create-session",
        body: { productSlug: missingSlug, quantity: 1 },
      })
    );
    assert.equal(typeof result === "string" ? 200 : result.statusCode, 200);
    const line = (
      bodyOf(result).cart as { items: Array<Record<string, unknown>> }
    ).items.find((item) => item.productSlug === missingSlug);
    assert.equal(line?.name, bundled?.name);
    assert.equal(line?.price, bundled?.price);
    assert.equal(line?.sku, bundled?.sku);

    const original = await docClient.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { PK: productKeys.pk(SLUG), SK: productKeys.sk() },
      })
    );
    assert.equal(original.Item?.name, "Stored festival hamper");
    assert.equal(original.Item?.price, 38.25);
  });

  it("rejects a slug that is not stored and not in a bundled catalog", async () => {
    const result = await cart.addToCart(
      event({
        method: "POST",
        sessionId: "admin-cart-test-session",
        body: { productSlug: "missing-product-slug", quantity: 1 },
      })
    );
    assert.equal(typeof result === "string" ? 400 : result.statusCode, 400);
    assert.equal(bodyOf(result).error, "Product not found");
  });
});
