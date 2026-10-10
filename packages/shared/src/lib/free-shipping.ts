import {
  convertCurrencyAmount,
  roundForCurrency,
  type ShopCurrency,
} from "../currency";
import { VENDOR_ORANGE_COUNTY } from "../constants";
import {
  FLASH_COMBO_SHIPPING_USD,
  isFlashComboProduct,
} from "./flash-sale";
import { cartLineUnitTotal } from "./product-addons";

/**
 * UsaRakhi standard delivery: cart merchandise must reach this USD subtotal per vendor
 * bucket, or the customer pays the difference as shipping (subtotal + shipping ≥ minimum).
 */
export const USARAKHI_MIN_ORDER_USD = 15;

/** @deprecated Use USARAKHI_MIN_ORDER_USD — kept for admin/shipping snapshot compat. */
export const FREE_SHIPPING_MIN_SUBTOTAL_USD = USARAKHI_MIN_ORDER_USD;

/** @deprecated UsaRakhi uses $15 minimum top-up, not tiered fees. */
export const FREE_SHIPPING_ABOVE_USD = USARAKHI_MIN_ORDER_USD;

/** @deprecated Legacy mid-tier threshold (unused). */
export const REDUCED_SHIPPING_MIN_SUBTOTAL_USD = 10;

/** @deprecated Legacy low-tier fee (unused). */
export const BELOW_THRESHOLD_SHIPPING_USD = 0;

/** @deprecated Legacy mid-tier fee (unused). */
export const REDUCED_SHIPPING_USD = 0;

/** Standard shipping is not universally free — UsaRakhi uses $15 minimum top-up. */
export const STANDARD_SHIPPING_ALWAYS_FREE = false;

/** Product tag for always-free standard shipping (even under $15). */
export const FREE_STANDARD_SHIPPING_TAG = "free-standard-shipping";

export function isFreeStandardShippingProduct(input: {
  productSlug?: string | null;
  tags?: string[] | null;
  freeStandardShipping?: boolean | null;
}): boolean {
  if (input.freeStandardShipping) return true;
  if ((input.tags ?? []).includes(FREE_STANDARD_SHIPPING_TAG)) return true;
  return false;
}

export type FreeShippingTier = "low" | "mid" | "free";

export type FreeShippingQuote = {
  /** Shipping charged to the customer in `currency`. */
  charge: number;
  qualifiesForFreeShipping: boolean;
  /** How much more cart value (in `currency`) is needed for free shipping. */
  amountAwayFromFreeShipping: number;
  /** How much more cart value (in `currency`) is needed to reach the $3.99 tier. */
  amountAwayFromReducedShipping: number;
  /** Exclusive "above this" free-shipping cutoff expressed in `currency`. */
  aboveAmountInCurrency: number;
  /** Free-shipping threshold expressed in `currency` (first free amount). */
  thresholdInCurrency: number;
  /** Reduced-shipping threshold expressed in `currency`. */
  reducedThresholdInCurrency: number;
  /** Legacy low-tier fee in `currency`. */
  lowTierFeeInCurrency: number;
  /** Legacy mid-tier fee in `currency`. */
  midTierFeeInCurrency: number;
  /** Current tier for this bucket. */
  tier: FreeShippingTier;
  /** Shipping fee for the current bucket tier, in `currency`. */
  belowThresholdFeeInCurrency: number;
};

function toCurrency(
  amountUsd: number,
  currency: ShopCurrency,
  usdInrRate: number
): number {
  if (currency === "USD") return roundForCurrency(amountUsd, "USD");
  return roundForCurrency(
    convertCurrencyAmount(amountUsd, "USD", "INR", usdInrRate),
    "INR"
  );
}

/**
 * UsaRakhi standard shipping: $15 minimum merchandise per vendor bucket.
 * Below $15, charge (minimum − subtotal) so merchandise + shipping meets the floor.
 * Buckets where every line qualifies for free standard shipping pay $0.
 */
