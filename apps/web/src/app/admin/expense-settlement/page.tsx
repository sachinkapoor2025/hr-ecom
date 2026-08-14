"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ExpensesPanel } from "@/components/admin/ExpensesPanel";
import { SettlementPanel } from "@/components/admin/SettlementPanel";
import { ReconciliationPanel } from "@/components/admin/ReconciliationPanel";

type ExpenseTab = "expense" | "settlement" | "reconciliation";

function parseTab(raw: string | null): ExpenseTab {
  if (raw === "expense" || raw === "settlement" || raw === "reconciliation") return raw;
  // Back-compat query aliases
  if (raw === "expenses") return "expense";
  if (raw === "payment-tracking" || raw === "tracking") return "settlement";
  return "expense";
}

function ExpenseSettlementHubInner() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = useMemo(() => parseTab(searchParams.get("tab")), [searchParams]);
  const [tab, setTab] = useState<ExpenseTab>(initial);

  useEffect(() => {
    setTab(initial);
  }, [initial]);

  // Admins may use Expense; Settlement / Reconciliation stay super-admin only.
  useEffect(() => {
    if (authLoading || isSuperAdmin) return;
    if (tab === "settlement" || tab === "reconciliation") {
      setTab("expense");
      router.replace("/admin/expense-settlement?tab=expense");
    }
  }, [authLoading, isSuperAdmin, tab, router]);

  if (authLoading) {
    return <p className="text-slate-500 p-6">Loading…</p>;
  }

  const tabs: { id: ExpenseTab; label: string; superOnly?: boolean }[] = [
    { id: "expense", label: "Expense" },
    { id: "settlement", label: "Settlement", superOnly: true },
    { id: "reconciliation", label: "Reconciliation", superOnly: true },
  ];

  const visibleTabs = tabs.filter((t) => !t.superOnly || isSuperAdmin);

  return (
    <div className="min-h-[50vh]">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {isSuperAdmin ? "Expense & Settlement" : "Expense"}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {isSuperAdmin
                ? "Business expenses, gateway settlements, and reconciliation — same tools, one place."
                : "Record and manage business expenses."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {visibleTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                  tab === t.id
                    ? "bg-nav text-white border-nav"
                    : "border-slate-300 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === "expense" && <ExpensesPanel />}
      {tab === "settlement" && isSuperAdmin && <SettlementPanel />}
      {tab === "reconciliation" && isSuperAdmin && <ReconciliationPanel />}
    </div>
  );
}

export default function ExpenseSettlementHubPage() {
  return (
    <Suspense fallback={<p className="text-slate-500 p-6">Loading…</p>}>
      <ExpenseSettlementHubInner />
    </Suspense>
  );
}
