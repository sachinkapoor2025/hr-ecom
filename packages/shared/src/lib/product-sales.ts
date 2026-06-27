import { DEFAULT_PRODUCT_INVENTORY, FAST_SELLING_THRESHOLD } from "../constants";
import type { Product } from "../schemas/product";

/** Total units sold — uses tracked counter, or estimates from starting inventory. */
export function getUnitsSold(product: Product): number {
  if (typeof product.unitsSold === "number") return product.unitsSold;
  const inv = product.inventory ?? DEFAULT_PRODUCT_INVENTORY;
  return Math.max(0, DEFAULT_PRODUCT_INVENTORY - inv);
}

/** In stock and sold at least FAST_SELLING_THRESHOLD units. */
export function isFastSelling(product: Product): boolean {
  return (product.inventory ?? 0) > 0 && getUnitsSold(product) >= FAST_SELLING_THRESHOLD;
}

export function sortByUnitsSold(a: Product, b: Product): number {
  return getUnitsSold(b) - getUnitsSold(a);
}
