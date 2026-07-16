import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { withCompetitiveStorefrontPricing, type Product } from "@hr-ecom/shared";

interface CatalogFile {
  products: Product[];
}

let cached: Product[] | null = null;

function resolveDataPath(filename: string): string | null {
  const candidates = [
    join(process.cwd(), "scripts/data", filename),
    join(process.cwd(), "../scripts/data", filename),
    join(process.cwd(), "../../scripts/data", filename),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

function loadCatalogFile(filename: string): Product[] {
  const path = resolveDataPath(filename);
  if (!path) return [];
  const data = JSON.parse(readFileSync(path, "utf-8")) as CatalogFile;
  return data.products ?? [];
}

/** Read bundled catalog JSON — reliable during CI static generation when API is rate-limited. */
export function getCatalogProducts(): Product[] {
  if (cached) return cached;
  const bySlug = new Map<string, Product>();
  for (const product of [
    ...loadCatalogFile("usarakhi-catalog.json"),
    ...loadCatalogFile("orange-county-hampers.json"),
  ]) {
    bySlug.set(product.slug, withCompetitiveStorefrontPricing(product));
  }
  cached = [...bySlug.values()];
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
