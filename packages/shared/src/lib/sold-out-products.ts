/**
 * Temporary force-OOS list for SKUs we cannot fulfill (e.g. Ek Omkar rakhi depleted,
 * Hershey / dry-fruit SKUs removed from UsaRakhi peak-season catalog).
 * Storefront lists hide these; cart/checkout reject; Dynamo script zeros inventory when AWS prod is available.
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
