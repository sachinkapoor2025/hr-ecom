import type { SesTemplate } from "@hr-ecom/shared";
import { STARTER_EMAIL_TEMPLATES } from "@/lib/starter-email-templates";

type ApiClient = <T>(path: string, init?: RequestInit) => Promise<T>;

/**
 * Ensures packaged starter templates exist in Admin → Templates (idempotent by templateId).
 */
export async function ensureStarterEmailTemplates(api: ApiClient): Promise<{
  templates: SesTemplate[];
  installed: string[];
}> {
  const list = await api<{ templates: SesTemplate[] }>("/ses-email/templates");
  const existingIds = new Set(list.templates.map((t) => t.templateId));
  const installed: string[] = [];

  for (const starter of STARTER_EMAIL_TEMPLATES) {
    if (existingIds.has(starter.templateId)) continue;

    const htmlRes = await fetch(starter.htmlPath);
    if (!htmlRes.ok) {
      throw new Error(`Failed to load starter template HTML (${starter.name})`);
    }
    const htmlBody = await htmlRes.text();

    const created = await api<{ template: SesTemplate; existed?: boolean }>("/ses-email/templates", {
      method: "POST",
      body: JSON.stringify({
        templateId: starter.templateId,
        name: starter.name,
        subject: starter.subject,
        htmlBody,
      }),
    });

    if (!created.existed) installed.push(created.template.templateId);
    existingIds.add(created.template.templateId);
  }

  const refreshed = await api<{ templates: SesTemplate[] }>("/ses-email/templates");
  return { templates: refreshed.templates, installed };
}
