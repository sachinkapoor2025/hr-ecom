import type { Metadata } from "next";
import Link from "next/link";
import { categoryHref } from "@/lib/category-urls";
import { api } from "@/lib/api";
import { applyInlineLinks } from "@/lib/inline-links";
import { homepageInlineLinks } from "@/lib/content/page-inline-links";
import { HomeHero } from "@/components/HomeHero";
import { CustomerReviews } from "@/components/CustomerReviews";
import { HomeProductCard } from "@/components/HomeProductCard";
import { FastSellingSection } from "@/components/FastSellingSection";
import { HomeSeoSection } from "@/components/HomeSeoSection";
import { HomeRakshaBandhan2026Section } from "@/components/HomeRakshaBandhan2026Section";
import { TrustStrip } from "@/components/TrustStrip";
import { WhyTrustUsSection } from "@/components/WhyTrustUsSection";
import { JsonLd } from "@/components/JsonLd";
import { site, homeBanners, homeCategoryOrder, faqs } from "@/lib/site";
import {
  getCatalogProductsByCategory,
  mergeProductsPreferExisting,
} from "@/lib/catalog-fallback";
import { faqJsonLd, howToSendRakhiJsonLd, pageMetadata } from "@/lib/seo";
import type { Product, Category } from "@hr-ecom/shared";

export const metadata: Metadata = pageMetadata({
  title: "Send Rakhi to USA Online | Rakhi Delivery USA | UsaRakhi",
  description:
    "Send rakhi to USA with domestic delivery — buy rakhi online USA, order from India worldwide. Rakhi store USA: designer rakhis, combos, 5–7 day nationwide shipping. California warehouse for fast local delivery.",
  path: "/",
  keywords:
    "send rakhi to usa, rakhi delivery usa, buy rakhi online usa, send rakhi to usa from india, rakhi store usa, usa rakhi shop online, rakhi gifts to usa, nationwide rakhi delivery usa",
});

export const dynamic = "force-static";
export const revalidate = 60;

export default async function HomePage() {
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const [productsData, categoriesData] = await Promise.all([
      api<{ products: Product[] }>("/products", { revalidate: 60 }),
      api<{ categories: Category[] }>("/categories", { revalidate: 60 }),
    ]);
    products = productsData.products;
    categories = categoriesData.categories;
  } catch {
    products = [];
    categories = [];
  }

  // Orange County hampers (and other catalog fallbacks) may not be in API yet.
  // Prefer live API prices — catalog JSON can be stale for shared slugs.
  for (const slug of homeCategoryOrder) {
    products = mergeProductsPreferExisting(products, getCatalogProductsByCategory(slug));
  }
  if (!categories.some((c) => c.slug === "rakhi-hampers")) {
    const now = new Date().toISOString();
    categories = [
      ...categories,
      {
        name: "Rakhi Hamper",
        slug: "rakhi-hampers",
        description: "Premium Rakhi gift hampers for USA delivery.",
        published: true,
        sortOrder: 15,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  const categoryMap = new Map(categories.map((c) => [c.slug, c]));
  const productsByCategory = homeCategoryOrder.map((slug) => ({
    slug,
    name: categoryMap.get(slug)?.name ?? slug.replace(/-/g, " "),
    products: products.filter(
      (p) => p.categorySlug === slug || p.additionalCategorySlugs?.includes(slug)
    ),
  }));

  return (
    <div>
      <JsonLd data={[faqJsonLd(faqs), howToSendRakhiJsonLd()]} />
      <HomeHero banners={homeBanners} />
      <TrustStrip />

      <FastSellingSection products={products} />

      {productsByCategory.map((section) =>
        section.products.length > 0 ? (
          <section key={section.slug} className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-bold text-primary capitalize">{section.name}</h2>
              <Link href={categoryHref(section.slug)} className="text-nav font-semibold text-sm hover:underline">
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

      <section className="max-w-4xl mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-4">
          Send Rakhi to USA — Free Shipping | Premium Online Rakhi Delivery
        </h1>
        <p className="text-slate-600 leading-relaxed mb-4">
          {applyInlineLinks(
            `${site.name} helps sisters in India, UK, Canada, Australia, and worldwide send rakhi to USA with reliable rakhi delivery USA across all 50 states. Shop 140+ designer rakhis — Single Rakhi, Combos with chocolates, rakhi gift hamper boxes with sweets and dry fruits, Kids Rakhi, Bhaiya Bhabhi sets, and Lumba Rakhi — delivered in 5–7 business days with roli chawal included. Order rakhi to USA from India in minutes at our online rakhi store USA.`,
            homepageInlineLinks
          )}
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <Link href="/raksha-bandhan" className="text-nav font-semibold hover:underline">
            Raksha Bandhan 2026 →
          </Link>
          <Link href="/blog/send-rakhi-to-usa-from-india" className="text-nav font-semibold hover:underline">
            Send from India guide →
          </Link>
          <Link href={categoryHref("rakhi-hampers")} className="text-nav font-semibold hover:underline">
            Rakhi Hampers →
          </Link>
          <Link href="/shipping" className="text-nav font-semibold hover:underline">
            Shipping info →
          </Link>
        </div>
      </section>

      <HomeRakshaBandhan2026Section />

      <WhyTrustUsSection />

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
