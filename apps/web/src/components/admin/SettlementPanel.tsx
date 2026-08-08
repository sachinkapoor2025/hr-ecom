"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  PAYMENT_LEDGER_SOURCES,
  PAYMENT_LEDGER_SOURCE_LABELS,
  currencyForPaymentSource,
  recordedByLabel,
  type LedgerCurrency,
  type PaymentLedgerEntry,
  type PaymentLedgerSource,
} from "@hr-ecom/shared";
import { useAuth, useApiClient } from "@/lib/auth-context";

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function formatMoney(amount: number, currency: LedgerCurrency) {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export function SettlementPanel() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const api = useApiClient();
  const [payments, setPayments] = useState<PaymentLedgerEntry[]>([]);
  const [totalByCurrency, setTotalByCurrency] = useState({ USD: 0, INR: 0 });
  const [listCurrency, setListCurrency] = useState<LedgerCurrency | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [amount, setAmount] = useState("");
  const [gatewayFee, setGatewayFee] = useState("");
  const [receivedDate, setReceivedDate] = useState(todayYmd());
  const [paymentSource, setPaymentSource] = useState<PaymentLedgerSource>("stripe");
  const [notes, setNotes] = useState("");

  const currency = currencyForPaymentSource(paymentSource);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{
        payments: PaymentLedgerEntry[];
        totalByCurrency?: { USD: number; INR: number };
        totalAmount?: number;
      }>("/admin/payment-ledger");
      setPayments(res.payments ?? []);
      setTotalByCurrency(
        res.totalByCurrency ?? {
          USD: res.totalAmount ?? 0,
          INR: 0,
        }
      );
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

  const visiblePayments = useMemo(() => {
    if (listCurrency === "ALL") return payments;
    return payments.filter((p) => (p.currency ?? "USD") === listCurrency);
  }, [payments, listCurrency]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) throw new Error("Enter a valid amount");
      const feeRaw = gatewayFee.trim();
      const fee = feeRaw === "" ? undefined : Number(feeRaw);
      if (fee !== undefined && (!Number.isFinite(fee) || fee < 0)) {
        throw new Error("Gateway fee must be a non-negative number");
      }

      await api("/admin/payment-ledger", {
        method: "POST",
        body: JSON.stringify({
          amount: value,
          receivedDate,
          paymentSource,
          ...(fee !== undefined ? { gatewayFee: fee } : {}),
          notes: notes.trim() || undefined,
        }),
      });
      setAmount("");
      setGatewayFee("");
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
          Settlement is limited to Cognito users in the <code>super-admin</code> group.
        </p>
        <Link href="/admin" className="text-sm text-accent hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Settlement</h2>
          <p className="text-slate-600 text-sm">
            Record net settlements from gateways. Stripe settlements are USD; Razorpay are INR.
          </p>
        </div>
        <Link
          href="/admin/expense-settlement?tab=reconciliation"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Reconciliation dashboard →
        </Link>
      </div>

      <form onSubmit={create} className="rounded-xl border border-slate-200 bg-white p-5 mb-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
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
            <p className="mt-1 text-xs text-slate-500">
              Currency: <strong>{currency}</strong> (auto)
            </p>
          </label>
          <label className="block text-sm">
            <span className="text-slate-700 font-medium">
              Net amount received ({currency === "INR" ? "₹" : "$"})
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={currency === "INR" ? "Amount in ₹" : "Amount in $"}
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
        </div>
        <label className="block text-sm max-w-sm">
          <span className="text-slate-700 font-medium">Gateway fee (optional)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={gatewayFee}
            onChange={(e) => setGatewayFee(e.target.value)}
            placeholder="Fee deducted by Stripe/Razorpay"
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </label>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
        <h2 className="text-lg font-semibold">All payments</h2>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-3">
            {(["ALL", "USD", "INR"] as const).map((c) => (
              <label key={c} className="inline-flex items-center gap-1.5 text-slate-700">
                <input
                  type="radio"
                  name="payment-list-currency"
                  checked={listCurrency === c}
                  onChange={() => setListCurrency(c)}
                />
                {c === "ALL" ? "All" : c}
              </label>
            ))}
          </div>
          <p className="text-slate-600">
            Total:{" "}
            <span className="font-semibold text-slate-900">
              {listCurrency === "ALL"
                ? `${formatMoney(totalByCurrency.USD, "USD")} · ${formatMoney(totalByCurrency.INR, "INR")}`
                : formatMoney(totalByCurrency[listCurrency], listCurrency)}
            </span>
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading…</p>
      ) : visiblePayments.length === 0 ? (
        <p className="text-slate-500 text-sm">No payment records yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Fee</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-3">Recorded by</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePayments.map((p) => (
                <tr key={p.paymentId} className="border-t border-slate-100">
                  <td className="py-3 px-3 whitespace-nowrap">{p.receivedDate}</td>
                  <td className="py-3 px-3">{PAYMENT_LEDGER_SOURCE_LABELS[p.paymentSource]}</td>
                  <td className="py-3 px-3 font-medium">
                    {formatMoney(p.amount, p.currency ?? "USD")}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {typeof p.gatewayFee === "number"
                      ? formatMoney(p.gatewayFee, p.currency ?? "USD")
                      : "—"}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{p.notes || "—"}</td>
                  <td className="py-3 px-3 text-slate-600 text-xs max-w-[10rem]">
                    {p.createdBy ? recordedByLabel(p.createdBy, "settlement") : "—"}
                  </td>
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
