"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Order, ReviewRequestSettings } from "@hr-ecom/shared";
import {
  buildReviewRequestWhatsAppDraft,
  buildWhatsAppDeepLink,
  defaultReviewRequestSettings,
  formatWhatsAppDisplayNumber,
  whatsappDigitsForOrderPhone,
} from "@hr-ecom/shared";
import { useApiClient } from "@/lib/auth-context";

export function ReviewWhatsAppManualSend({
  order,
  statusBadge,
}: {
  order: Order;
  statusBadge: ReactNode;
}) {
  const api = useApiClient();
  const [draft, setDraft] = useState("");
  const [ready, setReady] = useState(false);

  const phoneRaw = order.shippingAddress?.phone?.trim() ?? "";
  const digits = whatsappDigitsForOrderPhone(phoneRaw, order.shippingAddress?.country);
  const displayNumber = digits
    ? formatWhatsAppDisplayNumber(digits)
    : phoneRaw || "Not saved on this order";

  useEffect(() => {
    let cancelled = false;
    void api<{ settings: ReviewRequestSettings }>("/admin/review-request/settings")
      .then((res) => {
        if (cancelled) return;
        setDraft(buildReviewRequestWhatsAppDraft(order, res.settings));
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setDraft(buildReviewRequestWhatsAppDraft(order, defaultReviewRequestSettings));
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [api, order.orderId, order.orderNumber, order.status, order.shippingAddress?.name]);

  const openWhatsApp = () => {
    if (!digits || !draft.trim()) return;
    window.open(buildWhatsAppDeepLink(digits, draft.trim()), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-lg border border-slate-100 p-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="font-medium">WhatsApp Review Request</p>
        <div className="flex items-center gap-2">
          {statusBadge}
          <button
            type="button"
            disabled={!digits || !ready || !draft.trim()}
            onClick={openWhatsApp}
            className="text-sm rounded-lg bg-nav text-white px-3 py-1.5 hover:opacity-90 disabled:opacity-50"
          >
            Send WhatsApp
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-600 mt-2">
        Customer WhatsApp: <span className="font-medium text-slate-800">{displayNumber}</span>
        {phoneRaw && digits && phoneRaw.replace(/\D/g, "") !== digits ? (
          <span className="text-slate-500"> ({phoneRaw})</span>
        ) : null}
      </p>
      <p className="text-xs text-slate-500 mt-1">
        Opens WhatsApp with this customer&apos;s order phone. Edit the message if needed, then click
        Send inside WhatsApp. This does not use Twilio.
      </p>
      <label className="block text-xs font-medium text-slate-600 mt-3">
        Message (editable)
        <textarea
          className="mt-1 w-full border rounded-lg px-3 py-2 min-h-[140px] font-mono text-xs text-slate-800"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!ready}
        />
      </label>
      {!digits && (
        <p className="text-red-600 text-xs mt-2">
          No valid WhatsApp number on this order. The Send WhatsApp button stays disabled.
        </p>
      )}
    </div>
  );
}
