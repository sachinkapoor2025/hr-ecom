/** Starter marketing templates installed into Admin → Marketing Emails → Templates. */

import {
  DEFAULT_PREMIUM_MARKETING_EMAIL_CONTENT,
  PREMIUM_MARKETING_EMAIL_LAYOUT,
  buildPremiumMarketingEmailHtml,
  type MarketingEmailContent,
} from "@hr-ecom/shared";

export type StarterEmailTemplateMeta = {
  templateId: string;
  name: string;
  subject: string;
  /** Public URL path (served from apps/web/public) — optional when contentFields provided. */
  htmlPath?: string;
  /** Structured layout for Admin visual editor. */
  layout?: typeof PREMIUM_MARKETING_EMAIL_LAYOUT;
  contentFields?: MarketingEmailContent;
  /**
   * When true (default for structured templates), never overwrite an existing
   * DynamoDB template so Admin field edits are preserved.
   */
  preserveAdminEdits?: boolean;
};

export const RAKSHA_BANDHAN_TEMPLATE_ID = "raksha-bandhan-usa";
export const PREMIUM_RAKSHA_BANDHAN_TEMPLATE_ID = "premium-raksha-bandhan";

export const STARTER_EMAIL_TEMPLATES: StarterEmailTemplateMeta[] = [
  {
    templateId: RAKSHA_BANDHAN_TEMPLATE_ID,
    name: "Raksha Bandhan USA",
    subject: "Celebrate Raksha Bandhan Across Miles",
    htmlPath: "/email-templates/raksha-bandhan-usa.html",
  },
  {
    templateId: PREMIUM_RAKSHA_BANDHAN_TEMPLATE_ID,
    name: "Premium Raksha Bandhan (Editable)",
    subject: "Celebrate Raksha Bandhan Across Miles — UsaRakhi",
    layout: PREMIUM_MARKETING_EMAIL_LAYOUT,
    contentFields: DEFAULT_PREMIUM_MARKETING_EMAIL_CONTENT,
    preserveAdminEdits: true,
  },
];

export function resolveStarterHtmlBody(starter: StarterEmailTemplateMeta, fileHtml?: string): string {
  if (starter.contentFields && starter.layout === PREMIUM_MARKETING_EMAIL_LAYOUT) {
    return buildPremiumMarketingEmailHtml(starter.contentFields);
  }
  if (starter.contentFields) {
    return buildPremiumMarketingEmailHtml(starter.contentFields);
  }
  return fileHtml?.trim() || "";
}
