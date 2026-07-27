import type { Product } from "@hr-ecom/shared";
import { api } from "./api";
import {
  getCatalogProduct,
  getCatalogProducts,
  getCatalogProductsByCategory,
  mergeProductsPreferExisting,
} from "./catalog-fallback";

/**
 * Prefer last good API price over bundled catalog when the API blips.
 * Catalog JSON has historically diverged from DynamoDB (e.g. Om at $1.50 vs live $14.72)
 * and ISR + year-long stale-while-revalidate kept those wrong prices in HTML/OG tags.
 */
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
    // Short shared cache; PDP route is dynamic so this is not a year-long prerender.
    const data = await api<{ product: Product }>(`/products/${slug}`, { revalidate: 60 });
    return rememberProduct(data.product);
  } catch (err) {
    const stale = memoryProduct(slug);
    if (stale) return stale;

    const catalog = getCatalogProduct(slug);
    if (catalog && (allowCatalogFallback(catalog) || isProductMissingError(err))) {
      return catalog;
    }

    if (process.env.NODE_ENV !== "production") return catalog ?? null;
    return null;
  }
}

export async function loadFeaturedProducts(limit = 10): Promise<Product[]> {
  try {
    const data = await api<{ products: Product[] }>("/products", { revalidate: 300 });
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
      revalidate: 300,
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