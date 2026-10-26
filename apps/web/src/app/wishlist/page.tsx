import type { Metadata } from "next";
import type { Product } from "@hr-ecom/shared";
import { WishlistPageClient } from "./WishlistPageClient";
import { loadVisibleStorefrontProducts } from "@/lib/product-loader";

export const metadata: Metadata = {
  title: "Wish List",
  description: "Save Diwali and Bhai Dooj gifts on UsaRakhi and come back to them before checkout.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function inFestivalCategory(product: Product, slug: "diwali" | "bhai-dooj"): boolean {
  return product.categorySlug === slug || (product.additionalCategorySlugs?.includes(slug) ?? false);
}

/** Mix Diwali and Bhai Dooj listings so the empty wishlist still shows real festive gifts. */
function festiveSuggestions(products: Product[], limit: number): Product[] {
  const diwali = products.filter((product) => inFestivalCategory(product, "diwali"));
  const bhaiDooj = products.filter((product) => inFestivalCategory(product, "bhai-dooj"));
  const picked: Product[] = [];
  const seen = new Set<string>();
  const rounds = Math.max(diwali.length, bhaiDooj.length);
  for (let i = 0; i < rounds && picked.length < limit; i++) {
    for (const product of [bhaiDooj[i], diwali[i]]) {
      if (!product || seen.has(product.slug)) continue;
      seen.add(product.slug);
      picked.push(product);
      if (picked.length >= limit) break;
    }
  }
  return picked;
}

export default async function WishlistPage() {
  const visibleProducts = await loadVisibleStorefrontProducts();
  const recommendedProducts = festiveSuggestions(visibleProducts, 8);
  return (
    <WishlistPageClient visibleProducts={visibleProducts} recommendedProducts={recommendedProducts} />
  );
}
