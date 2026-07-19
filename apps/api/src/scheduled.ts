import type { ScheduledEvent, Context } from "aws-lambda";
import { processDueReviewEmails } from "./handlers/review-emails";
import { processAbandonedCartEmails } from "./handlers/abandoned-cart-emails";
import { processPendingPaymentReminders } from "./handlers/pending-payment-reminders";

/** EventBridge Schedule — review emails + abandoned cart + pending-payment reminders. */
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

  if (
    results.reviewEmailsError ||
    results.abandonedCartEmailsError ||
    results.pendingPaymentRemindersError
  ) {
    throw new Error(JSON.stringify(results));
  }

  return results;
}
