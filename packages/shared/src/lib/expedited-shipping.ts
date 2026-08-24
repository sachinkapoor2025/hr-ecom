import {
  convertCurrencyAmount,
  roundForCurrency,
  type ShopCurrency,
} from "../currency";
import { VENDOR_ORANGE_COUNTY } from "../constants";
import { RAKSHA_BANDHAN_FESTIVAL_DATE } from "../schemas/shipping";
import { addBusinessDays, formatDeliveryDate } from "./delivery";
import { shippingVendorKey } from "./free-shipping";

/** Flat rates for Rakhi-season confirmed-delivery upgrades (USD). */
export const EXPEDITED_THREE_DAY_SHIPPING_USD = 19;
export const EXPEDITED_TWO_DAY_SHIPPING_USD = 39;

/**
 * Checkout shipping choice.
 * - `standard` — UsaRakhi only: $22 min order (top-up shipping below); delivery after Aug 28 · 5 business days
 * - `three_day` — $19; 1 packing business day + 3 transit business days
 * - `two_day` — $39; 2 transit business days (priority pack)
 * Orange County carts: 3-day / 2-day only (no standard).
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
    detail: "Standard — delivery after Aug 28 · 5 business days · $22 minimum order",
  },
  {
    id: "three_day",
    label: "3-day delivery",
    shortLabel: "3-day",
    priceUsd: EXPEDITED_THREE_DAY_SHIPPING_USD,
    packingBusinessDays: 1,
    transitBusinessDays: 3,
    detail: "3-day delivery — $19",
  },
  {
    id: "two_day",
    label: "2-day delivery",
    shortLabel: "2-day",
    priceUsd: EXPEDITED_TWO_DAY_SHIPPING_USD,
    packingBusinessDays: 0,
    transitBusinessDays: 2,
    detail: "2-day delivery — $39",
  },
] as const;

const BY_ID = new Map(CHECKOUT_SHIPPING_OPTIONS.map((o) => [o.id, o]));

/** Orange County — paid expedited only (no free standard). */
export const ORANGE_COUNTY_CHECKOUT_SHIPPING_OPTIONS = CHECKOUT_SHIPPING_OPTIONS.filter(
  (o) => o.id === "three_day" || o.id === "two_day"
);

/** Peak-season guarantee for last-minute Rakhi orders (expedited OC shipping). */
export const RAKHI_LAST_MINUTE_GUARANTEE =
  "Last-minute orders are accepted — Guaranteed delivery by Rakhi";

export const ORANGE_COUNTY_SHIPPING_BULLETS = [
  RAKHI_LAST_MINUTE_GUARANTEE,
  "3-day delivery — $19",
  "2-day delivery — $39",
] as const;

/** True when every cart line is Orange County (no UsaRakhi lines). */
export function cartRequiresPaidExpeditedShipping(
  items: Array<{ vendorSlug?: string | null }>
): boolean {
  if (!items.length) return false;
  return items.every(
    (item) => shippingVendorKey({ vendorSlug: item.vendorSlug ?? undefined }) === VENDOR_ORANGE_COUNTY
  );
}

export function checkoutShippingOptionsForCart(
  items?: Array<{ vendorSlug?: string | null }>
): readonly ExpeditedShippingDef[] {
  if (cartRequiresPaidExpeditedShipping(items ?? [])) {
    return ORANGE_COUNTY_CHECKOUT_SHIPPING_OPTIONS;
  }
  return CHECKOUT_SHIPPING_OPTIONS;
}

export function defaultCheckoutShippingOption(
  items?: Array<{ vendorSlug?: string | null }>
): CheckoutShippingOptionId {
  if (cartRequiresPaidExpeditedShipping(items ?? [])) return "three_day";
  return "standard";
}

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

/** Marketing copy — ~90% applies to standard shipping only (not 3-day / 2-day). */
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

export const USARAKHI_SHIPPING_BULLETS = [
  "Standard delivery — after Aug 28 · 5 business days ($22 minimum; small carts topped up at checkout)",
  "Free standard shipping on selected products",
  RAKHI_LAST_MINUTE_GUARANTEE,
  "3-day delivery — $19",
  "2-day delivery — $39",
] as const;

/** Customer-facing shipping options — simple bullets, no calendar dates. */
export const RAKHI_DELIVERY_MESSAGING = {
  headline: "Shipping options",
  /** Shown above bullets on PDP / cart / checkout. */
  lastMinuteNote: RAKHI_LAST_MINUTE_GUARANTEE,
  orderByShort: "Mon, Aug 24",
  orderByLong: "Monday, August 24",
  festivalShort: "Aug 28",
  weekendNote: "",
  standardTitle: "Choose your delivery",
  shippingBullets: [...USARAKHI_SHIPPING_BULLETS],
  standardBullets: [
    "Standard delivery — after Aug 28 · 5 business days",
    "Orders under $22: remaining amount added as shipping at checkout",
  ],
  standardBadge: "Standard · after Aug 28",
  expeditedTitle: "Faster delivery",
  expeditedBullets: ["3-day delivery — $19", "2-day delivery — $39"],
  expeditedBadge: "Guaranteed by Rakhi",
} as const;

export function shippingBulletsForCart(
  items?: Array<{ vendorSlug?: string | null }>
): readonly string[] {
  if (cartRequiresPaidExpeditedShipping(items ?? [])) {
    return ORANGE_COUNTY_SHIPPING_BULLETS;
  }
  return RAKHI_DELIVERY_MESSAGING.shippingBullets;
}

/** @deprecated Use RAKHI_DELIVERY_MESSAGING */
export const RAKHI_DELIVERY_URGENCY_NOTICE = {
  title: RAKHI_DELIVERY_MESSAGING.headline,
  orderByShort: RAKHI_DELIVERY_MESSAGING.orderByShort,
  orderByLong: RAKHI_DELIVERY_MESSAGING.orderByLong,
  festivalShort: RAKHI_DELIVERY_MESSAGING.festivalShort,
  body: RAKHI_DELIVERY_MESSAGING.shippingBullets.join(". "),
  compact: RAKHI_DELIVERY_MESSAGING.shippingBullets.join(" · "),
  compactBullets: [...RAKHI_DELIVERY_MESSAGING.shippingBullets],
  weekendNote: RAKHI_DELIVERY_MESSAGING.weekendNote,
  successRateLabel: RAKHI_DELIVERY_MESSAGING.standardBadge,
  confirmedExpeditedLabel: "Confirmed on Rakhi day",
} as const;

/** @deprecated Use RAKHI_DELIVERY_URGENCY_NOTICE — kept for existing imports. */
export const RAKHI_WEEKEND_SHIPPING_NOTICE = RAKHI_DELIVERY_URGENCY_NOTICE;
