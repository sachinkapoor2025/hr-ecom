"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useSessionId } from "@/lib/session";
import { useAuth } from "@/lib/auth-context";
import type { Order } from "@hr-ecom/shared";

function OrderDetailInner({ orderId }: { orderId: string }) {
  const searchParams = useSearchParams();
  const sessionId = useSessionId();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const isDev = searchParams.get("dev") === "1";
  const redirectStatus = searchParams.get("redirect_status");

  useEffect(() => {
    if (!sessionId) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api<{ order: Order }>(`/orders/${orderId}`, { sessionId, token });
        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load order");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [orderId, sessionId, token]);

  if (loading) {
    return <div className="max-w-lg mx-auto px-4 py-16 text-center text-slate-600">Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-primary mb-3">Order</h1>
        <p className="text-slate-600 mb-6">{error || "Order not found."}</p>
        <Link href="/products" className="text-nav font-semibold hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const paid = order.status === "paid" || redirectStatus === "succeeded" || isDev;
  const statusLabel = paid ? "Order confirmed" : order.status === "pending_payment" ? "Awaiting payment" : order.status;

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className={`text-3xl font-bold mb-2 ${paid ? "text-green-600" : "text-primary"}`}>{statusLabel}</h1>
      <p className="text-slate-600 mb-6">
        {paid
          ? "Thank you for your purchase. You will receive a confirmation email shortly."
          : "Complete payment to confirm your order."}
      </p>

      <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Order ID</span>
          <span className="font-mono text-xs">{order.orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Status</span>
          <span className="font-semibold capitalize">{order.status.replace(/_/g, " ")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Total</span>
          <span className="font-bold text-nav">
            {new Intl.NumberFormat(undefined, { style: "currency", currency: order.currency }).format(order.total)}
          </span>
        </div>
        <ul className="border-t border-slate-100 pt-3 space-y-2">
          {order.items.map((item) => (
            <li key={item.productSlug} className="flex justify-between gap-4">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>
                {new Intl.NumberFormat(undefined, { style: "currency", currency: item.currency }).format(
                  item.price * item.quantity
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Link href="/products" className="mt-8 inline-block text-nav font-semibold hover:underline">
        Continue shopping →
      </Link>
    </div>
  );
}

export default function OrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    void params.then((p) => setOrderId(p.orderId));
  }, [params]);

  if (!orderId) {
    return <div className="max-w-lg mx-auto px-4 py-16 text-center text-slate-600">Loading...</div>;
  }

  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-16 text-center">Loading...</div>}>
      <OrderDetailInner orderId={orderId} />
    </Suspense>
  );
}
