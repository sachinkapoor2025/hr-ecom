"use client";

import { USARAKHI_STANDARD_DELIVERY_DETAIL } from "@hr-ecom/shared";
import type { DisplayCurrency } from "@/lib/currency-context";

type Props = {
  /** Amount still needed in product value for free standard shipping (0 = already free). */
  topUpAmount: number;
  formatMoney: (amount: number, currency: DisplayCurrency) => string;
  currency: DisplayCurrency;
  className?: string;
  compact?: boolean;
};

/**
 * UsaRakhi standard shipping: $25 minimum + “add $X more for free shipping” nudge.
 */
export function StandardShippingMinimumNote({
  topUpAmount,
  formatMoney,
  currency,
  className = "",
  compact = false,
}: Props) {
  return (
    <div
      className={`rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm leading-snug ${className}`}
    >
      <p className={`font-semibold text-primary ${compact ? "text-xs sm:text-sm" : ""}`}>
        {USARAKHI_STANDARD_DELIVERY_DETAIL}
      </p>
      {topUpAmount > 0 ? (
        <p className={`mt-1.5 font-semibold text-emerald-800 ${compact ? "text-xs sm:text-sm" : ""}`}>
          Add {formatMoney(topUpAmount, currency)} more in products to get free standard shipping.
        </p>
      ) : (
        <p className={`mt-1.5 font-semibold text-emerald-700 ${compact ? "text-xs sm:text-sm" : ""}`}>
          You qualify for free standard shipping on this order.
        </p>
      )}
      <p className="mt-1 text-xs text-slate-600">Delivery in 5 business days · ships after Aug 28.</p>
    </div>
  );
}
