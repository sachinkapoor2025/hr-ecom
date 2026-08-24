import type { HomeBanner } from "@/components/BannerCarousel";
import {
  HOME_PAGE_INDEPENDENCE_DAY_BANNER_ALT,
  HOME_PAGE_INDEPENDENCE_DAY_BANNER_PATH,
  LAST_MINUTE_RAKHI_ORDERS_BANNER_ALT,
  LAST_MINUTE_RAKHI_ORDERS_BANNER_PATH,
  RAKSHA_BANDHAN_ORDER_BY_20_BANNER_ALT,
  RAKSHA_BANDHAN_ORDER_BY_20_BANNER_PATH,
} from "@hr-ecom/shared";
import { homeBanners } from "@/lib/site";

/**
 * Independence Day homepage hero campaign (server/UTC clock).
 *
 * Active from STARTS_AT (inclusive) until ENDS_AT (exclusive):
 * through 15 Aug 2026 11:59:59.999 PM server time, then auto-reverts
 * at 16 Aug 2026 12:00:00.000 AM — no manual toggle required.
 */
export const INDEPENDENCE_DAY_HERO_STARTS_AT = "2026-08-09T00:00:00.000Z";
export const INDEPENDENCE_DAY_HERO_ENDS_AT = "2026-08-16T00:00:00.000Z";

/**
 * Extra carousel slide — same asset as marketing email hero
 * (`HOME_PAGE_INDEPENDENCE_DAY_BANNER_*` in @hr-ecom/shared).
 */
export const independenceDayHeroBanner: HomeBanner = {
  src: HOME_PAGE_INDEPENDENCE_DAY_BANNER_PATH,
  alt: HOME_PAGE_INDEPENDENCE_DAY_BANNER_ALT,
  href: "/products",
  eyebrow: "INDEPENDENCE DAY · 15 AUGUST",
  title: "Celebrate Freedom — Send Rakhi Love Across the",
  titleAccent: "USA",
  description:
    "Premium rakhis with fast USA delivery. Perfect for Independence Day & Raksha Bandhan.",
  cta: "Shop Freedom Sale",
  pill: "Independence Day · Fast USA Delivery · Premium Rakhis",
  imageFit: "contain",
};

/** Raksha Bandhan “Order by 20 August” promo — same cover fit as default homepage slides. */
export const rakshaBandhanOrderBy20Banner: HomeBanner = {
  src: RAKSHA_BANDHAN_ORDER_BY_20_BANNER_PATH,
  alt: RAKSHA_BANDHAN_ORDER_BY_20_BANNER_ALT,
  href: "/products?category=rakhi-combo",
  eyebrow: "RAKSHA BANDHAN · ORDER BY 20 AUGUST",
  title: "Raksha Bandhan is just around the",
  titleAccent: "corner!",
  description:
    "Order by 20 August for Guaranteed Delivery Before Rakhi. Shop premium Single Rakhi, Combos, Hampers & more.",
  cta: "Shop Rakhi Now",
  pill: "Order by 20 August · Guaranteed Delivery · Premium Rakhis",
};

/** Last-minute Rakhi orders — first homepage slide through Raksha Bandhan 2026. */
export const LAST_MINUTE_RAKHI_BANNER_STARTS_AT = "2026-08-21T00:00:00.000Z";
export const LAST_MINUTE_RAKHI_BANNER_ENDS_AT = "2026-08-29T07:00:00.000Z";

export const lastMinuteRakhiOrdersBanner: HomeBanner = {
  src: LAST_MINUTE_RAKHI_ORDERS_BANNER_PATH,
  alt: LAST_MINUTE_RAKHI_ORDERS_BANNER_ALT,
  href: "/products",
  eyebrow: "LAST MINUTE · RAKSHA BANDHAN",
  title: "Last Minute Orders? We Deliver Love,",
  titleAccent: "On Time!",
  description: "2-day delivery $39 · 3-day delivery $19 · Send Rakhis to loved ones in the USA",
  cta: "Order Now",
  pill: "Last Minute Orders · 2-day $39 · 3-day $19 · Guaranteed by Rakhi 28 August",
  imageFit: "contain",
};

export function isIndependenceDayHeroActive(now = new Date()): boolean {
  const t = now.getTime();
  const start = new Date(INDEPENDENCE_DAY_HERO_STARTS_AT).getTime();
  const end = new Date(INDEPENDENCE_DAY_HERO_ENDS_AT).getTime();
  return t >= start && t < end;
}

export function isLastMinuteRakhiBannerActive(now = new Date()): boolean {
  const t = now.getTime();
  const start = new Date(LAST_MINUTE_RAKHI_BANNER_STARTS_AT).getTime();
  const end = new Date(LAST_MINUTE_RAKHI_BANNER_ENDS_AT).getTime();
  return t >= start && t < end;
}

/**
 * Homepage hero — default `homeBanners` in existing order.
 * Independence Day slide is prepended only while that campaign window is active.
 * Last-minute Rakhi slide is prepended through Raksha Bandhan 28 August 2026.
 */
export function getHomeBanners(now = new Date()): readonly HomeBanner[] {
  const slides: HomeBanner[] = [...homeBanners];
  if (isIndependenceDayHeroActive(now)) {
    slides.unshift(independenceDayHeroBanner);
  }
  if (isLastMinuteRakhiBannerActive(now)) {
    slides.unshift(lastMinuteRakhiOrdersBanner);
  }
  return slides;
}
