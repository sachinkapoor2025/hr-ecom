import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { ProductDetailClient } from "./ProductDetailClient";
import type { Product } from "@hr-ecom/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await api<{ product: Product }>(`/products/${slug}`);
    const p = data.product;
    return {
      title: p.seoTitle ?? p.name,
      description: p.seoDescription ?? p.description.slice(0, 160),
      openGraph: {
        title: p.seoTitle ?? p.name,
        description: p.seoDescription ?? p.description.slice(0, 160),
        images: p.images?.[0] ? [{ url: p.images[0] }] : [],
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product: Product;

  try {
    const data = await api<{ product: Product }>(`/products/${slug}`);
    product = data.product;
  } catch {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability:
        product.inventory > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
