"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApiClient, useAuth } from "@/lib/auth-context";
import type { Order, RateQuote } from "@hr-ecom/shared";
import { ORDER_STATUS } from "@hr-ecom/shared";
import {
  statusLabel,
  badgeClass,
  nextStatuses,
  FULFILLMENT_STEPS,
} from "@/lib/order-status";
import {
  formatMoney,
  paymentStatusClass,
  paymentStatusLabel,
  shippingStatusLabel,
} from "@/lib/admin-utils";
import { canDownloadShippingLabel, printShippingLabel } from "@/lib/shipping-label";

type AdminOrder = Order & {
  adminNotes?: string;
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
};

export default function AdminOrderDetailPage() {
  const apiClient = useApiClient();
  const { isSuperAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [note, setNote] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [estimatedDeliveryAt, setEstimatedDeliveryAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [buyingLabel, setBuyingLabel] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [rateOptions, setRateOptions] = useState<RateQuote[]>([]);
  const [selectedRateId, setSelectedRateId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient<{ order: AdminOrder }>(`/admin/orders/${orderId}`);
      setOrder(data.order);
      setTrackingNumber(data.order.trackingNumber ?? "");
      setCarrier(data.order.carrier ?? "");
      setAdminNotes(data.order.adminNotes ?? "");
      setEstimatedDeliveryAt(data.order.estimatedDeliveryAt?.slice(0, 10) ?? "");
      setSelectedRateId(data.order.shippingRateId ?? "");
      const next = nextStatuses(data.order.status);
      setNewStatus(next[0] ?? data.order.status);
    } catch {
      setError("Could not load order.");
    } finally {
      setLoading(false);
    }
  }, [apiClient, orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const shippingFieldsRelevant =
        newStatus === ORDER_STATUS.PROCESSING ||
        newStatus === ORDER_STATUS.SHIPPED ||
        order?.status === ORDER_STATUS.PROCESSING ||
        order?.status === ORDER_STATUS.SHIPPED;

      const payload: Record<string, string | undefined> = {
        note: note || undefined,
        adminNotes,
      };

      if (shippingFieldsRelevant) {
        payload.trackingNumber = trackingNumber || undefined;
        payload.carrier = carrier || undefined;
        payload.estimatedDeliveryAt = estimatedDeliveryAt
          ? new Date(estimatedDeliveryAt).toISOString()
          : undefined;
      }

      const allowed = order ? nextStatuses(order.status) : [];
      if (allowed.length > 0 && newStatus) {
        payload.status = newStatus;
      }
      const data = await apiClient<{ order: AdminOrder }>(`/admin/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setOrder(data.order);
      setNote("");
      setMessage("Order updated.");
      const next = nextStatuses(data.order.status);
      setNewStatus(next[0] ?? data.order.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const quickStatus = async (status: string) => {
    setSaving(true);
    setError("");
    try {
      const data = await apiClient<{ order: AdminOrder }>(`/admin/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status, note: `Status changed to ${statusLabel(status)}` }),
      });
      setOrder(data.order);
      setMessage(`Order marked as ${statusLabel(status)}.`);
      const next = nextStatuses(data.order.status);
      setNewStatus(next[0] ?? data.order.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Permanently delete order ${orderId}? This removes the record from the database and cannot be undone.`
      )
    ) {
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await apiClient(`/admin/orders/${orderId}`, { method: "DELETE" });
      router.push("/admin/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      setDeleting(false);
    }
  };

  const printInvoice = () => window.print();

  const loadRates = async () => {
    setLoadingRates(true);
    setError("");
    try {
      const data = await apiClient<{ rates: RateQuote[] }>(`/admin/orders/${orderId}/rates`, {
        method: "POST",
      });
      setRateOptions(data.rates);
      if (data.rates.length) {
        const current = order?.shippingRateId;
        const match = current ? data.rates.find((r) => r.rateId === current) : undefined;
        setSelectedRateId(match?.rateId ?? data.rates[0].rateId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load rates.");
    } finally {
      setLoadingRates(false);
    }
  };

  const saveShippingService = async () => {
    const rate = rateOptions.find((r) => r.rateId === selectedRateId);
    if (!rate) {
      setError("Select a shipping service.");
      return;
    }
    setSavingService(true);
    setError("");
    try {
      const data = await apiClient<{ order: AdminOrder }>(`/admin/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({
          shippingServiceCode: rate.mailClass,
          shippingServiceName: rate.serviceName,
          shippingRateId: rate.rateId,
          estimatedLabelCost: rate.price,
        }),
      });
      setOrder(data.order);
      setMessage("Shipping service updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save shipping service.");
    } finally {
      setSavingService(false);
    }
  };

  const buyUspsLabel = async () => {
    setBuyingLabel(true);
    setError("");
    setMessage("");
    try {
      const data = await apiClient<{ order: AdminOrder }>(`/admin/orders/${orderId}/buy-label`, {
        method: "POST",
      });
      setOrder(data.order);
      setTrackingNumber(data.order.trackingNumber ?? "");
      setCarrier(data.order.carrier ?? "");
      setMessage("USPS label purchased.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Label purchase failed.");
      await load();
    } finally {
      setBuyingLabel(false);
    }
  };

  const labelStatusLabel = (status?: string) => {
    switch (status) {
      case "purchased":
        return "Purchased";
      case "failed":
        return "Failed";
      case "queued":
        return "Queued";
      default:
        return "None";
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10 text-slate-500">Loading…</div>;
  if (!order) return <div className="max-w-4xl mx-auto px-4 py-10 text-red-600">{error || "Order not found."}</div>;

  const currentStepIndex = FULFILLMENT_STEPS.indexOf(order.status as (typeof FULFILLMENT_STEPS)[number]);
  const transitions = nextStatuses(order.status);
  const addr = order.shippingAddress;
  const showShippingFields =
    newStatus === ORDER_STATUS.PROCESSING ||
    newStatus === ORDER_STATUS.SHIPPED ||
    (transitions.length === 0 &&
      (order.status === ORDER_STATUS.PROCESSING || order.status === ORDER_STATUS.SHIPPED));
  const isAcceptOnly = newStatus === ORDER_STATUS.ACCEPTED;
  const canBuyLabel =
    (order.status === ORDER_STATUS.PAID ||
      order.status === ORDER_STATUS.ACCEPTED ||
      order.status === ORDER_STATUS.PROCESSING) &&
    order.labelStatus !== "purchased";
  const labelMargin =
    order.labelCost != null ? order.shipping - order.labelCost : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/admin/orders" className="text-sm text-nav hover:underline">
        ← Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderId}</h1>
          <p className="text-sm text-slate-500">
            Placed {new Date(order.createdAt).toLocaleString()} · Updated{" "}
            {new Date(order.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeClass(order.status)}`}>
            {statusLabel(order.status)}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusClass(order.status)}`}
          >
            {paymentStatusLabel(order.status)}
          </span>
          <button
            type="button"
            onClick={printInvoice}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 print:hidden"
          >
            Download invoice
          </button>
          {canDownloadShippingLabel(order.status) && (
            <button
              type="button"
              onClick={() => printShippingLabel(order)}
              className="text-sm border border-nav text-nav rounded-lg px-3 py-1.5 hover:bg-blue-50 print:hidden font-medium"
            >
              Download shipping label
            </button>
          )}
          {order.status === ORDER_STATUS.PENDING_PAYMENT && (
            <Link
              href={`/checkout?orderId=${order.orderId}`}
              className="text-sm bg-amber-600 text-white rounded-lg px-3 py-1.5 print:hidden"
            >
              Retry payment
            </Link>
          )}
          {isSuperAdmin && (
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="text-sm bg-red-600 text-white rounded-lg px-3 py-1.5 print:hidden disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete order"}
            </button>
          )}
        </div>
      </div>

      <div id="invoice-print" className="hidden print:block mb-8">
        <h2 className="text-xl font-bold">Invoice — {order.orderId}</h2>
        <p className="text-sm">{addr.name} · {addr.email}</p>
        <p className="text-sm mt-4 font-bold">Total: {formatMoney(order.total, order.currency)}</p>
      </div>

      {/* Fulfillment stepper */}
      {order.status !== ORDER_STATUS.CANCELLED && order.status !== ORDER_STATUS.REFUNDED && (
        <div className="flex items-center mb-8">
          {FULFILLMENT_STEPS.map((step, i) => {
            const done = i <= currentStepIndex && currentStepIndex >= 0;
            return (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      done ? "bg-nav text-white" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[11px] mt-1 text-slate-500 text-center w-20">
                    {statusLabel(step)}
                  </span>
                </div>
                {i < FULFILLMENT_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i < currentStepIndex ? "bg-nav" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items + totals */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-3">Items</h2>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.productSlug} className="flex items-center gap-3 py-3">
                  {item.image ? (
                    <Link
                      href={`/products/${item.productSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-0 hover:z-30 shrink-0 group"
                      title={`View ${item.name} on storefront`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover border border-slate-200 bg-slate-50 transition-transform duration-200 ease-out group-hover:scale-[3.2] group-hover:shadow-xl group-hover:border-nav origin-left"
                      />
                    </Link>
                  ) : (
                    <Link
                      href={`/products/${item.productSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded border border-dashed border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center text-[10px] text-slate-400"
                      title={`View ${item.name} on storefront`}
                    >
                      View
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.productSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-nav hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm shrink-0">
                    {formatMoney(item.price * item.quantity, order.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t mt-3 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span>{formatMoney(order.shipping, order.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Total ({order.currency})</span>
                <span>{formatMoney(order.total, order.currency)}</span>
              </div>
            </div>
          </section>

          {/* Status history */}
          <section className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-3">Status history</h2>
            {order.statusHistory?.length ? (
              <ol className="relative border-l border-slate-200 ml-2">
                {[...order.statusHistory].reverse().map((h, i) => (
                  <li key={i} className="ml-4 pb-4 last:pb-0">
                    <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-nav" />
                    <p className="text-sm font-medium">{statusLabel(h.status)}</p>
                    <p className="text-xs text-slate-400">{new Date(h.at).toLocaleString()}</p>
                    {h.note && <p className="text-xs text-slate-500 mt-0.5">{h.note}</p>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-500">No history yet.</p>
            )}
          </section>
        </div>

        {/* Sidebar: customer + update */}
        <div className="space-y-6">
          <section className="bg-white border rounded-xl p-5 text-sm">
            <h2 className="font-semibold mb-3">Customer</h2>
            {addr.senderName && (
              <p className="text-xs text-slate-500 mb-1">
                Gift from: <span className="font-semibold text-slate-800">{addr.senderName}</span>
              </p>
            )}
            {addr.senderMessage && (
              <p className="text-xs text-slate-600 italic mb-2 border-l-2 border-amber-300 pl-2 leading-relaxed">
                “{addr.senderMessage}”
              </p>
            )}
            <p className="font-medium">{addr.name}</p>
            <p className="text-slate-500">{addr.email}</p>
            {addr.phone && <p className="text-slate-500">{addr.phone}</p>}
            <div className="mt-3 text-slate-600">
              <p>{addr.line1}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>
                {addr.city}, {addr.state} {addr.postalCode}
              </p>
              <p>{addr.country}</p>
            </div>
          </section>

          <section className="bg-white border rounded-xl p-5 text-sm">
            <h2 className="font-semibold mb-3">Payment & shipping</h2>
            <p className="text-slate-600 capitalize">Method: {order.paymentProvider ?? "—"}</p>
            <p className="text-slate-600 mt-1">Shipping: {shippingStatusLabel(order.status)}</p>
            {(order.shippingServiceName || order.shippingServiceCode) && (
              <p className="text-slate-600 mt-1">
                USPS service: {order.shippingServiceName ?? order.shippingServiceCode}
                {order.shippingServiceCode && order.shippingServiceName ? (
                  <span className="text-slate-400"> ({order.shippingServiceCode})</span>
                ) : null}
              </p>
            )}
            {order.estimatedLabelCost != null && (
              <p className="text-slate-600 mt-1">
                Est. label cost: {formatMoney(order.estimatedLabelCost, order.currency)}
              </p>
            )}
            {order.labelCost != null && (
              <p className="text-slate-600 mt-1">
                Label cost: {formatMoney(order.labelCost, order.currency)}
              </p>
            )}
            {order.labelStatus && (
              <p className="text-slate-600 mt-1">
                Label status:{" "}
                <span
                  className={
                    order.labelStatus === "failed"
                      ? "text-red-700 font-medium"
                      : order.labelStatus === "purchased"
                        ? "text-green-700 font-medium"
                        : ""
                  }
                >
                  {labelStatusLabel(order.labelStatus)}
                </span>
              </p>
            )}
            {order.labelError && (
              <p className="text-red-600 text-xs mt-1">Label error: {order.labelError}</p>
            )}
            {labelMargin != null && (
              <p className="text-xs text-slate-500 mt-2 border-t pt-2">
                Customer shipping charged {formatMoney(order.shipping, order.currency)} vs label{" "}
                {formatMoney(order.labelCost!, order.currency)}
                {labelMargin >= 0 ? (
                  <span className="text-green-700"> · margin {formatMoney(labelMargin, order.currency)}</span>
                ) : (
                  <span className="text-red-700">
                    {" "}
                    · loss {formatMoney(Math.abs(labelMargin), order.currency)}
                  </span>
                )}
              </p>
            )}
            {order.labelPdfUrl && (
              <a
                href={order.labelPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-nav hover:underline text-sm font-medium"
              >
                View USPS label PDF
              </a>
            )}
            {canBuyLabel && (
              <button
                type="button"
                disabled={buyingLabel}
                onClick={() => void buyUspsLabel()}
                className="mt-3 w-full bg-nav text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {buyingLabel ? "Purchasing label…" : "Buy USPS label"}
              </button>
            )}
            {order.trackingNumber && (
              <p className="text-slate-600 mt-1">
                Tracking: {order.trackingNumber}
                {order.carrier ? ` (${order.carrier})` : ""}
              </p>
            )}
            {order.estimatedDeliveryAt && (
              <p className="text-slate-600 mt-1">
                Est. delivery: {new Date(order.estimatedDeliveryAt).toLocaleDateString()}
              </p>
            )}
            {order.deliveredAt && (
              <p className="text-slate-600 mt-1">
                Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-2">
              Invoice: {order.status === ORDER_STATUS.PENDING_PAYMENT ? "Pending payment" : "Generated"}
            </p>
            {order.razorpayPaymentId && (
              <p className="text-xs text-slate-400 break-all mt-1">RZP: {order.razorpayPaymentId}</p>
            )}
            {order.paymentIntentId && (
              <p className="text-xs text-slate-400 break-all mt-1">PI: {order.paymentIntentId}</p>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">USPS service override</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  type="button"
                  disabled={loadingRates}
                  onClick={() => void loadRates()}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 hover:bg-slate-50 disabled:opacity-50"
                >
                  {loadingRates ? "Loading rates…" : "Load rates"}
                </button>
              </div>
              {rateOptions.length > 0 && (
                <>
                  <select
                    value={selectedRateId}
                    onChange={(e) => setSelectedRateId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm mb-2"
                  >
                    {rateOptions.map((r) => (
                      <option key={r.rateId} value={r.rateId}>
                        {r.serviceName} — {formatMoney(r.price, order.currency)}
                        {r.estimatedDeliveryDate
                          ? ` · by ${new Date(r.estimatedDeliveryDate).toLocaleDateString()}`
                          : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={savingService || !selectedRateId}
                    onClick={() => void saveShippingService()}
                    className="w-full border border-nav text-nav py-1.5 rounded-lg text-xs font-medium hover:bg-blue-50 disabled:opacity-50"
                  >
                    {savingService ? "Saving…" : "Save shipping service"}
                  </button>
                </>
              )}
            </div>
          </section>

          <section className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-3">Admin notes</h2>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
              placeholder="Internal remarks (not visible to customer)"
            />
          </section>

          <section className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-3">Update order</h2>
            {(transitions.includes(ORDER_STATUS.CANCELLED) ||
              transitions.includes(ORDER_STATUS.REFUNDED)) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {transitions.includes(ORDER_STATUS.CANCELLED) && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => quickStatus(ORDER_STATUS.CANCELLED)}
                    className="text-xs border border-red-200 text-red-700 px-2 py-1 rounded"
                  >
                    Cancel order
                  </button>
                )}
                {transitions.includes(ORDER_STATUS.REFUNDED) && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => quickStatus(ORDER_STATUS.REFUNDED)}
                    className="text-xs border border-purple-200 text-purple-700 px-2 py-1 rounded"
                  >
                    Mark refunded
                  </button>
                )}
              </div>
            )}
            {transitions.length === 0 ? (
              <p className="text-sm text-slate-500">
                This order is in a final state.
                {showShippingFields
                  ? " You can still update tracking and notes."
                  : " You can still update notes."}
              </p>
            ) : null}
            <form onSubmit={handleUpdate} className="space-y-3">
              {transitions.length > 0 && (
                <label className="block text-xs font-medium text-slate-500">
                  New status
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                  >
                    {transitions.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {isAcceptOnly && (
                <p className="text-xs text-slate-500">
                  Accept confirms the order for fulfillment. Add tracking when you move it to Processing or Shipped.
                </p>
              )}

              {showShippingFields && (
                <>
                  <label className="block text-xs font-medium text-slate-500">
                    Expected delivery date
                    <input
                      type="date"
                      value={estimatedDeliveryAt}
                      onChange={(e) => setEstimatedDeliveryAt(e.target.value)}
                      className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                    />
                  </label>

                  <label className="block text-xs font-medium text-slate-500">
                    Tracking number
                    <input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                      placeholder="e.g. 1Z999…"
                    />
                  </label>

                  <label className="block text-xs font-medium text-slate-500">
                    Carrier
                    <input
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                      placeholder="e.g. FedEx, DHL"
                    />
                  </label>
                </>
              )}

              <label className="block text-xs font-medium text-slate-500">
                Status note (optional)
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-nav text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {saving
                  ? "Saving…"
                  : isAcceptOnly
                    ? "Accept order"
                    : "Save update"}
              </button>
            </form>
            {message && <p className="text-green-600 text-xs mt-2">{message}</p>}
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
