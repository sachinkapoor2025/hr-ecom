import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { BannerCarousel } from "@/components/BannerCarousel";
import { HomeProductCard } from "@/components/HomeProductCard";
import { site, homeBanners, promoBanners, categoryOrder, faqs } from "@/lib/site";
import type { Product, Category } from "@hr-ecom/shared";

export const metadata: Metadata = {
  title: "Send Rakhi to USA Online | Free Shipping",
  description: site.description,
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const [productsData, categoriesData] = await Promise.all([
      api<{ products: Product[] }>("/products"),
      api<{ categories: Category[] }>("/categories"),
    ]);
    products = productsData.products;
    categories = categoriesData.categories;
  } catch {
    products = [];
    categories = [];
  }

  const categoryMap = new Map(categories.map((c) => [c.slug, c]));
  const productsByCategory = categoryOrder.map((slug) => ({
    slug,
    name: categoryMap.get(slug)?.name ?? slug.replace(/-/g, " "),
    products: products.filter((p) => p.categorySlug === slug),
  }));

  return (
    <div>
      <BannerCarousel banners={homeBanners} />

      <section className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-primary mb-3">{site.tagline}</h1>
        <p className="text-slate-600 max-w-3xl mx-auto text-sm md:text-base">
          Distance may keep you miles apart, but the bond between siblings remains strong. Send Rakhi to USA with
          fast delivery, free shipping on selected orders, and same-day dispatch.
        </p>
      </section>

      {productsByCategory.map((section, idx) =>
        section.products.length > 0 ? (
          <section key={section.slug} className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-bold text-primary capitalize">{section.name}</h2>
              <Link href={`/products?category=${section.slug}`} className="text-nav font-semibold text-sm hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {section.products.slice(0, 10).map((p) => (
                <HomeProductCard key={p.slug} product={p} />
              ))}
            </div>
            {idx === 1 && promoBanners[0] && (
              <div className="mt-8 relative w-full aspect-[21/5] rounded-lg overflow-hidden bg-slate-100">
                <Image src={promoBanners[0].src} alt={promoBanners[0].alt} fill className="object-cover" sizes="100vw" />
              </div>
            )}
          </section>
        ) : null
      )}

      {products.length === 0 && (
        <p className="text-center text-slate-500 py-12">
          Products could not be loaded. Confirm Amplify env var{" "}
          <code className="bg-slate-100 px-1 rounded">NEXT_PUBLIC_API_URL</code> is set and redeploy.
        </p>
      )}

      {promoBanners[1] && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="relative w-full max-w-md mx-auto aspect-[768/1152] rounded-lg overflow-hidden bg-slate-100">
            <Image src={promoBanners[1].src} alt={promoBanners[1].alt} fill className="object-cover" sizes="400px" />
          </div>
        </section>
      )}

      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-primary text-center mb-6">FAQ</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="border border-slate-200 rounded-lg p-4 bg-white">
              <summary className="font-semibold text-primary cursor-pointer text-sm">{f.q}</summary>
              <p className="text-slate-600 text-sm mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
