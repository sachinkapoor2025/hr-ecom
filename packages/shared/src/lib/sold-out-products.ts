import { VENDOR_ORANGE_COUNTY } from "../constants";

/**
 * Temporary: pause all UsaRakhi catalog SKUs (force inventory 0 on storefront).
 * Orange County stays buyable. Flip to true only when UsaRakhi must be held again.
 */
export const USARAKHI_STOREFRONT_PAUSED = false;

/**
 * Temporary force-OOS list for SKUs we cannot fulfill (e.g. Ek Omkar rakhi depleted,
 * Hershey / dry-fruit SKUs removed from UsaRakhi peak-season catalog).
 * Inventory is forced to 0; products still appear as Sold out on the storefront.
 */
export const FORCE_OUT_OF_STOCK_SLUGS = [
  "ek-omkar-designer-rakhi-for-brother-with-roli-chawal",
  "ek-omkar-rakhi-with-lindt-lindor-chocolates-combo",
  "pearl-rakhi-with-gold-ek-omkar-set-combo-premium-spiritual-rakhi",
  "gold-crystal-ek-omkar-rakhi-combo-premium-spiritual-rakhi-set",
  "blue-sapphire-pearl-ek-omkar-rakhi-set-combo-spiritual-designer-rakhi",
  // Hershey’s chocolate combos removed from UsaRakhi main catalog
  "mickey-mouse-bro-rakhi-combo-with-hersheys-chocolates",
  "kids-rakhi-with-hersheys-chocolates",
  "pink-lumba-rakhi-with-hersheys-chocolates",
  "peach-lumba-rakhi-with-hersheys-milk-chocolates",
  "omkar-rakhi-with-hersheys-milk-chocolates",
  "white-pearl-rakhi-with-hersheys-chocolates",
  "shree-rakhi-with-hersheys-chocolates",
  "red-rakhi-combo-with-hersheys-chocolates",
  "peech-pearl-rakhi-combo-with-hersheys-chocolates",
  "om-rakhi-with-hersheys-chocolates-roli-chawal",
  "fancy-multi-stone-rakhi-with-hersheys-chocolates",
  "elegant-designer-rakhi-with-2-hersheys-chocolates",
  "divine-rudraksha-rakhi-with-hersheys-chocolates",
  "designer-rakhi-for-men-with-hersheys-chocolates",
  "designer-rakhi-with-hersheys-chocolates",
  "designer-pink-thread-rakhi-with-hersheys-chocolates",
  "blue-stone-rakhi-with-5-hersheys-chocolates",
  // Pistachio flash combo removed with dry-fruit SKUs
  "blue-beads-om-pista-flash-combo",
] as const;

const FORCE_OUT_OF_STOCK = new Set<string>(FORCE_OUT_OF_STOCK_SLUGS);

export function isForceOutOfStockSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return FORCE_OUT_OF_STOCK.has(slug.trim());
}

export function isOrangeCountyVendorProduct(product: {
  vendorSlug?: string | null;
  images?: string[] | null;
}): boolean {
  if ((product.vendorSlug ?? "").trim() === VENDOR_ORANGE_COUNTY) return true;
  return (product.images ?? []).some((src) => src.includes("/uploads/orange-county/"));
}

/** True when UsaRakhi catalog is paused and this product is not Orange County. */
export function isUsarakhiStorefrontPaused(product: {
  vendorSlug?: string | null;
  images?: string[] | null;
  slug?: string | null;
}): boolean {
  if (!USARAKHI_STOREFRONT_PAUSED) return false;
  return !isOrangeCountyVendorProduct(product);
}

export function isStorefrontSoldOut(product: { inventory?: number | null }): boolean {
  return (product.inventory ?? 0) <= 0;
}

/** Clamp inventory to 0 for force-OOS SKUs and paused UsaRakhi products. */
export function withForcedOutOfStockInventory<
  T extends {
    slug?: string;
    inventory?: number;
    vendorSlug?: string | null;
    images?: string[] | null;
  },
>(product: T): T {
  if (isForceOutOfStockSlug(product.slug) || isUsarakhiStorefrontPaused(product)) {
    return { ...product, inventory: 0 };
  }
  return product;
}

/**
 * In-stock first, then sold out — keeps shoppers from hunting for buyable SKUs.
 * Stable within each group (original relative order preserved).
 */
export function sortAvailableProductsFirst<T extends { inventory?: number | null }>(
  products: T[]
): T[] {
  const available: T[] = [];
  const soldOut: T[] = [];
  for (const product of products) {
    if (isStorefrontSoldOut(product)) soldOut.push(product);
    else available.push(product);
  }
  return [...available, ...soldOut];
}

/**
 * Published storefront catalog: force-OOS SKUs stay at inventory 0;
 * available products listed before sold out.
 */
export function prepareStorefrontProducts<
  T extends {
    slug?: string;
    inventory?: number;
    published?: boolean;
    vendorSlug?: string | null;
    images?: string[] | null;
  },
>(products: T[]): T[] {
  const prepared = products
    .map(withForcedOutOfStockInventory)
    .filter((p) => p.published !== false);
  return sortAvailableProductsFirst(prepared);
}

/**
 * @deprecated Use prepareStorefrontProducts — sold-out SKUs stay listed with inventory 0.
 */
export function filterInStockStorefrontProducts<
  T extends {
    slug?: string;
    inventory?: number;
    published?: boolean;
    vendorSlug?: string | null;
    images?: string[] | null;
  },
>(products: T[]): T[] {
  return prepareStorefrontProducts(products);
}
