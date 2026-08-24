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

/** Homepage carousel slide — first slide from `getHomeBanners()` (Order by 20 August). */
export const RAKSHA_BANDHAN_ORDER_BY_20_BANNER_PATH =
  "/banners/banner-raksha-bandhan-order-by-20-august.png" as const;

export const RAKSHA_BANDHAN_ORDER_BY_20_BANNER_URL = `${SITE_ORIGIN}${RAKSHA_BANDHAN_ORDER_BY_20_BANNER_PATH}`;

export const RAKSHA_BANDHAN_ORDER_BY_20_BANNER_ALT =
  "Raksha Bandhan Aug 28 — Standard ~90% Rakhi-day · 3-day/2-day confirmed | UsaRakhi" as const;

/** Last-minute Rakhi orders campaign graphic (email + homepage). */
export const LAST_MINUTE_RAKHI_ORDERS_BANNER_PATH =
  "/banners/banner-last-minute-rakhi-orders.png" as const;

export const LAST_MINUTE_RAKHI_ORDERS_BANNER_URL = `${SITE_ORIGIN}${LAST_MINUTE_RAKHI_ORDERS_BANNER_PATH}`;

export const LAST_MINUTE_RAKHI_ORDERS_BANNER_ALT =
  "Last Minute Orders? We deliver love, on time — 2-day $39, 3-day $19 | UsaRakhi" as const;

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

/**
 * Current first homepage carousel slide (Order by 20 August) for marketing emails.
 * Same asset as `rakshaBandhanOrderBy20Banner` in the storefront hero.
 */
export function getOrderBy20HomePageBannerForEmail(): {
  src: string;
  alt: string;
  href: string;
} {
  return {
    src: RAKSHA_BANDHAN_ORDER_BY_20_BANNER_URL,
    alt: RAKSHA_BANDHAN_ORDER_BY_20_BANNER_ALT,
    href: `${SITE_ORIGIN}/products?category=rakhi-combo`,
  };
}

/** Last-minute Rakhi orders banner for marketing emails. */
export function getLastMinuteRakhiOrdersBannerForEmail(): {
  src: string;
  alt: string;
  href: string;
} {
  return {
    src: LAST_MINUTE_RAKHI_ORDERS_BANNER_URL,
    alt: LAST_MINUTE_RAKHI_ORDERS_BANNER_ALT,
    href: `${SITE_ORIGIN}/products`,
  };
}
