"use client";

import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@/lib/auth-context";

export default function TemplatesPage() {
  const api = useApiClient();
  const [templates, setTemplates] = useState<
    { templateId: string; name: string; subject: string; htmlBody: string; createdAt: string }[]
  >([]);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("<p>Hello {{name}}</p>");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await api<{ templates: typeof templates }>("/ses-email/templates");
    setTemplates(res.templates);
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    await api("/ses-email/templates", {
      method: "POST",
      body: JSON.stringify({ name, subject, htmlBody }),
    });
    setMessage("Template saved.");
    setName("");
    setSubject("");
    await load();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-primary">Templates</h1>
      <div className="rounded-xl border bg-white p-5 space-y-3">
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Template name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <textarea className="w-full border rounded-lg px-3 py-2 text-xs font-mono min-h-[140px]" value={htmlBody} onChange={(e) => setHtmlBody(e.target.value)} />
        <button type="button" onClick={() => void create()} className="rounded-lg bg-nav text-white px-4 py-2 text-sm">
          Save template
        </button>
        {message && <p className="text-green-600 text-sm">{message}</p>}
      </div>
      <ul className="rounded-xl border bg-white divide-y">
        {templates.map((t) => (
          <li key={t.templateId} className="p-4 text-sm">
            <p className="font-semibold">{t.name}</p>
            <p className="text-slate-500">{t.subject}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
