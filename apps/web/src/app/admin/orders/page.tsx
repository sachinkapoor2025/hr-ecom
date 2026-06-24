"use client";

import { useEffect, useState } from "react";
import { useApiClient } from "@/lib/auth-context";

interface Order {
  orderId: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  shippingAddress: { name: string; email: string };
}

export default function AdminOrdersPage() {
  const apiClient = useApiClient();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    apiClient<{ orders: Order[] }>("/admin/orders")
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]));
  }, [apiClient]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {orders.length === 0 ? (
        <p className="text-slate-600">No orders yet.</p>
      ) : (
        <table className="w-full text-sm bg-white rounded-lg overflow-hidden border">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.orderId} className="border-t">
                <td className="py-3 px-4 font-mono text-xs">{o.orderId.slice(0, 8)}...</td>
                <td className="py-3 px-4">{o.shippingAddress?.name ?? "—"}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-slate-100">{o.status}</span>
                </td>
                <td className="py-3 px-4">
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: o.currency,
                  }).format(o.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
