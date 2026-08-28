import { roundForCurrency, type ShopCurrency } from "../currency";
import { withFlashComboStorefrontPricing } from "./flash-sale";

/**
 * Competitive storefront price cuts (applied to catalog selling price before FX).
 * Same % applies in USD and INR because conversion happens after this reduction.
 *
 * - under $25 → 8% off
 * - $25–$29.99 → 10% off
 * - $30+ → 12% off
 */
export function getCompetitiveDiscountPercent(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0;
  if (price < 25) return 8;
  if (price < 30) return 10;
  return 12;
}

/** Reduce a catalog price by the competitive tier %; rounds for the currency. */
export function applyCompetitivePriceReduction(
  price: number,
  currency: ShopCurrency = "USD"
): number {
  const percent = getCompetitiveDiscountPercent(price);
  if (percent <= 0) return roundForCurrency(price, currency);
  return roundForCurrency(price * (1 - percent / 100), currency);
}

type Priced = {
  price: number;
  compareAtPrice?: number;
  currency?: ShopCurrency;
  /** Set after competitive pricing runs — makes this helper idempotent across API/catalog paths. */
  storefrontPricingApplied?: boolean;
};

/**
 * Storefront view of a product: lower selling price + keep/raise compare-at
 * so the original catalog price still shows as strikethrough.
 * Does not mutate DynamoDB — admin continues to see stored prices.
 */
type VendorPriced = Priced & {
  vendorSlug?: string;
  categorySlug?: string;
  couponExcluded?: boolean;
  tags?: string[];
  slug?: string;
};

/** @deprecated Competitive storefront cuts are disabled; catalog prices display as stored. */
export const MIN_USARAKHI_STOREFRONT_PRICE_USD = 1.99;

/**
 * Storefront view of a product. Catalog selling prices are shown as stored
 * (UsaRakhi $1.99 / $2.50 / $2.99 / $4.99 tiers and Orange County vendor+35%).
 * Flash combo still overlays its coded sale price.
 * Safe to call more than once.
 */
export function withCompetitiveStorefrontPricing<T extends VendorPriced>(product: T): T {
  const priced = withFlashComboStorefrontPricing(product);
  if (priced.storefrontPricingApplied) return priced;
  return { ...priced, storefrontPricingApplied: true };
}
