import type { Metadata } from "next";
import Link from "next/link";
import { isRakhiContentHidden } from "@hr-ecom/shared";
import { CountryRakhiLanding } from "@/components/CountryRakhiLanding";
import type { ProductSort } from "@/components/ProductSortBar";
import { getCountryRakhiPage } from "@/lib/content/country-rakhi-pages";
import { loadLocationPageProducts } from "@/lib/product-loader";
import { canonical, pageMetadata } from "@/lib/seo";

const page = getCountryRakhiPage("uk");

const SORT_VALUES: ProductSort[] = ["featured", "price-asc", "price-desc", "name-asc", "name-desc"];

function resolveSort(raw?: string): ProductSort {
  return SORT_VALUES.includes(raw as ProductSort) ? (raw as ProductSort) : "featured";
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateMetadata(): Metadata {
  if (isRakhiContentHidden()) {
    return pageMetadata({
      title: "Send Diwali & Bhai Dooj Gifts from the UK",
      description:
        "Order Diwali and Bhai Dooj gift hampers from the UK for delivery in the United States. Sweets, dry fruits, and chocolates ship domestically in the USA.",
      path: page.path,
      absoluteTitle: true,
    });
  }
  return {
  ...pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: page.path,
    keywords: page.keywords,
    absoluteTitle: true,
  }),
  alternates: {
    canonical: canonical(page.path),
    languages: Object.fromEntries(
      Object.entries(page.localeHints).map(([lang, path]) => [lang, canonical(path)])
    ),
  },
  };
}

interface Props {
  searchParams: Promise<{ sort?: string }>;
}

export default async function RakhiFromUkPage({ searchParams }: Props) {
  if (isRakhiContentHidden()) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-primary mb-4">Gifts from the UK</h1>
        <p className="text-slate-600 leading-relaxed mb-6">
          Order Diwali and Bhai Dooj gift hampers from the UK. Pay online and we deliver to a US address from within
          the United States.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/diwali-to-usa" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
            Shop Diwali gifts
          </Link>
          <Link href="/bhai-dooj-to-usa" className="rounded-full border px-4 py-2 text-sm font-semibold">
            Shop Bhai Dooj gifts
          </Link>
        </div>
      </div>
    );
  }
  const sort = resolveSort((await searchParams).sort);
  const products = await loadLocationPageProducts("rakhi-from-uk");

  return <CountryRakhiLanding page={page} products={products} sort={sort} />;
}
