/**
 * Admin test price for the dev storefront only.
 * The live catalog row stays unchanged; Amplify sets NEXT_PUBLIC_DEV_TEST_PRICE on the dev branch.
 */
export const DEV_TEST_PRICE_SLUG = "bhai-dooj-kaju-katli-and-kumkum-gift-box";

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
  const slug = item.slug ?? item.productSlug;
  if (slug !== DEV_TEST_PRICE_SLUG) return item;
  return { ...item, price: 99, currency: "INR" };
}
