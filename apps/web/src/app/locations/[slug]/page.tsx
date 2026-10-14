import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeProductCard } from "@/components/HomeProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CityContentSection } from "@/components/CityContentSection";
import { SeoLocationLanding } from "@/components/SeoLocationLanding";
import { SecondaryCityLanding, buildSecondaryCityFaqs } from "@/components/SecondaryCityLanding";
import { JsonLd } from "@/components/JsonLd";
import {
  allSeoLocationSlugs,
  californiaWarehouseLocations,
  getSeoLocation,
  locationPublicPath,
  seoLocations,
} from "@/lib/content/seo-data";
import { getCityContent } from "@/lib/content/city-pages";
import {
  getSecondaryCity,
  isExpressMetro,
  isSecondaryCity,
  secondaryCityIntro,
} from "@/lib/content/city-delivery-tiers";
import { loadLocationPageProducts } from "@/lib/product-loader";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, serviceAreaJsonLd } from "@/lib/seo";
import { buildLocationContent } from "@/components/SeoLocationLanding";
import { site } from "@/lib/site";
import type { Product } from "@hr-ecom/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Same as homepage: always load the full live catalog (avoid stale 20-product ISR HTML). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return allSeoLocationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = locationPublicPath(slug);

  // Express metros: prefer individually maintained city-pages copy for title/description.
  const cityContent = getCityContent(slug);
  if (isExpressMetro(slug) && cityContent) {
    return pageMetadata({
      title: `Send Diwali and Bhai Dooj Gifts to ${cityContent.label}, USA | Fast Delivery`,
      description:
        cityContent.metaExtra ??
        `Send Diwali gifts and Bhai Dooj gifts to ${cityContent.label}, USA with ${site.name}. Festive gift combos, sweets, chocolates, and dry fruit hampers with standard USA delivery.`,
      path,
      keywords: `diwali gifts ${cityContent.label}, bhai dooj gifts ${cityContent.label}, sweet combos, dry fruit hampers, UsaRakhi`,
      absoluteTitle: true,
    });
  }

  const secondary = getSecondaryCity(slug);
  if (secondary) {
    const place = `${secondary.name}, ${secondary.state}`;
    return pageMetadata({
      title: `Send Diwali and Bhai Dooj Gifts to ${place} | 5–7 Day USA Delivery | ${site.name}`,
      description: `Send Diwali gifts and Bhai Dooj gifts to ${place} with ${site.name}. Domestic USA shipping in 5–7 business days for sweet combos, chocolates, and dry fruit hampers. Stripe and Razorpay checkout.`,
      path,
      keywords: `diwali gifts ${secondary.name}, bhai dooj gifts ${secondary.name}, ${secondary.state}, sweet combos, dry fruit hampers`,
      absoluteTitle: true,
    });
  }

  const location = getSeoLocation(slug);
  if (!location) return { title: "Gifts Delivery" };

  const place =
    location.region === "state"
      ? location.name
      : location.state
        ? `${location.name}, ${location.state}`
        : location.name;
  const warehouseNote = location.isCaliforniaWarehouse
    ? " Ships from our California warehouse for faster West Coast delivery."
    : location.state
      ? ` Domestic USA shipping to ${place} — no customs delays.`
      : " Domestic USA shipping nationwide — no customs delays.";
  const regionNote =
    location.region === "state"
      ? `Browse Diwali gift combos, sweet boxes, chocolate combos, and dry fruit hampers for addresses across ${location.name}.`
      : `Order online for doorstep delivery in ${place}${location.state ? ` and nearby ${location.state} metros` : ""}.`;

  return pageMetadata({
    title: `Send Diwali and Bhai Dooj Gifts to ${place} | ${site.name}`,
    description: `Send Diwali gifts and Bhai Dooj gifts to ${place} with ${site.name}.${warehouseNote} ${regionNote} Secure Stripe and Razorpay checkout.`,
    path,
    keywords: location.keywords.slice(0, 12).join(", "),
    absoluteTitle: true,
  });
}

