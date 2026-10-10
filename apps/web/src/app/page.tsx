import type { Metadata } from "next";
import Link from "next/link";
import { categoryHref } from "@/lib/category-urls";
import { applyInlineLinks } from "@/lib/inline-links";
import { homepageInlineLinks } from "@/lib/content/page-inline-links";
import { HomeHero } from "@/components/HomeHero";
import { CategoryShopIcons } from "@/components/CategoryShopIcons";
import { GoogleReviews } from "@/components/GoogleReviews";
import { getGoogleReviews } from "@/lib/google-reviews";
import { HomeProductCard } from "@/components/HomeProductCard";
import { FastSellingSection } from "@/components/FastSellingSection";
import { FlashSaleSection } from "@/components/FlashSaleSection";
import { HomeSeoSection } from "@/components/HomeSeoSection";
import { TrustStrip } from "@/components/TrustStrip";
import { UsarakhiShareEmotionsBanner } from "@/components/UsarakhiShareEmotionsBanner";
import { IndiaBuyerBanner } from "@/components/IndiaBuyerBanner";
import { WhyTrustUsSection } from "@/components/WhyTrustUsSection";
import { JsonLd } from "@/components/JsonLd";
import { site, homeCategoryOrder, faqs } from "@/lib/site";
import { getHomeBanners } from "@/lib/independence-day-hero";
import {
  getCatalogProduct,
  getCatalogProductsByCategory,
  mergeProductsPreferExisting,
} from "@/lib/catalog-fallback";
import { pickHomeCategoryProducts } from "@/lib/home-category-products";
import { loadProducts } from "@/lib/product-loader";
import { faqJsonLd, howToSendRakhiJsonLd, pageMetadata } from "@/lib/seo";
import { FLASH_COMBO_SALE_SLUG, isFlashComboSaleActive, type Product } from "@hr-ecom/shared";

export const metadata: Metadata = pageMetadata({
  title: "Diwali & Bhai Dooj Gifts USA | Festive Hampers | UsaRakhi",
  description:
    "Shop Diwali and Bhai Dooj gift hampers with USA delivery — sweets, dry fruits, chocolates, and pooja sets shipped domestically.",
  path: "/",
  keywords:
    "diwali gifts usa, bhai dooj gifts usa, diwali hamper usa, bhai dooj hamper, send diwali gifts to usa, pooja set usa, kaju katli gift box usa",
});

/** Same as PDP: always render from live product API so listing prices cannot drift. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let products: Product[] = [];

  try {
    products = await loadProducts();
  } catch {
    products = [];
  }

  for (const slug of homeCategoryOrder) {
    products = mergeProductsPreferExisting(products, getCatalogProductsByCategory(slug));
  }

  const homeCategoryDisplayNames: Record<(typeof homeCategoryOrder)[number], string> = {
    "bhai-dooj": "Bhai Dooj Gifts",
    diwali: "Diwali Gifts",
  };

  // Home-only curated lists + order (does not change category/shop/search pages).
  const productsByCategory = homeCategoryOrder.map((slug) => ({
    slug,
    name: homeCategoryDisplayNames[slug],
    products: pickHomeCategoryProducts(products, slug),
  }));
  const googleReviews = await getGoogleReviews();
  const flashCombo = isFlashComboSaleActive()
    ? products.find((p) => p.slug === FLASH_COMBO_SALE_SLUG && p.published !== false) ??
      getCatalogProduct(FLASH_COMBO_SALE_SLUG) ??
      null
    : null;

  return (
    <div>
      <JsonLd data={[faqJsonLd(faqs), howToSendRakhiJsonLd()]} />
      <HomeHero banners={getHomeBanners()} />
      <UsarakhiShareEmotionsBanner />
      <CategoryShopIcons />
      <FlashSaleSection product={flashCombo} />
      <TrustStrip />
      <IndiaBuyerBanner />

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
              {section.products.map((p) => (
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
          Diwali &amp; Bhai Dooj Gifts — Delivered Across the USA
        </h1>
        <p className="text-slate-600 leading-relaxed mb-4">
          {applyInlineLinks(
            `${site.name} ships festive gift hampers from within the United States. Shop Bhai Dooj boxes with sweets, dry fruits, and chocolates, and Diwali hampers with pooja sets, toran, rangoli, and mithai — delivered in about 5 business days.`,
            homepageInlineLinks
          )}
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <Link href={categoryHref("bhai-dooj")} className="text-nav font-semibold hover:underline">
            Bhai Dooj gifts →
          </Link>
          <Link href={categoryHref("diwali")} className="text-nav font-semibold hover:underline">
            Diwali gifts →
          </Link>
          <Link href="/shipping" className="text-nav font-semibold hover:underline">
            Shipping info →
          </Link>
        </div>
      </section>

      <WhyTrustUsSection />

      <GoogleReviews data={googleReviews} />

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
