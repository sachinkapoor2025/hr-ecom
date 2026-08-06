"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  PAYMENT_LEDGER_SOURCES,
  PAYMENT_LEDGER_SOURCE_LABELS,
  type PaymentLedgerEntry,
  type PaymentLedgerSource,
} from "@hr-ecom/shared";
import { useAuth, useApiClient } from "@/lib/auth-context";

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminPaymentTrackingPage() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const api = useApiClient();
  const [payments, setPayments] = useState<PaymentLedgerEntry[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [amount, setAmount] = useState("");
  const [receivedDate, setReceivedDate] = useState(todayYmd());
  const [paymentSource, setPaymentSource] = useState<PaymentLedgerSource>("stripe");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ payments: PaymentLedgerEntry[]; totalAmount: number }>(
        "/admin/payment-ledger"
      );
      setPayments(res.payments ?? []);
      setTotalAmount(res.totalAmount ?? 0);
    } catch (err) {
      setPayments([]);
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!authLoading && isSuperAdmin) void load();
  }, [authLoading, isSuperAdmin, load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) throw new Error("Enter a valid amount");

      await api("/admin/payment-ledger", {
        method: "POST",
        body: JSON.stringify({
          amount: value,
          receivedDate,
          paymentSource,
          notes: notes.trim() || undefined,
        }),
      });
      setAmount("");
      setNotes("");
      setReceivedDate(todayYmd());
      setPaymentSource("stripe");
      setMessage("Payment recorded");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payment");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (paymentId: string) => {
    if (!confirm("Delete this payment record?")) return;
    setError("");
    try {
      await api(`/admin/payment-ledger/${paymentId}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (authLoading) {
    return <div className="p-10 text-slate-500">Loading…</div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">Super admin only</h1>
        <p className="text-sm text-slate-600 mb-6">
          Payment tracking is limited to Cognito users in the <code>super-admin</code> group.
        </p>
        <Link href="/admin" className="text-sm text-accent hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Payment Tracking</h1>
      <p className="text-slate-600 text-sm mb-6">
        Manual ledger of amounts received from payment gateways. Use this for reconciliation with
        orders and expenses.
      </p>

      <form onSubmit={create} className="rounded-xl border border-slate-200 bg-white p-5 mb-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="text-slate-700 font-medium">Amount received (USD)</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-700 font-medium">Date received</span>
            <input
              type="date"
              required
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-700 font-medium">Payment source</span>
            <select
              value={paymentSource}
              onChange={(e) => setPaymentSource(e.target.value as PaymentLedgerSource)}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
            >
              {PAYMENT_LEDGER_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {PAYMENT_LEDGER_SOURCE_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-slate-700 font-medium">Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-nav text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add payment"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {message && <p className="text-sm text-emerald-700 mb-3">{message}</p>}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">All payments</h2>
        <p className="text-sm text-slate-600">
          Total:{" "}
          <span className="font-semibold text-slate-900">
            ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading…</p>
      ) : payments.length === 0 ? (
        <p className="text-slate-500 text-sm">No payment records yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.paymentId} className="border-t border-slate-100">
                  <td className="py-3 px-3 whitespace-nowrap">{p.receivedDate}</td>
                  <td className="py-3 px-3">{PAYMENT_LEDGER_SOURCE_LABELS[p.paymentSource]}</td>
                  <td className="py-3 px-3 font-medium">
                    ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{p.notes || "—"}</td>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => void remove(p.paymentId)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
