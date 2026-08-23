"use client";

import type { FreeShippingQuote } from "@hr-ecom/shared";
import type { DisplayCurrency } from "@/lib/currency-context";

type FormatMoney = (amount: number, currency: DisplayCurrency) => string;

type Props = {
  quote: FreeShippingQuote;
  formatMoney: FormatMoney;
  currency: DisplayCurrency;
  className?: string;
  /** Extra note under the banner (e.g. multi-address / multi-seller). */
  footnote?: string;
};

/**
 * Standard shipping notice — always free (no cart minimum).
 * Expedited 3-day / 2-day options are chosen separately at checkout.
 */
export function FreeShippingNotice({ className = "", footnote }: Props) {
  return (
    <div
      className={`rounded-lg border border-emerald-200 bg-emerald-50/80 overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <p className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
          Shipping
        </p>
        <span className="text-xs font-bold text-accent">Free shipping on all orders</span>
      </div>
      <p className="px-3 pb-2.5 text-xs text-slate-700 leading-snug">
        Standard delivery is free (6 days). Choose 3-day ($19) or 2-day ($39) at checkout if you need
        it faster.
      </p>
      {footnote ? (
        <p className="px-3 py-2 border-t border-emerald-200/80 text-[11px] text-slate-500 leading-snug">
          {footnote}
        </p>
      ) : null}
    </div>
  );
}
