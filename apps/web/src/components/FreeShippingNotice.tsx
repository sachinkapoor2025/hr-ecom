"use client";

import {
  BELOW_THRESHOLD_SHIPPING_USD,
  FREE_SHIPPING_ABOVE_USD,
  FREE_SHIPPING_MIN_SUBTOTAL_USD,
  REDUCED_SHIPPING_MIN_SUBTOTAL_USD,
  REDUCED_SHIPPING_USD,
  type FreeShippingQuote,
  type FreeShippingTier,
} from "@hr-ecom/shared";
import type { DisplayCurrency } from "@/lib/currency-context";

type FormatMoney = (amount: number, currency: DisplayCurrency) => string;

type Props = {
  quote: FreeShippingQuote;
  formatMoney: FormatMoney;
  currency: DisplayCurrency;
  className?: string;
  /** Extra note under the table (e.g. multi-address / multi-seller). */
  footnote?: string;
};

function usdOrLocal(
  usdAmount: number,
  amountInCurrency: number,
  currency: DisplayCurrency,
  formatMoney: FormatMoney
): string {
  return currency === "USD" ? `$${usdAmount.toFixed(2)}` : formatMoney(amountInCurrency, currency);
}

function orderRangeLabel(
  currency: DisplayCurrency,
  formatMoney: FormatMoney,
  quote: FreeShippingQuote,
  tier: FreeShippingTier
): string {
  const midMin = usdOrLocal(
    REDUCED_SHIPPING_MIN_SUBTOTAL_USD,
    quote.reducedThresholdInCurrency,
    currency,
    formatMoney
  );
  const above = usdOrLocal(
    FREE_SHIPPING_ABOVE_USD,
    quote.aboveAmountInCurrency,
    currency,
    formatMoney
  );
  const midMaxUsd = FREE_SHIPPING_ABOVE_USD;
  const midMax =
    currency === "USD"
      ? `$${midMaxUsd.toFixed(2)}`
      : formatMoney(
          Math.round((quote.thresholdInCurrency / FREE_SHIPPING_MIN_SUBTOTAL_USD) * midMaxUsd),
          currency
        );

  if (tier === "low") {
    return currency === "USD" ? "$1.00 – $9.99" : `Under ${midMin}`;
  }
  if (tier === "mid") return `${midMin} – ${midMax}`;
  return `Above ${above}`;
}

function feeLabel(
  currency: DisplayCurrency,
  formatMoney: FormatMoney,
  quote: FreeShippingQuote,
  tier: FreeShippingTier
): string {
  if (tier === "free") return "FREE";
  if (tier === "mid") {
    return usdOrLocal(REDUCED_SHIPPING_USD, quote.midTierFeeInCurrency, currency, formatMoney);
  }
  return usdOrLocal(BELOW_THRESHOLD_SHIPPING_USD, quote.lowTierFeeInCurrency, currency, formatMoney);
}

/**
 * Shipping-rate breakup for cart / checkout (v2026-08-24: $7.99 / $3.99 / free at $18+).
 * Highlights the shopper's current tier and how much more unlocks the next savings.
 */
export function FreeShippingNotice({ quote, formatMoney, currency, className = "", footnote }: Props) {
  const tiers: FreeShippingTier[] = ["low", "mid", "free"];
  const currentFee =
    quote.tier === "free"
      ? "FREE"
      : formatMoney(
          quote.tier === "mid" ? quote.midTierFeeInCurrency : quote.lowTierFeeInCurrency,
          currency
        );

  return (
    <div
      className={`rounded-lg border border-slate-200 bg-slate-50/80 overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-slate-200 bg-white">
        <p className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
          Shipping rates
        </p>
        {quote.qualifiesForFreeShipping ? (
          <span className="text-xs font-bold text-accent">Free shipping unlocked</span>
        ) : (
          <span className="text-xs font-semibold text-slate-700">
            Today: <span className="text-primary">{currentFee}</span>
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-200/80">
        {tiers.map((tier) => {
          const active = quote.tier === tier;
          return (
            <div
              key={tier}
              className={`flex items-center justify-between gap-3 px-3 py-2 text-xs ${
                active ? "bg-amber-50" : "bg-transparent"
              }`}
            >
              <div className="min-w-0 flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                    active ? "bg-accent" : "bg-slate-300"
                  }`}
                  aria-hidden
                />
                <span className={active ? "font-semibold text-slate-900" : "text-slate-600"}>
                  {orderRangeLabel(currency, formatMoney, quote, tier)}
                </span>
                {active ? (
                  <span className="rounded-full bg-accent/10 text-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    You
                  </span>
                ) : null}
              </div>
              <span
                className={`shrink-0 font-bold tabular-nums ${
                  tier === "free"
                    ? "text-accent"
                    : active
                      ? "text-primary"
                      : "text-slate-800"
                }`}
              >
                {feeLabel(currency, formatMoney, quote, tier)}
              </span>
            </div>
          );
        })}
      </div>

      {!quote.qualifiesForFreeShipping && (
        <div className="px-3 py-2 border-t border-slate-200 bg-white text-xs text-slate-600 leading-snug">
          {quote.tier === "low" ? (
            <p>
              Add{" "}
              <strong className="text-slate-900">
                {formatMoney(quote.amountAwayFromReducedShipping, currency)}
              </strong>{" "}
              more → shipping drops to{" "}
              <strong className="text-slate-900">
                {formatMoney(quote.midTierFeeInCurrency, currency)}
              </strong>
              . Add{" "}
              <strong className="text-slate-900">
                {formatMoney(quote.amountAwayFromFreeShipping, currency)}
              </strong>{" "}
              more → <strong className="text-accent">free shipping</strong>.
            </p>
          ) : (
            <p>
              Add{" "}
              <strong className="text-slate-900">
                {formatMoney(quote.amountAwayFromFreeShipping, currency)}
              </strong>{" "}
              more to unlock <strong className="text-accent">free shipping</strong>.
            </p>
          )}
        </div>
      )}

      {footnote ? (
        <p className="px-3 py-2 border-t border-slate-200 text-[11px] text-slate-500 leading-snug">
          {footnote}
        </p>
      ) : null}
    </div>
  );
}
