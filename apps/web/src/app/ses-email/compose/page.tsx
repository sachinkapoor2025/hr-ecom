"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useApiClient } from "@/lib/auth-context";
import { SES_TIMEZONES, type SesCampaign } from "@hr-ecom/shared";

function ComposeInner() {
  const api = useApiClient();
  const router = useRouter();
  const search = useSearchParams();
  const editId = search.get("id");

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [senderName, setSenderName] = useState("UsaRakhi");
  const [senderEmail, setSenderEmail] = useState("order@usarakhi.com");
  const [replyTo, setReplyTo] = useState("order@usarakhi.com");
  const [htmlBody, setHtmlBody] = useState(
    `<h1>Hello {{name}}</h1><p>A note from UsaRakhi for {{company}}.</p><p><a href="https://www.usarakhi.com/products">Shop Rakhi</a></p>`
  );
  const [mode, setMode] = useState<"now" | "later">("now");
  const [scheduledLocal, setScheduledLocal] = useState("");
  const [timezone, setTimezone] = useState<(typeof SES_TIMEZONES)[number]>("Asia/Kolkata");
  const [recurrenceType, setRecurrenceType] = useState<"none" | "daily" | "weekly" | "monthly" | "cron">("none");
  const [testTo, setTestTo] = useState("");
  const [templates, setTemplates] = useState<{ templateId: string; name: string; subject: string; htmlBody: string }[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [campaignId, setCampaignId] = useState(editId ?? "");

  useEffect(() => {
    void api<{ settings: { defaultSenderName: string; defaultSenderEmail: string; defaultReplyTo: string } }>(
      "/ses-email/settings"
    )
      .then((r) => {
        setSenderName(r.settings.defaultSenderName);
        setSenderEmail(r.settings.defaultSenderEmail);
        setReplyTo(r.settings.defaultReplyTo);
      })
      .catch(() => undefined);
    void api<{ templates: typeof templates }>("/ses-email/templates")
      .then((r) => setTemplates(r.templates))
      .catch(() => undefined);
  }, [api]);

  useEffect(() => {
    if (!editId) return;
    void api<{ campaign: SesCampaign }>(`/ses-email/campaigns/${editId}`)
      .then((r) => {
        const c = r.campaign;
        setCampaignId(c.campaignId);
        setName(c.name);
        setSubject(c.subject);
        setSenderName(c.senderName);
        setSenderEmail(c.senderEmail);
        setReplyTo(c.replyTo);
        setHtmlBody(c.htmlBody);
        if (c.scheduledAt) {
          setMode("later");
          setScheduledLocal(c.scheduledAt.slice(0, 16));
        }
        setTimezone((c.timezone as (typeof SES_TIMEZONES)[number]) || "Asia/Kolkata");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [api, editId]);

  const save = async (sendNow: boolean) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload: Record<string, unknown> = {
        name,
        subject,
        senderName,
        senderEmail,
        replyTo,
        htmlBody,
        timezone,
        recurrenceType,
      };
      if (mode === "later" && scheduledLocal) {
        payload.scheduledAt = new Date(scheduledLocal).toISOString();
      }

      let id = campaignId;
      if (id) {
        await api(`/ses-email/campaigns/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        const created = await api<{ campaign: SesCampaign }>("/ses-email/campaigns", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        id = created.campaign.campaignId;
        setCampaignId(id);
      }

      if (sendNow) {
        await api(`/ses-email/campaigns/${id}`, {
          method: "PUT",
          body: JSON.stringify({ action: "send_now" }),
        });
        setMessage("Campaign queued for sending.");
      } else if (mode === "later") {
        setMessage("Campaign scheduled.");
      } else {
        setMessage("Draft saved. Upload recipients next.");
      }
      router.push(`/ses-email/campaigns/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!campaignId) {
      setError("Save the campaign first, then send a test.");
      return;
    }
    setError("");
    try {
      await api("/ses-email/test", {
        method: "POST",
        body: JSON.stringify({ campaignId, to: testTo }),
      });
      setMessage(`Test email sent to ${testTo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test send failed");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-primary">Compose Email</h1>
      <p className="text-sm text-slate-500">
        Variables: <code>{"{{name}}"}</code> <code>{"{{company}}"}</code> <code>{"{{email}}"}</code>
      </p>

      <div className="space-y-4 rounded-xl border bg-white p-5">
        <label className="block text-sm">
          Campaign name
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block text-sm">
          Subject
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </label>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block text-sm">
            Sender name
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
          </label>
          <label className="block text-sm">
            Sender email
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} />
          </label>
          <label className="block text-sm">
            Reply-To
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} />
          </label>
        </div>

        {templates.length > 0 && (
          <label className="block text-sm">
            Load template
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              defaultValue=""
              onChange={(e) => {
                const t = templates.find((x) => x.templateId === e.target.value);
                if (!t) return;
                setSubject(t.subject);
                setHtmlBody(t.htmlBody);
              }}
            >
              <option value="">Select…</option>
              {templates.map((t) => (
                <option key={t.templateId} value={t.templateId}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block text-sm">
          HTML body
          <textarea
            className="mt-1 w-full border rounded-lg px-3 py-2 font-mono text-xs min-h-[220px]"
            value={htmlBody}
            onChange={(e) => setHtmlBody(e.target.value)}
          />
        </label>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === "now"} onChange={() => setMode("now")} />
            Send immediately (after save)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === "later"} onChange={() => setMode("later")} />
            Schedule for later
          </label>
        </div>

        {mode === "later" && (
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block text-sm sm:col-span-1">
              Date & time
              <input
                type="datetime-local"
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={scheduledLocal}
                onChange={(e) => setScheduledLocal(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              Time zone
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value as (typeof SES_TIMEZONES)[number])}
              >
                {SES_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Recurrence
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value as typeof recurrenceType)}
              >
                <option value="none">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            disabled={saving || !name || !subject}
            onClick={() => void save(false)}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={saving || !name || !subject}
            onClick={() => void save(mode === "now")}
            className="rounded-lg bg-nav text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {mode === "later" ? "Schedule campaign" : "Save & send now"}
          </button>
        </div>

        <div className="border-t pt-4 flex flex-wrap gap-2 items-end">
          <label className="block text-sm flex-1 min-w-[200px]">
            Test email to
            <input
              type="email"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <button
            type="button"
            onClick={() => void sendTest()}
            className="rounded-lg border border-nav text-nav px-4 py-2 text-sm font-medium"
          >
            Send test
          </button>
        </div>

        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}

export default function ComposePage() {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
      <ComposeInner />
    </Suspense>
  );
}
