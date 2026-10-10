import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeProductCard } from "@/components/HomeProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import {
  allCollectionSlugs,
  getCollection,
} from "@/lib/collections";
import { getCollectionGuide } from "@/lib/content/collection-guides";
import { loadProducts } from "@/lib/product-loader";
import { getCatalogProducts, mergeProductsPreferExisting } from "@/lib/catalog-fallback";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import type { Product } from "@hr-ecom/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return allCollectionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Collection" };
  return pageMetadata({
    title: collection.title,
    description: collection.description,
    path: `/collections/${slug}`,
    keywords: `${collection.h1}, send rakhi to usa, UsaRakhi`,
  });
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  let products: Product[] = [];
  try {
    products = await loadProducts();
  } catch {
    products = [];
  }
  products = mergeProductsPreferExisting(products, getCatalogProducts());
  const filtered = collection.filter(products).filter((p) => p.published !== false);
  const guide = getCollectionGuide(slug);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: collection.h1 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 overflow-x-hidden">
      <JsonLd
        data={[
          breadcrumbJsonLd(
            crumbs.map((c) => ({
              name: c.label,
              path: c.href ?? `/collections/${slug}`,
            }))
          ),
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">{collection.h1}</h1>
        <p className="text-slate-600 max-w-3xl">{collection.intro}</p>
      </header>

      {filtered.length === 0 ? (
        <p className="text-slate-600 mb-8">
          Products for this collection are being updated.{" "}
          <Link href="/products" className="text-nav font-semibold hover:underline">
            Browse all Rakhis →
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-stretch">
          {filtered.map((product) => (
            <HomeProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}

      {guide ? (
        <section className="mt-12 pt-10 border-t border-slate-200 max-w-3xl text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-primary mb-3">{guide.heading}</h2>
          {guide.paragraphs.map((para) => (
            <p key={para} className="mb-4">
              {para}
            </p>
          ))}
          <h3 className="text-lg font-semibold text-primary mb-2">{guide.pointsHeading}</h3>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            {guide.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="text-sm">
            {guide.links.map((link, i) => (
              <span key={link.href}>
                {i > 0 ? " · " : null}
                <Link href={link.href} className="text-nav font-semibold hover:underline">
                  {link.label}
                </Link>
              </span>
            ))}
          </p>
        </section>
      ) : null}
    </div>
  );
}
