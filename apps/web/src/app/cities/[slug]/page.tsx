import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { HomeProductCard } from "@/components/HomeProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { cityLinks, site } from "@/lib/site";
import { shuffleForCity } from "@/lib/city-products";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import type { Product } from "@hr-ecom/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return cityLinks.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = cityLinks.find((c) => c.slug === slug);
  if (!city) return { title: "City" };
  return pageMetadata({
    title: `Send Rakhi to ${city.label} USA | Fast Delivery`,
    description: `Send Rakhi to ${city.label}, USA with ${site.name}. Premium rakhis, 5–7 day delivery, roli chawal included. Order from India worldwide.`,
    path: `/cities/${slug}`,
    keywords: `send rakhi to ${city.label}, rakhi delivery ${city.label}, rakhi USA ${city.label}, UsaRakhi`,
  });
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = cityLinks.find((c) => c.slug === slug);
  if (!city) notFound();

  let products: Product[] = [];
  try {
    const data = await api<{ products: Product[] }>("/products");
    products = data.products;
  } catch {
    products = [];
  }

  const cityProducts = shuffleForCity(products, slug).slice(0, 20);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: `Rakhi to ${city.label}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <JsonLd data={breadcrumbJsonLd(crumbs.map((c) => ({ name: c.label, path: c.href ?? `/cities/${slug}` })))} />
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold text-primary mb-6">Send Rakhi to {city.label}, USA</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cityProducts.map((p) => (
          <HomeProductCard key={p.slug} product={p} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="text-slate-500">
          No products yet.{" "}
          <Link href="/products" className="text-nav hover:underline">
            Browse all Rakhis
          </Link>
        </p>
      )}

      <section className="mt-12 pt-8 border-t border-slate-200 max-w-3xl">
        <div className="text-slate-700 space-y-4 leading-relaxed">
          <p>
            Looking to send Rakhi to your brother in <strong>{city.label}</strong>? {site.name} delivers premium
            Rakhis across {city.label} and all of America in 5–7 business days. Sisters in India, UK, Canada, and
            worldwide order here — we ship domestically within the USA to your brother&apos;s doorstep.
          </p>
          <p>
            Choose from Single Rakhi, Rakhi Combos with chocolates, Kids Rakhi, Bhaiya Bhabhi sets, and Lumba Rakhi.
            Most orders include complimentary roli and chawal for the Raksha Bandhan tilak ceremony.
          </p>
        </div>
      </section>

      <section className="mt-12 p-6 bg-slate-50 rounded-xl text-sm text-slate-600">
        <h2 className="font-semibold text-primary mb-2">Also deliver to</h2>
        <div className="flex flex-wrap gap-2">
          {cityLinks
            .filter((c) => c.slug !== slug)
            .map((c) => (
              <Link key={c.slug} href={`/cities/${c.slug}`} className="text-nav hover:underline">
                {c.label}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