export function quoteUsarakhiStandardShipping(input: {
  subtotal: number;
  currency: ShopCurrency;
  usdInrRate: number;
  items?: Array<{
    productSlug?: string;
    tags?: string[];
    freeStandardShipping?: boolean;
  }>;
}): FreeShippingQuote {
  const { subtotal, currency, usdInrRate } = input;
  const minInCurrency = toCurrency(USARAKHI_MIN_ORDER_USD, currency, usdInrRate);
  const roundedSubtotal = roundForCurrency(subtotal, currency);

  const allFreeSelected =
    (input.items?.length ?? 0) > 0 &&
    input.items!.every((item) => isFreeStandardShippingProduct(item));

  if (allFreeSelected) {
    return {
      charge: 0,
      qualifiesForFreeShipping: true,
      amountAwayFromFreeShipping: 0,
      amountAwayFromReducedShipping: 0,
      aboveAmountInCurrency: minInCurrency,
      thresholdInCurrency: minInCurrency,
      reducedThresholdInCurrency: toCurrency(
        REDUCED_SHIPPING_MIN_SUBTOTAL_USD,
        currency,
        usdInrRate
      ),
      lowTierFeeInCurrency: 0,
      midTierFeeInCurrency: 0,
      tier: "free",
      belowThresholdFeeInCurrency: 0,
    };
  }

  const charge =
    roundedSubtotal >= minInCurrency
      ? 0
      : roundForCurrency(minInCurrency - roundedSubtotal, currency);

  return {
    charge,
    qualifiesForFreeShipping: charge === 0,
    amountAwayFromFreeShipping: charge,
    amountAwayFromReducedShipping: charge,
    aboveAmountInCurrency: minInCurrency,
    thresholdInCurrency: minInCurrency,
    reducedThresholdInCurrency: toCurrency(
      REDUCED_SHIPPING_MIN_SUBTOTAL_USD,
      currency,
      usdInrRate
    ),
    lowTierFeeInCurrency: charge,
    midTierFeeInCurrency: 0,
    tier: charge === 0 ? "free" : "low",
    belowThresholdFeeInCurrency: charge,
  };
}

/**
 * @deprecated Prefer quoteUsarakhiStandardShipping for UsaRakhi buckets.
 */
export function quoteFreeShippingThreshold(input: {
  subtotal: number;
  currency: ShopCurrency;
  usdInrRate: number;
}): FreeShippingQuote {
  return quoteUsarakhiStandardShipping(input);
}

/** Default vendor bucket for catalog SKUs without `vendorSlug` (UsaRakhi). */
export const SHIPPING_VENDOR_USARAKHI = "usarakhi";

type ShippingVendorSource = {
  vendorSlug?: string | null;
  image?: string | null;
  images?: string[] | null;
};

function looksLikeOrangeCountyImage(src: string | null | undefined): boolean {
  return Boolean(src && src.includes("/uploads/orange-county/"));
}

/**
 * Normalize cart/product vendor for per-vendor shipping buckets.
 * Orange County is never merged into the UsaRakhi $15 minimum — each vendor is quoted separately.
 * Infers OC from image path when older cart lines lack `vendorSlug`.
 */
export function shippingVendorKey(item: ShippingVendorSource): string {
  const slug = item.vendorSlug?.trim();
  if (slug === VENDOR_ORANGE_COUNTY) return VENDOR_ORANGE_COUNTY;
  if (slug) return slug;
  const imgs = [
    ...(item.image ? [item.image] : []),
    ...((item.images ?? []).filter(Boolean) as string[]),
  ];
  if (imgs.some(looksLikeOrangeCountyImage)) return VENDOR_ORANGE_COUNTY;
  return SHIPPING_VENDOR_USARAKHI;
}

/** True when cart has both UsaRakhi and Orange County (or other) shipping vendors. */
export function cartHasMultipleShippingVendors(
  items: ShippingVendorSource[]
): boolean {
  const keys = new Set(items.map((item) => shippingVendorKey(item)));
  return keys.size > 1;
}

/**
 * Free-shipping groups: each subtotal is one chargeable bucket
 * (delivery address × vendor). Standard shipping is free per bucket.
 */
export function quoteShipmentsShipping(input: {
  shipmentSubtotals: number[];
  currency: ShopCurrency;
  usdInrRate: number;
}): {
  totalCharge: number;
  perShipment: FreeShippingQuote[];
} {
  const perShipment = input.shipmentSubtotals.map((subtotal) =>
    quoteFreeShippingThreshold({
      subtotal,
      currency: input.currency,
      usdInrRate: input.usdInrRate,
    })
  );
  const totalCharge = roundForCurrency(
    perShipment.reduce((sum, q) => sum + q.charge, 0),
    input.currency
  );
  return { totalCharge, perShipment };
}

