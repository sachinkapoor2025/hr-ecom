import {
  convertCurrencyAmount,
  roundForCurrency,
  type ShopCurrency,
} from "../currency";
import { VENDOR_ORANGE_COUNTY } from "../constants";
import { RAKSHA_BANDHAN_FESTIVAL_DATE } from "../schemas/shipping";
import { addBusinessDays, formatDeliveryDate } from "./delivery";
import { shippingVendorKey } from "./free-shipping";

/** Customer-facing standard delivery line (all vendors). */
export const USARAKHI_STANDARD_DELIVERY_DETAIL =
  "Standard USA delivery · 5 business days · Free shipping on $15 minimum cart value";

/** Historical 3-day window — kept for old orders only (not offered at checkout). */
export const USARAKHI_THREE_DAY_ARRIVAL_YMD = "2026-08-30";
export const USARAKHI_THREE_DAY_ARRIVAL_LABEL = "August 29–30";

/** @deprecated 3-day express is no longer offered at checkout. */
export const EXPEDITED_THREE_DAY_SHIPPING_USD = 19;
/** @deprecated 2-day delivery is no longer offered at checkout. */
export const EXPEDITED_TWO_DAY_SHIPPING_USD = 39;

/**
 * Checkout shipping choice.
 * - `standard` — UsaRakhi: $15 min merchandise (top-up shipping below); OC: always free; 5 business days
 * - `three_day` / `two_day` — historical orders only (not offered at checkout)
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
    detail: USARAKHI_STANDARD_DELIVERY_DETAIL,
  },
  {
    id: "three_day",
    label: "3-day express delivery",
    shortLabel: "3-day",
    priceUsd: EXPEDITED_THREE_DAY_SHIPPING_USD,
    packingBusinessDays: 1,
    transitBusinessDays: 3,
    detail: "3-day express delivery — no longer available",
  },
  {
    id: "two_day",
    label: "2-day delivery",
    shortLabel: "2-day",
    priceUsd: EXPEDITED_TWO_DAY_SHIPPING_USD,
    packingBusinessDays: 0,
    transitBusinessDays: 2,
    detail: "2-day delivery — no longer available",
  },
] as const;

const BY_ID = new Map(CHECKOUT_SHIPPING_OPTIONS.map((o) => [o.id, o]));

export const STANDARD_CHECKOUT_SHIPPING_OPTIONS = CHECKOUT_SHIPPING_OPTIONS.filter(
  (o) => o.id === "standard"
);

/** UsaRakhi carts — standard only (3-day is no longer offered). */
export const USARAKHI_CHECKOUT_SHIPPING_OPTIONS = STANDARD_CHECKOUT_SHIPPING_OPTIONS;

/** Orange County — standard delivery, always free shipping. */
export const ORANGE_COUNTY_CHECKOUT_SHIPPING_OPTIONS = STANDARD_CHECKOUT_SHIPPING_OPTIONS;

/** @deprecated 3-day express is no longer offered; same as standard copy. */
export const RAKHI_LAST_MINUTE_GUARANTEE = USARAKHI_STANDARD_DELIVERY_DETAIL;

export const ORANGE_COUNTY_SHIPPING_BULLETS = [
  "Standard USA delivery",
  "5 business days",
  "Free shipping on all Orange County products",
] as const;

export const MIXED_VENDOR_SHIPPING_BULLETS = [
  "Shipping is calculated separately for each vendor",
  "UsaRakhi: free shipping on $15 minimum — otherwise the remaining amount is added as shipping",
  "Orange County: free shipping on all products",
] as const;

type ShippingCartItem = {
  vendorSlug?: string | null;
  image?: string | null;
  images?: string[] | null;
};

function vendorKeysForCart(items: ShippingCartItem[]): Set<string> {
  return new Set(items.map((item) => shippingVendorKey(item)));
}

/** True when every cart line is Orange County (no UsaRakhi lines). */
export function cartIsOrangeCountyOnly(items: ShippingCartItem[]): boolean {
  if (!items.length) return false;
  return [...vendorKeysForCart(items)].every((key) => key === VENDOR_ORANGE_COUNTY);
}

