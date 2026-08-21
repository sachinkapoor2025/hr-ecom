import { ORDER_STATUS } from "../constants";
import type { Order } from "../schemas/order";

/**
 * Fallback delay for older orders that only have `deliveredAt` (no due stamp).
 * New Delivered/Complete transitions set `reviewEmailDueAt` to "now" so the
 * request can send immediately and the cron can retry failed channels.
 */
export const REVIEW_EMAIL_DELAY_DAYS = 1;

export const REVIEW_EMAIL_DELAY_MS = REVIEW_EMAIL_DELAY_DAYS * 24 * 60 * 60 * 1000;

export function isDeliveredStatus(status: string): boolean {
  return status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.COMPLETE;
}

export function reviewEmailDueAtFrom(deliveredAtIso: string): string {
  return new Date(new Date(deliveredAtIso).getTime() + REVIEW_EMAIL_DELAY_MS).toISOString();
}

export type ReviewChannelUiStatus = "sent" | "failed" | "not_sent" | "not_available";
export type ReviewRequestOverallStatus = "sent" | "partially_sent" | "failed" | "not_sent";

export const REVIEW_EMAIL_UNAVAILABLE_LABEL = "Not Available – Invalid/Missing email";
export const REVIEW_WHATSAPP_UNAVAILABLE_LABEL = "Not Available – No valid WhatsApp number";

export const REVIEW_REQUEST_OVERALL_LABEL: Record<ReviewRequestOverallStatus, string> = {
  sent: "Review Request: Sent",
  partially_sent: "Review Request: Partially Sent",
  failed: "Review Request: Failed",
  not_sent: "Not Sent",
};

export type ReviewChannelStatusView = {
  status: ReviewChannelUiStatus;
  label: string;
  at?: string;
  error?: string;
  provider?: string;
  messageId?: string;
  providerStatus?: string;
};

type ReviewOrderFields = Pick<
  Order,
  | "status"
  | "deliveredAt"
  | "reviewEmailDueAt"
  | "reviewEmailSentAt"
  | "reviewEmailLastError"
  | "reviewEmailUnavailableAt"
  | "reviewEmailLastAttemptAt"
  | "reviewEmailProvider"
  | "reviewEmailMessageId"
  | "reviewEmailProviderStatus"
  | "reviewWhatsAppSentAt"
  | "reviewWhatsAppSkippedAt"
  | "reviewWhatsAppLastError"
  | "reviewWhatsAppLastAttemptAt"
  | "reviewWhatsAppProvider"
  | "reviewWhatsAppMessageId"
  | "reviewWhatsAppProviderStatus"
  | "statusHistory"
>;

export function isReviewEmailChannelDone(
  order: Pick<Order, "reviewEmailSentAt" | "reviewEmailUnavailableAt">
): boolean {
  return Boolean(order.reviewEmailSentAt || order.reviewEmailUnavailableAt);
}

export function isReviewWhatsAppChannelDone(
  order: Pick<Order, "reviewWhatsAppSentAt" | "reviewWhatsAppSkippedAt">
): boolean {
  return Boolean(order.reviewWhatsAppSentAt || order.reviewWhatsAppSkippedAt);
}

/** True when either channel still needs a first successful/unavailable attempt. */
export function reviewRequestStillNeeded(order: ReviewOrderFields): boolean {
  if (!isDeliveredStatus(order.status)) return false;
  return !isReviewEmailChannelDone(order) || !isReviewWhatsAppChannelDone(order);
}

/** Resolve when a review email should send (for backfill on older orders). */
export function resolveReviewEmailDueAt(order: ReviewOrderFields): string | null {
  if (isReviewEmailChannelDone(order) && isReviewWhatsAppChannelDone(order)) return null;
  if (order.reviewEmailDueAt) return order.reviewEmailDueAt;
  if (order.deliveredAt) return reviewEmailDueAtFrom(order.deliveredAt);
  if (!isDeliveredStatus(order.status)) return null;

  const deliveredEntry = order.statusHistory
    ?.slice()
    .reverse()
    .find((h) => h.status === ORDER_STATUS.DELIVERED || h.status === ORDER_STATUS.COMPLETE);

  if (deliveredEntry?.at) return reviewEmailDueAtFrom(deliveredEntry.at);
  return null;
}

export function isReviewEmailDue(order: ReviewOrderFields, now = new Date()): boolean {
  const dueAt = resolveReviewEmailDueAt(order);
  if (!dueAt || !isDeliveredStatus(order.status)) return false;
  if (!reviewRequestStillNeeded(order)) return false;
  return new Date(dueAt).getTime() <= now.getTime();
}

