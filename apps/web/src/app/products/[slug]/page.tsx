import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ProductDetailClient } from "./ProductDetailClient";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, productJsonLd } from "@/lib/seo";
import { productPageFaqs } from "@/lib/content/product-faqs";
import { resolveImageUrl } from "@/lib/images";
import type { Product } from "@hr-ecom/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const data = await api<{ products: Product[] }>("/products");
    return data.products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await api<{ product: Product }>(`/products/${slug}`);
    const p = data.product;
    return pageMetadata({
      title: p.seoTitle ?? p.name,
      description: p.seoDescription ?? p.description.slice(0, 160),
      path: `/products/${slug}`,
      ogImage: resolveImageUrl(p.images?.[0]),
      keywords: [p.name, ...(p.tags ?? []), "send rakhi to USA", "UsaRakhi"].join(", "),
    });
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product: Product;
  let relatedProducts: Product[] = [];

  try {
    const data = await api<{ product: Product }>(`/products/${slug}`);
    product = data.product;
  } catch {
    notFound();
  }

  try {
    const related = await api<{ products: Product[] }>(`/products?category=${product.categorySlug}`);
    relatedProducts = related.products.filter((p) => p.slug !== product.slug).slice(0, 5);
  } catch {
    relatedProducts = [];
  }

  const categoryLabel = product.categorySlug.replace(/-/g, " ");
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: categoryLabel, href: `/categories/${product.categorySlug}` },
    { label: product.name },
  ];

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product),
          breadcrumbJsonLd(crumbs.map((c) => ({ name: c.label, path: c.href ?? `/products/${slug}` }))),
          faqJsonLd(productPageFaqs),
        ]}
      />
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <Breadcrumbs items={crumbs} />
      </div>
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
