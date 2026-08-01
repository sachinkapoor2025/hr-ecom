import {
  convertCurrencyAmount,
  roundForCurrency,
  type ShopCurrency,
} from "../currency";

/** Cart subtotal at or above this (USD) unlocks free shipping. */
export const FREE_SHIPPING_MIN_SUBTOTAL_USD = 7;

/** Flat shipping charged when cart is below the free-shipping threshold. */
export const BELOW_THRESHOLD_SHIPPING_USD = 6.99;

export type FreeShippingQuote = {
  /** Shipping charged to the customer in `currency`. */
  charge: number;
  qualifiesForFreeShipping: boolean;
  /** How much more cart value (in `currency`) is needed for free shipping. */
  amountAwayFromFreeShipping: number;
  /** Free-shipping threshold expressed in `currency`. */
  thresholdInCurrency: number;
  /** Shipping fee when below threshold, in `currency`. */
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
 * Free-shipping threshold rule: cart under $7 → $6.99 shipping; $7+ → free.
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
  const belowThresholdFeeInCurrency = toCurrency(
    BELOW_THRESHOLD_SHIPPING_USD,
    currency,
    usdInrRate
  );
  const subtotalUsd = toUsd(subtotal, currency, usdInrRate);
  const qualifiesForFreeShipping = subtotalUsd >= FREE_SHIPPING_MIN_SUBTOTAL_USD;
  const charge = qualifiesForFreeShipping ? 0 : belowThresholdFeeInCurrency;
  const amountAwayFromFreeShipping = qualifiesForFreeShipping
    ? 0
    : Math.max(0, roundForCurrency(thresholdInCurrency - subtotal, currency));

  return {
    charge,
    qualifiesForFreeShipping,
    amountAwayFromFreeShipping,
    thresholdInCurrency,
    belowThresholdFeeInCurrency,
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
 * (delivery address × vendor). Under $7 → $6.99; $7+ → free. Total = sum.
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
 * Shipping for one delivery address: evaluate the $7 / $6.99 rule per vendor
 * inside that address (UsaRakhi vs Orange County, etc.), then sum.
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
