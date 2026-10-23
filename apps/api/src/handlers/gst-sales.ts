import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  VENDOR_ORANGE_COUNTY,
  businessDaysBetween,
  buildGstSalesReport,
  currentIndianFinancialYearToDate,
  gstSalesQuerySchema,
  gstSupplierSettingsSchema,
  lineVendorKey,
  orderKeys,
  type GstOrderInput,
  type GstOrderItemInput,
  type Order,
} from "@hr-ecom/shared";
import { requireSuperAdmin } from "../lib/auth";
import { docClient, ORDERS_TABLE } from "../lib/db";
import { getLiveUsdInrRate } from "../lib/exchange-rate";
import { loadGstSupplierSettings, saveGstSupplierSettings } from "../lib/gst-settings";
import { getBundledOrangeCountyProduct } from "../lib/orange-county-catalog";
import { badRequest, forbidden, ok } from "../lib/response";

const LOOKBACK_MS = 90 * 86_400_000;
const MAX_RANGE_DAYS = 400;

type StoredOrder = Order & { GSI2PK?: string; GSI2SK?: string };

function queryParam(event: APIGatewayProxyEventV2, key: string): string | undefined {
  const value = event.queryStringParameters?.[key];
  return value == null || value === "" ? undefined : value;
}

async function fetchOrdersBetween(isoFrom: string, isoTo: string): Promise<StoredOrder[]> {
  const items: StoredOrder[] = [];
  let lastKey: Record<string, unknown> | undefined;
  do {
    const res = await docClient.send(
      new QueryCommand({
        TableName: ORDERS_TABLE,
        IndexName: "GSI2",
        KeyConditionExpression: "GSI2PK = :pk AND GSI2SK BETWEEN :from AND :to",
        ExpressionAttributeValues: {
          ":pk": orderKeys.gsi2pk(),
          ":from": isoFrom,
          ":to": isoTo,
        },
        ExclusiveStartKey: lastKey,
      })
    );
    items.push(...((res.Items ?? []) as StoredOrder[]));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

function mapItem(item: Order["items"][number]): GstOrderItemInput {
  const vendor = lineVendorKey(item);
  let vendorCost = item.vendorCost;
  if (vendor === VENDOR_ORANGE_COUNTY && !(typeof vendorCost === "number" && vendorCost >= 0)) {
    const bundled = getBundledOrangeCountyProduct(item.productSlug);
    if (typeof bundled?.vendorCost === "number" && bundled.vendorCost >= 0) {
      vendorCost = bundled.vendorCost;
    }
  }
  return {
    productSlug: item.productSlug,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    vendorSlug: vendor,
    vendorCost: typeof vendorCost === "number" ? vendorCost : null,
    image: item.image,
    addons: item.addons,
  };
}

function toGstOrder(order: StoredOrder): GstOrderInput {
  return {
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    status: order.status,
    statusHistory: order.statusHistory,
    items: order.items.map(mapItem),
    shippingOption: order.shippingOption,
    shippingServiceName: order.shippingServiceName,
    shippingServiceCode: order.shippingServiceCode,
    shipments: order.shipments?.map((shipment) => ({
      shipmentId: shipment.shipmentId,
      items: shipment.items.map(mapItem),
      shippingServiceName: shipment.shippingServiceName,
      shippingServiceCode: shipment.shippingServiceCode,
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    currency: order.currency,
    paymentProvider: order.paymentProvider,
    paymentIntentId: order.paymentIntentId,
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    shippingAddress: order.shippingAddress,
  };
}

export async function getGstSupplierSettings(event: APIGatewayProxyEventV2) {
  if (!requireSuperAdmin(event)) return forbidden();
  const settings = await loadGstSupplierSettings();
  return ok({ settings });
}

export async function updateGstSupplierSettings(event: APIGatewayProxyEventV2) {
  if (!requireSuperAdmin(event)) return forbidden();
  let body: unknown;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return badRequest("Invalid JSON");
  }
  const parsed = gstSupplierSettingsSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid GST settings");
  const settings = await saveGstSupplierSettings(parsed.data);
  return ok({ settings });
}

export async function getGstSalesInvoices(event: APIGatewayProxyEventV2) {
  if (!requireSuperAdmin(event)) return forbidden();

  const rawQuery: Record<string, string> = {};
  const fromQuery = queryParam(event, "from");
  const toQuery = queryParam(event, "to");
  const providerQuery = queryParam(event, "provider");
  const rateQuery = queryParam(event, "usdInrRate");
  if (fromQuery) rawQuery.from = fromQuery;
  if (toQuery) rawQuery.to = toQuery;
  if (providerQuery) rawQuery.provider = providerQuery;
  if (rateQuery) rawQuery.usdInrRate = rateQuery;

  const parsed = gstSalesQuerySchema.safeParse(rawQuery);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid filters");

  const fy = currentIndianFinancialYearToDate();
  const from = parsed.data.from ?? fy.from;
  const to = parsed.data.to ?? fy.to;
  if (from > to) return badRequest("Start date must be on or before the end date");
  const dayCount = businessDaysBetween(from, to).length;
  if (dayCount < 1 || dayCount > MAX_RANGE_DAYS) {
    return badRequest(`Choose a date range of 1 to ${MAX_RANGE_DAYS} days`);
  }

  const quote = await getLiveUsdInrRate();
  const usdInrRate = parsed.data.usdInrRate ?? quote.rate;
  const usdInrRateSource = parsed.data.usdInrRate != null ? "entered-on-report" : quote.source;

  const fromInstant = new Date(`${from}T00:00:00+05:30`).getTime() - LOOKBACK_MS;
  const toInstant = new Date(`${to}T23:59:59.999+05:30`).toISOString();
  const orders = await fetchOrdersBetween(new Date(fromInstant).toISOString(), toInstant);
  const supplier = await loadGstSupplierSettings();

  const report = buildGstSalesReport({
    orders: orders.map(toGstOrder),
    from,
    to,
    provider: parsed.data.provider,
    usdInrRate,
    usdInrRateSource,
    supplier,
  });

  return ok(report);
}
