"use client";

import {
  checkoutShippingOptionsForCart,
  EXPEDITED_THREE_DAY_SHIPPING_USD,
  expeditedOptionPriceInCurrency,
  shippingOptionServiceName,
  USARAKHI_MIN_ORDER_USD,
  USARAKHI_THREE_DAY_ARRIVAL_LABEL,
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
  /** Peak-season carts pass 3-day only for UsaRakhi. */
  options?: readonly ExpeditedShippingDef[];
  /** Radio group name — keep unique if two templates ever share a page. */
  name?: string;
  /** Cart mixes UsaRakhi + Orange County — shipping rules apply per vendor. */
  multiVendor?: boolean;
};

function TruckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7.5h9.75v9H8.25m-5.25-9V16.5A1.5 1.5 0 004.5 18h.75m-2.25-10.5h9.75M12.75 7.5h3.15c.4 0 .77.2.98.53l2.37 3.72c.14.22.22.48.22.74V16.5a1.5 1.5 0 01-1.5 1.5h-.75M8.25 18a1.5 1.5 0 103 0m-3 0a1.5 1.5 0 113 0m6.75 0a1.5 1.5 0 103 0m-3 0a1.5 1.5 0 113 0"
      />
    </svg>
  );
}

/**
 * Delivery picker used on cart and checkout.
 * UsaRakhi carts may choose 3-day ($19, arrives Aug 29). OC and mixed carts are standard only.
 */
export function LastMinuteDeliveryTemplate({
  value,
  onChange,
  standardCharge,
  formatMoney,
  currency,
  usdInrRate,
  className = "",
  options = checkoutShippingOptionsForCart(),
  name = "shippingOption",
  multiVendor = false,
}: LastMinuteDeliveryTemplateProps) {
  const threeDay = options.find((o) => o.id === "three_day");
  const standard = options.find((o) => o.id === "standard");
  const heading = threeDay ? "Need it faster?" : "Delivery";

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
          {heading}
        </h2>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
          {threeDay
            ? `Standard delivery is 5 business days. UsaRakhi 3-day delivery is $${EXPEDITED_THREE_DAY_SHIPPING_USD} and arrives ${USARAKHI_THREE_DAY_ARRIVAL_LABEL} (1 packing day + 3 transit days) — not on Rakhi day.`
            : `Standard delivery · 5 business days. Carts under $${USARAKHI_MIN_ORDER_USD} pay the remaining amount as shipping.`}
        </p>
        {multiVendor ? (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm font-semibold text-amber-950 leading-snug">
            You selected products from different vendors — shipping is calculated separately.
            UsaRakhi and Orange County each need a ${USARAKHI_MIN_ORDER_USD} minimum; otherwise
            the remaining amount is added as shipping for that vendor.
          </p>
        ) : null}
      </header>

      <fieldset className="p-3 sm:p-4">
        <legend className="sr-only">Delivery speed</legend>
        {threeDay ? (
          <div className="grid grid-cols-1 gap-3">
            <ThreeDayCard
              option={threeDay}
              selected={value === threeDay.id}
              onChange={onChange}
              formatMoney={formatMoney}
              currency={currency}
              usdInrRate={usdInrRate}
              name={name}
            />
          </div>
        ) : null}

        {standard ? (
          <label
            className={`${threeDay ? "mt-3" : ""} flex gap-3 rounded-lg border-2 px-3 py-3 cursor-pointer transition ${
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

function ThreeDayCard({
  option,
  selected,
  onChange,
  formatMoney,
  currency,
  usdInrRate,
  name,
}: {
  option: ExpeditedShippingDef;
  selected: boolean;
  onChange: (option: CheckoutShippingOptionId) => void;
  formatMoney: FormatMoney;
  currency: DisplayCurrency;
  usdInrRate: number;
  name: string;
}) {
  const price = expeditedOptionPriceInCurrency(option.id, currency, usdInrRate);
  const title = `${shippingOptionServiceName(option.id)} — ${formatMoney(price, currency)}`;

  return (
    <div
      className={`relative flex flex-col rounded-xl border-2 p-4 sm:p-5 transition ${
        selected
          ? "border-nav bg-nav/[0.04] ring-2 ring-nav/20 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      {selected ? (
        <span className="absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white bg-nav">
          Selected
        </span>
      ) : null}

      <label className="flex flex-col flex-1 cursor-pointer">
        <input
          type="radio"
          name={name}
          value={option.id}
          checked={selected}
          onChange={() => onChange(option.id)}
          className="sr-only"
        />
        <span className="flex items-center gap-2 pr-16">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nav text-white">
            <TruckIcon />
          </span>
          <span className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">{title}</span>
        </span>
        <span className="mt-3 text-3xl sm:text-[2rem] font-extrabold tabular-nums leading-none text-nav">
          {formatMoney(price, currency)}
        </span>
        <span className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Additional delivery fee
        </span>
        <span className="mt-2 text-sm text-slate-600 leading-snug">
          1 packing day + 3 transit days. Arrives {USARAKHI_THREE_DAY_ARRIVAL_LABEL} — not on Rakhi
          day (August 28).
        </span>
      </label>

      <button
        type="button"
        onClick={() => onChange(option.id)}
        aria-pressed={selected}
        className={`mt-4 w-full rounded-md py-2.5 text-sm font-bold tracking-wide transition ${
          selected
            ? "bg-nav text-white"
            : "bg-white text-primary border border-primary/20 hover:bg-primary hover:text-white"
        }`}
      >
        Choose 3-Day Delivery
      </button>
    </div>
  );
}
