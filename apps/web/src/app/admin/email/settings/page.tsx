"use client";

import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@/lib/auth-context";
import type { SesSettings } from "@hr-ecom/shared";

export default function SettingsPage() {
  const api = useApiClient();
  const [settings, setSettings] = useState<SesSettings | null>(null);
  const [smtpPasswordSet, setSmtpPasswordSet] = useState(false);
  const [passwordDirty, setPasswordDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await api<{ settings: SesSettings; smtpPasswordSet?: boolean }>(
      "/ses-email/settings"
    );
    setSettings(res.settings);
    setSmtpPasswordSet(Boolean(res.smtpPasswordSet));
    setPasswordDirty(false);
  }, [api]);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Failed"));
  }, [load]);

  const save = async () => {
    if (!settings) return;
    setError("");
    setMessage("");
    try {
      const payload: SesSettings = {
        ...settings,
        // Keep existing password unless the admin typed a new one.
        smtpPassword: passwordDirty ? settings.smtpPassword || "" : "",
      };
      const res = await api<{ settings: SesSettings; smtpPasswordSet?: boolean }>(
        "/ses-email/settings",
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      setSettings(res.settings);
      setSmtpPasswordSet(Boolean(res.smtpPasswordSet));
      setPasswordDirty(false);
      setMessage("Settings saved. Marketing emails will use these SMTP credentials.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  if (!settings) return <p className="text-slate-500">Loading settings…</p>;

  const field = (key: keyof SesSettings, label: string, type: "text" | "number" = "text") => (
    <label className="block text-sm">
      {label}
      <input
        type={type}
        className="mt-1 w-full border rounded-lg px-3 py-2"
        value={String(settings[key] ?? "")}
        onChange={(e) =>
          setSettings({
            ...settings,
            [key]: type === "number" ? Number(e.target.value) : e.target.value,
          })
        }
      />
    </label>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-primary">Settings</h1>
      <p className="text-sm text-slate-500">
        Marketing campaigns send via SMTP below (Mailercloud / mailrcld). Transactional order emails
        still use the separate server SMTP and are not changed here.
      </p>

      <div className="rounded-xl border bg-white p-5 space-y-3">
        <h2 className="font-semibold text-primary">Marketing SMTP</h2>
        <p className="text-xs text-slate-500">
          From Mailercloud: host <code>smtp-prod.mailrcld.com</code>, port <code>587</code>, STARTTLS,
          user <code>order@usarakhi.com</code>. Click <strong>Generate New Password</strong> in
          Mailercloud, then paste it here and Save.
        </p>

        <label className="block text-sm">
          Transport
          <select
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={settings.marketingTransport ?? "smtp"}
            onChange={(e) =>
              setSettings({
                ...settings,
                marketingTransport: e.target.value as "smtp" | "ses",
              })
            }
          >
            <option value="smtp">SMTP (Mailercloud) — recommended</option>
            <option value="ses">Amazon SES API (suspended / legacy)</option>
          </select>
        </label>

        {field("smtpHost", "SMTP host")}
        {field("smtpPort", "SMTP port", "number")}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(settings.smtpSecure)}
            onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.checked })}
          />
          Use SMTPS / secure (port 465). Leave unchecked for STARTTLS on 587.
        </label>

        {field("smtpUser", "SMTP username")}

        <label className="block text-sm">
          SMTP password
          <input
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full border rounded-lg px-3 py-2"
            placeholder={
              smtpPasswordSet
                ? "Password saved — type a new one to replace"
                : "Paste password from Mailercloud"
            }
            value={passwordDirty ? String(settings.smtpPassword ?? "") : ""}
            onChange={(e) => {
              setPasswordDirty(true);
              setSettings({ ...settings, smtpPassword: e.target.value });
            }}
          />
        </label>
        {smtpPasswordSet && !passwordDirty && (
          <p className="text-xs text-emerald-700">SMTP password is saved.</p>
        )}
      </div>

      <div className="rounded-xl border bg-white p-5 space-y-3">
        <h2 className="font-semibold text-primary">Sender &amp; limits</h2>
        {field("defaultSenderName", "Default sender name")}
        {field("defaultSenderEmail", "Default sender email")}
        {field("defaultReplyTo", "Default reply-to")}
        {field("dailyLimit", "Daily limit", "number")}
        {field("maxSendRatePerMinute", "Max emails / minute", "number")}
        {field("batchSize", "Batch size", "number")}
        {field("delayBetweenBatchesMs", "Delay between batches (ms)", "number")}
        {field("concurrentWorkers", "Concurrent workers", "number")}
        {field("companyName", "Company name (footer)")}
        {field("companyAddress", "Company address (footer)")}
        {field("contactEmail", "Contact email (footer)")}
        {field("privacyUrl", "Privacy policy URL")}
        {field("adminNotifyEmail", "Admin notify email")}
        <button
          type="button"
          onClick={() => void save()}
          className="rounded-lg bg-nav text-white px-4 py-2 text-sm"
        >
          Save settings
        </button>
        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}
