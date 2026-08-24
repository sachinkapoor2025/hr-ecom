"use client";

import {
  CHECKOUT_SHIPPING_OPTIONS,
  RAKHI_DELIVERY_MESSAGING,
  ORANGE_COUNTY_SHIPPING_BULLETS,
  expeditedOptionPriceInCurrency,
  type CheckoutShippingOptionId,
  type ExpeditedShippingDef,
} from "@hr-ecom/shared";
import type { DisplayCurrency } from "@/lib/currency-context";
import { RakhiDeliverySummary } from "@/components/RakhiDeliverySummary";
import { RakhiDeliveryBulletList } from "@/components/RakhiDeliveryBulletList";

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
  /** Hide the summary header when RakhiDeliverySummary is shown above. */
  showHeader?: boolean;
  /** Subset of options (defaults to all). Orange County carts pass 3-day + 2-day only. */
  options?: readonly ExpeditedShippingDef[];
};

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
  const msg = RAKHI_DELIVERY_MESSAGING;
  const hideStandard = !options.some((o) => o.id === "standard");
  const bullets = hideStandard ? ORANGE_COUNTY_SHIPPING_BULLETS : msg.shippingBullets;

  return (
    <div className={`rounded-xl border border-amber-200 bg-amber-50/60 overflow-hidden ${className}`}>
      {showHeader ? (
        <div className="px-3.5 py-3 border-b border-amber-200/80 bg-white/70 space-y-2">
          <p className="text-sm font-bold text-primary">{msg.headline}</p>
          <RakhiDeliveryBulletList items={bullets} highlightFirst />
        </div>
      ) : null}

      <fieldset className="p-3 space-y-2.5">
        <legend className="sr-only">Shipping speed</legend>
        {options.map((option) => {
          const selected = value === option.id;
          const price =
            option.id === "standard"
              ? standardCharge
              : expeditedOptionPriceInCurrency(option.id, currency, usdInrRate);
          const priceLabel =
            option.id === "standard"
              ? standardCharge <= 0
                ? "FREE"
                : formatMoney(standardCharge, currency)
              : formatMoney(price, currency);

          return (
            <label
              key={option.id}
              className={`flex gap-3 rounded-lg border-2 px-3 py-3 cursor-pointer transition ${
                selected
                  ? "border-nav bg-white ring-1 ring-nav/20 shadow-sm"
                  : "border-slate-200 bg-white/80 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="shippingOption"
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                className="mt-1 h-4 w-4 border-slate-300 text-nav focus:ring-nav"
              />
              <span className="flex-1 min-w-0">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-sm font-bold text-slate-900">{option.label}</span>
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      option.id === "standard" && standardCharge <= 0
                        ? "text-accent"
                        : "text-primary"
                    }`}
                  >
                    {priceLabel}
                  </span>
                </span>
                <span className="block text-xs text-slate-600 mt-1 leading-snug">
                  {option.detail}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}

/** @deprecated Use RakhiDeliverySummary — one block, standard and expedited separated. */
export function RakhiWeekendShippingBanner(props: { className?: string }) {
  return <RakhiDeliverySummary {...props} />;
}
