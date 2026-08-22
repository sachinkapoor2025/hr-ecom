import { z } from "zod";
import { displayOrderRef } from "../lib/order-number";
import { formatOrderStatusLabel } from "../lib/order-status";

/** Placeholders available in review-request email/WhatsApp templates. */
export const REVIEW_REQUEST_TEMPLATE_VARS = [
  "name",
  "orderNumber",
  "statusLabel",
  "websiteReviewUrl",
  "googleReviewUrl",
  "siteUrl",
] as const;

export const DEFAULT_WEBSITE_REVIEW_URL = "https://www.usarakhi.com/reviews";

export const DEFAULT_REVIEW_REQUEST_EMAIL_SUBJECT =
  "Order {{statusLabel}} — #{{orderNumber}} | UsaRakhi";

export const DEFAULT_REVIEW_REQUEST_EMAIL_TEXT = `Hi {{name}},

Your order #{{orderNumber}} has been {{statusLabel}}.

We hope your brother loves his Rakhi! If you have a moment, we would love to hear how the delivery went. Your review helps other families send Rakhi with confidence.

Leave a Review:
{{websiteReviewUrl}}

Review us on Google:
{{googleReviewUrl}}

This is optional — only share if you would like to.

Questions? Reply to this email or WhatsApp us.

— UsaRakhi Team
{{siteUrl}}`;

export const DEFAULT_REVIEW_REQUEST_WHATSAPP = `Hi {{name}}! Thank you — your UsaRakhi order {{orderNumber}} is {{statusLabel}}.

Leave a review: {{websiteReviewUrl}}
Review us on Google: {{googleReviewUrl}}

We hope your brother loved his Rakhi.`;

export const reviewRequestSettingsSchema = z.object({
  websiteReviewUrl: z.string().trim().url().max(500).default(DEFAULT_WEBSITE_REVIEW_URL),
  googleReviewUrl: z
    .string()
    .trim()
    .max(500)
    .default("")
    .refine((s) => !s || /^https?:\/\//i.test(s), "Google review URL must start with http(s)"),
  emailEnabled: z.boolean().default(true),
  whatsappEnabled: z.boolean().default(true),
  emailSubjectTemplate: z.string().trim().min(1).max(200).default(DEFAULT_REVIEW_REQUEST_EMAIL_SUBJECT),
  emailTextTemplate: z.string().trim().min(1).max(4000).default(DEFAULT_REVIEW_REQUEST_EMAIL_TEXT),
  whatsappTemplate: z.string().trim().min(1).max(1600).default(DEFAULT_REVIEW_REQUEST_WHATSAPP),
});

export type ReviewRequestSettings = z.infer<typeof reviewRequestSettingsSchema>;

export const defaultReviewRequestSettings: ReviewRequestSettings = reviewRequestSettingsSchema.parse({});

export type ReviewRequestTemplateVars = {
  name: string;
  orderNumber: string;
  statusLabel: string;
  websiteReviewUrl: string;
  googleReviewUrl: string;
  siteUrl: string;
};

export function renderReviewRequestTemplate(
  template: string,
  vars: ReviewRequestTemplateVars
): string {
  return template.replace(/\{\{\s*(name|orderNumber|statusLabel|websiteReviewUrl|googleReviewUrl|siteUrl)\s*\}\}/g, (_, key: keyof ReviewRequestTemplateVars) => {
    return vars[key] ?? "";
  });
}

/** Drop empty Google-review lines when no Google URL is configured. */
export function omitEmptyGoogleReviewLines(text: string, googleReviewUrl: string): string {
  if (googleReviewUrl.trim()) return text;
  return text
    .replace(/^.*\{\{\s*googleReviewUrl\s*\}\}.*$/gm, "")
    .replace(/Review us on Google:\s*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const DEFAULT_REVIEW_SITE_URL = "https://www.usarakhi.com";

export function reviewRequestTemplateVars(
  order: {
    orderId: string;
    orderNumber?: string | null;
    status: string;
    shippingAddress?: { name?: string } | null;
  },
  settings: ReviewRequestSettings,
  siteUrl = DEFAULT_REVIEW_SITE_URL
): ReviewRequestTemplateVars {
  const site = siteUrl.replace(/\/$/, "");
  const name = order.shippingAddress?.name?.split(" ")[0]?.trim() || "there";
  return {
    name,
    orderNumber: displayOrderRef({ orderId: order.orderId, orderNumber: order.orderNumber }),
    statusLabel: formatOrderStatusLabel(order.status),
    websiteReviewUrl: settings.websiteReviewUrl || `${site}/reviews`,
    googleReviewUrl: settings.googleReviewUrl.trim(),
    siteUrl: site,
  };
}

/** Pre-filled WhatsApp review text from the saved admin template. */
export function buildReviewRequestWhatsAppDraft(
  order: {
    orderId: string;
    orderNumber?: string | null;
    status: string;
    shippingAddress?: { name?: string } | null;
  },
  settings: ReviewRequestSettings,
  siteUrl = DEFAULT_REVIEW_SITE_URL
): string {
  const vars = reviewRequestTemplateVars(order, settings, siteUrl);
  const template = omitEmptyGoogleReviewLines(settings.whatsappTemplate, vars.googleReviewUrl);
  return renderReviewRequestTemplate(template, vars).trim();
}

export const REVIEW_NOTIFICATION_CHANNELS = ["email", "whatsapp"] as const;
export type ReviewNotificationChannel = (typeof REVIEW_NOTIFICATION_CHANNELS)[number];

/** Persisted attempt outcome — never "not_sent" (that is only a derived UI state). */
export const REVIEW_NOTIFICATION_LOG_STATUSES = ["sent", "failed", "not_available"] as const;
export type ReviewNotificationLogStatus = (typeof REVIEW_NOTIFICATION_LOG_STATUSES)[number];

export const reviewNotificationLogEntrySchema = z.object({
  id: z.string().min(1).max(80),
  type: z.literal("review_request").default("review_request"),
  channel: z.enum(REVIEW_NOTIFICATION_CHANNELS),
  orderId: z.string().min(1).max(80),
  customer: z.string().max(200).optional(),
  status: z.enum(REVIEW_NOTIFICATION_LOG_STATUSES),
  at: z.string().min(1),
  provider: z.string().max(80).optional(),
  messageId: z.string().max(200).optional(),
  providerStatus: z.string().max(300).optional(),
  error: z.string().max(500).optional(),
});

export type ReviewNotificationLogEntry = z.infer<typeof reviewNotificationLogEntrySchema>;

export const REVIEW_NOTIFICATION_LOG_MAX = 30;
