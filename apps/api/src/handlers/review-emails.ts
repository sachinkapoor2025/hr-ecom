import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  ORDER_STATUS,
  orderKeys,
  isReviewEmailDue,
  isDeliveredStatus,
  reviewRequestStillNeeded,
  isReviewEmailChannelDone,
  isReviewWhatsAppChannelDone,
  displayOrderRef,
  formatOrderStatusLabel,
  renderReviewRequestTemplate,
  omitEmptyGoogleReviewLines,
  type Order,
  type ReviewRequestSettings,
} from "@hr-ecom/shared";
import { docClient, ORDERS_TABLE, now } from "../lib/db";
import { sendReviewRequestEmail } from "../lib/email";
import { notifyCustomerWhatsApp, reviewRequestWhatsAppMessage } from "../lib/whatsapp";
import { loadReviewRequestSettings } from "../lib/review-request-settings";

type StoredOrder = Order & {
  PK: string;
  SK: string;
  GSI3PK?: string;
  GSI3SK?: string;
};

const DELIVERED_STATUSES = [ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETE] as const;

export type ReviewDispatchChannelResult =
  | "sent"
  | "skipped"
  | "already_sent"
  | "disabled"
  | "failed";

export type ReviewDispatchResult = {
  email: ReviewDispatchChannelResult;
  whatsapp: ReviewDispatchChannelResult;
};

function logReviewNotify(input: {
  channel: "email" | "whatsapp";
  orderId: string;
  orderNumber?: string;
  customer?: string;
  ok: boolean;
  skipped?: boolean;
  error?: string;
}) {
  const payload = {
    type: `review-request-${input.channel}`,
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    customer: input.customer,
    at: now(),
    ok: input.ok,
    skipped: Boolean(input.skipped),
    error: input.error,
  };
  if (input.ok || input.skipped) console.info("Review request notify", payload);
  else console.error("Review request notify failed", payload);
}

async function queryOrdersByStatus(status: string): Promise<StoredOrder[]> {
  const items: StoredOrder[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const res = await docClient.send(
      new QueryCommand({
        TableName: ORDERS_TABLE,
        IndexName: "GSI3",
        KeyConditionExpression: "GSI3PK = :pk",
        ExpressionAttributeValues: { ":pk": orderKeys.gsi3pk(status) },
        ExclusiveStartKey: lastKey,
      })
    );
    items.push(...((res.Items ?? []) as StoredOrder[]));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

async function patchOrderFlags(
  orderId: string,
  opts: {
    condition: string;
    set: string[];
    remove?: string[];
    names?: Record<string, string>;
    values: Record<string, unknown>;
  }
): Promise<boolean> {
  const parts = [`SET ${opts.set.join(", ")}`];
  if (opts.remove?.length) parts.push(`REMOVE ${opts.remove.join(", ")}`);
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: ORDERS_TABLE,
        Key: { PK: orderKeys.pk(orderId), SK: orderKeys.sk() },
        UpdateExpression: parts.join(" "),
        ConditionExpression: opts.condition,
        ExpressionAttributeNames: opts.names,
        ExpressionAttributeValues: opts.values,
      })
    );
    return true;
  } catch (err) {
    if ((err as { name?: string }).name === "ConditionalCheckFailedException") return false;
    throw err;
  }
}

async function claimEmailSent(orderId: string, sentAt: string): Promise<boolean> {
  return patchOrderFlags(orderId, {
    condition: "attribute_not_exists(reviewEmailSentAt)",
    set: [
      "reviewEmailSentAt = :sent",
      "reviewEmailDueAt = if_not_exists(reviewEmailDueAt, :sent)",
      "updatedAt = :sent",
    ],
    remove: ["reviewEmailLastError"],
    values: { ":sent": sentAt },
  });
}

async function clearEmailClaim(orderId: string, error: string): Promise<void> {
  const sentAt = now();
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: ORDERS_TABLE,
        Key: { PK: orderKeys.pk(orderId), SK: orderKeys.sk() },
        UpdateExpression: "REMOVE reviewEmailSentAt SET reviewEmailLastError = :err, updatedAt = :now",
        ExpressionAttributeValues: { ":err": error.slice(0, 500), ":now": sentAt },
      })
    );
  } catch (err) {
    console.error("Failed to clear review email claim", orderId, err);
  }
}

async function claimWhatsAppSent(orderId: string, sentAt: string): Promise<boolean> {
  return patchOrderFlags(orderId, {
    condition:
      "attribute_not_exists(reviewWhatsAppSentAt) AND attribute_not_exists(reviewWhatsAppSkippedAt)",
    set: ["reviewWhatsAppSentAt = :sent", "updatedAt = :sent"],
    remove: ["reviewWhatsAppLastError"],
    values: { ":sent": sentAt },
  });
}

