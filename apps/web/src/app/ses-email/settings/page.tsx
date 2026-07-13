"use client";

import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@/lib/auth-context";
import type { SesSettings } from "@hr-ecom/shared";

export default function SettingsPage() {
  const api = useApiClient();
  const [settings, setSettings] = useState<SesSettings | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await api<{ settings: SesSettings }>("/ses-email/settings");
    setSettings(res.settings);
  }, [api]);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Failed"));
  }, [load]);

  const save = async () => {
    if (!settings) return;
    setError("");
    try {
      const res = await api<{ settings: SesSettings }>("/ses-email/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      setSettings(res.settings);
      setMessage("Settings saved.");
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
        AWS credentials are read from the Lambda IAM role in production (no keys in code). Region:{" "}
        <strong>us-east-1</strong> · Domain: <strong>usarakhi.com</strong> (verified).
      </p>
      <div className="rounded-xl border bg-white p-5 space-y-3">
        {field("awsRegion", "AWS Region")}
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
        <button type="button" onClick={() => void save()} className="rounded-lg bg-nav text-white px-4 py-2 text-sm">
          Save settings
        </button>
        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}
