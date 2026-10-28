/**
 * Delivery-tier classification for /send-gifts-to-{slug} pages.
 * Express metros keep individually maintained copy (city-pages.ts).
 * Secondary cities share one thin template driven by this data file.
 */

/** Major metros — keep differentiated landing content. */
export const EXPRESS_METRO_SLUGS = [
  "new-york",
  "los-angeles",
  "chicago",
  "houston",
  "san-francisco",
  "new-jersey",
] as const;

export type ExpressMetroSlug = (typeof EXPRESS_METRO_SLUGS)[number];

export function isExpressMetro(slug: string): slug is ExpressMetroSlug {
  return (EXPRESS_METRO_SLUGS as readonly string[]).includes(slug);
}

export interface SecondaryCity {
  slug: string;
  name: string;
  state: string;
  /** Nearby express / major metro for internal linking (not a canonical target). */
  nearbyMetroSlug: ExpressMetroSlug | "san-jose";
  nearbyMetroLabel: string;
  /** Heuristic search-demand flag for editorial decisions (not from Search Console). */
  searchPotential: "moderate" | "low" | "very-low";
}

/**
 * Secondary city doorways that previously shared near-identical boilerplate.
 * Public URL stays /send-gifts-to-{slug}; content uses SecondaryCityLanding.
 */
export const SECONDARY_CITIES: SecondaryCity[] = [
  { slug: "anaheim", name: "Anaheim", state: "California", nearbyMetroSlug: "los-angeles", nearbyMetroLabel: "Los Angeles", searchPotential: "low" },
  { slug: "berkeley", name: "Berkeley", state: "California", nearbyMetroSlug: "san-francisco", nearbyMetroLabel: "San Francisco Bay Area", searchPotential: "low" },
  { slug: "cupertino", name: "Cupertino", state: "California", nearbyMetroSlug: "san-francisco", nearbyMetroLabel: "San Francisco Bay Area", searchPotential: "very-low" },
  { slug: "dublin-california", name: "Dublin", state: "California", nearbyMetroSlug: "san-francisco", nearbyMetroLabel: "San Francisco Bay Area", searchPotential: "very-low" },
  { slug: "fremont", name: "Fremont", state: "California", nearbyMetroSlug: "san-francisco", nearbyMetroLabel: "San Francisco Bay Area", searchPotential: "low" },
  { slug: "fresno", name: "Fresno", state: "California", nearbyMetroSlug: "los-angeles", nearbyMetroLabel: "California", searchPotential: "low" },
  { slug: "dallas", name: "Dallas", state: "Texas", nearbyMetroSlug: "houston", nearbyMetroLabel: "Texas", searchPotential: "moderate" },
  { slug: "austin", name: "Austin", state: "Texas", nearbyMetroSlug: "houston", nearbyMetroLabel: "Texas", searchPotential: "moderate" },
  { slug: "atlanta", name: "Atlanta", state: "Georgia", nearbyMetroSlug: "chicago", nearbyMetroLabel: "Chicago", searchPotential: "moderate" },
  { slug: "seattle", name: "Seattle", state: "Washington", nearbyMetroSlug: "san-francisco", nearbyMetroLabel: "San Francisco Bay Area", searchPotential: "moderate" },
  { slug: "edison-nj", name: "Edison", state: "New Jersey", nearbyMetroSlug: "new-jersey", nearbyMetroLabel: "New Jersey", searchPotential: "moderate" },
  { slug: "jersey-city", name: "Jersey City", state: "New Jersey", nearbyMetroSlug: "new-jersey", nearbyMetroLabel: "New Jersey", searchPotential: "moderate" },
  { slug: "washington-dc", name: "Washington", state: "District of Columbia", nearbyMetroSlug: "new-york", nearbyMetroLabel: "New York", searchPotential: "moderate" },
  { slug: "fairfax-virginia", name: "Fairfax", state: "Virginia", nearbyMetroSlug: "new-york", nearbyMetroLabel: "New York / East Coast", searchPotential: "very-low" },
];

const secondaryBySlug = new Map(SECONDARY_CITIES.map((c) => [c.slug, c]));

export function getSecondaryCity(slug: string): SecondaryCity | undefined {
  return secondaryBySlug.get(slug);
}

export function isSecondaryCity(slug: string): boolean {
  return secondaryBySlug.has(slug);
}

export function allSecondaryCitySlugs(): string[] {
  return SECONDARY_CITIES.map((c) => c.slug);
}

/** Deterministic hash so the same city always gets the same intro variant. */
function slugVariantIndex(slug: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h % modulo;
}

/**
 * Rotating intro lines for secondary city doorways — reduces exact-duplicate
 * boilerplate across /send-gifts-to-{slug} without changing routes.
 */
export function secondaryCityIntro(slug: string, city: string, state: string): string {
  const place = `${city}, ${state}`;
  const variants = [
    `UsaRakhi delivers Diwali and Bhai Dooj gifts to ${place} in 5–7 business days. Order from India, the UK, Canada, or anywhere else — the parcel ships inside the United States.`,
    `Sending sweets, dry fruits, or a festive hamper to ${place}? UsaRakhi fulfills the order in America, so it is not an international parcel.`,
    `${place} deliveries use the standard USA window of 5–7 business days after dispatch. Pay in INR or USD and enter the local address at checkout.`,
    `Diwali and Bhai Dooj gifts for ${place} are packed as the product page describes and shipped domestically across the United States.`,
  ];
  return variants[slugVariantIndex(slug, variants.length)]!;
}

/** A second, different paragraph so secondary city pages are not copies of each other. */
export function secondaryCityGiftNote(slug: string, city: string, state: string): string {
  const place = `${city}, ${state}`;
  const variants = [
    `For ${place}, a Bhai Dooj box is the direct gift for a brother. The product name is the contents, such as kaju katli, nuts, chocolate, or kumkum. A Diwali combo is the better fit when the hamper should include a pooja piece or decor with sweets or dry fruits.`,
    `Shoppers sending to ${place} usually start with the occasion. Bhai Dooj listings are brother gifts. Diwali listings pair a thali, toran, rangoli, or Shubh Labh with food. Sweet, dry fruit, chocolate, and pooja pages regroup the same boxes by what is inside.`,
    `A gift for ${place} is a fixed hamper, not a custom box. Open the product page for the included list before checkout. Weights and piece counts appear only when that listing states them.`,
    `Orders for ${place} need a full US address at checkout. Carts of $15 or more qualify for free shipping, Orange County products ship free, and a mixed-vendor cart is calculated separately.`,
  ];
  return variants[slugVariantIndex(slug, variants.length)]!;
}
