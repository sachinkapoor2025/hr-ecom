/**
 * Dev-storefront price for one hamper. The shared catalog row stays at its
 * live selling price; the dev site shows and charges this amount instead.
 */
export const DEV_TEST_PRICE_SLUG = "bhai-dooj-kaju-katli-and-kumkum-gift-box";
export const DEV_TEST_PRICE_INR = 99;

type Priced = {
  slug?: string;
  productSlug?: string;
  price: number;
  currency?: string;
};

export function withDevTestStorefrontPrice<T extends Priced>(item: T): T {
  const slug = item.slug ?? item.productSlug;
  if (slug !== DEV_TEST_PRICE_SLUG) return item;
  return { ...item, price: DEV_TEST_PRICE_INR, currency: "INR" };
}

/** True for the Amplify dev branch host (dev.<appId>.amplifyapp.com). */
export function isDevStorefrontHost(hostOrUrl: string | undefined | null): boolean {
  if (!hostOrUrl) return false;
  let host = hostOrUrl.trim().toLowerCase();
  if (!host) return false;
  try {
    if (host.includes("://")) host = new URL(host).host.toLowerCase();
  } catch {
    return false;
  }
  return host.startsWith("dev.") && host.endsWith(".amplifyapp.com");
}

export function devStorefrontTestPriceActive(input: {
  origin?: string | null;
  envFlag?: string | null;
}): boolean {
  if (input.envFlag === "1") return true;
  return isDevStorefrontHost(input.origin);
}
