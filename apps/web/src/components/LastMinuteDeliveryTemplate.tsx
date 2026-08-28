"use client";

import {
  checkoutShippingOptionsForCart,
  USARAKHI_MIN_ORDER_USD,
  type CheckoutShippingOptionId,
  type ExpeditedShippingDef,
} from "@hr-ecom/shared";
import type { DisplayCurrency } from "@/lib/currency-context";
import { StandardShippingMinimumNote } from "@/components/StandardShippingMinimumNote";

type FormatMoney = (amount: number, currency: DisplayCurrency) => string;

export type LastMinuteDeliveryTemplateProps = {
  value: CheckoutShippingOptionId;
  onChange: (option: CheckoutShippingOptionId) => void;
  /** Standard (threshold) shipping charge currently due. */
  standardCharge: number;
  formatMoney: FormatMoney;
  currency: DisplayCurrency;
  usdInrRate: number;
  className?: string;
  options?: readonly ExpeditedShippingDef[];
  /** Radio group name — keep unique if two templates ever share a page. */
  name?: string;
  /** Cart mixes UsaRakhi + Orange County — shipping rules apply per vendor. */
  multiVendor?: boolean;
  /** Cart is Orange County only — always free shipping. */
  orangeCountyOnly?: boolean;
};

/**
 * Delivery picker used on cart and checkout. Standard USA delivery only.
 */
export function LastMinuteDeliveryTemplate({
  value,
  onChange,
  standardCharge,
  formatMoney,
  currency,
  className = "",
  options = checkoutShippingOptionsForCart(),
  name = "shippingOption",
  multiVendor = false,
  orangeCountyOnly = false,
}: LastMinuteDeliveryTemplateProps) {
  const standard = options.find((o) => o.id === "standard");

  return (
    <section
      className={`rounded-xl border border-primary/15 bg-gradient-to-b from-slate-50 via-white to-white overflow-hidden shadow-sm ${className}`}
      aria-labelledby="last-minute-delivery-heading"
    >
      <header className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-nav">Delivery</p>
        <h2
          id="last-minute-delivery-heading"
          className="mt-1 text-lg sm:text-xl font-bold text-primary leading-snug"
        >
          Delivery
        </h2>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
          {orangeCountyOnly
            ? "Standard USA delivery · 5 business days · Free shipping on all Orange County products."
            : `Standard USA delivery · 5 business days · Free shipping on $${USARAKHI_MIN_ORDER_USD} minimum cart value.`}
        </p>
        {multiVendor ? (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm font-semibold text-amber-950 leading-snug">
            You selected products from different vendors — shipping is calculated separately.
            UsaRakhi needs a ${USARAKHI_MIN_ORDER_USD} minimum; Orange County products always ship
            free.
          </p>
        ) : null}
      </header>

      <fieldset className="p-3 sm:p-4">
        <legend className="sr-only">Delivery speed</legend>
        {standard ? (
          <label
            className={`flex gap-3 rounded-lg border-2 px-3 py-3 cursor-pointer transition ${
              value === "standard"
                ? "border-nav bg-white ring-1 ring-nav/20 shadow-sm"
                : "border-slate-200 bg-white/80 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name={name}
              value="standard"
              checked={value === "standard"}
              onChange={() => onChange("standard")}
              className="mt-1 h-4 w-4 border-slate-300 text-nav focus:ring-nav"
            />
            <span className="flex-1 min-w-0">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-sm font-bold text-slate-900">{standard.label}</span>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    standardCharge <= 0 ? "text-accent" : "text-primary"
                  }`}
                >
                  {standardCharge <= 0 ? "FREE" : formatMoney(standardCharge, currency)}
                </span>
              </span>
              <StandardShippingMinimumNote
                topUpAmount={standardCharge}
                formatMoney={formatMoney}
                currency={currency}
                className="mt-2"
                compact
                multiVendor={multiVendor}
                orangeCountyOnly={orangeCountyOnly}
              />
            </span>
          </label>
        ) : null}

        <p className="mt-3 text-center text-[11px] sm:text-xs text-slate-500 leading-snug">
          Available for eligible addresses/orders only.
        </p>
      </fieldset>
    </section>
  );
}
