/**
 * Homepage hero banner assets shared by the storefront and marketing emails.
 * Keep paths in sync — emails use absolute URLs; the web app uses relative `/banners/…`.
 */

export const SITE_ORIGIN = "https://www.usarakhi.com";

/** Relative public path of the Independence Day homepage hero (first carousel slide while active). */
export const HOME_PAGE_INDEPENDENCE_DAY_BANNER_PATH =
  "/banners/banner-independence-day-2026.png" as const;

/** Absolute URL for the same banner (email clients require absolute image src). */
export const HOME_PAGE_INDEPENDENCE_DAY_BANNER_URL = `${SITE_ORIGIN}${HOME_PAGE_INDEPENDENCE_DAY_BANNER_PATH}`;

export const HOME_PAGE_INDEPENDENCE_DAY_BANNER_ALT =
  "India Independence Day Freedom Sale — Send Rakhi to USA | UsaRakhi" as const;

/** Raksha Bandhan “Order by 20 August” campaign banner (homepage + marketing email). */
export const RAKSHA_BANDHAN_ORDER_BY_20_BANNER_PATH =
  "/banners/banner-raksha-bandhan-order-by-20-august.png" as const;

export const RAKSHA_BANDHAN_ORDER_BY_20_BANNER_URL = `${SITE_ORIGIN}${RAKSHA_BANDHAN_ORDER_BY_20_BANNER_PATH}`;

/**
 * Email hero must be first-party (same brand domain).
 * Third-party hosts (jsDelivr/GitHub) make Gmail hide images as “suspicious”.
 * File path: apps/web/public/email-templates/raksha-bandhan-order-by-20-august-banner.png
 */
export const RAKSHA_BANDHAN_ORDER_BY_20_EMAIL_BANNER_PATH =
  "/email-templates/raksha-bandhan-order-by-20-august-banner.png" as const;

export const RAKSHA_BANDHAN_ORDER_BY_20_EMAIL_BANNER_URL =
  `${SITE_ORIGIN}${RAKSHA_BANDHAN_ORDER_BY_20_EMAIL_BANNER_PATH}` as const;

export const RAKSHA_BANDHAN_ORDER_BY_20_BANNER_ALT =
  "Raksha Bandhan is just around the corner — Order by 20 August for Guaranteed Delivery Before Rakhi | UsaRakhi" as const;

/**
 * First homepage banner image for marketing emails.
 * Matches the Independence Day slide prepended by `getHomeBanners()` on the storefront.
 */
export function getFirstHomePageBannerForEmail(): {
  src: string;
  alt: string;
  href: string;
} {
  return {
    src: HOME_PAGE_INDEPENDENCE_DAY_BANNER_URL,
    alt: HOME_PAGE_INDEPENDENCE_DAY_BANNER_ALT,
    href: `${SITE_ORIGIN}/products`,
  };
}
