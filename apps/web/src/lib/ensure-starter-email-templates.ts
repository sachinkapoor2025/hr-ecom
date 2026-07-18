import type { SesTemplate } from "@hr-ecom/shared";
import { STARTER_EMAIL_TEMPLATES } from "@/lib/starter-email-templates";

type ApiClient = <T>(path: string, init?: RequestInit) => Promise<T>;

/**
 * Ensures packaged starter templates exist in Admin → Templates.
 * Creates missing starters and refreshes HTML for existing starter ids
 * so design updates (banner, product images) ship to the Templates list.
 */
export async function ensureStarterEmailTemplates(api: ApiClient): Promise<{
  templates: SesTemplate[];
  installed: string[];
  updated: string[];
}> {
  const list = await api<{ templates: SesTemplate[] }>("/ses-email/templates");
  const byId = new Map(list.templates.map((t) => [t.templateId, t]));
  const installed: string[] = [];
  const updated: string[] = [];

  for (const starter of STARTER_EMAIL_TEMPLATES) {
    const htmlRes = await fetch(starter.htmlPath);
    if (!htmlRes.ok) {
      throw new Error(`Failed to load starter template HTML (${starter.name})`);
    }
    const htmlBody = await htmlRes.text();
    const existing = byId.get(starter.templateId);

    if (!existing) {
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
      byId.set(created.template.templateId, created.template);
      continue;
    }

    // Refresh packaged starter content when the HTML file changes.
    if (existing.htmlBody !== htmlBody || existing.subject !== starter.subject || existing.name !== starter.name) {
      const res = await api<{ template: SesTemplate }>(`/ses-email/templates/${starter.templateId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: starter.name,
          subject: starter.subject,
          htmlBody,
        }),
      });
      updated.push(res.template.templateId);
      byId.set(res.template.templateId, res.template);
    }
  }

  const refreshed = await api<{ templates: SesTemplate[] }>("/ses-email/templates");
  return { templates: refreshed.templates, installed, updated };
}
