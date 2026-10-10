/**
 * Homepage category grids: every in-stock product in that category.
 */
import type { Product } from "@hr-ecom/shared";
import { sortAvailableProductsFirst } from "@hr-ecom/shared";

export function pickHomeCategoryProducts(products: Product[], categorySlug: string): Product[] {
  const inCategory = products.filter(
    (product) =>
      product.published !== false &&
      (product.categorySlug === categorySlug ||
        product.additionalCategorySlugs?.includes(categorySlug))
  );
  return sortAvailableProductsFirst(inCategory);
}
