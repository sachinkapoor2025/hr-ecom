import { VENDOR_ORANGE_COUNTY } from "../constants";
import { isFlashComboProduct } from "./flash-sale";
import { detectRakhiSetSize, type RakhiSetSize } from "./rakhi-set-size";

/** Single UsaRakhi rakhi (no chocolate). */
export const USARAKHI_PRICE_SINGLE_USD = 1.99;
/** Rakhi with chocolate (or other edible extras). */
export const USARAKHI_PRICE_CHOCOLATE_USD = 4.99;
/** Plain 2 / 3 / 4 / 5 rakhi sets. */
export const USARAKHI_PRICE_SET_USD: Record<RakhiSetSize, number> = {
  2: 2.5,
  3: 2.99,
  4: 3.49,
  5: 3.99,
};

const CHOCOLATE_SIGNAL =
  /chocolate|chocolates|ferrero|lindor|lindt|hershey|kitkat|dairy\s*milk|snicker|milky\s*way|mixed\s*choc/i;

const EXTRA_COMBO_SIGNAL =
  /kaju\s*katli|besan\s*ladd|soan\s*papdi|dry\s*fruit|mithai|hamper|nuts|almond|cashew|pistach|badam|kaju|pista/i;

export type UsarakhiPricedProduct = {
  name?: string;
  slug?: string;
  description?: string;
  categorySlug?: string | null;
  additionalCategorySlugs?: string[] | null;
  tags?: string[] | null;
  vendorSlug?: string | null;
  images?: string[] | null;
};

function isOrangeCounty(product: UsarakhiPricedProduct): boolean {
  const vendor = product.vendorSlug?.trim();
  if (vendor === VENDOR_ORANGE_COUNTY) return true;
  return (product.images ?? []).some((src) => src.includes("/uploads/orange-county/"));
}

/** Name/slug/tags only — SEO descriptions mention chocolates/hampers in browse links. */
function identityBlob(product: UsarakhiPricedProduct): string {
  return [product.name, product.slug, ...(product.tags ?? [])].filter(Boolean).join(" ");
}

export function usarakhiHasChocolateOrExtras(product: UsarakhiPricedProduct): boolean {
  const blob = identityBlob(product);
  if (CHOCOLATE_SIGNAL.test(blob) || EXTRA_COMBO_SIGNAL.test(blob)) return true;
  const primary = (product.categorySlug ?? "").trim();
  if (primary === "rakhi-hampers") return true;
  return (product.additionalCategorySlugs ?? []).includes("rakhi-hampers");
}

/**
 * Catalog selling price for UsaRakhi products, or null for Orange County / flash combo
 * (those keep vendor or coded pricing).
 */
export function resolveUsarakhiCatalogPriceUsd(product: UsarakhiPricedProduct): number | null {
  if (isOrangeCounty(product)) return null;
  if (isFlashComboProduct(product.slug)) return null;
  if (usarakhiHasChocolateOrExtras(product)) return USARAKHI_PRICE_CHOCOLATE_USD;
  const size = detectRakhiSetSize({
    name: product.name ?? "",
    slug: product.slug,
    description: product.description,
    categorySlug: product.categorySlug ?? undefined,
    tags: product.tags ?? undefined,
  });
  if (size) return USARAKHI_PRICE_SET_USD[size];
  const category = (product.categorySlug ?? "").trim();
  // Brother + lumba is two rakhis.
  if (category === "bhaiya-bhabhi-rakhi") return USARAKHI_PRICE_SET_USD[2];
  return USARAKHI_PRICE_SINGLE_USD;
}
