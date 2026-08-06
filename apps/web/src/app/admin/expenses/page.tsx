"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  EXPENSE_TYPES,
  EXPENSE_TYPE_LABELS,
  type Expense,
  type ExpenseType,
} from "@hr-ecom/shared";
import { useAuth, useApiClient } from "@/lib/auth-context";

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminExpensesPage() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const api = useApiClient();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [amount, setAmount] = useState("");
  const [expenseType, setExpenseType] = useState<ExpenseType>("shipping_charges");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(todayYmd());
  const [billFile, setBillFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ expenses: Expense[]; totalAmount: number }>("/admin/expenses");
      setExpenses(res.expenses ?? []);
      setTotalAmount(res.totalAmount ?? 0);
    } catch (err) {
      setExpenses([]);
      setError(err instanceof Error ? err.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!authLoading && isSuperAdmin) void load();
  }, [authLoading, isSuperAdmin, load]);

  const uploadBill = async (file: File): Promise<string | undefined> => {
    const contentType = file.type || "image/jpeg";
    const presign = await api<{ uploadUrl: string; publicUrl: string }>("/uploads/presign", {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        contentType,
        folder: "expenses",
      }),
    });
    const uploadRes = await fetch(presign.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": contentType },
    });
    if (!uploadRes.ok) throw new Error("Bill image upload failed");
    return presign.publicUrl;
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) throw new Error("Enter a valid amount");
      let billImageUrl: string | undefined;
      if (billFile) billImageUrl = await uploadBill(billFile);

      await api("/admin/expenses", {
        method: "POST",
        body: JSON.stringify({
          amount: value,
          expenseType,
          description: description.trim() || undefined,
          expenseDate,
          ...(billImageUrl ? { billImageUrl } : {}),
        }),
      });
      setAmount("");
      setDescription("");
      setExpenseDate(todayYmd());
      setExpenseType("shipping_charges");
      setBillFile(null);
      setMessage("Expense saved");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (expenseId: string) => {
    if (!confirm("Delete this expense?")) return;
    setError("");
    try {
      await api(`/admin/expenses/${expenseId}`, { method: "DELETE" });
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
          Expense management is limited to Cognito users in the <code>super-admin</code> group.
        </p>
        <Link href="/admin" className="text-sm text-accent hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Expense Management</h1>
      <p className="text-slate-600 text-sm mb-6">
        Track business expenses. Bill/invoice upload is optional for now.
      </p>

      <form onSubmit={create} className="rounded-xl border border-slate-200 bg-white p-5 mb-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-700 font-medium">Expense amount (USD)</span>
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
            <span className="text-slate-700 font-medium">Expense type</span>
            <select
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
            >
              {EXPENSE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {EXPENSE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-700 font-medium">Expense date</span>
            <input
              type="date"
              required
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-700 font-medium">Bill / invoice image (optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBillFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-slate-700 font-medium">Description (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-nav text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add expense"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {message && <p className="text-sm text-emerald-700 mb-3">{message}</p>}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">All expenses</h2>
        <p className="text-sm text-slate-600">
          Total:{" "}
          <span className="font-semibold text-slate-900">
            ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading…</p>
      ) : expenses.length === 0 ? (
        <p className="text-slate-500 text-sm">No expenses recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Bill</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((ex) => (
                <tr key={ex.expenseId} className="border-t border-slate-100">
                  <td className="py-3 px-3 whitespace-nowrap">{ex.expenseDate}</td>
                  <td className="py-3 px-3">{EXPENSE_TYPE_LABELS[ex.expenseType]}</td>
                  <td className="py-3 px-3 font-medium">
                    ${ex.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                    {ex.description || "—"}
                  </td>
                  <td className="py-3 px-3">
                    {ex.billImageUrl ? (
                      <a
                        href={ex.billImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => void remove(ex.expenseId)}
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
