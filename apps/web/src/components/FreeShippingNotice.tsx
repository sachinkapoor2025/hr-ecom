"use client";

import {
  FREE_SHIPPING_MIN_SUBTOTAL_USD,
  type FreeShippingQuote,
} from "@hr-ecom/shared";
import type { DisplayCurrency } from "@/lib/currency-context";

type Props = {
  quote: FreeShippingQuote;
  formatMoney: (amount: number, currency: DisplayCurrency) => string;
  currency: DisplayCurrency;
  className?: string;
};

/** Upsell when cart is below the free-shipping threshold. */
export function FreeShippingNotice({ quote, formatMoney, currency, className = "" }: Props) {
  if (quote.qualifiesForFreeShipping) {
    return (
      <p
        className={`text-xs text-green-800 bg-green-50 border border-green-100 rounded-md px-3 py-2 ${className}`}
      >
        You qualify for free shipping on this order.
      </p>
    );
  }

  const thresholdLabel =
    currency === "USD"
      ? `$${FREE_SHIPPING_MIN_SUBTOTAL_USD}`
      : formatMoney(quote.thresholdInCurrency, currency);

  return (
    <p
      className={`text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 ${className}`}
    >
      Add products for more than {thresholdLabel} to avail free shipping. Shipping is{" "}
      {formatMoney(quote.belowThresholdFeeInCurrency, currency)} until then.
      {quote.amountAwayFromFreeShipping > 0 && (
        <>
          {" "}
          Add {formatMoney(quote.amountAwayFromFreeShipping, currency)} more to unlock it.
        </>
      )}
    </p>
  );
}