async function markWhatsAppSkipped(orderId: string, reason: string): Promise<void> {
  const sentAt = now();
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: ORDERS_TABLE,
        Key: { PK: orderKeys.pk(orderId), SK: orderKeys.sk() },
        UpdateExpression:
          "REMOVE reviewWhatsAppSentAt SET reviewWhatsAppSkippedAt = if_not_exists(reviewWhatsAppSkippedAt, :sent), reviewWhatsAppLastError = :err, updatedAt = :sent",
        ExpressionAttributeValues: { ":sent": sentAt, ":err": reason.slice(0, 500) },
      })
    );
  } catch (err) {
    console.error("Failed to mark review WhatsApp skipped", orderId, err);
  }
}

async function recordWhatsAppError(orderId: string, error: string): Promise<void> {
  const sentAt = now();
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: ORDERS_TABLE,
        Key: { PK: orderKeys.pk(orderId), SK: orderKeys.sk() },
        UpdateExpression:
          "REMOVE reviewWhatsAppSentAt SET reviewWhatsAppLastError = :err, updatedAt = :now",
        ExpressionAttributeValues: { ":err": error.slice(0, 500), ":now": sentAt },
      })
    );
  } catch (err) {
    console.error("Failed to record review WhatsApp error", orderId, err);
  }
}

function validWhatsAppPhone(phone?: string | null): string | null {
  const raw = phone?.trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return raw;
}

function templateVars(order: Order, settings: ReviewRequestSettings) {
  const site = (process.env.SITE_URL ?? "https://www.usarakhi.com").replace(/\/$/, "");
  return {
    name: order.shippingAddress?.name?.split(" ")[0]?.trim() || "there",
    orderNumber: displayOrderRef(order),
    statusLabel: formatOrderStatusLabel(order.status),
    websiteReviewUrl: settings.websiteReviewUrl || `${site}/reviews`,
    googleReviewUrl: settings.googleReviewUrl.trim(),
    siteUrl: site,
  };
}

async function sendEmailChannel(
  order: StoredOrder,
  settings: ReviewRequestSettings
): Promise<ReviewDispatchChannelResult> {
  if (isReviewEmailChannelDone(order)) return "already_sent";
  if (!settings.emailEnabled) return "disabled";

  const customerEmail = order.shippingAddress?.email?.trim();
  if (!customerEmail?.includes("@")) {
    const claimed = await claimEmailSent(order.orderId, now());
    if (claimed) {
      await docClient.send(
        new UpdateCommand({
          TableName: ORDERS_TABLE,
          Key: { PK: orderKeys.pk(order.orderId), SK: orderKeys.sk() },
          UpdateExpression: "SET reviewEmailLastError = :err, updatedAt = :now",
          ExpressionAttributeValues: { ":err": "No customer email", ":now": now() },
        })
      );
    }
    logReviewNotify({
      channel: "email",
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customer: customerEmail,
      ok: false,
      skipped: true,
      error: "No customer email",
    });
    return "skipped";
  }

  const claimed = await claimEmailSent(order.orderId, now());
  if (!claimed) return "already_sent";

  const vars = templateVars(order, settings);
  const result = await sendReviewRequestEmail(order, settings, vars);
  if (result.ok) {
    logReviewNotify({
      channel: "email",
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customer: customerEmail,
      ok: true,
    });
    return "sent";
  }

  logReviewNotify({
    channel: "email",
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    customer: customerEmail,
    ok: false,
    skipped: result.skipped,
    error: result.error,
  });
  await clearEmailClaim(order.orderId, result.error ?? "Email send failed");
  return result.skipped ? "skipped" : "failed";
}

