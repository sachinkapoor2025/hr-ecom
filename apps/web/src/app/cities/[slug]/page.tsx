import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeProductCard } from "@/components/HomeProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CityContentSection } from "@/components/CityContentSection";
import { JsonLd } from "@/components/JsonLd";
import { cityNavHref, site, usCityLinks } from "@/lib/site";
import { getCityContent } from "@/lib/content/city-pages";
import { loadLocationPageProducts } from "@/lib/product-loader";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, serviceAreaJsonLd } from "@/lib/seo";
import type { Product } from "@hr-ecom/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Same as homepage / location pages: load the live festive catalog. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return usCityLinks.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = usCityLinks.find((c) => c.slug === slug);
  const content = getCityContent(slug);
  if (!city) return { title: "City" };
  return pageMetadata({
    title: `Send Diwali and Bhai Dooj Gifts to ${city.label}, USA | Fast Delivery`,
    description:
      content?.metaExtra ??
      `Send Diwali gifts and Bhai Dooj gifts to ${city.label}, USA with ${site.name}. Sweet combos, chocolates, and dry fruit hampers with 5–7 day delivery.`,
    path: `/send-gifts-to-${slug}`,
    keywords: `diwali gifts ${city.label}, bhai dooj gifts ${city.label}, sweet combos, dry fruit hampers, UsaRakhi`,
  });
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = usCityLinks.find((c) => c.slug === slug);
  const content = getCityContent(slug);
  if (!city || !content) notFound();

  let cityProducts: Product[] = [];
  try {
    cityProducts = await loadLocationPageProducts(slug);
  } catch {
    cityProducts = [];
  }

  const crumbs = [
    { label: "Home", href: "/" },
    { label: `Gifts to ${city.label}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs.map((c) => ({ name: c.label, path: c.href ?? `/send-gifts-to-${slug}` }))),
          faqJsonLd(content.faqs),
          serviceAreaJsonLd({ label: city.label, slug, state: content.state }),
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold text-primary mb-2">
        Send Diwali and Bhai Dooj Gifts to {city.label}, USA
      </h1>
      <p className="text-slate-600 mb-8">
        Diwali gift combos, Bhai Dooj gifts, sweets, chocolates, and dry fruit hampers for {city.label}.
        Order from India, the UK, Canada, or anywhere. We ship domestically within America in 5–7
        business days.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cityProducts.map((p) => (
          <HomeProductCard key={p.slug} product={p} />
        ))}
      </div>
      {cityProducts.length === 0 && (
        <p className="text-slate-500 mt-4">
          No products yet.{" "}
          <Link href="/products" className="text-nav hover:underline">
            Browse Diwali and Bhai Dooj gifts
          </Link>
        </p>
      )}

      <CityContentSection content={content} />

      <section className="mt-12 p-6 bg-slate-50 rounded-xl text-sm text-slate-600">
        <h2 className="font-semibold text-primary mb-2">Also deliver Diwali gifts to</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {usCityLinks
            .filter((c) => c.slug !== slug)
            .map((c) => (
              <Link key={c.slug} href={cityNavHref(c)} className="text-nav hover:underline">
                {c.label}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
