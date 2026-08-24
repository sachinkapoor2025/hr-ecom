import { VENDOR_ORANGE_COUNTY } from "../constants";

/** Cost-price tiers for eligible UsaRakhi single & combo rakhis (no chocolates / dry fruit). */
export const USARAKHI_COST_RAKHI_PRICES_USD = [3, 5, 7] as const;
export type UsarakhiCostRakhiPriceUsd = (typeof USARAKHI_COST_RAKHI_PRICES_USD)[number];

const PLAIN_RAKHI_CATEGORIES = new Set(["single-rakhi", "rakhi-combo"]);

const CHOCOLATE_OR_EXTRA_SIGNAL =
  /chocolate|chocolates|ferrero|lindor|lindt|hershey|kitkat|dairy\s*milk|snicker|milky\s*way|mixed\s*choc|kaju\s*katli|besan\s*ladd|soan\s*papdi|dry\s*fruit|dry\s*fruits|mithai|hamper|nuts|almond|cashew|pistach|badam|kaju|pista/i;

export type PlainRakhiProduct = {
  name?: string;
  slug?: string;
  description?: string;
  categorySlug?: string | null;
  additionalCategorySlugs?: string[] | null;
  tags?: string[] | null;
  vendorSlug?: string | null;
  images?: string[] | null;
};

function isOrangeCounty(product: PlainRakhiProduct): boolean {
  const vendor = product.vendorSlug?.trim();
  if (vendor === VENDOR_ORANGE_COUNTY) return true;
  return (product.images ?? []).some((src) => src.includes("/uploads/orange-county/"));
}

function productBlob(product: PlainRakhiProduct): string {
  return [product.name, product.description, product.slug, ...(product.tags ?? [])]
    .filter(Boolean)
    .join(" ");
}

function inPlainRakhiCategory(product: PlainRakhiProduct): boolean {
  const primary = (product.categorySlug ?? "").trim();
  const extras = product.additionalCategorySlugs ?? [];
  if (PLAIN_RAKHI_CATEGORIES.has(primary)) return true;
  return extras.some((slug) => PLAIN_RAKHI_CATEGORIES.has(slug));
}

/**
 * UsaRakhi single / combo rakhis without chocolates, dry fruit, or hampers.
 * Orange County products are never included.
 */
export function isUsarakhiPlainRakhiProduct(product: PlainRakhiProduct): boolean {
  if (isOrangeCounty(product)) return false;

  const primary = (product.categorySlug ?? "").trim();
  if (primary === "rakhi-hampers") return false;
  if ((product.additionalCategorySlugs ?? []).includes("rakhi-hampers")) return false;

  if (!inPlainRakhiCategory(product)) return false;
  if (CHOCOLATE_OR_EXTRA_SIGNAL.test(productBlob(product))) return false;

  return true;
}

/** Stable pseudo-random $3 / $5 / $7 from slug so prices do not change on every deploy. */
export function pickUsarakhiCostRakhiPriceUsd(slug: string): UsarakhiCostRakhiPriceUsd {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return USARAKHI_COST_RAKHI_PRICES_USD[hash % USARAKHI_COST_RAKHI_PRICES_USD.length];
}
