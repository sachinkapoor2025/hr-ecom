"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiClient } from "@/lib/auth-context";
import { ORDER_STATUS } from "@hr-ecom/shared";
import { statusLabel, badgeClass } from "@/lib/order-status";

interface Order {
  orderId: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  trackingNumber?: string;
  shippingAddress: { name: string; email: string };
}

const STATUS_TABS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: ORDER_STATUS.PENDING_PAYMENT, label: "Pending" },
  { id: ORDER_STATUS.PAID, label: "Paid" },
  { id: ORDER_STATUS.PROCESSING, label: "Processing" },
  { id: ORDER_STATUS.SHIPPED, label: "Shipped" },
  { id: ORDER_STATUS.DELIVERED, label: "Delivered" },
  { id: ORDER_STATUS.CANCELLED, label: "Cancelled" },
  { id: ORDER_STATUS.REFUNDED, label: "Refunded" },
];

export default function AdminOrdersPage() {
  const apiClient = useApiClient();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    apiClient<{ orders: Order[] }>("/admin/orders")
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [apiClient]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length };
    for (const o of orders) map[o.status] = (map[o.status] ?? 0) + 1;
    return map;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab !== "all" && o.status !== tab) return false;
      if (!q) return true;
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.shippingAddress?.name?.toLowerCase().includes(q) ||
        o.shippingAddress?.email?.toLowerCase().includes(q)
      );
    });
  }, [orders, tab, search]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              tab === t.id
                ? "bg-nav text-white border-nav"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            {t.label}
            {counts[t.id] ? <span className="ml-1.5 opacity-70">({counts[t.id]})</span> : null}
          </button>
        ))}
      </div>

      <input
        type="search"
        placeholder="Search by order id, customer name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 border border-slate-300 rounded-lg px-3 py-2 text-sm"
      />

      {loading ? (
        <p className="text-slate-500">Loading orders…</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-600">No orders found.</p>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.orderId}
                  onClick={() => router.push(`/admin/orders/${o.orderId}`)}
                  className="border-t hover:bg-blue-50/50 cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono text-xs text-nav">{o.orderId.slice(0, 8)}…</td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div>{o.shippingAddress?.name ?? "—"}</div>
                    <div className="text-xs text-slate-400">{o.shippingAddress?.email ?? ""}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(o.status)}`}>
                      {statusLabel(o.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: o.currency,
                    }).format(o.total)}
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
