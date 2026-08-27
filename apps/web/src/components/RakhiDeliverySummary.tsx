"use client";

import { RAKHI_DELIVERY_MESSAGING, USARAKHI_STANDARD_DELIVERY_DETAIL } from "@hr-ecom/shared";
import { RakhiDeliveryBulletList } from "@/components/RakhiDeliveryBulletList";
import { StandardShippingMinimumNote } from "@/components/StandardShippingMinimumNote";
import type { DisplayCurrency } from "@/lib/currency-context";

type Props = {
  /** Kept for call-site compatibility; dates are no longer shown. */
  datePrefix?: string;
  className?: string;
  /** Override bullets (e.g. Orange County standard-only). */
  bullets?: readonly string[];
  /** Optional extra note above the bullets. */
  showLastMinuteNote?: boolean;
  /** Amount to add in products for free standard shipping. */
  standardTopUpAmount?: number;
  formatMoney?: (amount: number, currency: DisplayCurrency) => string;
  currency?: DisplayCurrency;
  /** Show $25 minimum nudge on PDP / cart hints. */
  showStandardMinimumNote?: boolean;
};

/**
 * Shipping options: standard USA delivery, 5 business days, free shipping on $25.
 */
export function RakhiDeliverySummary({
  className = "",
  bullets,
  standardTopUpAmount,
  formatMoney,
  currency,
  showStandardMinimumNote = false,
}: Props) {
  const msg = RAKHI_DELIVERY_MESSAGING;
  const items = bullets ?? msg.shippingBullets;
  const showMinimum =
    showStandardMinimumNote &&
    standardTopUpAmount != null &&
    formatMoney &&
    currency;

  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-slate-800 ${className}`}
    >
      <p className="font-bold text-primary text-sm">{msg.headline}</p>
      {showMinimum ? (
        <StandardShippingMinimumNote
          topUpAmount={standardTopUpAmount}
          formatMoney={formatMoney}
          currency={currency}
          className="mt-2 border-amber-100"
          compact
        />
      ) : showStandardMinimumNote ? (
        <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
          {USARAKHI_STANDARD_DELIVERY_DETAIL}
        </p>
      ) : null}
      <RakhiDeliveryBulletList items={items} highlightFirst className="mt-2" />
    </div>
  );
}
