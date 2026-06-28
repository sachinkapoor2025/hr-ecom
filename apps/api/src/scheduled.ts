import type { ScheduledEvent, Context } from "aws-lambda";
import { processDueReviewEmails } from "./handlers/review-emails";

/** EventBridge Schedule — runs hourly to send post-delivery review requests. */
export async function handler(_event: ScheduledEvent, _context: Context) {
  try {
    const result = await processDueReviewEmails();
    return result;
  } catch (err) {
    console.error("Review emails cron failed:", err);
    throw err;
  }
}
