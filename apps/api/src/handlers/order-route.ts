import { QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  buildOrderRoutePayload,
  eventKeys,
  orderKeys,
  type Order,
  type RawAnalyticsEvent,
} from "@hr-ecom/shared";
import { requireAdmin } from "../lib/auth";
import { docClient, ORDERS_TABLE, EVENTS_TABLE } from "../lib/db";
import { ok, badRequest, forbidden, notFound } from "../lib/response";

async function loadSessionEvents(sessionId: string): Promise<RawAnalyticsEvent[]> {
  const items: RawAnalyticsEvent[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const res = await docClient.send(
      new QueryCommand({
        TableName: EVENTS_TABLE,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": eventKeys.pk(sessionId) },
        ScanIndexForward: true,
        ExclusiveStartKey,
        Limit: 400,
      })
    );
    for (const item of res.Items ?? []) {
      items.push({
        eventId: item.eventId as string | undefined,
        type: item.type as string | undefined,
        createdAt: item.createdAt as string | undefined,
        at: item.at as string | undefined,
        path: item.path as string | undefined,
        productSlug: item.productSlug as string | undefined,
        referrer: item.referrer as string | undefined,
        metadata: item.metadata as Record<string, string> | undefined,
      });
    }
    ExclusiveStartKey = res.LastEvaluatedKey as Record<string, unknown> | undefined;
    // Cap journey reconstruction to keep admin responses snappy
    if (items.length >= 500) break;
  } while (ExclusiveStartKey);
  return items;
}

/** Admin: full Order Route / attribution journey for one order. */
export async function getAdminOrderRoute(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();

  const orderId = event.pathParameters?.orderId?.trim();
  if (!orderId) return badRequest("orderId required");

  const orderRes = await docClient.send(
    new GetCommand({
      TableName: ORDERS_TABLE,
      Key: { PK: orderKeys.pk(orderId), SK: orderKeys.sk() },
    })
  );
  if (!orderRes.Item) return notFound("Order not found");

  const order = orderRes.Item as Order;
  const sessionId = order.sessionId?.trim();
  const events = sessionId ? await loadSessionEvents(sessionId) : [];

  const payload = buildOrderRoutePayload(order, events);
  return ok(payload);
}
