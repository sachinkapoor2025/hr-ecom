/**
 * Homepage category grids: up to five products, in-stock first.
 * Category, search, and catalog pages keep the full list.
 */
import type { Product } from "@hr-ecom/shared";
import { sortAvailableProductsFirst } from "@hr-ecom/shared";

export const HOME_CATEGORY_PRODUCT_LIMIT = 5;

export function pickHomeCategoryProducts(products: Product[], categorySlug: string): Product[] {
  const inCategory = products.filter(
    (product) =>
      product.published !== false &&
      (product.categorySlug === categorySlug ||
        product.additionalCategorySlugs?.includes(categorySlug))
  );
  return sortAvailableProductsFirst(inCategory).slice(0, HOME_CATEGORY_PRODUCT_LIMIT);
}
