import {
  FAST_SELLING_HAMPER_COUNT,
  FAST_SELLING_THRESHOLD,
  ORANGE_COUNTY_CATEGORY_SLUG,
} from "../constants";
import type { Product } from "../schemas/product";

/** Total units sold — only the counter incremented when orders are paid (never inferred from stock). */
export function getUnitsSold(product: Product): number {
  return product.unitsSold ?? 0;
}

/** In stock and at least FAST_SELLING_THRESHOLD real paid orders. */
export function isFastSelling(product: Product): boolean {
  return (product.inventory ?? 0) > 0 && getUnitsSold(product) >= FAST_SELLING_THRESHOLD;
}

export function sortByUnitsSold(a: Product, b: Product): number {
  const sold = getUnitsSold(b) - getUnitsSold(a);
  if (sold !== 0) return sold;
  return a.name.localeCompare(b.name);
}

export function isHamperProduct(product: Product): boolean {
  if (product.categorySlug === ORANGE_COUNTY_CATEGORY_SLUG) return true;
  return product.additionalCategorySlugs?.includes(ORANGE_COUNTY_CATEGORY_SLUG) ?? false;
}

function isStorefrontEligible(product: Product): boolean {
  return product.published !== false && (product.inventory ?? 0) > 0;
}

/** In-stock hampers ranked by paid units sold (highest first). */
export function pickTopSellingHampers(
  products: Product[],
  limit = FAST_SELLING_HAMPER_COUNT
): Product[] {
  return products
    .filter((product) => isHamperProduct(product) && isStorefrontEligible(product))
    .sort(sortByUnitsSold)
    .slice(0, limit);
}

/**
 * Homepage Fast Selling list: pin the top-selling hampers, then other fast sellers.
 */
export function pickFastSellingHomeProducts(products: Product[], limit = 10): Product[] {
  const topHampers = pickTopSellingHampers(products, FAST_SELLING_HAMPER_COUNT);
  const pinned = new Set(topHampers.map((product) => product.slug));
  const others = products.filter((product) => isFastSelling(product) && !pinned.has(product.slug)).sort(sortByUnitsSold);
  return [...topHampers, ...others].slice(0, Math.max(limit, topHampers.length));
}
