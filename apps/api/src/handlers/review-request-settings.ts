import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  isDeliveredStatus,
  reviewRequestSettingsSchema,
  reviewRequestStillNeeded,
} from "@hr-ecom/shared";
import { ok, badRequest, forbidden, notFound } from "../lib/response";
import { requireAdmin } from "../lib/auth";
import {
  loadReviewRequestSettings,
  saveReviewRequestSettings,
} from "../lib/review-request-settings";
import { dispatchReviewRequest } from "./review-emails";
import { resolveOrderByIdOrNumber } from "../lib/order-numbers";

export async function getReviewRequestSettings(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();
  const settings = await loadReviewRequestSettings();
  return ok({ settings });
}

export async function updateReviewRequestSettings(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();
  const body = JSON.parse(event.body ?? "{}");
  const parsed = reviewRequestSettingsSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);
  const settings = await saveReviewRequestSettings(parsed.data);
  return ok({ settings });
}

/** Admin retry for failed/unsent review channels — never resends a successful channel. */
export async function retryOrderReviewRequest(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();
  const orderId = event.pathParameters?.orderId;
  if (!orderId) return badRequest("Order ID required");

  const order = await resolveOrderByIdOrNumber(orderId);

  if (!order) return notFound("Order not found");
  if (!isDeliveredStatus(order.status)) {
    return badRequest("Review request can only be sent for Delivered or Complete orders.");
  }
  if (!reviewRequestStillNeeded(order)) {
    return ok({
      alreadySent: true,
      result: { email: "already_sent", whatsapp: "already_sent" },
    });
  }

  const result = await dispatchReviewRequest(order);
  return ok({ alreadySent: false, result });
}
