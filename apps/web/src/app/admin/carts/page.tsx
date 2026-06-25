"use client";

import { useEffect, useMemo, useState } from "react";
import { useApiClient } from "@/lib/auth-context";

interface CartItem {
  productSlug: string;
  name: string;
  quantity: number;
  price: number;
}

interface AbandonedCart {
  userKey: string;
  sessionId?: string;
  itemCount: number;
  value: number;
  currency?: string;
  updatedAt: string;
  items: CartItem[];
  name?: string;
  email?: string;
  phone?: string;
}

function toCsv(carts: AbandonedCart[]): string {
  const header = ["name", "email", "phone", "items", "value", "currency", "lastSeen"];
  const rows = carts.map((c) => [
    c.name ?? "",
    c.email ?? "",
    c.phone ?? "",
    c.items.map((i) => `${i.quantity}x ${i.name}`).join("; "),
    c.value.toFixed(2),
    c.currency ?? "",
    c.updatedAt,
  ]);
  return [header, ...rows]
    .map((r) => r.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export default function AdminCartsPage() {
  const apiClient = useApiClient();
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient<{ carts: AbandonedCart[] }>("/admin/carts/abandoned")
      .then((d) => setCarts(d.carts))
      .catch(() => setCarts([]))
      .finally(() => setLoading(false));
  }, [apiClient]);

  const totalValue = useMemo(() => carts.reduce((sum, c) => sum + c.value, 0), [carts]);

  const downloadCsv = () => {
    const blob = new Blob([toCsv(carts)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abandoned-carts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Abandoned Carts</h1>
        {carts.length > 0 && (
          <button
            onClick={downloadCsv}
            className="bg-nav text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Export CSV
          </button>
        )}
      </div>
      <p className="text-slate-600 text-sm mb-6">
        Carts still holding items — potential sales to recover.{" "}
        {carts.length > 0 && (
          <span className="font-medium">
            {carts.length} carts ·{" "}
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: carts[0]?.currency ?? "USD",
            }).format(totalValue)}{" "}
            at risk
          </span>
        )}
      </p>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : carts.length === 0 ? (
        <p className="text-slate-600">No abandoned carts right now.</p>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {carts.map((c) => (
                <tr key={c.userKey} className="border-t align-top">
                  <td className="py-3 px-4">
                    {c.name || c.email || c.phone ? (
                      <div>
                        {c.name && <div className="font-medium">{c.name}</div>}
                        {c.email && <div className="text-xs text-slate-500">{c.email}</div>}
                        {c.phone && <div className="text-xs text-slate-500">{c.phone}</div>}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Anonymous</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <ul className="space-y-0.5">
                      {c.items.map((i) => (
                        <li key={i.productSlug} className="text-xs text-slate-600">
                          {i.quantity}× {i.name}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: c.currency ?? "USD",
                    }).format(c.value)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs">
                    {new Date(c.updatedAt).toLocaleString()}
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