async function sendWhatsAppChannel(
  order: StoredOrder,
  settings: ReviewRequestSettings
): Promise<ReviewDispatchChannelResult> {
  if (isReviewWhatsAppChannelDone(order)) return "already_sent";
  if (!settings.whatsappEnabled) return "disabled";

  const phone = validWhatsAppPhone(order.shippingAddress?.phone);
  if (!phone) {
    await markWhatsAppSkipped(order.orderId, "No valid WhatsApp number");
    logReviewNotify({
      channel: "whatsapp",
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customer: order.shippingAddress?.phone,
      ok: false,
      skipped: true,
      error: "No valid WhatsApp number",
    });
    return "skipped";
  }

  const claimed = await claimWhatsAppSent(order.orderId, now());
  if (!claimed) return "already_sent";

  const vars = templateVars(order, settings);
  const template = omitEmptyGoogleReviewLines(settings.whatsappTemplate, vars.googleReviewUrl);
  const message =
    renderReviewRequestTemplate(template, vars).trim() ||
    reviewRequestWhatsAppMessage({
      name: vars.name,
      orderId: order.orderId,
      orderNumber: vars.orderNumber,
      websiteReviewUrl: vars.websiteReviewUrl,
      googleReviewUrl: vars.googleReviewUrl || undefined,
    });

  const wa = await notifyCustomerWhatsApp({
    phone,
    context: `review-request-${order.orderId}`,
    message,
  });

  if (wa?.ok) {
    logReviewNotify({
      channel: "whatsapp",
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customer: phone,
      ok: true,
    });
    return "sent";
  }

  const error = wa?.error ?? (wa == null ? "WhatsApp not configured or send skipped" : "WhatsApp send failed");
  const skipped = Boolean(wa?.skipped || wa == null);
  if (skipped) {
    await markWhatsAppSkipped(order.orderId, error);
    logReviewNotify({
      channel: "whatsapp",
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customer: phone,
      ok: false,
      skipped: true,
      error,
    });
    return "skipped";
  }

  await recordWhatsAppError(order.orderId, error);
  logReviewNotify({
    channel: "whatsapp",
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    customer: phone,
    ok: false,
    error,
  });
  return "failed";
}

/**
 * Send the one-time review request (email + WhatsApp) for a delivered/complete order.
 * Never throws. Each channel is independently idempotent.
 */
export async function dispatchReviewRequest(order: Order): Promise<ReviewDispatchResult> {
  const stored = order as StoredOrder;
  if (!isDeliveredStatus(stored.status)) {
    return { email: "skipped", whatsapp: "skipped" };
  }

  let settings: ReviewRequestSettings;
  try {
    settings = await loadReviewRequestSettings();
  } catch (err) {
    console.error("Review request settings load failed", err);
    return { email: "failed", whatsapp: "failed" };
  }

  const email = await sendEmailChannel(stored, settings).catch((err) => {
    console.error("Review email dispatch exception", stored.orderId, err);
    return "failed" as const;
  });
  const whatsapp = await sendWhatsAppChannel(stored, settings).catch((err) => {
    console.error("Review WhatsApp dispatch exception", stored.orderId, err);
    return "failed" as const;
  });
  return { email, whatsapp };
}

/** After a status save — never throws, never blocks the order update. */
export async function notifyReviewRequestAfterStatusChange(order: Order): Promise<void> {
  if (!isDeliveredStatus(order.status) || !reviewRequestStillNeeded(order)) return;
  try {
    await dispatchReviewRequest(order);
  } catch (err) {
    console.error("Review request dispatch failed:", order.orderId, err);
  }
}

async function processOrder(order: StoredOrder): Promise<"sent" | "skipped" | "failed"> {
  if (!reviewRequestStillNeeded(order) || !isReviewEmailDue(order)) return "skipped";
  const result = await dispatchReviewRequest(order);
  const failed = result.email === "failed" || result.whatsapp === "failed";
  const sent = result.email === "sent" || result.whatsapp === "sent";
  if (failed && !sent) return "failed";
  if (sent) return "sent";
  return "skipped";
}

/** 15-minute cron: retry unsent review channels for delivered/complete orders. */
export async function processDueReviewEmails(): Promise<{
  scanned: number;
  sent: number;
  skipped: number;
  failed: number;
}> {
  const seen = new Set<string>();
  const orders: StoredOrder[] = [];

  for (const status of DELIVERED_STATUSES) {
    for (const order of await queryOrdersByStatus(status)) {
      if (!seen.has(order.orderId)) {
        seen.add(order.orderId);
        orders.push(order);
      }
    }
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const order of orders) {
    const outcome = await processOrder(order);
    if (outcome === "sent") sent += 1;
    else if (outcome === "failed") failed += 1;
    else skipped += 1;
  }

  console.log("Review request cron", { scanned: orders.length, sent, skipped, failed });
  return { scanned: orders.length, sent, skipped, failed };
}

/** Call when admin/vendor/USPS marks order delivered/complete — sets schedule fields. */
export function applyDeliveryReviewSchedule(
  order: Order,
  nextStatus: string,
  timestamp: string
): Partial<Order> {
  if (nextStatus === order.status || !isDeliveredStatus(nextStatus)) return {};

  const deliveredAt = order.deliveredAt ?? timestamp;
  const patch: Partial<Order> = {};

  if (!order.deliveredAt) patch.deliveredAt = deliveredAt;
  if (!order.reviewEmailSentAt && !order.reviewEmailDueAt) {
    // Immediate: cron can retry failed channels on the next 15-minute tick.
    patch.reviewEmailDueAt = timestamp;
  }
  return patch;
}
