import {
  convertCurrencyAmount,
  roundForCurrency,
  type ShopCurrency,
} from "../currency";
import { RAKSHA_BANDHAN_FESTIVAL_DATE } from "../schemas/shipping";
import { addBusinessDays, formatDeliveryDate } from "./delivery";

/** Flat rates for Rakhi-season confirmed-delivery upgrades (USD). */
export const EXPEDITED_THREE_DAY_SHIPPING_USD = 19;
export const EXPEDITED_TWO_DAY_SHIPPING_USD = 39;

/**
 * Checkout shipping choice.
 * - `standard` — existing free-shipping tiers ($7.99 / $3.99 / free); not confirmed for Rakhi
 * - `three_day` — $19; 1 packing business day + 3 transit business days
 * - `two_day` — $39; 2 transit business days (priority pack)
 */
export const CHECKOUT_SHIPPING_OPTION_IDS = ["standard", "three_day", "two_day"] as const;
export type CheckoutShippingOptionId = (typeof CHECKOUT_SHIPPING_OPTION_IDS)[number];

export type ExpeditedShippingDef = {
  id: CheckoutShippingOptionId;
  label: string;
  shortLabel: string;
  priceUsd: number;
  /** Business days before the package leaves (USPS does not move on weekends). */
  packingBusinessDays: number;
  /** Business days in transit after handoff. */
  transitBusinessDays: number;
  /** Shown next to the price. */
  detail: string;
};

export const CHECKOUT_SHIPPING_OPTIONS: readonly ExpeditedShippingDef[] = [
  {
    id: "standard",
    label: "Standard shipping",
    shortLabel: "Standard",
    priceUsd: 0,
    packingBusinessDays: 1,
    transitBusinessDays: 5,
    detail:
      "About 6 business days. Order by Monday — we do our best to deliver on Raksha Bandhan.",
  },
  {
    id: "three_day",
    label: "3-day delivery",
    shortLabel: "3-day",
    priceUsd: EXPEDITED_THREE_DAY_SHIPPING_USD,
    packingBusinessDays: 1,
    transitBusinessDays: 3,
    detail: "Includes 1 business day for packing, then 3 business days in transit ($19).",
  },
  {
    id: "two_day",
    label: "2-day delivery",
    shortLabel: "2-day",
    priceUsd: EXPEDITED_TWO_DAY_SHIPPING_USD,
    packingBusinessDays: 0,
    transitBusinessDays: 2,
    detail: "Priority packing and 2 business days in transit ($39).",
  },
] as const;

const BY_ID = new Map(CHECKOUT_SHIPPING_OPTIONS.map((o) => [o.id, o]));

export function getCheckoutShippingOption(
  id: string | null | undefined
): ExpeditedShippingDef | undefined {
  if (!id) return undefined;
  return BY_ID.get(id as CheckoutShippingOptionId);
}

export function isCheckoutShippingOptionId(id: string): id is CheckoutShippingOptionId {
  return BY_ID.has(id as CheckoutShippingOptionId);
}

/** Total business days from order to estimated arrival for an option. */
export function expeditedLeadBusinessDays(option: ExpeditedShippingDef): number {
  return option.packingBusinessDays + option.transitBusinessDays;
}

export function estimateShippingArrival(
  optionId: CheckoutShippingOptionId,
  from: Date = new Date()
): Date {
  const option = BY_ID.get(optionId) ?? BY_ID.get("standard")!;
  return addBusinessDays(from, expeditedLeadBusinessDays(option));
}

/** Recommended order-by for Rakhi-day delivery (Monday before festival). */
export const RAKHI_ORDER_BY_DATE = "2026-08-24";

/** Marketing copy — recent orders placed by the deadline with expedited shipping. */
export const RAKHI_ON_TIME_DELIVERY_SUCCESS_PERCENT = 90;

export function formatRakhiOrderByLabel(isoDate = RAKHI_ORDER_BY_DATE): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatRakhiFestivalLabel(isoDate = RAKSHA_BANDHAN_FESTIVAL_DATE): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Whether the customer is still inside the public “order by Monday” window (NY date). */
export function isBeforeRakhiOrderByDeadline(from: Date = new Date()): boolean {
  return ymdInNy(from) <= RAKHI_ORDER_BY_DATE;
}

