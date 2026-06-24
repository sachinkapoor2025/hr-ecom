import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { HomeProductCard } from "@/components/HomeProductCard";
import { cityLinks, site } from "@/lib/site";
import type { Product } from "@hr-ecom/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = cityLinks.find((c) => c.slug === slug);
  if (!city) return { title: "City" };
  return {
    title: `Send Rakhi to ${city.label} | Free Shipping`,
    description: `Send Rakhi to ${city.label}, USA with fast delivery from ${site.name}.`,
  };
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-primary mb-3">Send Rakhi to {city.label}</h1>
      <p className="text-slate-600 mb-8 max-w-2xl">
        Deliver premium Rakhis to your brother in {city.label} with {site.name}. Same-day dispatch, 5–7 business day
        delivery, and free shipping on selected orders.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((p) => (
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
    </div>
  );
}
