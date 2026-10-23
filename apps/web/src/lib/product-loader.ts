import type { Product } from "@hr-ecom/shared";
import {
  getProductCdnBase,
  isRakhiSeasonPaused,
  resolveProductImageUrl,
  sanitizePublicProductCopy,
  sortAvailableProductsFirst,
} from "@hr-ecom/shared";
import { api } from "./api";
import { homeCategoryOrder } from "./site";
import {
  getCatalogProduct,
  getCatalogProducts,
  getCatalogProductsByCategory,
  mergeProductsPreferExisting,
} from "./catalog-fallback";
import { shuffleForCity } from "./city-products";
import { applyDevTestPrice } from "./dev-test-price";

/**
 * Prefer last good API price over bundled catalog when the API blips.
 * Catalog JSON has historically diverged from DynamoDB (e.g. Om at $1.50 vs live $14.72)
 * and ISR + year-long stale-while-revalidate kept those wrong prices in HTML/OG tags.
 */
const PRODUCT_MEMORY_TTL_MS = 60 * 60 * 1000; // 1 hour
const productMemoryCache = new Map<string, { product: Product; at: number }>();

/** Same cache policy for listing + PDP — never serve a stale Next Data Cache price. */
const FRESH_PRODUCT_FETCH = { revalidate: false as const };

function rememberProduct(product: Product): Product {
  const visible = sanitizePublicProductCopy(applyDevTestPrice(product));
  productMemoryCache.set(visible.slug, { product: visible, at: Date.now() });
  return visible;
}

function rememberProducts(products: Product[]): Product[] {
  for (const product of products) rememberProduct(product);
  return products;
}

function memoryProduct(slug: string): Product | null {
  const hit = productMemoryCache.get(slug);
  if (!hit) return null;
  if (Date.now() - hit.at > PRODUCT_MEMORY_TTL_MS) return null;
  return hit.product;
}

/** Catalog is OK for vendor/hamper SKUs that may not be in DynamoDB yet. */
function allowCatalogFallback(product: Product): boolean {
  return Boolean(product.vendorSlug) || product.categorySlug === "rakhi-hampers";
}

function isProductMissingError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? "");
  return /not found/i.test(message) || /\(404\)/.test(message);
}

/**
 * Authoritative storefront product: API first for standard SKUs.
 * On API 404 for a bundled catalog slug, fall back so PDPs do not hard-redirect home.
 * Do not fall back on transient API failures — that reintroduced stale catalog prices.
 */
export async function loadProduct(slug: string): Promise<Product | null> {
  try {
    const data = await api<{ product: Product }>(`/products/${slug}`, FRESH_PRODUCT_FETCH);
    if (isRakhiSeasonPaused(data.product) || (data.product.inventory ?? 0) <= 0) return null;
    return rememberProduct(data.product);
  } catch (err) {
    const stale = memoryProduct(slug);
    if (stale) return stale;

    const catalog = getCatalogProduct(slug);
    if (catalog && (allowCatalogFallback(catalog) || isProductMissingError(err))) {
      if (isRakhiSeasonPaused(catalog)) return null;
      return sanitizePublicProductCopy(applyDevTestPrice(catalog));
    }

    if (process.env.NODE_ENV !== "production") {
      if (!catalog || isRakhiSeasonPaused(catalog)) return null;
      return sanitizePublicProductCopy(applyDevTestPrice(catalog));
    }
    return null;
  }
}

/** Shared list loader — same API + cache policy as `loadProduct` (PDP). */
export async function loadProducts(params?: {
  category?: string;
  search?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString() ? `?${query.toString()}` : "";

  try {
    const data = await api<{ products: Product[] }>(`/products${qs}`, FRESH_PRODUCT_FETCH);
    return rememberProducts(
      data.products.filter((product) => !isRakhiSeasonPaused(product) && (product.inventory ?? 0) > 0)
    );
  } catch {
    const catalog = params?.category
      ? getCatalogProductsByCategory(params.category)
      : getCatalogProducts();
    return catalog
      .filter((product) => !isRakhiSeasonPaused(product))
      .map((product) => sanitizePublicProductCopy(applyDevTestPrice(product)));
  }
}

/**
 * Category grids: live API first, then only add missing hamper/catalog SKUs.
 * Never overwrite an API product with bundled catalog prices.
 */
export async function loadProductsByCategory(categorySlug: string): Promise<Product[]> {
  let products: Product[] = [];
  try {
    products = await loadProducts({ category: categorySlug });
  } catch {
    products = [];
  }
  return sortAvailableProductsFirst(
    mergeProductsPreferExisting(products, getCatalogProductsByCategory(categorySlug))
      .filter((product) => !isRakhiSeasonPaused(product))
      .map((product) => sanitizePublicProductCopy(applyDevTestPrice(product)))
  );
}

export async function loadFeaturedProducts(limit = 10): Promise<Product[]> {
  const products = await loadProducts();
  return products.slice(0, limit);
}

function isPurchasableStorefrontProduct(product: Product): boolean {
  return product.published !== false && !isRakhiSeasonPaused(product) && (product.inventory ?? 0) > 0;
}

/**
 * Products currently shown on the shop: festive categories, in stock, and not
 * paused for the closed Rakhi season.
 */
export async function loadVisibleStorefrontProducts(): Promise<Product[]> {
  const groups = await Promise.all(homeCategoryOrder.map((slug) => loadProductsByCategory(slug)));
  const bySlug = new Map<string, Product>();
  for (const group of groups) {
    for (const product of group) {
      if (!isPurchasableStorefrontProduct(product) || bySlug.has(product.slug)) continue;
      bySlug.set(product.slug, product);
    }
  }
  return [...bySlug.values()];
}

export async function loadRelatedProducts(categorySlug: string, excludeSlug: string): Promise<Product[]> {
  const products = await loadProductsByCategory(categorySlug);
  return products.filter((p) => p.slug !== excludeSlug).slice(0, 5);
}

/** True when at least one image is on the UsaRakhi CDN (not a third-party host that blocks hotlinking). */
export function productHasManagedImages(product: { images?: string[] | null }): boolean {
  let host = "";
  try {
    host = new URL(getProductCdnBase()).host;
  } catch {
    host = "";
  }
  return (product.images ?? []).some((raw) => {
    const url = resolveProductImageUrl(raw);
    if (!url) return false;
    if (url.startsWith("/uploads/") || url.startsWith("/products/") || url.startsWith("/blog/")) return true;
    try {
      return Boolean(host) && new URL(url).host === host;
    } catch {
      return false;
    }
  });
}

/**
 * Location landings use the same festive catalog as the shop.
 * The full product scan also includes vendor SKUs whose image hosts return 403,
 * which rendered as empty cards on city pages.
 */
export async function loadLocationPageProducts(citySlug: string): Promise<Product[]> {
  const products = await loadVisibleStorefrontProducts();
  return shuffleForCity(products.filter(productHasManagedImages), citySlug);
}

/** Prefer catalog slugs at build time — avoids CI/API rate-limit prerender failures. */
export function getStaticProductSlugs(): string[] {
  const fromCatalog = getCatalogProducts().map((p) => p.slug);
  if (fromCatalog.length > 0) return fromCatalog;
  return [];
}
