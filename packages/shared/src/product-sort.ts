import type { Product } from "./schemas/product";

export const PRODUCT_SORT_VALUES = ["price-asc", "price-desc"] as const;
export type ProductSortValue = (typeof PRODUCT_SORT_VALUES)[number];

export const PRODUCT_SORT_OPTIONS: { value: ProductSortValue; label: string }[] = [
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function isProductSortValue(value: string | null | undefined): value is ProductSortValue {
  return PRODUCT_SORT_VALUES.includes(value as ProductSortValue);
}

export function sortProducts(products: Product[], sort: ProductSortValue): Product[] {
  const items = [...products];

  switch (sort) {
    case "price-asc":
      return items.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
    case "price-desc":
      return items.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
    default:
      return items;
  }
}
