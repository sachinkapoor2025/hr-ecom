import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  ORDER_STATUS,
  orderKeys,
  isReviewEmailDue,
  isDeliveredStatus,
  reviewRequestStillNeeded,
  getReviewEmailChannelStatus,
  getReviewWhatsAppChannelStatus,
  displayOrderRef,
  formatOrderStatusLabel,
  renderReviewRequestTemplate,
  omitEmptyGoogleReviewLines,
  type Order,
  type ReviewRequestSettings,
  type ReviewNotificationLogEntry,
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
const SEND_LOCK_STALE_MS = 2 * 60 * 1000;

export type ReviewDispatchChannel = "email" | "whatsapp";
export type ReviewDispatchChannelResult =
  | "sent"
  | "skipped"
  | "already_sent"
  | "disabled"
  | "failed"
  | "not_available";

export type ReviewDispatchResult = {
  email: ReviewDispatchChannelResult;
  whatsapp: ReviewDispatchChannelResult;
};

export type ReviewDispatchOptions = {
  /** When set, only these channels run. Successful sends are never repeated. */
  channels?: ReviewDispatchChannel[];
  /** Admin retry: re-check email/phone instead of treating Not Available as finished. */
  recheckContact?: boolean;
};

function logReviewNotify(input: {
  channel: "email" | "whatsapp";
  orderId: string;
  orderNumber?: string;
  customer?: string;
  ok: boolean;
  skipped?: boolean;
  error?: string;
  messageId?: string;
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
    messageId: input.messageId,
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

function staleLockIso(): string {
  return new Date(Date.now() - SEND_LOCK_STALE_MS).toISOString();
}

async function claimChannelLock(
  orderId: string,
  channel: ReviewDispatchChannel,
  opts?: { requireUnsent?: boolean }
): Promise<boolean> {
  const sendingAttr = channel === "email" ? "reviewEmailSendingAt" : "reviewWhatsAppSendingAt";
  const sentAttr = channel === "email" ? "reviewEmailSentAt" : "reviewWhatsAppSentAt";
  const sentAt = now();
  const requireUnsent = opts?.requireUnsent !== false;
  const condition = requireUnsent
    ? `attribute_not_exists(${sentAttr}) AND (attribute_not_exists(${sendingAttr}) OR ${sendingAttr} < :stale)`
    : `attribute_not_exists(${sendingAttr}) OR ${sendingAttr} < :stale`;
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: ORDERS_TABLE,
        Key: { PK: orderKeys.pk(orderId), SK: orderKeys.sk() },
        UpdateExpression: `SET ${sendingAttr} = :now, updatedAt = :now`,
        ConditionExpression: condition,
        ExpressionAttributeValues: { ":now": sentAt, ":stale": staleLockIso() },
      })
    );
    return true;
  } catch (err) {
    if ((err as { name?: string }).name === "ConditionalCheckFailedException") return false;
    throw err;
  }
}