/** Subtotals keyed by vendor within one delivery address (includes add-ons). */
export function vendorSubtotalsForItems(
  items: Array<{
    price: number;
    quantity: number;
    vendorSlug?: string;
    addons?: Array<{ price: number; quantity: number }>;
  }>
): number[] {
  const byVendor = new Map<string, number>();
  for (const item of items) {
    const key = shippingVendorKey(item);
    byVendor.set(
      key,
      (byVendor.get(key) ?? 0) + cartLineUnitTotal(item) * item.quantity
    );
  }
  return [...byVendor.values()];
}

function alwaysFreeShippingQuote(
  currency: ShopCurrency,
  usdInrRate: number
): FreeShippingQuote {
  const minInCurrency = toCurrency(USARAKHI_MIN_ORDER_USD, currency, usdInrRate);
  return {
    charge: 0,
    qualifiesForFreeShipping: true,
    amountAwayFromFreeShipping: 0,
    amountAwayFromReducedShipping: 0,
    aboveAmountInCurrency: minInCurrency,
    thresholdInCurrency: minInCurrency,
    reducedThresholdInCurrency: toCurrency(
      REDUCED_SHIPPING_MIN_SUBTOTAL_USD,
      currency,
      usdInrRate
    ),
    lowTierFeeInCurrency: 0,
    midTierFeeInCurrency: 0,
    tier: "free",
    belowThresholdFeeInCurrency: 0,
  };
}

function flashComboShippingQuote(
  currency: ShopCurrency,
  usdInrRate: number
): FreeShippingQuote {
  const charge = toCurrency(FLASH_COMBO_SHIPPING_USD, currency, usdInrRate);
  return {
    charge,
    qualifiesForFreeShipping: false,
    amountAwayFromFreeShipping: 0,
    amountAwayFromReducedShipping: 0,
    aboveAmountInCurrency: 0,
    thresholdInCurrency: 0,
    reducedThresholdInCurrency: 0,
    lowTierFeeInCurrency: charge,
    midTierFeeInCurrency: 0,
    tier: "low",
    belowThresholdFeeInCurrency: charge,
  };
}

/**
 * Shipping for one delivery address:
 * UsaRakhi uses a $15 merchandise minimum (top-up shipping below).
 * Orange County is always free shipping.
 * Flash-combo-only buckets use a flat $0.99 shipping fee.
 */
export function quoteAddressShipmentShipping(input: {
  items: Array<{
    price: number;
    quantity: number;
    vendorSlug?: string;
    image?: string;
    images?: string[];
    productSlug?: string;
    tags?: string[];
    freeStandardShipping?: boolean;
    addons?: Array<{ price: number; quantity: number }>;
  }>;
  currency: ShopCurrency;
  usdInrRate: number;
}): {
  totalCharge: number;
  perVendor: FreeShippingQuote[];
} {
  const byVendor = new Map<
    string,
    Array<{
      price: number;
      quantity: number;
      productSlug?: string;
      tags?: string[];
      freeStandardShipping?: boolean;
      addons?: Array<{ price: number; quantity: number }>;
    }>
  >();
  for (const item of input.items) {
    const key = shippingVendorKey(item);
    const list = byVendor.get(key) ?? [];
    list.push(item);
    byVendor.set(key, list);
  }

  const perVendor = [...byVendor.entries()].map(([vendorKey, vendorItems]) => {
    if (vendorKey === VENDOR_ORANGE_COUNTY) {
      return alwaysFreeShippingQuote(input.currency, input.usdInrRate);
    }

    const flashOnly =
      vendorItems.length > 0 &&
      vendorItems.every((i) => isFlashComboProduct(i.productSlug));
    if (flashOnly) {
      return flashComboShippingQuote(input.currency, input.usdInrRate);
    }

    const subtotal = vendorItems.reduce(
      (sum, i) => sum + cartLineUnitTotal(i) * i.quantity,
      0
    );

    return quoteUsarakhiStandardShipping({
      subtotal,
      currency: input.currency,
      usdInrRate: input.usdInrRate,
      items: vendorItems.map((i) => ({
        productSlug: i.productSlug,
        tags: i.tags,
        freeStandardShipping: i.freeStandardShipping,
      })),
    });
  });

  const totalCharge = roundForCurrency(
    perVendor.reduce((sum, q) => sum + q.charge, 0),
    input.currency
  );
  return { totalCharge, perVendor };
}
