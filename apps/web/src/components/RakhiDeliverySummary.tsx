"use client";

import { RAKHI_DELIVERY_MESSAGING } from "@hr-ecom/shared";
import { RakhiDeliveryBulletList } from "@/components/RakhiDeliveryBulletList";

type Props = {
  /** Kept for call-site compatibility; dates are no longer shown. */
  datePrefix?: string;
  className?: string;
  /** Override bullets (e.g. Orange County: 3-day / 2-day only). */
  bullets?: readonly string[];
};

/**
 * Clear shipping options — free 6-day, 3-day $19, 2-day $39 (or OC expedited-only).
 * No calendar dates.
 */
export function RakhiDeliverySummary({ className = "", bullets }: Props) {
  const msg = RAKHI_DELIVERY_MESSAGING;
  const items = bullets ?? msg.shippingBullets;

  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-slate-800 ${className}`}
    >
      <p className="font-bold text-primary text-sm">{msg.headline}</p>
      <RakhiDeliveryBulletList items={items} highlightFirst className="mt-2" />
    </div>
  );
}