async function persistReviewOutcome(opts: {
  orderId: string;
  channel: ReviewDispatchChannel;
  outcome: "sent" | "failed" | "not_available";
  at: string;
  customer?: string;
  error?: string;
  provider?: string;
  messageId?: string;
  providerStatus?: string;
}): Promise<void> {
  const log: ReviewNotificationLogEntry = {
    id: `${opts.channel}-${opts.at}-${Math.random().toString(36).slice(2, 8)}`,
    type: "review_request",
    channel: opts.channel,
    orderId: opts.orderId,
    ...(opts.customer ? { customer: opts.customer.slice(0, 200) } : {}),
    status: opts.outcome,
    at: opts.at,
    ...(opts.provider ? { provider: opts.provider.slice(0, 80) } : {}),
    ...(opts.messageId ? { messageId: opts.messageId.slice(0, 200) } : {}),
    ...(opts.providerStatus ? { providerStatus: opts.providerStatus.slice(0, 300) } : {}),
    ...(opts.error ? { error: opts.error.slice(0, 500) } : {}),
  };

  const names: Record<string, string> = { "#log": "reviewNotificationLog" };
  const values: Record<string, unknown> = {
    ":log": [log],
    ":empty": [],
    ":at": opts.at,
  };
  const set: string[] = ["#log = list_append(if_not_exists(#log, :empty), :log)", "updatedAt = :at"];
  const remove: string[] = [];

  const errVal = (opts.error ?? (opts.outcome === "not_available" ? "Not available" : "Send failed")).slice(0, 500);

  if (opts.channel === "email") {
    remove.push("reviewEmailSendingAt");
    if (opts.outcome === "sent") {
      set.push(
        "reviewEmailSentAt = :at",
        "reviewEmailDueAt = if_not_exists(reviewEmailDueAt, :at)",
        "reviewEmailLastAttemptAt = :at"
      );
      remove.push("reviewEmailLastError", "reviewEmailUnavailableAt");
      if (opts.provider) {
        set.push("reviewEmailProvider = :prov");
        values[":prov"] = opts.provider.slice(0, 80);
      }
      if (opts.messageId) {
        set.push("reviewEmailMessageId = :mid");
        values[":mid"] = opts.messageId.slice(0, 200);
      }
      if (opts.providerStatus) {
        set.push("reviewEmailProviderStatus = :pst");
        values[":pst"] = opts.providerStatus.slice(0, 300);
      }
    } else if (opts.outcome === "not_available") {
      set.push("reviewEmailUnavailableAt = :at", "reviewEmailLastAttemptAt = :at", "reviewEmailLastError = :err");
      values[":err"] = errVal;
      remove.push("reviewEmailSentAt");
    } else {
      set.push("reviewEmailLastError = :err", "reviewEmailLastAttemptAt = :at");
      values[":err"] = errVal;
      remove.push("reviewEmailSentAt");
      if (opts.provider) {
        set.push("reviewEmailProvider = :prov");
        values[":prov"] = opts.provider.slice(0, 80);
      }
      if (opts.providerStatus) {
        set.push("reviewEmailProviderStatus = :pst");
        values[":pst"] = opts.providerStatus.slice(0, 300);
      }
    }
  } else {
    remove.push("reviewWhatsAppSendingAt");
    if (opts.outcome === "sent") {
      set.push("reviewWhatsAppSentAt = :at", "reviewWhatsAppLastAttemptAt = :at");
      remove.push("reviewWhatsAppLastError", "reviewWhatsAppSkippedAt");
      if (opts.provider) {
        set.push("reviewWhatsAppProvider = :prov");
        values[":prov"] = opts.provider.slice(0, 80);
      }
      if (opts.messageId) {
        set.push("reviewWhatsAppMessageId = :mid");
        values[":mid"] = opts.messageId.slice(0, 200);
      }
      if (opts.providerStatus) {
        set.push("reviewWhatsAppProviderStatus = :pst");
        values[":pst"] = opts.providerStatus.slice(0, 300);
      }
    } else if (opts.outcome === "not_available") {
      set.push(
        "reviewWhatsAppSkippedAt = if_not_exists(reviewWhatsAppSkippedAt, :at)",
        "reviewWhatsAppLastAttemptAt = :at",
        "reviewWhatsAppLastError = :err"
      );
      values[":err"] = errVal;
      remove.push("reviewWhatsAppSentAt");
    } else {
      set.push("reviewWhatsAppLastError = :err", "reviewWhatsAppLastAttemptAt = :at");
      values[":err"] = errVal;
      remove.push("reviewWhatsAppSentAt");
      if (opts.provider) {
        set.push("reviewWhatsAppProvider = :prov");
        values[":prov"] = opts.provider.slice(0, 80);
      }
      if (opts.providerStatus) {
        set.push("reviewWhatsAppProviderStatus = :pst");
        values[":pst"] = opts.providerStatus.slice(0, 300);
      }
    }
  }

  const parts = [`SET ${set.join(", ")}`];
  if (remove.length) parts.push(`REMOVE ${remove.join(", ")}`);

  try {
    await docClient.send(
      new UpdateCommand({
        TableName: ORDERS_TABLE,
        Key: { PK: orderKeys.pk(opts.orderId), SK: orderKeys.sk() },
        UpdateExpression: parts.join(" "),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
      })
    );
  } catch (err) {
    console.error("Failed to persist review notification outcome", opts.orderId, opts.channel, err);
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

function channelEnabled(opts: ReviewDispatchOptions | undefined, channel: ReviewDispatchChannel): boolean {
  if (!opts?.channels?.length) return true;
  return opts.channels.includes(channel);
}

async function sendEmailChannel(
  order: StoredOrder,
  settings: ReviewRequestSettings,
  opts?: ReviewDispatchOptions
): Promise<ReviewDispatchChannelResult> {
  const emailStatus = getReviewEmailChannelStatus(order);
  if (emailStatus.status === "sent") return "already_sent";
  if (!opts?.recheckContact && emailStatus.status === "not_available") {
    return "not_available";
  }
  if (!settings.emailEnabled) return "disabled";

  const customerEmail = order.shippingAddress?.email?.trim();
  if (!customerEmail?.includes("@")) {
    await persistReviewOutcome({
      orderId: order.orderId,
      channel: "email",
      outcome: "not_available",
      at: now(),
      customer: customerEmail,
      error: "Invalid/Missing email",
    });
    logReviewNotify({
      channel: "email",
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customer: customerEmail,
      ok: false,
      skipped: true,
      error: "Invalid/Missing email",
    });
    return "not_available";
  }

  const claimed = await claimChannelLock(order.orderId, "email", {
    requireUnsent: emailStatus.status !== "not_available",
  });
  if (!claimed) return "already_sent";

  const vars = templateVars(order, settings);
  const result = await sendReviewRequestEmail(order, settings, vars);
  const sentAt = now();

  if (result.ok && !result.skipped) {
    await persistReviewOutcome({
      orderId: order.orderId,
      channel: "email",
      outcome: "sent",
      at: sentAt,
      customer: customerEmail,
      provider: result.provider ?? "smtp",
      messageId: result.messageId,
      providerStatus: result.providerStatus,
    });
    logReviewNotify({
      channel: "email",
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customer: customerEmail,
      ok: true,
      messageId: result.messageId,
    });
    return "sent";
  }

  const error = result.error ?? (result.skipped ? "Email send skipped" : "Email send failed");
  await persistReviewOutcome({
    orderId: order.orderId,
    channel: "email",
    outcome: "failed",
    at: sentAt,
    customer: customerEmail,
    error,
    provider: result.provider ?? "smtp",
    messageId: result.messageId,
    providerStatus: result.providerStatus,
  });
  logReviewNotify({
    channel: "email",
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    customer: customerEmail,
    ok: false,
    skipped: result.skipped,
    error,
  });
  return "failed";
}

async function sendWhatsAppChannel(
  order: StoredOrder,
  settings: ReviewRequestSettings,
  opts?: ReviewDispatchOptions
): Promise<ReviewDispatchChannelResult> {
  const waStatus = getReviewWhatsAppChannelStatus(order);
  if (waStatus.status === "sent") return "already_sent";
  if (!opts?.recheckContact && waStatus.status === "not_available") {
    return "not_available";
  }
  if (!settings.whatsappEnabled) return "disabled";

  const phone = validWhatsAppPhone(order.shippingAddress?.phone);
  if (!phone) {
    await persistReviewOutcome({
      orderId: order.orderId,
      channel: "whatsapp",
      outcome: "not_available",
      at: now(),
      customer: order.shippingAddress?.phone,
      error: "No valid WhatsApp number",
    });
    logReviewNotify({
      channel: "whatsapp",
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customer: order.shippingAddress?.phone,
      ok: false,
      skipped: true,
      error: "No valid WhatsApp number",
    });
    return "not_available";
  }

  const claimed = await claimChannelLock(order.orderId, "whatsapp", {
    requireUnsent: waStatus.status !== "not_available",
  });
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
  const sentAt = now();

  if (wa?.ok && !wa.skipped) {
    await persistReviewOutcome({
      orderId: order.orderId,
      channel: "whatsapp",
      outcome: "sent",
      at: sentAt,
      customer: phone,
      provider: wa.provider,
      messageId: wa.messageId,
      providerStatus: wa.providerStatus,
    });
    logReviewNotify({
      channel: "whatsapp",
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customer: phone,
      ok: true,
      messageId: wa.messageId,
    });
    return "sent";
  }

  const error =
    wa?.error ??
    (wa == null ? "WhatsApp not configured or send skipped" : "WhatsApp send failed");
  await persistReviewOutcome({
    orderId: order.orderId,
    channel: "whatsapp",
    outcome: "failed",
    at: sentAt,
    customer: phone,
    error,
    provider: wa?.provider,
    messageId: wa?.messageId,
    providerStatus: wa?.providerStatus,
  });
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
 * Never throws. Each channel is independently idempotent. Sent is recorded only after
 * the SMTP / WhatsApp provider returns success.
 */
export async function dispatchReviewRequest(
  order: Order,
  opts?: ReviewDispatchOptions
): Promise<ReviewDispatchResult> {
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

  const email = channelEnabled(opts, "email")
    ? await sendEmailChannel(stored, settings, opts).catch((err) => {
        console.error("Review email dispatch exception", stored.orderId, err);
        return "failed" as const;
      })
    : "skipped";
  const whatsapp = channelEnabled(opts, "whatsapp")
    ? await sendWhatsAppChannel(stored, settings, opts).catch((err) => {
        console.error("Review WhatsApp dispatch exception", stored.orderId, err);
        return "failed" as const;
      })
    : "skipped";
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

/** 15-minute cron: retry unsent/failed review channels for delivered/complete orders. */
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
