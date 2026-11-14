import { cache } from "react";
import {
  isRakhiPrimaryProduct,
  isRakhiSeasonPaused,
  type Product,
} from "@hr-ecom/shared";
import { categoryHref } from "@/lib/category-urls";
import { loadProducts, productHasManagedImages } from "@/lib/product-loader";

/** Festive categories that already exist on the storefront. Rakhi SKUs are not included. */
export const SEASONAL_SOURCE_CATEGORIES = [
  "bhai-dooj",
  "diwali",
  "sweet-combos",
  "dry-fruit-combos",
  "chocolate-combos",
  "pooja-sets",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  "bhai-dooj": "Bhai Dooj gift boxes",
  diwali: "Diwali hampers",
  "sweet-combos": "Sweet combos",
  "dry-fruit-combos": "Dry fruit combos",
  "chocolate-combos": "Chocolate combos",
  "pooja-sets": "Pooja sets",
};

function haystack(product: Product): string {
  return `${product.name} ${product.slug}`.toLowerCase();
}

const KIDS_EXTRA = /marker|skateboard/;
const RITUAL = /pooja|puja|thali|rangoli|toran|shubh labh/;
const PANTRY = /dry fruit|mixed nut|almond|pistachio|cashew|kaju|laddoo|laddu|mithai|barfi|sweet/;
const CHOCOLATE = /chocolate|ferrero|m&m|skittle|hershey|lindt|lindor/;

function isKidsExtra(product: Product): boolean {
  return KIDS_EXTRA.test(haystack(product));
}

function isRitualSet(product: Product): boolean {
  return product.categorySlug === "pooja-sets" || RITUAL.test(haystack(product));
}

/** Food gifts for a Thanksgiving table: nuts, sweets, and chocolates. Ritual sets stay off this page. */
export function isThanksgivingPantryGift(product: Product): boolean {
  if (isKidsExtra(product) || isRitualSet(product)) return false;
  return PANTRY.test(haystack(product));
}

export function isThanksgivingChocolateGift(product: Product): boolean {
  if (isKidsExtra(product) || isRitualSet(product)) return false;
  const text = haystack(product);
  return CHOCOLATE.test(text) && !PANTRY.test(text);
}

export function isNewYearChocolateGift(product: Product): boolean {
  return isThanksgivingChocolateGift(product);
}

export function isNewYearPantryGift(product: Product): boolean {
  return isThanksgivingPantryGift(product);
}

/** In-stock Diwali hampers and pooja sets — shown only on the New Year page, under their real names. */
export function isNewYearFestiveGift(product: Product): boolean {
  if (isKidsExtra(product)) return false;
  return product.categorySlug === "diwali" || product.categorySlug === "pooja-sets" || isRitualSet(product);
}

export function isNewYearGift(product: Product): boolean {
  return isNewYearChocolateGift(product) || isNewYearPantryGift(product) || isNewYearFestiveGift(product);
}

export type SeasonalSection = {
  id: string;
  heading: string;
  intro: string;
  match: (product: Product) => boolean;
};

export function groupSeasonalProducts(
  products: Product[],
  sections: readonly SeasonalSection[]
): { section: SeasonalSection; products: Product[] }[] {
  const used = new Set<string>();
  return sections
    .map((section) => {
      const matched = products.filter((product) => !used.has(product.slug) && section.match(product));
      for (const product of matched) used.add(product.slug);
      return { section, products: matched };
    })
    .filter((group) => group.products.length > 0);
}

export function categoryLinksFromProducts(products: Product[]): { href: string; label: string }[] {
  const seen = new Set<string>();
  const links: { href: string; label: string }[] = [];
  for (const product of products) {
    if (seen.has(product.categorySlug)) continue;
    const label = CATEGORY_LABELS[product.categorySlug];
    if (!label) continue;
    seen.add(product.categorySlug);
    links.push({ href: categoryHref(product.categorySlug), label });
  }
  return links;
}

/**
 * In-stock storefront gifts from the live catalog.
 * Uses the API list (inventory already filtered) so bundled catalog JSON cannot
 * resurrect sold-out SKUs with stale stock counts.
 */
export const loadSeasonalCatalog = cache(async (): Promise<Product[]> => {
  const groups = await Promise.all(
    SEASONAL_SOURCE_CATEGORIES.map((slug) => loadProducts({ category: slug }))
  );
  const bySlug = new Map<string, Product>();
  for (const group of groups) {
    for (const product of group) {
      if (product.published === false) continue;
      if ((product.inventory ?? 0) <= 0) continue;
      if (isRakhiSeasonPaused(product) || isRakhiPrimaryProduct(product)) continue;
      if (!productHasManagedImages(product)) continue;
      if (bySlug.has(product.slug)) continue;
      bySlug.set(product.slug, product);
    }
  }
  return [...bySlug.values()];
});
