import type { Product } from "@hr-ecom/shared";
import { api } from "./api";
import {
  getCatalogProduct,
  getCatalogProducts,
  getCatalogProductsByCategory,
  mergeProductsPreferExisting,
} from "./catalog-fallback";

export async function loadProduct(slug: string): Promise<Product | null> {
  try {
    const data = await api<{ product: Product }>(`/products/${slug}`, { revalidate: false });
    return data.product;
  } catch {
    // Fall through to bundled catalog (e.g. hampers before DynamoDB import).
  }
  return getCatalogProduct(slug) ?? null;
}

export async function loadFeaturedProducts(limit = 10): Promise<Product[]> {
  try {
    const data = await api<{ products: Product[] }>("/products", { revalidate: 3600 });
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
