import {
  convertCurrencyAmount,
  roundForCurrency,
  type ShopCurrency,
} from "../currency";

/** Cart subtotal at or above this (USD) unlocks free shipping. */
export const FREE_SHIPPING_MIN_SUBTOTAL_USD = 10.99;

/**
 * At or above this (USD) and below free-shipping threshold → reduced $2.99 shipping.
 * Below this → $6.99 shipping.
 */
export const REDUCED_SHIPPING_MIN_SUBTOTAL_USD = 7;

/** Flat shipping when bucket is under $7. */
export const BELOW_THRESHOLD_SHIPPING_USD = 6.99;

/** Flat shipping when bucket is $7+ but under $10.99. */
export const REDUCED_SHIPPING_USD = 2.99;

export type FreeShippingTier = "low" | "mid" | "free";

export type FreeShippingQuote = {
  /** Shipping charged to the customer in `currency`. */
  charge: number;
  qualifiesForFreeShipping: boolean;
  /** How much more cart value (in `currency`) is needed for free shipping. */
  amountAwayFromFreeShipping: number;
  /** How much more cart value (in `currency`) is needed to reach the $2.99 tier. */
  amountAwayFromReducedShipping: number;
  /** Free-shipping threshold expressed in `currency`. */
  thresholdInCurrency: number;
  /** Reduced-shipping ($2.99) threshold expressed in `currency`. */
  reducedThresholdInCurrency: number;
  /** $6.99 tier fee in `currency`. */
  lowTierFeeInCurrency: number;
  /** $2.99 tier fee in `currency`. */
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

function toUsd(
  amount: number,
  currency: ShopCurrency,
  usdInrRate: number
): number {
  if (currency === "USD") return amount;
  return convertCurrencyAmount(amount, "INR", "USD", usdInrRate);
}

/**
 * Shipping tiers (per address × vendor bucket, in USD):
 * - under $7 → $6.99
 * - $7 to under $10.99 → $2.99
 * - $10.99+ → free
 * Evaluated in USD, then converted when the shopper currency is INR.
 */
export function quoteFreeShippingThreshold(input: {
  subtotal: number;
  currency: ShopCurrency;
  usdInrRate: number;
}): FreeShippingQuote {
  const { subtotal, currency, usdInrRate } = input;
  const thresholdInCurrency = toCurrency(
    FREE_SHIPPING_MIN_SUBTOTAL_USD,
    currency,
    usdInrRate
  );
  const reducedThresholdInCurrency = toCurrency(
    REDUCED_SHIPPING_MIN_SUBTOTAL_USD,
    currency,
    usdInrRate
  );
  const lowTierFee = toCurrency(BELOW_THRESHOLD_SHIPPING_USD, currency, usdInrRate);
  const midTierFee = toCurrency(REDUCED_SHIPPING_USD, currency, usdInrRate);
  const subtotalUsd = toUsd(subtotal, currency, usdInrRate);

  let charge = 0;
  let qualifiesForFreeShipping = false;
  let tier: FreeShippingTier = "low";
  if (subtotalUsd >= FREE_SHIPPING_MIN_SUBTOTAL_USD) {
    qualifiesForFreeShipping = true;
    tier = "free";
    charge = 0;
  } else if (subtotalUsd >= REDUCED_SHIPPING_MIN_SUBTOTAL_USD) {
    tier = "mid";
    charge = midTierFee;
  } else {
    tier = "low";
    charge = lowTierFee;
  }

  const amountAwayFromFreeShipping = qualifiesForFreeShipping
    ? 0
    : Math.max(0, roundForCurrency(thresholdInCurrency - subtotal, currency));
  const amountAwayFromReducedShipping =
    tier === "low"
      ? Math.max(0, roundForCurrency(reducedThresholdInCurrency - subtotal, currency))
      : 0;

  return {
    charge,
    qualifiesForFreeShipping,
    amountAwayFromFreeShipping,
    amountAwayFromReducedShipping,
    thresholdInCurrency,
    reducedThresholdInCurrency,
    lowTierFeeInCurrency: lowTierFee,
    midTierFeeInCurrency: midTierFee,
    tier,
    belowThresholdFeeInCurrency: charge,
  };
}

/** Default vendor bucket for catalog SKUs without `vendorSlug` (UsaRakhi). */
export const SHIPPING_VENDOR_USARAKHI = "usarakhi";

/** Normalize cart/product vendor for per-vendor free-shipping buckets. */
export function shippingVendorKey(item: { vendorSlug?: string }): string {
  const slug = item.vendorSlug?.trim();
  return slug || SHIPPING_VENDOR_USARAKHI;
}

/**
 * Free-shipping groups: each subtotal is one chargeable bucket
 * (delivery address × vendor). Tiers apply per bucket; total = sum.
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

/** Subtotals keyed by vendor within one delivery address. */
export function vendorSubtotalsForItems(
  items: Array<{ price: number; quantity: number; vendorSlug?: string }>
): number[] {
  const byVendor = new Map<string, number>();
  for (const item of items) {
    const key = shippingVendorKey(item);
    byVendor.set(key, (byVendor.get(key) ?? 0) + item.price * item.quantity);
  }
  return [...byVendor.values()];
}

/**
 * Shipping for one delivery address: evaluate tiers per vendor inside that
 * address (UsaRakhi vs Orange County, etc.), then sum.
 */
export function quoteAddressShipmentShipping(input: {
  items: Array<{ price: number; quantity: number; vendorSlug?: string }>;
  currency: ShopCurrency;
  usdInrRate: number;
}): {
  totalCharge: number;
  perVendor: FreeShippingQuote[];
} {
  const { totalCharge, perShipment } = quoteShipmentsShipping({
    shipmentSubtotals: vendorSubtotalsForItems(input.items),
    currency: input.currency,
    usdInrRate: input.usdInrRate,
  });
  return { totalCharge, perVendor: perShipment };
}
