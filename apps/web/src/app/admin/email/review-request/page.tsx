"use client";

import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@/lib/auth-context";
import type { ReviewRequestSettings } from "@hr-ecom/shared";
import { defaultReviewRequestSettings } from "@hr-ecom/shared";

export default function ReviewRequestSettingsPage() {
  const api = useApiClient();
  const [settings, setSettings] = useState<ReviewRequestSettings | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await api<{ settings: ReviewRequestSettings }>("/admin/review-request/settings");
    setSettings(res.settings);
  }, [api]);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [load]);

  const save = async () => {
    if (!settings) return;
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const res = await api<{ settings: ReviewRequestSettings }>("/admin/review-request/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      setSettings(res.settings);
      setMessage("Review request settings saved. These apply to Delivered/Complete orders.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <p className="text-slate-500">Loading review request settings…</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-primary">Review request</h2>
        <p className="text-sm text-slate-500 mt-1">
          Sent once when an order first becomes <strong>Delivered</strong> or <strong>Complete</strong>.
          Uses transactional SMTP (<code>order@usarakhi.com</code>), not marketing Mailercloud. Website
          reviews are never copied to Google.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <div className="rounded-xl border bg-white p-5 space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={settings.emailEnabled}
            onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
          />
          Send review request email
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={settings.whatsappEnabled}
            onChange={(e) => setSettings({ ...settings, whatsappEnabled: e.target.checked })}
          />
          Send review request WhatsApp
        </label>

        <label className="block text-sm">
          Website review URL
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={settings.websiteReviewUrl}
            onChange={(e) => setSettings({ ...settings, websiteReviewUrl: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Google Business review URL
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            placeholder="https://search.google.com/local/writereview?placeid=…"
            value={settings.googleReviewUrl}
            onChange={(e) => setSettings({ ...settings, googleReviewUrl: e.target.value })}
          />
          <span className="text-xs text-slate-500">Leave blank to hide the Google button.</span>
        </label>
      </div>

      <div className="rounded-xl border bg-white p-5 space-y-4">
        <p className="text-xs text-slate-500">
          Placeholders: <code>{"{{name}}"}</code> <code>{"{{orderNumber}}"}</code>{" "}
          <code>{"{{statusLabel}}"}</code> <code>{"{{websiteReviewUrl}}"}</code>{" "}
          <code>{"{{googleReviewUrl}}"}</code> <code>{"{{siteUrl}}"}</code>
        </p>
        <label className="block text-sm">
          Email subject
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={settings.emailSubjectTemplate}
            onChange={(e) => setSettings({ ...settings, emailSubjectTemplate: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Email body (plain text; HTML is generated for Gmail/Outlook)
          <textarea
            className="mt-1 w-full border rounded-lg px-3 py-2 min-h-[180px] font-mono text-xs"
            value={settings.emailTextTemplate}
            onChange={(e) => setSettings({ ...settings, emailTextTemplate: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          WhatsApp message
          <textarea
            className="mt-1 w-full border rounded-lg px-3 py-2 min-h-[140px] font-mono text-xs"
            value={settings.whatsappTemplate}
            onChange={(e) => setSettings({ ...settings, whatsappTemplate: e.target.value })}
          />
        </label>
        <button
          type="button"
          onClick={() => setSettings(defaultReviewRequestSettings)}
          className="text-sm text-slate-600 underline"
        >
          Reset templates to defaults
        </button>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="rounded-lg bg-nav text-white font-semibold px-5 py-2.5 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}
