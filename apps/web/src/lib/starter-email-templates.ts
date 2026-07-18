/** Starter marketing templates installed into Admin → Marketing Emails → Templates. */

export type StarterEmailTemplateMeta = {
  templateId: string;
  name: string;
  subject: string;
  /** Public URL path (served from apps/web/public). */
  htmlPath: string;
};

export const RAKSHA_BANDHAN_TEMPLATE_ID = "raksha-bandhan-usa";

export const STARTER_EMAIL_TEMPLATES: StarterEmailTemplateMeta[] = [
  {
    templateId: RAKSHA_BANDHAN_TEMPLATE_ID,
    name: "Raksha Bandhan USA",
    subject: "Celebrate Raksha Bandhan Across Miles",
    htmlPath: "/email-templates/raksha-bandhan-usa.html",
  },
];
