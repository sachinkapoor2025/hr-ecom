"use client";

import { RAKHI_DELIVERY_MESSAGING } from "@hr-ecom/shared";
import { RakhiDeliveryBulletList } from "@/components/RakhiDeliveryBulletList";

type Props = {
  /** Kept for call-site compatibility; dates are no longer shown. */
  datePrefix?: string;
  className?: string;
};

/**
 * Clear shipping options — free 6-day, 3-day $19, 2-day $39.
 * No calendar dates.
 */
export function RakhiDeliverySummary({ className = "" }: Props) {
  const msg = RAKHI_DELIVERY_MESSAGING;

  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-slate-800 ${className}`}
    >
      <p className="font-bold text-primary text-sm">{msg.headline}</p>
      <RakhiDeliveryBulletList items={msg.shippingBullets} highlightFirst className="mt-2" />
    </div>
  );
}
