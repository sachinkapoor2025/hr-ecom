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
  { label: "Diwali gifts to New York", href: locationPublicPath("new-york") },
  { label: "Diwali gifts to California", href: locationPublicPath("california") },
  { label: "Diwali gifts to Texas", href: locationPublicPath("texas") },
  { label: "Diwali gifts to Florida", href: locationPublicPath("florida") },
  { label: "Diwali gifts to Chicago", href: locationPublicPath("chicago") },
  { label: "Bhai Dooj gifts to New Jersey", href: locationPublicPath("new-jersey") },
  { label: "Bhai Dooj gifts to Virginia", href: locationPublicPath("virginia") },
  { label: "Bhai Dooj gifts to Washington", href: locationPublicPath("washington") },
  { label: "Diwali gifts to Los Angeles", href: locationPublicPath("los-angeles") },
  { label: "Diwali gifts to Houston", href: locationPublicPath("houston") },
  { label: "Bhai Dooj gifts to Dallas", href: locationPublicPath("dallas") },
  { label: "Diwali gifts to Atlanta", href: locationPublicPath("atlanta") },
  { label: "Bhai Dooj gifts to Boston", href: locationPublicPath("boston") },
  { label: "Diwali gifts to Seattle", href: locationPublicPath("seattle") },
  { label: "Bhai Dooj gifts to Miami", href: locationPublicPath("miami") },
  { label: "Diwali gifts to San Francisco", href: locationPublicPath("san-francisco") },
  { label: "Diwali gifts to San Diego", href: locationPublicPath("san-diego") },
  { label: "Bhai Dooj gifts to Austin", href: locationPublicPath("austin") },
  { label: "Diwali gifts to Denver", href: locationPublicPath("denver") },
  { label: "Bhai Dooj gifts to Phoenix", href: locationPublicPath("phoenix") },
];

/**
 * Explore More link groups for product pages.
 * Category links use the public Diwali and Bhai Dooj collection paths.
 */
export const EXPLORE_MORE_GROUPS: ExploreMoreGroup[] = [
  {
    heading: "Gifts by City",
    links: CITY_LINKS,
  },
  {
    heading: "Diwali Gifts",
    links: [
      { label: "Diwali gift combos", href: categoryHref("diwali") },
      { label: "Diwali sweet combos", href: categoryHref("sweet-combos") },
      { label: "Diwali chocolate boxes", href: categoryHref("chocolate-combos") },
      { label: "Diwali dry fruit hampers", href: categoryHref("dry-fruit-combos") },
      { label: "Diwali pooja sets", href: categoryHref("pooja-sets") },
    ],
  },
  {
    heading: "Bhai Dooj Gifts",
    links: [
      { label: "Bhai Dooj gifts for brother", href: categoryHref("bhai-dooj") },
      { label: "Bhai Dooj sweet boxes", href: categoryHref("sweet-combos") },
      { label: "Bhai Dooj chocolates", href: categoryHref("chocolate-combos") },
      { label: "Bhai Dooj dry fruit hampers", href: categoryHref("dry-fruit-combos") },
      { label: "Bhai Dooj pooja gifts", href: categoryHref("pooja-sets") },
    ],
  },
  {
    heading: "Sweets, Chocolates and Dry Fruits",
    links: [
      { label: "Sweet combos", href: categoryHref("sweet-combos") },
      { label: "Chocolate combos", href: categoryHref("chocolate-combos") },
      { label: "Dry fruit hampers", href: categoryHref("dry-fruit-combos") },
      { label: "Festive gift hampers", href: categoryHref("diwali") },
      { label: "Shop all festive gifts", href: "/products" },
    ],
  },
  {
    heading: "Popular Festive Picks",
    links: [
      { label: "Bhai Dooj gift collection", href: categoryHref("bhai-dooj") },
      { label: "Diwali gift collection", href: categoryHref("diwali") },
      { label: "Traditional sweet hampers", href: categoryHref("sweet-combos") },
      { label: "Chocolate gift boxes", href: categoryHref("chocolate-combos") },
      { label: "Mixed dry fruit boxes", href: categoryHref("dry-fruit-combos") },
    ],
  },
];
