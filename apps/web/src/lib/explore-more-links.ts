import { categoryHref } from "@/lib/category-urls";
import { locationPublicPath } from "@/lib/content/seo-data";

export type ExploreMoreLink = {
  label: string;
  href: string;
};

export type ExploreMoreGroup = {
  heading: string;
  links: ExploreMoreLink[];
};

/** Major USA city / state doorways for PDP “Explore More” internal links. */
const CITY_LINKS: ExploreMoreLink[] = [
  { label: "Gifts to New York", href: locationPublicPath("new-york") },
  { label: "Gifts to California", href: locationPublicPath("california") },
  { label: "Gifts to Texas", href: locationPublicPath("texas") },
  { label: "Gifts to Florida", href: locationPublicPath("florida") },
  { label: "Gifts to Chicago", href: locationPublicPath("chicago") },
  { label: "Gifts to New Jersey", href: locationPublicPath("new-jersey") },
  { label: "Gifts to Virginia", href: locationPublicPath("virginia") },
  { label: "Gifts to Washington", href: locationPublicPath("washington") },
  { label: "Gifts to Los Angeles", href: locationPublicPath("los-angeles") },
  { label: "Gifts to Houston", href: locationPublicPath("houston") },
  { label: "Gifts to Dallas", href: locationPublicPath("dallas") },
  { label: "Gifts to Atlanta", href: locationPublicPath("atlanta") },
  { label: "Gifts to Boston", href: locationPublicPath("boston") },
  { label: "Gifts to Seattle", href: locationPublicPath("seattle") },
  { label: "Gifts to Miami", href: locationPublicPath("miami") },
  { label: "Gifts to San Francisco", href: locationPublicPath("san-francisco") },
  { label: "Gifts to San Diego", href: locationPublicPath("san-diego") },
  { label: "Gifts to Austin", href: locationPublicPath("austin") },
  { label: "Gifts to Denver", href: locationPublicPath("denver") },
  { label: "Gifts to Phoenix", href: locationPublicPath("phoenix") },
];

/**
 * FNP-style Explore More link groups for product pages.
 * Category links use public SEO paths; other groups use /collections/* landings.
 */
export const EXPLORE_MORE_GROUPS: ExploreMoreGroup[] = [
  {
    heading: "Rakhi by Cities",
    links: CITY_LINKS,
  },
  {
    heading: "Rakhi by Type",
    links: [
      { label: "Single Rakhi", href: categoryHref("single-rakhi") },
      { label: "Bhaiya Bhabhi Rakhi", href: categoryHref("bhaiya-bhabhi-rakhi") },
      { label: "Kids Rakhi", href: categoryHref("kids-rakhi") },
      { label: "Lumba Rakhi", href: categoryHref("lumba-rakhi") },
      { label: "Rakhi Sets", href: "/collections/rakhi-sets" },
      { label: "Rakhi Hampers", href: categoryHref("rakhi-hampers") },
      { label: "Personalized Rakhi", href: "/collections/personalized-rakhi" },
      { label: "Premium Rakhi", href: "/collections/premium-rakhi" },
    ],
  },
  {
    heading: "Rakhi by Recipient",
    links: [
      { label: "Rakhi for Brother", href: "/collections/rakhi-for-brother" },
      { label: "Rakhi for Bhaiya", href: "/collections/rakhi-for-bhaiya" },
      { label: "Rakhi for Bhabhi", href: "/collections/rakhi-for-bhabhi" },
      { label: "Rakhi for Kids", href: categoryHref("kids-rakhi") },
      { label: "Rakhi for Cousin Brother", href: "/collections/rakhi-for-cousin-brother" },
    ],
  },
  {
    heading: "Rakhi by Price",
    links: [
      { label: "Rakhi Under $10", href: "/collections/rakhi-under-10" },
      { label: "Under $20", href: "/collections/rakhi-under-20" },
      { label: "Under $30", href: "/collections/rakhi-under-30" },
      { label: "Premium Rakhi", href: "/collections/premium-rakhi" },
    ],
  },
  {
    heading: "Popular Collections",
    links: [
      { label: "Best Selling Rakhis", href: "/collections/best-selling-rakhis" },
      { label: "New Arrivals", href: "/collections/new-arrivals" },
      { label: "Trending Rakhis", href: "/collections/trending-rakhis" },
      { label: "Designer Rakhis", href: "/collections/designer-rakhis" },
      { label: "Festival Special Rakhis", href: "/collections/festival-special-rakhis" },
    ],
  },
];
