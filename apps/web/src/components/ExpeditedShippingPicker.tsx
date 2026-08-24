"use client";

import {
  CHECKOUT_SHIPPING_OPTIONS,
  expeditedOptionPriceInCurrency,
  shippingOptionServiceName,
  type CheckoutShippingOptionId,
  type ExpeditedShippingDef,
} from "@hr-ecom/shared";
import type { DisplayCurrency } from "@/lib/currency-context";
import { RakhiDeliverySummary } from "@/components/RakhiDeliverySummary";

type FormatMoney = (amount: number, currency: DisplayCurrency) => string;

type Props = {
  value: CheckoutShippingOptionId;
  onChange: (option: CheckoutShippingOptionId) => void;
  /** Standard (threshold) shipping charge currently due. */
  standardCharge: number;
  formatMoney: FormatMoney;
  currency: DisplayCurrency;
  usdInrRate: number;
  className?: string;
  /** Hide the promotional header when a summary is shown above. */
  showHeader?: boolean;
  /** Subset of options (defaults to all). Peak-season carts pass 3-day + 2-day only. */
  options?: readonly ExpeditedShippingDef[];
};

const PROMO_CARD_ORDER: CheckoutShippingOptionId[] = ["two_day", "three_day"];

function TruckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM12 17V9m0 0H5.5M12 9h6.5M12 9L9 5m3 4l3-4"
      />
    </svg>
  );
}

function ctaLabel(optionId: CheckoutShippingOptionId, selected: boolean): string {
  if (selected) return optionId === "two_day" ? "2-Day delivery selected" : "3-Day delivery selected";
  if (optionId === "two_day") return "Choose 2-Day Delivery";
  if (optionId === "three_day") return "Choose 3-Day Delivery";
  return "Choose this option";
}

export function ExpeditedShippingPicker({
  value,
  onChange,
  standardCharge,
  formatMoney,
  currency,
  usdInrRate,
  className = "",
  showHeader = true,
  options = CHECKOUT_SHIPPING_OPTIONS,
}: Props) {
  const paidCards = PROMO_CARD_ORDER.map((id) => options.find((o) => o.id === id)).filter(
    (o): o is ExpeditedShippingDef => Boolean(o)
  );
  const standard = options.find((o) => o.id === "standard");

  return (
    <section
      className={`rounded-xl border border-primary/15 bg-gradient-to-b from-slate-50 via-white to-white overflow-hidden shadow-sm ${className}`}
      aria-labelledby="last-minute-delivery-heading"
    >
      {showHeader ? (
        <header className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-nav">Last-minute delivery</p>
          <h2
            id="last-minute-delivery-heading"
            className="mt-1 text-lg sm:text-xl font-bold text-primary leading-snug"
          >
            Need Your Order Fast?
          </h2>
          <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
            Add a delivery fee to ship faster — choose one option. Packed with care and shipped from
            within the USA.
          </p>
        </header>
      ) : (
        <h2 id="last-minute-delivery-heading" className="sr-only">
          Need Your Order Fast?
        </h2>
      )}

      <fieldset className="p-3 sm:p-4">
        <legend className="sr-only">Delivery speed</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paidCards.map((option) => {
            const selected = value === option.id;
            const price = expeditedOptionPriceInCurrency(option.id, currency, usdInrRate);
            const isTwoDay = option.id === "two_day";

            return (
              <div
                key={option.id}
                role="presentation"
                onClick={() => onChange(option.id)}
                className={`relative flex flex-col rounded-xl border-2 p-4 cursor-pointer transition ${
                  selected
                    ? isTwoDay
                      ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-md"
                      : "border-nav bg-nav/[0.04] ring-2 ring-nav/20 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {selected ? (
                  <span
                    className={`absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${
                      isTwoDay ? "bg-primary" : "bg-nav"
                    }`}
                  >
                    Selected
                  </span>
                ) : null}

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                      isTwoDay ? "bg-primary text-white" : "bg-nav text-white"
                    }`}
                  >
                    <TruckIcon />
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {shippingOptionServiceName(option.id)}
                  </p>
                </div>

                <p
                  className={`mt-3 text-3xl sm:text-[2rem] font-extrabold tabular-nums leading-none ${
                    isTwoDay ? "text-primary" : "text-nav"
                  }`}
                >
                  {formatMoney(price, currency)}
                </p>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Additional delivery fee
                </p>
                <p className="mt-2 text-sm text-slate-600 leading-snug">
                  {isTwoDay
                    ? "Priority packing and 2-day transit for last-minute orders."
                    : "Reliable 3-day delivery — the most popular faster option."}
                </p>

                <input
                  type="radio"
                  name="shippingOption"
                  value={option.id}
                  checked={selected}
                  onChange={() => onChange(option.id)}
                  className="sr-only"
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option.id);
                  }}
                  aria-pressed={selected}
                  className={`mt-4 w-full rounded-md py-2.5 text-sm font-bold uppercase tracking-wide transition ${
                    selected
                      ? isTwoDay
                        ? "bg-primary text-white"
                        : "bg-nav text-white"
                      : "bg-white text-primary border border-primary/20 hover:bg-primary hover:text-white"
                  }`}
                >
                  {ctaLabel(option.id, selected)}
                </button>
              </div>
            );
          })}
        </div>

        {standard ? (
          <label
            className={`mt-3 flex gap-3 rounded-lg border-2 px-3 py-3 cursor-pointer transition ${
              value === "standard"
                ? "border-nav bg-white ring-1 ring-nav/20 shadow-sm"
                : "border-slate-200 bg-white/80 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="shippingOption"
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
              <span className="block text-xs text-slate-600 mt-1 leading-snug">{standard.detail}</span>
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

/** @deprecated Use RakhiDeliverySummary — one block, standard and expedited separated. */
export function RakhiWeekendShippingBanner(props: { className?: string }) {
  return <RakhiDeliverySummary {...props} />;
}