/** True when the cart has both UsaRakhi and Orange County (or other) vendors. */
export function cartIsMixedShippingVendors(items: ShippingCartItem[]): boolean {
  return vendorKeysForCart(items).size > 1;
}

/** 3-day express is no longer offered at checkout. */
export function cartAllowsThreeDayShipping(_items: ShippingCartItem[]): boolean {
  return false;
}

/** @deprecated OC no longer requires paid expedited — always false. */
export function cartRequiresPaidExpeditedShipping(_items: ShippingCartItem[]): boolean {
  return false;
}

export function checkoutShippingOptionsForCart(
  _items?: ShippingCartItem[]
): readonly ExpeditedShippingDef[] {
  return STANDARD_CHECKOUT_SHIPPING_OPTIONS;
}

export function defaultCheckoutShippingOption(
  _items?: ShippingCartItem[]
): CheckoutShippingOptionId {
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
  if (optionId === "three_day" && ymdInNy(from) <= USARAKHI_THREE_DAY_ARRIVAL_YMD) {
    return new Date(`${USARAKHI_THREE_DAY_ARRIVAL_YMD}T16:00:00.000Z`);
  }
  const option = BY_ID.get(optionId) ?? BY_ID.get("standard")!;
  return addBusinessDays(from, expeditedLeadBusinessDays(option));
}

/** Recommended order-by for Rakhi-day delivery (Monday before festival). */
export const RAKHI_ORDER_BY_DATE = "2026-08-24";

/** Marketing copy — no longer used as a Rakhi-day promise. */
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
 * Rakhi-day delivery is no longer confirmed for any checkout option.
 */
export function canConfirmDeliveryByRakhi(
  _optionId: CheckoutShippingOptionId,
  _from: Date = new Date()
): boolean {
  return false;
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
 * Expedited options are not offered; new checkouts use standard threshold / flash rates.
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
  if (optionId === "three_day") return "3-Day Express Delivery";
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
  if (optionId === "three_day" && ymdInNy(from) <= USARAKHI_THREE_DAY_ARRIVAL_YMD) {
    return USARAKHI_THREE_DAY_ARRIVAL_LABEL;
  }
  const arrival = estimateShippingArrival(optionId, from);
  return formatDeliveryDate(arrival);
}

export const USARAKHI_SHIPPING_BULLETS = [
  "Standard USA delivery",
  "5 business days",
  "Free shipping on $15 minimum cart value",
] as const;

/** Customer-facing shipping options. */
export const RAKHI_DELIVERY_MESSAGING = {
  headline: "Shipping options",
  lastMinuteNote: USARAKHI_STANDARD_DELIVERY_DETAIL,
  orderByShort: "Mon, Aug 24",
  orderByLong: "Monday, August 24",
  festivalShort: "Aug 28",
  weekendNote: "",
  standardTitle: "Choose your delivery",
  shippingBullets: [...USARAKHI_SHIPPING_BULLETS],
  standardBullets: [
    "Standard USA delivery",
    "5 business days",
    "Free shipping on $15 minimum cart value",
  ],
  standardBadge: "Standard USA delivery · 5 business days",
  expeditedTitle: "Standard delivery",
  expeditedBullets: [...USARAKHI_SHIPPING_BULLETS],
  expeditedBadge: "Standard USA delivery · 5 business days",
} as const;

export function shippingBulletsForCart(items?: ShippingCartItem[]): readonly string[] {
  const list = items ?? [];
  if (cartIsOrangeCountyOnly(list)) {
    return ORANGE_COUNTY_SHIPPING_BULLETS;
  }
  if (cartIsMixedShippingVendors(list)) {
    return MIXED_VENDOR_SHIPPING_BULLETS;
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
  confirmedExpeditedLabel: USARAKHI_STANDARD_DELIVERY_DETAIL,
} as const;

/** @deprecated Use RAKHI_DELIVERY_URGENCY_NOTICE — kept for existing imports. */
export const RAKHI_WEEKEND_SHIPPING_NOTICE = RAKHI_DELIVERY_URGENCY_NOTICE;
