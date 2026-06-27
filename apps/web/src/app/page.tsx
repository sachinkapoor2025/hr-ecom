import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { BannerCarousel } from "@/components/BannerCarousel";
import { CustomerReviews } from "@/components/CustomerReviews";
import { HomeProductCard } from "@/components/HomeProductCard";
import { HomeSeoSection } from "@/components/HomeSeoSection";
import { JsonLd } from "@/components/JsonLd";
import { site, homeBanners, homeCategoryOrder, faqs } from "@/lib/site";
import { faqJsonLd, howToSendRakhiJsonLd, pageMetadata } from "@/lib/seo";
import type { Product, Category } from "@hr-ecom/shared";

export const metadata: Metadata = pageMetadata({
  title: "Send Rakhi to USA Online | Free Shipping",
  description: site.description,
  path: "/",
});

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
  const productsByCategory = homeCategoryOrder.map((slug) => ({
    slug,
    name: categoryMap.get(slug)?.name ?? slug.replace(/-/g, " "),
    products: products.filter((p) => p.categorySlug === slug),
  }));

  return (
    <div>
      <JsonLd data={[faqJsonLd(faqs), howToSendRakhiJsonLd()]} />
      <BannerCarousel banners={homeBanners} />

      <section className="max-w-4xl mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-4">
          Send Rakhi to USA — Premium Online Rakhi Delivery
        </h1>
        <p className="text-slate-600 leading-relaxed mb-4">
          {site.name} helps sisters in India, UK, Canada, Australia, and worldwide send Rakhi to brothers
          across all 50 United States. Shop 126+ designer rakhis — Single Rakhi, Combos with chocolates,
          Kids Rakhi, Bhaiya Bhabhi sets, and Lumba Rakhi — delivered in 5–7 business days with roli chawal
          included.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <Link href="/raksha-bandhan" className="text-nav font-semibold hover:underline">
            Raksha Bandhan 2026 →
          </Link>
          <Link href="/blog/send-rakhi-to-usa-from-india" className="text-nav font-semibold hover:underline">
            Send from India guide →
          </Link>
          <Link href="/shipping" className="text-nav font-semibold hover:underline">
            Shipping info →
          </Link>
        </div>
      </section>

      {productsByCategory.map((section) =>
        section.products.length > 0 ? (
          <section key={section.slug} className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-bold text-primary capitalize">{section.name}</h2>
              <Link href={`/categories/${section.slug}`} className="text-nav font-semibold text-sm hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-stretch">
              {section.products.slice(0, 10).map((p) => (
                <HomeProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        ) : null
      )}

      {products.length === 0 && (
        <p className="text-center text-slate-500 py-12">
          Products could not be loaded. Confirm Amplify env var{" "}
          <code className="bg-slate-100 px-1 rounded">NEXT_PUBLIC_API_URL</code> is set and redeploy.
        </p>
      )}

      <CustomerReviews />

      <HomeSeoSection />

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-primary text-center mb-2">More Questions?</h2>
        <p className="text-center text-sm text-slate-500 mb-6">
          Quick answers below — or{" "}
          <Link href="/faq" className="text-nav hover:underline">
            read our full FAQ page
          </Link>
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {faqs.slice(0, 6).map((f) => (
            <details key={f.q} className="border border-slate-200 rounded-xl p-5 bg-white">
              <summary className="font-semibold text-primary cursor-pointer text-sm">{f.q}</summary>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
