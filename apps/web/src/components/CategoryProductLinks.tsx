import Link from "next/link";
import type { Product } from "@hr-ecom/shared";

/** SEO internal links from category pages to individual product URLs. */
export function CategoryProductLinks({
  products,
  categoryName,
}: {
  products: Product[];
  categoryName: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-slate-200" aria-labelledby="category-product-links">
      <h2 id="category-product-links" className="text-xl font-bold text-primary mb-2">
        Shop {categoryName} — All Products
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Browse every {categoryName.toLowerCase()} in this collection. Each link goes to the full product page with
        photos, pricing, and add-to-cart.
      </p>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
        {products.map((product) => (
          <li key={product.slug}>
            <Link
              href={`/products/${product.slug}`}
              className="text-nav font-medium hover:underline leading-snug"
            >
              {product.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
