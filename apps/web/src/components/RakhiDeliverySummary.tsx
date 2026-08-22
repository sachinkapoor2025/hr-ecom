"use client";

import {
  RAKHI_DELIVERY_MESSAGING,
  estimatedDeliveryRange,
  expeditedOptionPriceInCurrency,
  formatDeliveryDate,
} from "@hr-ecom/shared";
import { useCurrency } from "@/lib/currency-context";
import { RakhiDeliveryBulletList } from "@/components/RakhiDeliveryBulletList";

type Props = {
  /** e.g. "Order today →" on cart or "Estimated delivery:" on PDP */
  datePrefix?: string;
  className?: string;
};

/**
 * Single Rakhi delivery block — standard (~90%) and expedited (confirmed) kept separate.
 * Use this instead of stacking EstimatedDeliveryNote + RakhiWeekendShippingBanner.
 */
export function RakhiDeliverySummary({
  datePrefix = "Order today →",
  className = "",
}: Props) {
  const { format, displayCurrency, usdInrRate } = useCurrency();
  const msg = RAKHI_DELIVERY_MESSAGING;
  const { start, end } = estimatedDeliveryRange();
  const windowLabel = `${formatDeliveryDate(start)} – ${formatDeliveryDate(end)}`;
  const three = expeditedOptionPriceInCurrency("three_day", displayCurrency, usdInrRate);
  const two = expeditedOptionPriceInCurrency("two_day", displayCurrency, usdInrRate);

  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-slate-800 ${className}`}
    >
      <p className="font-bold text-primary">{msg.headline}</p>

      <p className="mt-2 text-xs sm:text-sm leading-snug">
        <span className="font-semibold text-primary">{datePrefix}</span>{" "}
        <span className="font-medium text-slate-900">Arrives {windowLabel}</span>
        <span className="text-slate-600"> (about 6 business days, USA)</span>
      </p>

      <div className="mt-3 rounded-md border border-emerald-100 bg-emerald-50/70 px-2.5 py-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-900">
          {msg.standardTitle}
        </p>
        <RakhiDeliveryBulletList items={msg.standardBullets} className="mt-1.5" />
      </div>

      <div className="mt-2 rounded-md border border-nav/25 bg-white/90 px-2.5 py-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
          {msg.expeditedTitle}
        </p>
        <RakhiDeliveryBulletList
          items={[
            ...msg.expeditedBullets,
            `At checkout: 3-day (${format(three, displayCurrency)}) · 2-day (${format(two, displayCurrency)})`,
          ]}
          className="mt-1.5"
        />
      </div>

      <p className="text-[11px] text-emerald-800 mt-2.5 font-medium">{msg.weekendNote}</p>
    </div>
  );
}
