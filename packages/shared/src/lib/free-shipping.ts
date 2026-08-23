import {
  convertCurrencyAmount,
  roundForCurrency,
  type ShopCurrency,
} from "../currency";
import {
  FLASH_COMBO_SHIPPING_USD,
  isFlashComboProduct,
} from "./flash-sale";
import { cartLineUnitTotal } from "./product-addons";

/**
 * Standard shipping is always free (no cart minimum).
 * Expedited 3-day ($19) / 2-day ($39) are separate checkout options.
 */
export const STANDARD_SHIPPING_ALWAYS_FREE = true;

/** @deprecated No minimum — standard shipping is always free. Kept for API/UI compat. */
export const FREE_SHIPPING_ABOVE_USD = 0;

/** @deprecated No minimum — standard shipping is always free. */
export const FREE_SHIPPING_MIN_SUBTOTAL_USD = 0;

/** @deprecated Legacy mid-tier threshold (unused while standard shipping is free). */
export const REDUCED_SHIPPING_MIN_SUBTOTAL_USD = 10;

/** @deprecated Legacy low-tier fee (unused while standard shipping is free). */
export const BELOW_THRESHOLD_SHIPPING_USD = 0;

/** @deprecated Legacy mid-tier fee (unused while standard shipping is free). */
export const REDUCED_SHIPPING_USD = 0;

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
 * Standard shipping quote — always free (no cart minimum).
 * Flash-combo-only buckets still use a flat fee via `quoteAddressShipmentShipping`.
 */
export function quoteFreeShippingThreshold(input: {
  subtotal: number;
  currency: ShopCurrency;
  usdInrRate: number;
}): FreeShippingQuote {
  const { currency, usdInrRate } = input;
  return {
    charge: 0,
    qualifiesForFreeShipping: true,
    amountAwayFromFreeShipping: 0,
    amountAwayFromReducedShipping: 0,
    aboveAmountInCurrency: toCurrency(FREE_SHIPPING_ABOVE_USD, currency, usdInrRate),
    thresholdInCurrency: toCurrency(FREE_SHIPPING_MIN_SUBTOTAL_USD, currency, usdInrRate),
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

/** Default vendor bucket for catalog SKUs without `vendorSlug` (UsaRakhi). */
export const SHIPPING_VENDOR_USARAKHI = "usarakhi";

/** Normalize cart/product vendor for per-vendor free-shipping buckets. */
export function shippingVendorKey(item: { vendorSlug?: string }): string {
  const slug = item.vendorSlug?.trim();
  return slug || SHIPPING_VENDOR_USARAKHI;
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
 * Shipping for one delivery address: standard is free per vendor bucket.
 * Flash-combo-only buckets use a flat $0.99 shipping fee.
 */
export function quoteAddressShipmentShipping(input: {
  items: Array<{
    price: number;
    quantity: number;
    vendorSlug?: string;
    productSlug?: string;
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
      addons?: Array<{ price: number; quantity: number }>;
    }>
  >();
  for (const item of input.items) {
    const key = shippingVendorKey(item);
    const list = byVendor.get(key) ?? [];
    list.push(item);
    byVendor.set(key, list);
  }

  const perVendor = [...byVendor.values()].map((vendorItems) => {
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
    return quoteFreeShippingThreshold({
      subtotal,
      currency: input.currency,
      usdInrRate: input.usdInrRate,
    });
  });

  const totalCharge = roundForCurrency(
    perVendor.reduce((sum, q) => sum + q.charge, 0),
    input.currency
  );
  return { totalCharge, perVendor };
}
