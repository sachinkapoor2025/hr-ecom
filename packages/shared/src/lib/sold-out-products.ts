/**
 * Temporary force-OOS list for SKUs we cannot fulfill (e.g. Ek Omkar rakhi depleted).
 * Storefront lists hide these; cart/checkout reject; Dynamo script zeros inventory when AWS prod is available.
 */
export const FORCE_OUT_OF_STOCK_SLUGS = [
  "ek-omkar-designer-rakhi-for-brother-with-roli-chawal",
  "ek-omkar-rakhi-with-lindt-lindor-chocolates-combo",
  "pearl-rakhi-with-gold-ek-omkar-set-combo-premium-spiritual-rakhi",
  "gold-crystal-ek-omkar-rakhi-combo-premium-spiritual-rakhi-set",
  "blue-sapphire-pearl-ek-omkar-rakhi-set-combo-spiritual-designer-rakhi",
] as const;

const FORCE_OUT_OF_STOCK = new Set<string>(FORCE_OUT_OF_STOCK_SLUGS);

export function isForceOutOfStockSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return FORCE_OUT_OF_STOCK.has(slug.trim());
}

/** Clamp inventory to 0 for force-OOS SKUs (safe to call on any product-like object). */
export function withForcedOutOfStockInventory<T extends { slug?: string; inventory?: number }>(
  product: T
): T {
  if (!isForceOutOfStockSlug(product.slug)) return product;
  return { ...product, inventory: 0 };
}

export function filterInStockStorefrontProducts<T extends { slug?: string; inventory?: number; published?: boolean }>(
  products: T[]
): T[] {
  return products
    .map(withForcedOutOfStockInventory)
    .filter((p) => p.published !== false && (p.inventory ?? 0) > 0);
}
