/**
 * Orange County vendor order feed.
 *
 * GET /vendors/orange-county/orders
 * Header: X-Vendor-Api-Key: <ORANGE_COUNTY_VENDOR_API_KEY>
 *
 * Returns paid+ fulfillment orders that include at least one orange-county line item.
 * Line items are filtered to that vendor only (UsaRakhi-only SKUs are omitted).
 */
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { VENDOR_ORANGE_COUNTY, orderKeys, type Order, type CartItem } from "@hr-ecom/shared";
import { docClient, ORDERS_TABLE } from "../lib/db";
import { ok, unauthorized, badRequest, forbidden } from "../lib/response";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function vendorApiKeyOk(event: APIGatewayProxyEventV2, vendorSlug: string): boolean {
  const key =
    event.headers?.["x-vendor-api-key"] ??
    event.headers?.["X-Vendor-Api-Key"] ??
    "";
  if (!key) return false;
  if (vendorSlug === VENDOR_ORANGE_COUNTY) {
    const expected = process.env.ORANGE_COUNTY_VENDOR_API_KEY?.trim();
    return Boolean(expected && key === expected);
  }
  return false;
}

function vendorLineItems(order: Order, vendorSlug: string): CartItem[] {
  return (order.items ?? []).filter((i) => i.vendorSlug === vendorSlug);
}

function orderTouchesVendor(order: Order, vendorSlug: string): boolean {
  if (order.vendorSlugs?.includes(vendorSlug)) return true;
  return (order.items ?? []).some((i) => i.vendorSlug === vendorSlug);
}

/** Public vendor catalog of orders for Orange County fulfillment. */
export async function listOrangeCountyOrders(event: APIGatewayProxyEventV2) {
  return listVendorOrders(event, VENDOR_ORANGE_COUNTY);
}

async function listVendorOrders(event: APIGatewayProxyEventV2, vendorSlug: string) {
  if (!vendorApiKeyOk(event, vendorSlug)) {
    return unauthorized("Valid X-Vendor-Api-Key required");
  }

  const qs = event.queryStringParameters ?? {};
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(qs.limit ?? DEFAULT_LIMIT) || DEFAULT_LIMIT));
  const statusFilter = qs.status?.trim(); // optional exact status
  const since = qs.since?.trim(); // ISO date lower bound on createdAt

  // Pull recent orders from admin date feed, then filter to this vendor.
  const collected: Order[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  let scanned = 0;
  const maxScan = 500;

  while (collected.length < limit && scanned < maxScan) {
    const pageSize = Math.min(50, maxScan - scanned);
    const result = await docClient.send(
      new QueryCommand({
        TableName: ORDERS_TABLE,
        IndexName: "GSI2",
        KeyConditionExpression: "GSI2PK = :pk",
        ExpressionAttributeValues: { ":pk": orderKeys.gsi2pk() },
        ScanIndexForward: false,
        Limit: pageSize,
        ExclusiveStartKey,
      })
    );

    const page = (result.Items ?? []) as Order[];
    scanned += page.length;
    ExclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;

    for (const order of page) {
      if (!orderTouchesVendor(order, vendorSlug)) continue;
      if (since && order.createdAt < since) continue;
      if (statusFilter && order.status !== statusFilter) continue;
      // Skip unpaid / cancelled by default unless status explicitly requested
      if (
        !statusFilter &&
        (order.status === "pending_payment" ||
          order.status === "cancelled" ||
          order.status === "refunded")
      ) {
        continue;
      }

      const items = vendorLineItems(order, vendorSlug);
      if (!items.length) continue;

      collected.push({
        ...order,
        items,
        vendorSlugs: [vendorSlug],
      });
      if (collected.length >= limit) break;
    }

    if (!ExclusiveStartKey) break;
  }

  return ok({
    vendorSlug,
    count: collected.length,
    orders: collected.map((o) => ({
      orderId: o.orderId,
      status: o.status,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      currency: o.currency,
      shippingAddress: o.shippingAddress,
      trackingNumber: o.trackingNumber,
      carrier: o.carrier,
      shippingServiceName: o.shippingServiceName,
      items: o.items.map((i) => ({
        productSlug: i.productSlug,
        sku: i.sku,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        currency: i.currency,
      })),
      // Vendor-facing subtotal for their lines only
      vendorSubtotal: o.items.reduce((s, i) => s + i.price * i.quantity, 0),
    })),
  });
}

export async function getOrangeCountyOrder(event: APIGatewayProxyEventV2) {
  if (!vendorApiKeyOk(event, VENDOR_ORANGE_COUNTY)) {
    return unauthorized("Valid X-Vendor-Api-Key required");
  }
  const orderId = event.pathParameters?.orderId;
  if (!orderId) return badRequest("orderId required");

  const { GetCommand } = await import("@aws-sdk/lib-dynamodb");
  const result = await docClient.send(
    new GetCommand({
      TableName: ORDERS_TABLE,
      Key: { PK: orderKeys.pk(orderId), SK: orderKeys.sk() },
    })
  );
  const order = result.Item as Order | undefined;
  if (!order || !orderTouchesVendor(order, VENDOR_ORANGE_COUNTY)) {
    return forbidden("Order not found for this vendor");
  }

  const items = vendorLineItems(order, VENDOR_ORANGE_COUNTY);
  return ok({
    order: {
      orderId: order.orderId,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      currency: order.currency,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      items,
      vendorSubtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
    },
  });
}
