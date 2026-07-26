import type { ScheduledEvent, Context } from "aws-lambda";
import { processDueReviewEmails } from "./handlers/review-emails";
import { processAbandonedCartEmails } from "./handlers/abandoned-cart-emails";
import { processPendingPaymentReminders } from "./handlers/pending-payment-reminders";
import { reconcilePendingRazorpayPayments } from "./handlers/payments/razorpay";

/** EventBridge Schedule — review emails + abandoned cart + pending-payment reminders + Razorpay reconcile. */
export async function handler(_event: ScheduledEvent, _context: Context) {
  const results: Record<string, unknown> = {};

  try {
    results.reviewEmails = await processDueReviewEmails();
  } catch (err) {
    console.error("Review emails cron failed:", err);
    results.reviewEmailsError = err instanceof Error ? err.message : String(err);
  }

  try {
    results.abandonedCartEmails = await processAbandonedCartEmails();
  } catch (err) {
    console.error("Abandoned cart emails cron failed:", err);
    results.abandonedCartEmailsError = err instanceof Error ? err.message : String(err);
  }

  try {
    results.pendingPaymentReminders = await processPendingPaymentReminders();
  } catch (err) {
    console.error("Pending payment reminders cron failed:", err);
    results.pendingPaymentRemindersError = err instanceof Error ? err.message : String(err);
  }

  try {
    // Safety net when Razorpay captured but browser crash skipped client verify.
    results.razorpayReconcile = await reconcilePendingRazorpayPayments();
  } catch (err) {
    console.error("Razorpay reconcile cron failed:", err);
    results.razorpayReconcileError = err instanceof Error ? err.message : String(err);
  }

  if (
    results.reviewEmailsError ||
    results.abandonedCartEmailsError ||
    results.pendingPaymentRemindersError ||
    results.razorpayReconcileError
  ) {
    throw new Error(JSON.stringify(results));
  }

  return results;
}