export default async function SeoLocationPage({ params }: Props) {
  const { slug } = await params;

  let cityProducts: Product[] = [];
  try {
    // Same festive catalog as the shop, so every card has a store CDN image.
    cityProducts = await loadLocationPageProducts(slug);
  } catch {
    cityProducts = [];
  }

  // --- Express metros: individually maintained CityContentSection ---
  const cityContent = getCityContent(slug);
  if (isExpressMetro(slug) && cityContent) {
    const crumbs = [
      { label: "Home", href: "/" },
      { label: `Send Gifts to ${cityContent.label}` },
    ];
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <JsonLd
          data={[
            breadcrumbJsonLd(
              crumbs.map((c) => ({ name: c.label, path: c.href ?? locationPublicPath(slug) }))
            ),
            faqJsonLd(cityContent.faqs),
            serviceAreaJsonLd({ label: cityContent.label, slug, state: cityContent.state }),
          ]}
        />
        <Breadcrumbs items={crumbs} />
        <h1 className="text-3xl font-bold text-primary mb-2">
          Send Diwali and Bhai Dooj Gifts to {cityContent.label}, USA
        </h1>
        <p className="text-slate-600 mb-8 max-w-3xl">
          {cityContent.metaExtra ??
            `Diwali gift combos and Bhai Dooj gifts for ${cityContent.label}. Domestic USA shipping for sweets, chocolates, and dry fruit hampers.`}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {cityProducts.map((p) => (
            <HomeProductCard key={p.slug} product={p} />
          ))}
        </div>
        <CityContentSection content={cityContent} />
      </div>
    );
  }

  // --- Secondary doorways: shared thin template ---
  const secondary = getSecondaryCity(slug);
  if (secondary) {
    const place = `${secondary.name}, ${secondary.state}`;
    const crumbs = [
      { label: "Home", href: "/" },
      { label: `Send Gifts to ${secondary.name}` },
    ];
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <JsonLd
          data={[
            breadcrumbJsonLd(
              crumbs.map((c) => ({ name: c.label, path: c.href ?? locationPublicPath(slug) }))
            ),
            faqJsonLd([...buildSecondaryCityFaqs(secondary)]),
            serviceAreaJsonLd({ label: secondary.name, slug, state: secondary.state }),
          ]}
        />
        <Breadcrumbs items={crumbs} />
        <h1 className="text-3xl font-bold text-primary mb-2">
          Send Diwali and Bhai Dooj Gifts to {place}
        </h1>
        <p className="text-slate-600 mb-8 max-w-3xl">
          {secondaryCityIntro(secondary.slug, secondary.name, secondary.state)}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {cityProducts.map((p) => (
            <HomeProductCard key={p.slug} product={p} />
          ))}
        </div>
        <SecondaryCityLanding city={secondary} />
      </div>
    );
  }

  // --- All other SEO locations (states + remaining cities) ---
  const location = getSeoLocation(slug);
  if (!location) notFound();

  const place =
    location.region === "state"
      ? location.name
      : location.state
        ? `${location.name}, ${location.state}`
        : location.name;

  const content = buildLocationContent(location);
  const related = location.isCaliforniaWarehouse
    ? californiaWarehouseLocations()
        .filter((l) => l.slug !== slug && !isSecondaryCity(l.slug))
        .slice(0, 8)
    : location.state
      ? seoLocations
          .filter((l) => l.state === location.state && l.slug !== slug && !isSecondaryCity(l.slug))
          .slice(0, 8)
      : [];

  const crumbs = [
    { label: "Home", href: "/" },
    { label: `Send Gifts to ${place}` },
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
        Send Diwali and Bhai Dooj Gifts to {place}
      </h1>
      <p className="text-slate-600 mb-8 max-w-3xl">
        Send Diwali gift combos, Bhai Dooj gifts, sweets, chocolates, and dry fruit hampers to {place}{" "}
        with {site.name}. Domestic USA shipping and secure checkout.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cityProducts.map((p) => (
          <HomeProductCard key={p.slug} product={p} />
        ))}
      </div>
      {cityProducts.length === 0 && (
        <p className="text-slate-500 mt-4">
          <Link href="/products" className="text-nav hover:underline">
            Browse Diwali and Bhai Dooj gifts
          </Link>
        </p>
      )}

      <SeoLocationLanding location={location} related={related} />
    </div>
  );
}
