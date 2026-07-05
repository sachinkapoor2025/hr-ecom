import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { HomeProductCard } from "@/components/HomeProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoLocationLanding } from "@/components/SeoLocationLanding";
import { JsonLd } from "@/components/JsonLd";
import {
  allSeoLocationSlugs,
  californiaWarehouseLocations,
  getSeoLocation,
  locationPublicPath,
  seoLocations,
} from "@/lib/content/seo-data";
import { shuffleForCity } from "@/lib/city-products";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, serviceAreaJsonLd } from "@/lib/seo";
import { buildLocationContent } from "@/components/SeoLocationLanding";
import { site } from "@/lib/site";
import type { Product } from "@hr-ecom/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return allSeoLocationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = getSeoLocation(slug);
  if (!location) return { title: "Rakhi Delivery" };

  const place =
    location.region === "state"
      ? location.name
      : location.state
        ? `${location.name}, ${location.state}`
        : location.name;
  const path = locationPublicPath(slug);
  const primary = location.keywords[0] ?? `send rakhi to ${location.name.toLowerCase()}`;

  return pageMetadata({
    title: `Send Rakhi to ${place} | USA Delivery | ${site.name}`,
    description: `${primary.charAt(0).toUpperCase() + primary.slice(1)} with ${site.name}. Premium rakhis, domestic USA shipping${location.isCaliforniaWarehouse ? ", fast California warehouse dispatch" : ""}, roli chawal included.`,
    path,
    keywords: location.keywords.slice(0, 12).join(", "),
    absoluteTitle: true,
  });
}

export default async function SeoLocationPage({ params }: Props) {
  const { slug } = await params;
  const location = getSeoLocation(slug);
  if (!location) notFound();

  const place =
    location.region === "state"
      ? location.name
      : location.state
        ? `${location.name}, ${location.state}`
        : location.name;

  let products: Product[] = [];
  try {
    const data = await api<{ products: Product[] }>("/products");
    products = data.products;
  } catch {
    products = [];
  }

  const cityProducts = shuffleForCity(products, slug).slice(0, 20);
  const content = buildLocationContent(location);

  const related = location.isCaliforniaWarehouse
    ? californiaWarehouseLocations()
        .filter((l) => l.slug !== slug)
        .slice(0, 8)
    : location.state
      ? seoLocations.filter((l) => l.state === location.state && l.slug !== slug).slice(0, 8)
      : [];

  const crumbs = [
    { label: "Home", href: "/" },
    { label: `Send Rakhi to ${place}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs.map((c) => ({ name: c.label, path: c.href ?? locationPublicPath(slug) }))),
          faqJsonLd(content.faqs),
          serviceAreaJsonLd({ label: place, slug, state: location.state ?? undefined }),
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold text-primary mb-2">
        Send Rakhi to {place} — Online USA Delivery
      </h1>
      <p className="text-slate-600 mb-8 max-w-3xl">
        {location.keywords[0]
          ? `${location.keywords[0].charAt(0).toUpperCase() + location.keywords[0].slice(1)} with ${site.name}.`
          : `Premium rakhi delivery to ${place}.`}{" "}
        Domestic USA shipping, secure checkout, roli chawal on most rakhis.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cityProducts.map((p) => (
          <HomeProductCard key={p.slug} product={p} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="text-slate-500 mt-4">
          <Link href="/products" className="text-nav hover:underline">
            Browse all Rakhis
          </Link>
        </p>
      )}

      <SeoLocationLanding location={location} related={related} />
    </div>
  );
}
