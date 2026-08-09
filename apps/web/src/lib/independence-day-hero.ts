import type { HomeBanner } from "@/components/BannerCarousel";
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

/** Extra carousel slide — taller art uses contain so nothing is cropped. */
export const independenceDayHeroBanner: HomeBanner = {
  src: "/banners/banner-independence-day-2026.png",
  alt: "Celebrate India's Independence Day — Send Rakhi to USA | UsaRakhi Great Freedom Sale",
  href: "/products",
  eyebrow: "INDEPENDENCE DAY · 15 AUGUST",
  title: "🇮🇳 Celebrate India's Independence Day with Love Across the",
  titleAccent: "USA",
  description:
    "Celebrate the spirit of freedom by sending beautiful Rakhis to your loved ones across the USA. Enjoy fast delivery, premium quality, and make this Independence Day & Raksha Bandhan even more memorable.",
  cta: "Shop Independence Collection",
  pill: "🇮🇳 Independence Day · Fast USA Delivery · Premium Rakhis",
  imageFit: "contain",
};

export function isIndependenceDayHeroActive(now = new Date()): boolean {
  const t = now.getTime();
  const start = new Date(INDEPENDENCE_DAY_HERO_STARTS_AT).getTime();
  const end = new Date(INDEPENDENCE_DAY_HERO_ENDS_AT).getTime();
  return t >= start && t < end;
}

/**
 * Homepage hero only — prepends the Independence Day slide while the campaign
 * is active; all default `homeBanners` stay in the carousel after it.
 */
export function getHomeBanners(now = new Date()): readonly HomeBanner[] {
  if (isIndependenceDayHeroActive(now)) {
    return [independenceDayHeroBanner, ...homeBanners];
  }
  return homeBanners;
}
