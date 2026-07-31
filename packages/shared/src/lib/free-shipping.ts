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
