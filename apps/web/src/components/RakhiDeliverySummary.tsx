"use client";

import { RAKHI_DELIVERY_MESSAGING } from "@hr-ecom/shared";
import { RakhiDeliveryBulletList } from "@/components/RakhiDeliveryBulletList";

type Props = {
  /** Kept for call-site compatibility; dates are no longer shown. */
  datePrefix?: string;
  className?: string;
  /** Override bullets (e.g. Orange County: guarantee + 3-day / 2-day). */
  bullets?: readonly string[];
  /** Hide the last-minute guarantee line when bullets already include it. */
  showLastMinuteNote?: boolean;
};

/**
 * Shipping options + last-minute Rakhi delivery guarantee.
 */
export function RakhiDeliverySummary({
  className = "",
  bullets,
  showLastMinuteNote = true,
}: Props) {
  const msg = RAKHI_DELIVERY_MESSAGING;
  const items = bullets ?? msg.shippingBullets;
  const noteAlreadyInBullets = items.some((item) =>
    item.toLowerCase().includes("guaranteed delivery by rakhi")
  );
  const showNote = showLastMinuteNote && !noteAlreadyInBullets;

  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-slate-800 ${className}`}
    >
      <p className="font-bold text-primary text-sm">{msg.headline}</p>
      {showNote ? (
        <p className="mt-1.5 text-sm font-semibold text-slate-900 leading-snug">
          {msg.lastMinuteNote}
        </p>
      ) : null}
      <RakhiDeliveryBulletList items={items} highlightFirst className="mt-2" />
    </div>
  );
}
