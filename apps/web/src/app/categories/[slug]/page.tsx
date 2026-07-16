import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Suspense } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryContentSection } from "@/components/CategoryContentSection";
import { JsonLd } from "@/components/JsonLd";
import { getCategoryContent } from "@/lib/content/category-content";
import { getCategoryPageSeo } from "@/lib/content/category-seo";
import { getCategoryRichContent } from "@/lib/content/category-rich-content";
import { CategoryProductLinks } from "@/components/CategoryProductLinks";
import { categoryHref } from "@/lib/category-urls";
import { getCatalogProductsByCategory } from "@/lib/catalog-fallback";
import { categoryOrder } from "@/lib/site";
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";
import type { Product, Category } from "@hr-ecom/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return categoryOrder.map((slug) => ({ slug }));
}

export const revalidate = 60;

function mergeProductsBySlug(products: Product[], additions: Product[]): Product[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  for (const product of additions) bySlug.set(product.slug, product);
  return [...bySlug.values()];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const seo = getCategoryPageSeo(slug);
  const path = categoryHref(slug);

  if (seo) {
    return pageMetadata({
      title: seo.title,
      description: seo.description,
      path,
      absoluteTitle: true,
    });
  }

  try {
    const data = await api<{ category: Category }>(`/categories/${slug}`, { revalidate: 3600 });
    const c = data.category;
    return pageMetadata({
      title: `${c.name} — Send to USA | Free Shipping`,
      description:
        c.seoDescription ??
        c.description?.slice(0, 160) ??
        `Shop ${c.name} with fast USA delivery from UsaRakhi. Premium designs, roli chawal included.`,
      path,
    });
  } catch {
    return pageMetadata({
      title: `${slug.replace(/-/g, " ")} Rakhi USA`,
      description: `Shop ${slug.replace(/-/g, " ")} with USA delivery from UsaRakhi.`,
      path,
    });
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  let category: Category | null = null;
  let products: Product[] = [];

  try {
    const [catData, prodData] = await Promise.all([
      api<{ category: Category }>(`/categories/${slug}`, { revalidate: 3600 }),
      api<{ products: Product[] }>(`/products?category=${slug}`, { revalidate: 60 }),
    ]);
    category = catData.category;
    products = prodData.products;
  } catch {
    if (!categoryOrder.includes(slug as (typeof categoryOrder)[number])) notFound();
    products = getCatalogProductsByCategory(slug);
  }

  if (slug === "rakhi-combo") {
    products = mergeProductsBySlug(products, getCatalogProductsByCategory("rakhi-combo"));
  }

  const name = category?.name ?? slug.replace(/-/g, " ");
  const pageSeo = getCategoryPageSeo(slug);
  const h1 = pageSeo?.h1 ?? `${name} — Send to USA`;
  const baseDescription =
    category?.description?.trim() ||
    `Browse our ${name} collection — premium Rakhis delivered to all 50 US states. Order online from India, UK, Canada, or anywhere worldwide.`;
  const extra = getCategoryContent(slug);
  const rich = getCategoryRichContent(slug);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: name },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs.map((c) => ({ name: c.label, path: c.href ?? categoryHref(slug) }))),
          itemListJsonLd(
            `${name} — UsaRakhi USA`,
            products.map((p) => ({ name: p.name, path: `/products/${p.slug}` }))
          ),
          ...(rich ? [faqJsonLd(rich.faqs)] : []),
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold text-primary mb-8">{h1}</h1>

      {products.length > 0 ? (
        <Suspense fallback={<p className="text-slate-500">Loading products…</p>}>
          <ProductGrid products={products} />
        </Suspense>
      ) : (
        <p className="text-slate-500">
          Products loading soon.{" "}
          <Link href="/products" className="text-nav hover:underline">
            Browse all Rakhis
          </Link>
        </p>
      )}

      <CategoryProductLinks products={products} categoryName={name} />

      {rich ? (
        <CategoryContentSection content={rich} categoryName={name} products={products} />
      ) : (
        <>
          <section className="mt-12 pt-10 border-t border-slate-200">
            <div className="grid lg:grid-cols-2 gap-x-12 gap-y-6 text-slate-700 leading-relaxed">
              <div className="space-y-4">
                {baseDescription.split(/(?<=\.)\s+/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
                {extra?.extraParagraphs.map((para, i) => (
                  <p key={`extra-${i}`}>{para}</p>
                ))}
              </div>
              {extra?.sections && extra.sections.length > 0 && (
                <div className="space-y-6">
                  {extra.sections.map((section) => (
                    <div key={section.heading}>
                      <h2 className="text-lg font-bold text-primary mb-3">{section.heading}</h2>
                      <ul className="space-y-2 text-sm">
                        {section.paragraphs.map((item, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-nav mt-1 shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="mt-10 p-6 bg-slate-50 rounded-xl">
            <h2 className="font-semibold text-primary mb-3">Why order {name} from UsaRakhi?</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-nav shrink-0">✓</span>
                Fast Rakhi delivery to all 50 US states (5–7 business days)
              </li>
              <li className="flex gap-2">
                <span className="text-nav shrink-0">✓</span>
                Order from India, UK, Canada, Australia — we deliver inside USA
              </li>
              <li className="flex gap-2">
                <span className="text-nav shrink-0">✓</span>
                Complimentary roli and chawal with most rakhis
              </li>
              <li className="flex gap-2">
                <span className="text-nav shrink-0">✓</span>
                Secure checkout with Razorpay and Stripe
              </li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
