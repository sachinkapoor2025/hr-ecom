"use client";

import { USARAKHI_MIN_ORDER_USD, USARAKHI_STANDARD_DELIVERY_DETAIL } from "@hr-ecom/shared";
import type { DisplayCurrency } from "@/lib/currency-context";

type Props = {
  /** Amount still needed in UsaRakhi product value for free standard shipping (0 = already free). */
  topUpAmount: number;
  formatMoney: (amount: number, currency: DisplayCurrency) => string;
  currency: DisplayCurrency;
  className?: string;
  compact?: boolean;
  /** Cart mixes UsaRakhi + Orange County (or other vendors). */
  multiVendor?: boolean;
};

/**
 * UsaRakhi standard shipping: $25 minimum + “add $X more for free shipping” nudge.
 * Orange County merchandise never counts toward the UsaRakhi minimum.
 */
export function StandardShippingMinimumNote({
  topUpAmount,
  formatMoney,
  currency,
  className = "",
  compact = false,
  multiVendor = false,
}: Props) {
  return (
    <div
      className={`rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm leading-snug ${className}`}
    >
      {multiVendor ? (
        <p
          className={`mb-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 font-semibold text-amber-950 ${
            compact ? "text-xs sm:text-sm" : "text-sm"
          }`}
        >
          You selected products from different vendors — shipping is calculated separately for
          each. The ${USARAKHI_MIN_ORDER_USD} minimum (and free standard shipping) applies only to
          UsaRakhi items; Orange County products do not count toward that minimum.
        </p>
      ) : null}
      <p className={`font-semibold text-primary ${compact ? "text-xs sm:text-sm" : ""}`}>
        {USARAKHI_STANDARD_DELIVERY_DETAIL}
      </p>
      {topUpAmount > 0 ? (
        <p className={`mt-1.5 font-semibold text-emerald-800 ${compact ? "text-xs sm:text-sm" : ""}`}>
          Add {formatMoney(topUpAmount, currency)} more in UsaRakhi products to get free standard
          shipping.
        </p>
      ) : (
        <p className={`mt-1.5 font-semibold text-emerald-700 ${compact ? "text-xs sm:text-sm" : ""}`}>
          Your UsaRakhi items qualify for free standard shipping.
        </p>
      )}
      <p className="mt-1 text-xs text-slate-600">Delivery in 5 business days · ships after Aug 28.</p>
    </div>
  );
}
