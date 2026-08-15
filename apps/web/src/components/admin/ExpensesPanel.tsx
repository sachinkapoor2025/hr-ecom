"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  EXPENSE_BILL_STATUSES,
  EXPENSE_BILL_STATUS_LABELS,
  EXPENSE_DONE_BY,
  EXPENSE_MAX_BILL_IMAGES,
  EXPENSE_TYPES,
  EXPENSE_TYPE_LABELS,
  normalizeExpenseTypes,
  LEDGER_CURRENCIES,
  recordedByLabel,
  displayNameFromEmail,
  type Expense,
  type ExpenseBillStatus,
  type ExpenseDoneBy,
  type ExpenseType,
  type LedgerCurrency,
} from "@hr-ecom/shared";
import { useAuth, useApiClient } from "@/lib/auth-context";
import { compressBillFiles } from "@/lib/compress-bill";

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function formatMoney(amount: number, currency: LedgerCurrency) {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function expenseBillUrls(ex: Expense): string[] {
  if (ex.billImageUrls?.length) return ex.billImageUrls;
  if (ex.billImageUrl) return [ex.billImageUrl];
  return [];
}

function resolveStatus(ex: Expense): ExpenseBillStatus {
  if (ex.billStatus) return ex.billStatus;
  if (ex.noBill) return "no_bill";
  return expenseBillUrls(ex).length ? "all_bills" : "no_bill";
}

export function ExpensesPanel() {
  const { isAdmin, isSuperAdmin, user, loading: authLoading } = useAuth();
  const api = useApiClient();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [listCurrency, setListCurrency] = useState<LedgerCurrency | "ALL">("ALL");
  const [filterLoggedBy, setFilterLoggedBy] = useState("ALL");
  const [filterDoneBy, setFilterDoneBy] = useState<"ALL" | ExpenseDoneBy>("ALL");
  const [filterType, setFilterType] = useState<"ALL" | ExpenseType>("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Expense | null>(null);

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<LedgerCurrency>("USD");
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>(["shipping_charges"]);
  const [doneBy, setDoneBy] = useState<ExpenseDoneBy>("DGV");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(todayYmd());
  const [billStatus, setBillStatus] = useState<ExpenseBillStatus>("all_bills");
  const [billFiles, setBillFiles] = useState<File[]>([]);
  const [existingBillUrls, setExistingBillUrls] = useState<string[]>([]);

  const toggleExpenseType = (t: ExpenseType) => {
    setExpenseTypes((prev) => {
      if (prev.includes(t)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== t);
      }
      return [...prev, t];
    });
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setExpenseDate(todayYmd());
    setExpenseTypes(["shipping_charges"]);
    setDoneBy("DGV");
    setCurrency("USD");
    setBillStatus("all_bills");
    setBillFiles([]);
    setExistingBillUrls([]);
    setEditing(null);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{
        expenses: Expense[];
      }>("/admin/expenses");
      setExpenses(res.expenses ?? []);
    } catch (err) {
      setExpenses([]);
      setError(err instanceof Error ? err.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!authLoading && isAdmin) void load();
  }, [authLoading, isAdmin, load]);

  const loggedByOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of expenses) {
      const key = (e.createdBy ?? "").trim().toLowerCase();
      if (!key) continue;
      if (!map.has(key)) map.set(key, displayNameFromEmail(e.createdBy));
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [expenses]);

  const visibleExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (listCurrency !== "ALL" && (e.currency ?? "USD") !== listCurrency) return false;
      if (filterDoneBy !== "ALL" && e.doneBy !== filterDoneBy) return false;
      if (filterLoggedBy !== "ALL") {
        const created = (e.createdBy ?? "").trim().toLowerCase();
        if (created !== filterLoggedBy) return false;
      }
      if (filterType !== "ALL") {
        const types = normalizeExpenseTypes({
          expenseType: e.expenseType,
          expenseTypes: e.expenseTypes,
        });
        if (!types.includes(filterType)) return false;
      }
      return true;
    });
  }, [expenses, listCurrency, filterDoneBy, filterLoggedBy, filterType]);

  const filteredTotals = useMemo(() => {
    const USD = visibleExpenses
      .filter((e) => (e.currency ?? "USD") === "USD")
      .reduce((sum, e) => sum + e.amount, 0);
    const INR = visibleExpenses
      .filter((e) => e.currency === "INR")
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      USD: Math.round(USD * 100) / 100,
      INR: Math.round(INR * 100) / 100,
    };
  }, [visibleExpenses]);

  const canModifyExpense = (ex: Expense): boolean => {
    if (isSuperAdmin) return true;
    const createdBy = (ex.createdBy ?? "").trim().toLowerCase();
    if (!createdBy) return false;
    const email = (user?.email ?? "").trim().toLowerCase();
    return Boolean(email) && createdBy === email;
  };

  const startEdit = (ex: Expense) => {
    if (!canModifyExpense(ex)) {
      setError("You can only edit expenses you added");
      return;
    }
    setEditing(ex);
    setAmount(String(ex.amount));
    setCurrency(ex.currency ?? "USD");
    setExpenseTypes(
      normalizeExpenseTypes({ expenseType: ex.expenseType, expenseTypes: ex.expenseTypes })
    );
    setDoneBy(ex.doneBy === "Joha" ? "Joha" : "DGV");
    setDescription(ex.description ?? "");
    setExpenseDate(ex.expenseDate);
    setBillStatus(resolveStatus(ex));
    setExistingBillUrls(expenseBillUrls(ex));
    setBillFiles([]);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onBillFilesChange = (fileList: FileList | null) => {
    const next = Array.from(fileList ?? []);
    if (next.length > EXPENSE_MAX_BILL_IMAGES) {
      setError(`You can upload at most ${EXPENSE_MAX_BILL_IMAGES} bills`);
      setBillFiles(next.slice(0, EXPENSE_MAX_BILL_IMAGES));
      return;
    }
    setError("");
    setBillFiles(next);
  };

  const uploadBill = async (file: File): Promise<string> => {
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
    if (!uploadRes.ok) throw new Error(`Bill upload failed: ${file.name}`);
    return presign.publicUrl;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) throw new Error("Enter a valid amount");

      let billImageUrls: string[] = [];
      if (billStatus === "no_bill") {
        billImageUrls = [];
      } else {
        const compressed = await compressBillFiles(billFiles);
        const uploaded: string[] = [];
        for (const file of compressed) {
          uploaded.push(await uploadBill(file));
        }
        billImageUrls = editing
          ? [...existingBillUrls, ...uploaded].slice(0, EXPENSE_MAX_BILL_IMAGES)
          : uploaded;
        if (billImageUrls.length === 0) {
          throw new Error("Upload at least one bill, or select “This expense has no bill”");
        }
      }

      if (expenseTypes.length === 0) {
        throw new Error("Select at least one expense type");
      }

      const body = {
        amount: value,
        currency,
        expenseType: expenseTypes[0],
        expenseTypes,
        doneBy,
        description: description.trim() || undefined,
        expenseDate,
        billStatus,
        noBill: billStatus === "no_bill",
        billImageUrls,
      };

      if (editing) {
        if (!canModifyExpense(editing)) {
          throw new Error("You can only edit expenses you added");
        }
        await api(`/admin/expenses/${editing.expenseId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        setMessage("Expense updated");
      } else {
        await api("/admin/expenses", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setMessage("Expense saved");
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (expenseId: string) => {
    if (!isSuperAdmin) {
      setError("Only super admins can delete expenses");
      return;
    }
    if (!confirm("Delete this expense?")) return;
    setError("");
    try {
      await api(`/admin/expenses/${expenseId}`, { method: "DELETE" });
      if (editing?.expenseId === expenseId) resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (authLoading) {
    return <div className="p-10 text-slate-500">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">Admin access required</h1>
        <Link href="/admin" className="text-sm text-accent hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <h2 className="text-lg font-semibold mb-1">Expense</h2>
      <p className="text-slate-600 text-sm mb-6">
        Track business expenses. Images are compressed before upload (max {EXPENSE_MAX_BILL_IMAGES}{" "}
        bills).
      </p>

      <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 mb-8 space-y-4">
        {editing && (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span>Editing expense {editing.expenseId.slice(0, 8)}…</span>
            <button type="button" className="text-accent hover:underline" onClick={resetForm}>
              Cancel edit
            </button>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="block text-sm">
            <span className="text-slate-700 font-medium">Expense amount</span>
            <div className="mt-1 flex items-center gap-4 mb-2">
              {LEDGER_CURRENCIES.map((c) => (
                <label key={c} className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="expense-currency"
                    value={c}
                    checked={currency === c}
                    onChange={() => setCurrency(c)}
                  />
                  {c}
                </label>
              ))}
            </div>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="block text-sm sm:col-span-2">
            <span className="text-slate-700 font-medium">Expense type</span>
            <p className="text-xs text-slate-500 mt-0.5 mb-2">
              Select one or more — e.g. Shipping, Inventory Purchase, and Purchase Bills together.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXPENSE_TYPES.map((t) => {
                const checked = expenseTypes.includes(t);
                return (
                  <label
                    key={t}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                      checked
                        ? "border-nav bg-blue-50 text-nav"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleExpenseType(t)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm font-medium">{EXPENSE_TYPE_LABELS[t]}</span>
                  </label>
                );
              })}
            </div>
          </div>
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
            <span className="text-slate-700 font-medium">Expense done by</span>
            <select
              required
              value={doneBy}
              onChange={(e) => setDoneBy(e.target.value as ExpenseDoneBy)}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
            >
              {EXPENSE_DONE_BY.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <div className="block text-sm space-y-2">
            <span className="text-slate-700 font-medium">Bill availability</span>
            <div className="space-y-1.5">
              {EXPENSE_BILL_STATUSES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-slate-700">
                  <input
                    type="radio"
                    name="bill-status"
                    checked={billStatus === s}
                    onChange={() => {
                      setBillStatus(s);
                      if (s === "no_bill") {
                        setBillFiles([]);
                        setExistingBillUrls([]);
                      }
                    }}
                  />
                  {EXPENSE_BILL_STATUS_LABELS[s]}
                </label>
              ))}
            </div>
            {billStatus !== "no_bill" && (
              <div>
                <span className="text-slate-700 font-medium">
                  Bill / invoice images (max {EXPENSE_MAX_BILL_IMAGES})
                </span>
                {editing && existingBillUrls.length > 0 && (
                  <ul className="mt-1 text-xs text-slate-600 space-y-0.5">
                    {existingBillUrls.map((url, i) => (
                      <li key={url} className="flex items-center gap-2">
                        <a href={url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                          Existing {i + 1}
                        </a>
                        <button
                          type="button"
                          className="text-red-600 hover:underline"
                          onClick={() =>
                            setExistingBillUrls((prev) => prev.filter((u) => u !== url))
                          }
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  multiple
                  onChange={(e) => onBillFilesChange(e.target.files)}
                  className="mt-1 w-full text-sm"
                />
                {billFiles.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    {billFiles.length} new file(s) selected (will be compressed if images)
                  </p>
                )}
              </div>
            )}
          </div>
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
          {saving ? "Saving…" : editing ? "Update expense" : "Add expense"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {message && <p className="text-sm text-emerald-700 mb-3">{message}</p>}

      <div className="flex flex-col gap-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">All expenses</h2>
          <p className="text-sm text-slate-600">
            Total:{" "}
            <span className="font-semibold text-slate-900">
              {listCurrency === "ALL"
                ? `${formatMoney(filteredTotals.USD, "USD")} · ${formatMoney(filteredTotals.INR, "INR")}`
                : formatMoney(filteredTotals[listCurrency], listCurrency)}
            </span>
            <span className="text-slate-400 ml-1">({visibleExpenses.length})</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
          <select
            value={listCurrency}
            onChange={(e) => setListCurrency(e.target.value as LedgerCurrency | "ALL")}
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
            title="Filter by currency"
          >
            <option value="ALL">All currencies</option>
            <option value="USD">USD</option>
            <option value="INR">INR</option>
          </select>
          <select
            value={filterDoneBy}
            onChange={(e) => setFilterDoneBy(e.target.value as "ALL" | ExpenseDoneBy)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
            title="Filter by who incurred the expense"
          >
            <option value="ALL">All done by</option>
            {EXPENSE_DONE_BY.map((name) => (
              <option key={name} value={name}>
                Done by {name}
              </option>
            ))}
          </select>
          <select
            value={filterLoggedBy}
            onChange={(e) => setFilterLoggedBy(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
            title="Filter by who logged the expense"
          >
            <option value="ALL">All logged by</option>
            {loggedByOptions.map((o) => (
              <option key={o.value} value={o.value}>
                Logged by {o.label}
              </option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "ALL" | ExpenseType)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
            title="Filter by expense type"
          >
            <option value="ALL">All types</option>
            {EXPENSE_TYPES.map((t) => (
              <option key={t} value={t}>
                {EXPENSE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading…</p>
      ) : visibleExpenses.length === 0 ? (
        <p className="text-slate-500 text-sm">No expenses match these filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Done by</th>
                <th className="py-3 px-3">Bills</th>
                <th className="py-3 px-3">Logged by</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleExpenses.map((ex) => {
                const urls = expenseBillUrls(ex);
                const status = resolveStatus(ex);
                return (
                  <tr key={ex.expenseId} className="border-t border-slate-100">
                    <td className="py-3 px-3 whitespace-nowrap">{ex.expenseDate}</td>
                    <td className="py-3 px-3">
                      {normalizeExpenseTypes({
                        expenseType: ex.expenseType,
                        expenseTypes: ex.expenseTypes,
                      })
                        .map((t) => EXPENSE_TYPE_LABELS[t])
                        .join(", ")}
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {formatMoney(ex.amount, ex.currency ?? "USD")}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">{ex.doneBy ?? "—"}</td>
                    <td className="py-3 px-3">
                      {status === "no_bill" || urls.length === 0 ? (
                        <span className="text-slate-500">No bill</span>
                      ) : (
                        <span className="inline-flex flex-col gap-0.5">
                          <span className="text-xs text-slate-500">
                            {EXPENSE_BILL_STATUS_LABELS[status]}
                          </span>
                          <span className="inline-flex flex-wrap gap-2">
                            {urls.map((url, i) => (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-accent hover:underline"
                              >
                                View {urls.length > 1 ? i + 1 : ""}
                              </a>
                            ))}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600 max-w-[9rem]">
                      {ex.createdBy ? recordedByLabel(ex.createdBy, "expense") : "—"}
                    </td>
                    <td className="py-3 px-3 space-x-3 whitespace-nowrap">
                      {canModifyExpense(ex) ? (
                        <button
                          type="button"
                          onClick={() => startEdit(ex)}
                          className="text-accent hover:underline"
                        >
                          Edit
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">View only</span>
                      )}
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => void remove(ex.expenseId)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