/** Calendar date YYYY-MM-DD in America/New_York for comparisons. */
export function festivalDateYmd(): string {
  return RAKSHA_BANDHAN_FESTIVAL_DATE;
}

function ymdInNy(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Whether this option can still aim for arrival on/before Raksha Bandhan.
 * Standard is never treated as confirmed (weekend USPS closures).
 */
export function canConfirmDeliveryByRakhi(
  optionId: CheckoutShippingOptionId,
  from: Date = new Date()
): boolean {
  if (optionId === "standard") return false;
  const arrival = estimateShippingArrival(optionId, from);
  return ymdInNy(arrival) <= festivalDateYmd();
}

export function expeditedOptionPriceInCurrency(
  optionId: CheckoutShippingOptionId,
  currency: ShopCurrency,
  usdInrRate: number
): number {
  const option = BY_ID.get(optionId);
  if (!option || optionId === "standard") return 0;
  if (currency === "USD") return roundForCurrency(option.priceUsd, "USD");
  return roundForCurrency(
    convertCurrencyAmount(option.priceUsd, "USD", "INR", usdInrRate),
    "INR"
  );
}

/**
 * Final customer shipping charge for checkout.
 * Expedited options replace threshold / flash rates with the flat upgrade fee.
 */
export function resolveCheckoutShippingCharge(input: {
  optionId: CheckoutShippingOptionId;
  /** Threshold / flash / pass-through charge when option is standard. */
  standardCharge: number;
  currency: ShopCurrency;
  usdInrRate: number;
}): number {
  if (input.optionId === "standard") {
    return roundForCurrency(input.standardCharge, input.currency);
  }
  return expeditedOptionPriceInCurrency(input.optionId, input.currency, input.usdInrRate);
}

export function shippingOptionServiceName(optionId: CheckoutShippingOptionId): string {
  if (optionId === "three_day") return "3-Day Delivery";
  if (optionId === "two_day") return "2-Day Delivery";
  return "Standard shipping";
}

export function shippingOptionServiceCode(optionId: CheckoutShippingOptionId): string {
  if (optionId === "three_day") return "EXPEDITED_3_DAY";
  if (optionId === "two_day") return "EXPEDITED_2_DAY";
  return "STANDARD";
}

export function expeditedArrivalLabel(
  optionId: CheckoutShippingOptionId,
  from: Date = new Date()
): string {
  const arrival = estimateShippingArrival(optionId, from);
  return formatDeliveryDate(arrival);
}

/** Optimistic Rakhi-season urgency copy — avoids “won’t deliver” language that kills weekend orders. */
export const RAKHI_DELIVERY_URGENCY_NOTICE = {
  title: "Order by Monday for Rakhi-day delivery",
  orderByShort: "Mon, Aug 24",
  orderByLong: "Monday, August 24",
  festivalShort: "Aug 28",
  body:
    "Order by Monday, August 24 and we'll do our best to reach your brother on Raksha Bandhan (Friday, August 28). About 9 in 10 orders placed by Monday with 3-day ($19) or 2-day ($39) shipping have arrived on festival day. Ordering this weekend? You're still in time — we prioritize packing as soon as USPS reopens.",
  compact:
    "Order by Mon, Aug 24 — ~90% arrive on Rakhi day with 3-day or 2-day at checkout. We'll try our best for every order.",
  /** Short bullet lines for cart / PDP banners (prices appended in UI). */
  compactBullets: [
    "Order by Mon, Aug 24 for Rakhi-day delivery",
    "~90% arrive on Rakhi day (Aug 28) with 3-day or 2-day at checkout",
    "We'll try our best for every order",
  ],
  weekendNote:
    "Weekend orders welcome — place yours now and we'll prioritize packing Monday morning.",
  successRateLabel: "~90% on Rakhi day",
} as const;

/** @deprecated Use RAKHI_DELIVERY_URGENCY_NOTICE — kept for existing imports. */
export const RAKHI_WEEKEND_SHIPPING_NOTICE = RAKHI_DELIVERY_URGENCY_NOTICE;
