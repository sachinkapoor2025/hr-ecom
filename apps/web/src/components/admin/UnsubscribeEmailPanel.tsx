"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useApiClient } from "@/lib/auth-context";

type UnsubItem = {
  email: string;
  unsubscribedAt: string;
  source: "payment_reminder" | "admin";
};

/**
 * Admin UI for the pending-payment reminder unsubscribe table
 * (`hr-ecom-pending-payment-unsub-*`) — same list the public
 * `/unsubscribe/payment-reminders` form writes to.
 */
export function UnsubscribeEmailPanel() {
  const api = useApiClient();
  const [items, setItems] = useState<UnsubItem[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ items: UnsubItem[] }>("/admin/pending-payment-unsubscribe");
      setItems(res.items ?? []);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : "Failed to load unsubscribe list");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api("/admin/pending-payment-unsubscribe", {
        method: "POST",
        body: JSON.stringify({ email: trimmed }),
      });
      setEmail("");
      setMessage(`${trimmed.toLowerCase()} will no longer receive pending-payment reminders.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add email");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (addr: string) => {
    if (!confirm(`Remove ${addr} from the unsubscribe list? They may receive reminders again.`)) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await api(`/admin/pending-payment-unsubscribe/${encodeURIComponent(addr)}`, {
        method: "DELETE",
      });
      setMessage(`${addr} removed from unsubscribe list.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove email");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <h2 className="text-lg font-semibold mb-1">Unsubscribe Email</h2>
      <p className="text-sm text-slate-600 mb-4">
        Add customer emails here when they ask to stop pending-payment reminder notifications.
        Uses the same DynamoDB unsubscribe table as{" "}
        <Link href="/unsubscribe/payment-reminders" className="text-nav hover:underline" target="_blank">
          /unsubscribe/payment-reminders
        </Link>
        . Order status emails are unaffected. For marketing campaign opt-outs, use{" "}
        <Link href="/admin/email/suppression" className="text-nav hover:underline">
          Marketing Email → Suppression List
        </Link>
        .
      </p>

      <form onSubmit={add} className="rounded-xl border bg-white p-5 flex flex-wrap gap-2 mb-4">
        <input
          type="email"
          className="flex-1 min-w-[200px] border border-slate-300 rounded-lg px-3 py-2 text-sm"
          placeholder="customer@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-nav text-white px-4 py-2 text-sm font-medium hover:bg-nav/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Unsubscribe"}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {message && <p className="text-green-700 text-sm mb-3">{message}</p>}

      {loading ? (
        <p className="text-slate-500 text-sm">Loading…</p>
      ) : (
        <ul className="rounded-xl border bg-white divide-y text-sm">
          {items.map((i) => (
            <li key={i.email} className="px-4 py-3 flex justify-between gap-2 items-start">
              <div>
                <p className="font-medium text-slate-800">{i.email}</p>
                <p className="text-xs text-slate-500">
                  {i.source === "admin" ? "Added by admin" : "Customer opt-out"}
                  {i.unsubscribedAt
                    ? ` · ${new Date(i.unsubscribedAt).toLocaleString()}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                className="text-red-600 text-xs shrink-0 hover:underline"
                onClick={() => void remove(i.email)}
              >
                Remove
              </button>
            </li>
          ))}
          {items.length === 0 && (
            <li className="p-4 text-slate-500">No unsubscribed emails yet.</li>
          )}
        </ul>
      )}
    </div>
  );
}
