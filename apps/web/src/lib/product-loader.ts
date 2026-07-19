import type { Product } from "@hr-ecom/shared";
import { api } from "./api";
import {
  getCatalogProduct,
  getCatalogProducts,
  getCatalogProductsByCategory,
  mergeProductsPreferExisting,
} from "./catalog-fallback";

/** Prefer last good API price over bundled catalog when the API blips (catalog can be stale). */
const PRODUCT_MEMORY_TTL_MS = 60 * 60 * 1000; // 1 hour
const productMemoryCache = new Map<string, { product: Product; at: number }>();

function rememberProduct(product: Product): Product {
  productMemoryCache.set(product.slug, { product, at: Date.now() });
  return product;
}

function memoryProduct(slug: string): Product | null {
  const hit = productMemoryCache.get(slug);
  if (!hit) return null;
  if (Date.now() - hit.at > PRODUCT_MEMORY_TTL_MS) return null;
  return hit.product;
}

/**
 * Authoritative storefront product load: API (ISR-cached) first, then in-process
 * memory of the last good API response, then bundled catalog only as last resort.
 */
export async function loadProduct(slug: string): Promise<Product | null> {
  try {
    const data = await api<{ product: Product }>(`/products/${slug}`, { revalidate: 3600 });
    return rememberProduct(data.product);
  } catch {
    const stale = memoryProduct(slug);
    if (stale) return stale;
    // Fall through to bundled catalog (e.g. hampers before DynamoDB import / cold CI).
  }
  return getCatalogProduct(slug) ?? null;
}

export async function loadFeaturedProducts(limit = 10): Promise<Product[]> {
  try {
    const data = await api<{ products: Product[] }>("/products", { revalidate: 3600 });
    for (const product of data.products) rememberProduct(product);
    return data.products.slice(0, limit);
  } catch {
    return getCatalogProducts().slice(0, limit);
  }
}

export async function loadRelatedProducts(categorySlug: string, excludeSlug: string): Promise<Product[]> {
  let products: Product[] = [];
  try {
    const data = await api<{ products: Product[] }>(`/products?category=${categorySlug}`, {
      revalidate: 3600,
    });
    products = data.products;
    for (const product of products) rememberProduct(product);
  } catch {
    products = [];
  }
  if (categorySlug === "rakhi-hampers" || products.length === 0) {
    products = mergeProductsPreferExisting(products, getCatalogProductsByCategory(categorySlug));
  }
  return products.filter((p) => p.slug !== excludeSlug).slice(0, 5);
}

/** Prefer catalog slugs at build time — avoids CI/API rate-limit prerender failures. */
export function getStaticProductSlugs(): string[] {
  const fromCatalog = getCatalogProducts().map((p) => p.slug);
  if (fromCatalog.length > 0) return fromCatalog;
  return [];
}
