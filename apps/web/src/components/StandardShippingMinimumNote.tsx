"use client";

import { USARAKHI_MIN_ORDER_USD, USARAKHI_STANDARD_DELIVERY_DETAIL } from "@hr-ecom/shared";
import type { DisplayCurrency } from "@/lib/currency-context";

type Props = {
  /** Amount still needed for free standard shipping (0 = already free). */
  topUpAmount: number;
  formatMoney: (amount: number, currency: DisplayCurrency) => string;
  currency: DisplayCurrency;
  className?: string;
  compact?: boolean;
  /** Cart mixes UsaRakhi + Orange County (or other vendors). */
  multiVendor?: boolean;
};

/**
 * Standard shipping: $25 minimum per vendor + “add $X more for free shipping” nudge.
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
          each. UsaRakhi and Orange County each need a ${USARAKHI_MIN_ORDER_USD} minimum. If either
          is below ${USARAKHI_MIN_ORDER_USD}, the remaining amount is added as shipping for that
          vendor.
        </p>
      ) : null}
      <p className={`font-semibold text-primary ${compact ? "text-xs sm:text-sm" : ""}`}>
        {USARAKHI_STANDARD_DELIVERY_DETAIL}
      </p>
      {topUpAmount > 0 ? (
        <p className={`mt-1.5 font-semibold text-emerald-800 ${compact ? "text-xs sm:text-sm" : ""}`}>
          {multiVendor
            ? `Shipping of ${formatMoney(topUpAmount, currency)} will be added unless you add more products so each vendor reaches $${USARAKHI_MIN_ORDER_USD}.`
            : `Add ${formatMoney(topUpAmount, currency)} more in products to get free standard shipping.`}
        </p>
      ) : (
        <p className={`mt-1.5 font-semibold text-emerald-700 ${compact ? "text-xs sm:text-sm" : ""}`}>
          {multiVendor
            ? "Both vendors qualify for free standard shipping."
            : "Your order qualifies for free standard shipping."}
        </p>
      )}
      <p className="mt-1 text-xs text-slate-600">Delivery in 5 business days.</p>
    </div>
  );
}