function looksLikeMissingEmailError(error?: string): boolean {
  return /invalid\/missing email|no customer email/i.test(error ?? "");
}

function looksLikeMissingPhoneError(error?: string): boolean {
  return /no valid whatsapp number|no valid phone/i.test(error ?? "");
}

export function getReviewEmailChannelStatus(order: ReviewOrderFields): ReviewChannelStatusView {
  const missingEmail =
    Boolean(order.reviewEmailUnavailableAt) || looksLikeMissingEmailError(order.reviewEmailLastError);

  // Legacy rows claimed sentAt before SMTP success when the address was missing.
  if (order.reviewEmailSentAt && !missingEmail) {
    return {
      status: "sent",
      label: "Sent",
      at: order.reviewEmailSentAt,
      provider: order.reviewEmailProvider,
      messageId: order.reviewEmailMessageId,
      providerStatus: order.reviewEmailProviderStatus,
    };
  }
  if (missingEmail) {
    return {
      status: "not_available",
      label: REVIEW_EMAIL_UNAVAILABLE_LABEL,
      at: order.reviewEmailUnavailableAt || order.reviewEmailLastAttemptAt || order.reviewEmailSentAt,
      error: order.reviewEmailLastError || "Invalid/Missing email",
    };
  }
  if (order.reviewEmailLastError) {
    return {
      status: "failed",
      label: "Failed",
      at: order.reviewEmailLastAttemptAt,
      error: order.reviewEmailLastError,
      provider: order.reviewEmailProvider,
      messageId: order.reviewEmailMessageId,
      providerStatus: order.reviewEmailProviderStatus,
    };
  }
  return { status: "not_sent", label: "Not Sent" };
}

export function getReviewWhatsAppChannelStatus(order: ReviewOrderFields): ReviewChannelStatusView {
  const missingPhone =
    Boolean(order.reviewWhatsAppSkippedAt) || looksLikeMissingPhoneError(order.reviewWhatsAppLastError);

  if (order.reviewWhatsAppSentAt && !missingPhone) {
    return {
      status: "sent",
      label: "Sent",
      at: order.reviewWhatsAppSentAt,
      provider: order.reviewWhatsAppProvider,
      messageId: order.reviewWhatsAppMessageId,
      providerStatus: order.reviewWhatsAppProviderStatus,
    };
  }
  if (missingPhone && !order.reviewWhatsAppSentAt) {
    return {
      status: "not_available",
      label: REVIEW_WHATSAPP_UNAVAILABLE_LABEL,
      at: order.reviewWhatsAppSkippedAt || order.reviewWhatsAppLastAttemptAt,
      error: order.reviewWhatsAppLastError || "No valid WhatsApp number",
    };
  }
  if (order.reviewWhatsAppLastError) {
    return {
      status: "failed",
      label: "Failed",
      at: order.reviewWhatsAppLastAttemptAt,
      error: order.reviewWhatsAppLastError,
      provider: order.reviewWhatsAppProvider,
      messageId: order.reviewWhatsAppMessageId,
      providerStatus: order.reviewWhatsAppProviderStatus,
    };
  }
  return { status: "not_sent", label: "Not Sent" };
}

export function getReviewRequestOverallStatus(order: ReviewOrderFields): ReviewRequestOverallStatus {
  const email = getReviewEmailChannelStatus(order).status;
  const whatsapp = getReviewWhatsAppChannelStatus(order).status;
  const terminalOk = (s: ReviewChannelUiStatus) => s === "sent" || s === "not_available";

  if (terminalOk(email) && terminalOk(whatsapp)) {
    if (email === "not_available" && whatsapp === "not_available") return "not_sent";
    return "sent";
  }
  if (email === "sent" || whatsapp === "sent") return "partially_sent";
  if (email === "failed" || whatsapp === "failed") return "failed";
  return "not_sent";
}

export function getReviewRequestOverallLabel(order: ReviewOrderFields): string {
  return REVIEW_REQUEST_OVERALL_LABEL[getReviewRequestOverallStatus(order)];
}

/** Admin may retry any channel that is not already successfully sent. */
export function canRetryReviewChannel(
  order: ReviewOrderFields,
  channel: "email" | "whatsapp"
): boolean {
  if (!isDeliveredStatus(order.status)) return false;
  const status =
    channel === "email"
      ? getReviewEmailChannelStatus(order).status
      : getReviewWhatsAppChannelStatus(order).status;
  return status !== "sent";
}
