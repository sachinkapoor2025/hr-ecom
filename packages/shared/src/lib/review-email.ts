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

type ReviewOrderFields = Pick<
  Order,
  | "status"
  | "deliveredAt"
  | "reviewEmailDueAt"
  | "reviewEmailSentAt"
  | "reviewWhatsAppSentAt"
  | "reviewWhatsAppSkippedAt"
  | "statusHistory"
>;

export function isReviewEmailChannelDone(
  order: Pick<Order, "reviewEmailSentAt">
): boolean {
  return Boolean(order.reviewEmailSentAt);
}

export function isReviewWhatsAppChannelDone(
  order: Pick<Order, "reviewWhatsAppSentAt" | "reviewWhatsAppSkippedAt">
): boolean {
  return Boolean(order.reviewWhatsAppSentAt || order.reviewWhatsAppSkippedAt);
}

/** True when either channel still needs a first successful/skipped attempt. */
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
