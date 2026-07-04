import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Product } from "@hr-ecom/shared";

interface CatalogFile {
  products: Product[];
}

let cached: Product[] | null = null;

function resolveCatalogPath(): string | null {
  const candidates = [
    join(process.cwd(), "scripts/data/usarakhi-catalog.json"),
    join(process.cwd(), "../scripts/data/usarakhi-catalog.json"),
    join(process.cwd(), "../../scripts/data/usarakhi-catalog.json"),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

/** Read bundled catalog JSON — reliable during CI static generation when API is rate-limited. */
export function getCatalogProducts(): Product[] {
  if (cached) return cached;
  const path = resolveCatalogPath();
  if (!path) {
    cached = [];
    return cached;
  }
  const data = JSON.parse(readFileSync(path, "utf-8")) as CatalogFile;
  cached = data.products ?? [];
  return cached;
}

export function getCatalogProduct(slug: string): Product | undefined {
  return getCatalogProducts().find((p) => p.slug === slug);
}

function isKidsComboProduct(product: Product): boolean {
  if (product.categorySlug !== "kids-rakhi") return false;

  const text = [product.name, product.description, ...(product.tags ?? [])]
    .join(" ")
    .toLowerCase();

  return [
    "combo",
    "chocolate",
    "chocolates",
    "hershey",
    "lindor",
    "lindt",
    "kitkat",
    "dairy milk",
    "snicker",
    "milky way",
  ].some((term) => text.includes(term));
}

export function getCatalogProductsByCategory(categorySlug: string): Product[] {
  const products = getCatalogProducts().filter((p) => p.categorySlug === categorySlug);
  if (categorySlug !== "rakhi-combo") return products;

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  for (const product of getCatalogProducts().filter(isKidsComboProduct)) {
    bySlug.set(product.slug, product);
  }
  return [...bySlug.values()];
}
