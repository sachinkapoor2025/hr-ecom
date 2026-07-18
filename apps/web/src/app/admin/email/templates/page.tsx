"use client";

import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@/lib/auth-context";
import { ensureStarterEmailTemplates } from "@/lib/ensure-starter-email-templates";
import { RAKSHA_BANDHAN_TEMPLATE_ID } from "@/lib/starter-email-templates";
import type { SesTemplate } from "@hr-ecom/shared";

const EMPTY_HTML = "<p>Hello {{name}}</p>";

export default function TemplatesPage() {
  const api = useApiClient();
  const [templates, setTemplates] = useState<SesTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState(EMPTY_HTML);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [booting, setBooting] = useState(true);

  const isEditing = Boolean(selectedId);

  const load = useCallback(async () => {
    const { templates: list, installed, updated } = await ensureStarterEmailTemplates(api);
    setTemplates(list);
    if (installed.includes(RAKSHA_BANDHAN_TEMPLATE_ID)) {
      setMessage("Raksha Bandhan USA template installed and ready to use.");
    } else if (updated.includes(RAKSHA_BANDHAN_TEMPLATE_ID)) {
      setMessage("Raksha Bandhan USA template updated with banner and product images.");
    }
    return list;
  }, [api]);

  useEffect(() => {
    void load()
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load templates"))
      .finally(() => setBooting(false));
  }, [load]);

  const resetForm = () => {
    setSelectedId(null);
    setName("");
    setSubject("");
    setHtmlBody(EMPTY_HTML);
    setMessage("");
    setError("");
  };

  const openTemplate = async (templateId: string) => {
    setLoadingId(templateId);
    setMessage("");
    setError("");
    try {
      const res = await api<{ template: SesTemplate }>(`/ses-email/templates/${templateId}`);
      const t = res.template;
      setSelectedId(t.templateId);
      setName(t.name);
      setSubject(t.subject);
      setHtmlBody(t.htmlBody);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load template");
    } finally {
      setLoadingId(null);
    }
  };

  const save = async () => {
    if (!name.trim() || !subject.trim() || !htmlBody.trim()) {
      setError("Name, subject, and HTML body are required.");
      return;
    }
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = { name: name.trim(), subject: subject.trim(), htmlBody };
      if (selectedId) {
        const res = await api<{ template: SesTemplate }>(`/ses-email/templates/${selectedId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSelectedId(res.template.templateId);
        setName(res.template.name);
        setSubject(res.template.subject);
        setHtmlBody(res.template.htmlBody);
        setMessage("Template updated.");
      } else {
        const res = await api<{ template: SesTemplate }>("/ses-email/templates", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSelectedId(res.template.templateId);
        setName(res.template.name);
        setSubject(res.template.subject);
        setHtmlBody(res.template.htmlBody);
        setMessage("Template created.");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedId) return;
    if (!window.confirm(`Delete template “${name || "untitled"}”? This cannot be undone.`)) return;
    setDeleting(true);
    setMessage("");
    setError("");
    try {
      await api(`/ses-email/templates/${selectedId}`, { method: "DELETE" });
      resetForm();
      setMessage("Template deleted.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-primary">Templates</h1>
        {isEditing && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            New template
          </button>
        )}
      </div>

      <div className="rounded-xl border bg-white p-5 space-y-3">
        <p className="text-xs text-slate-500">
          {isEditing ? "Editing saved template" : "Create a new template"}
        </p>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-xs font-mono min-h-[140px]"
          value={htmlBody}
          onChange={(e) => setHtmlBody(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || deleting || booting}
            className="rounded-lg bg-nav text-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {saving ? "Saving…" : isEditing ? "Update template" : "Save template"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => void remove()}
              disabled={saving || deleting}
              className="rounded-lg border border-red-200 text-red-700 px-4 py-2 text-sm hover:bg-red-50 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="text-sm font-semibold text-slate-700">Saved templates</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click a template to open it in the editor. Use it from Compose → Load template for campaigns.
          </p>
        </div>
        {booting ? (
          <p className="p-4 text-sm text-slate-500">Loading templates…</p>
        ) : templates.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No templates yet. Create one above.</p>
        ) : (
          <ul className="divide-y">
            {templates.map((t) => {
              const active = selectedId === t.templateId;
              const busy = loadingId === t.templateId;
              return (
                <li key={t.templateId}>
                  <button
                    type="button"
                    onClick={() => void openTemplate(t.templateId)}
                    disabled={busy}
                    className={`w-full text-left p-4 text-sm transition-colors hover:bg-slate-50 disabled:opacity-60 ${
                      active ? "bg-slate-50 ring-inset ring-1 ring-nav/20" : ""
                    }`}
                  >
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-slate-500">{t.subject}</p>
                    {busy && <p className="text-xs text-slate-400 mt-1">Opening…</p>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
