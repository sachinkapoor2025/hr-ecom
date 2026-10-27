/**
 * Admin test price for the dev storefront only.
 * The live catalog row stays unchanged; Amplify sets NEXT_PUBLIC_DEV_TEST_PRICE on the dev branch.
 * Checkout charges the same amount when the API sees the dev storefront origin.
 */
import { withDevTestStorefrontPrice } from "@hr-ecom/shared";

export { DEV_TEST_PRICE_SLUG } from "@hr-ecom/shared";

type Priced = {
  slug?: string;
  productSlug?: string;
  price: number;
  currency?: string;
};

export function devTestPriceEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEV_TEST_PRICE === "1";
}

export function applyDevTestPrice<T extends Priced>(item: T): T {
  if (!devTestPriceEnabled()) return item;
  return withDevTestStorefrontPrice(item);
}
