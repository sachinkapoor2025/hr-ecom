"use client";

import {
  FREE_SHIPPING_MIN_SUBTOTAL_USD,
  REDUCED_SHIPPING_MIN_SUBTOTAL_USD,
  type FreeShippingQuote,
} from "@hr-ecom/shared";
import type { DisplayCurrency } from "@/lib/currency-context";

type Props = {
  quote: FreeShippingQuote;
  formatMoney: (amount: number, currency: DisplayCurrency) => string;
  currency: DisplayCurrency;
  className?: string;
};

function moneyLabel(
  usdAmount: number,
  amountInCurrency: number,
  currency: DisplayCurrency,
  formatMoney: Props["formatMoney"]
): string {
  return currency === "USD" ? `$${usdAmount}` : formatMoney(amountInCurrency, currency);
}

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

  const freeLabel = moneyLabel(
    FREE_SHIPPING_MIN_SUBTOTAL_USD,
    quote.thresholdInCurrency,
    currency,
    formatMoney
  );
  const reducedLabel = moneyLabel(
    REDUCED_SHIPPING_MIN_SUBTOTAL_USD,
    quote.reducedThresholdInCurrency,
    currency,
    formatMoney
  );
  const lowFee = formatMoney(quote.lowTierFeeInCurrency, currency);
  const midFee = formatMoney(quote.midTierFeeInCurrency, currency);

  if (quote.tier === "mid") {
    return (
      <p
        className={`text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 ${className}`}
      >
        Shipping is {midFee}. Add {formatMoney(quote.amountAwayFromFreeShipping, currency)} more
        to unlock free shipping ({freeLabel}+).
      </p>
    );
  }

  // Under $7 — $6.99 now; next step is $2.99 at $7, then free at $10.99
  return (
    <p
      className={`text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 ${className}`}
    >
      Shipping is {lowFee}. Add {formatMoney(quote.amountAwayFromReducedShipping, currency)} more
      for {midFee} shipping ({reducedLabel}+), or{" "}
      {formatMoney(quote.amountAwayFromFreeShipping, currency)} more for free shipping ({freeLabel}
      +).
    </p>
  );
}
