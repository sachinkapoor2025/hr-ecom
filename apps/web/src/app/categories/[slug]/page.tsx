import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { HomeProductCard } from "@/components/HomeProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { categoryOrder } from "@/lib/site";
import { breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";
import type { Product, Category } from "@hr-ecom/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return categoryOrder.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await api<{ category: Category }>(`/categories/${slug}`);
    const c = data.category;
    return pageMetadata({
      title: `${c.name} — Send to USA | Free Shipping`,
      description:
        c.seoDescription ??
        c.description?.slice(0, 160) ??
        `Shop ${c.name} with fast USA delivery from UsaRakhi. Premium designs, roli chawal included.`,
      path: `/categories/${slug}`,
    });
  } catch {
    return pageMetadata({
      title: `${slug.replace(/-/g, " ")} Rakhi USA`,
      description: `Shop ${slug.replace(/-/g, " ")} with USA delivery from UsaRakhi.`,
      path: `/categories/${slug}`,
    });
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  let category: Category | null = null;
  let products: Product[] = [];

  try {
    const [catData, prodData] = await Promise.all([
      api<{ category: Category }>(`/categories/${slug}`),
      api<{ products: Product[] }>(`/products?category=${slug}`),
    ]);
    category = catData.category;
    products = prodData.products;
  } catch {
    if (!categoryOrder.includes(slug as (typeof categoryOrder)[number])) notFound();
  }

  const name = category?.name ?? slug.replace(/-/g, " ");
  const description =
    category?.description ||
    `Browse our ${name} collection — premium Rakhis delivered to all 50 US states. Order online from India, UK, Canada, or anywhere worldwide.`;

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: name },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs.map((c) => ({ name: c.label, path: c.href ?? `/categories/${slug}` }))),
          itemListJsonLd(
            `${name} — UsaRakhi USA`,
            products.map((p) => ({ name: p.name, path: `/products/${p.slug}` }))
          ),
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold text-primary mb-4">{name} — Send to USA</h1>
      <div className="text-slate-600 mb-8 max-w-3xl leading-relaxed">
        <p>{description}</p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p) => (
            <HomeProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-slate-500">
          Products loading soon.{" "}
          <Link href="/products" className="text-nav hover:underline">Browse all Rakhis</Link>
        </p>
      )}

      <section className="mt-12 p-6 bg-slate-50 rounded-xl">
        <h2 className="font-semibold text-primary mb-2">Why order {name} from UsaRakhi?</h2>
        <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
          <li>Fast Rakhi delivery to all 50 US states (5–7 business days)</li>
          <li>Order from India, UK, Canada, Australia — we deliver inside USA</li>
          <li>Complimentary roli and chawal with most rakhis</li>
          <li>Secure checkout with Razorpay and Stripe</li>
        </ul>
      </section>
    </div>
  );
}
