"use client";

import {
  CHECKOUT_SHIPPING_OPTIONS,
  EXPEDITED_THREE_DAY_SHIPPING_USD,
  EXPEDITED_TWO_DAY_SHIPPING_USD,
  RAKHI_DELIVERY_URGENCY_NOTICE,
  canConfirmDeliveryByRakhi,
  expeditedArrivalLabel,
  expeditedOptionPriceInCurrency,
  type CheckoutShippingOptionId,
} from "@hr-ecom/shared";
import { useCurrency, type DisplayCurrency } from "@/lib/currency-context";
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
};

export function ExpeditedShippingPicker({
  value,
  onChange,
  standardCharge,
  formatMoney,
  currency,
  usdInrRate,
  className = "",
}: Props) {
  const notice = RAKHI_DELIVERY_URGENCY_NOTICE;

  return (
    <div className={`rounded-xl border border-amber-200 bg-amber-50/60 overflow-hidden ${className}`}>
      <div className="px-3.5 py-3 border-b border-amber-200/80 bg-white/70">
        <p className="text-sm font-bold text-primary">{notice.title}</p>
        <RakhiDeliveryBulletList
          items={[
            ...notice.compactBullets,
            `At checkout choose 3-day (${formatMoney(
              expeditedOptionPriceInCurrency("three_day", currency, usdInrRate),
              currency
            )}) or 2-day (${formatMoney(
              expeditedOptionPriceInCurrency("two_day", currency, usdInrRate),
              currency
            )})`,
          ]}
          highlightFirst
        />
        <p className="text-[11px] text-emerald-800 mt-2 font-medium">{notice.weekendNote}</p>
      </div>

      <fieldset className="p-3 space-y-2.5">
        <legend className="sr-only">Shipping speed</legend>
        {CHECKOUT_SHIPPING_OPTIONS.map((option) => {
          const selected = value === option.id;
          const canConfirm = canConfirmDeliveryByRakhi(option.id);
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
          const eta = expeditedArrivalLabel(option.id);

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
                <span className="block text-xs text-slate-600 mt-1 leading-snug">{option.detail}</span>
                <span className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                  {option.id === "standard" ? (
                    <span className="rounded-full bg-emerald-50 text-emerald-800 px-2 py-0.5 font-semibold">
                      {notice.successRateLabel} if ordered by {notice.orderByShort} · est. {eta}
                    </span>
                  ) : canConfirm ? (
                    <span className="rounded-full bg-emerald-50 text-emerald-800 px-2 py-0.5 font-semibold">
                      Best odds for Rakhi day · est. {eta}
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 text-amber-900 px-2 py-0.5 font-semibold">
                      Add 2-day for best Rakhi-day odds · est. {eta}
                    </span>
                  )}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}

/** Compact banner for cart / product pages. */
export function RakhiWeekendShippingBanner({ className = "" }: { className?: string }) {
  const { format, displayCurrency, usdInrRate } = useCurrency();
  const three = expeditedOptionPriceInCurrency("three_day", displayCurrency, usdInrRate);
  const two = expeditedOptionPriceInCurrency("two_day", displayCurrency, usdInrRate);
  const notice = RAKHI_DELIVERY_URGENCY_NOTICE;
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-slate-800 ${className}`}
    >
      <p className="font-bold text-primary text-sm">{notice.title}</p>
      <RakhiDeliveryBulletList
        items={[
          ...notice.compactBullets,
          `At checkout choose 3-day (${format(three, displayCurrency)}) or 2-day (${format(two, displayCurrency)})`,
        ]}
        highlightFirst
      />
      <p className="text-[11px] text-emerald-800 mt-2 font-medium">{notice.weekendNote}</p>
      <p className="sr-only">
        Reference USD fees: ${EXPEDITED_THREE_DAY_SHIPPING_USD} and ${EXPEDITED_TWO_DAY_SHIPPING_USD}.
      </p>
    </div>
  );
}
