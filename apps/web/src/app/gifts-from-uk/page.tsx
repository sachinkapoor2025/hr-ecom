import type { Metadata } from "next";
import { isRakhiContentHidden } from "@hr-ecom/shared";
import { CountryGiftLanding } from "@/components/CountryGiftLanding";
import { CountryRakhiLanding } from "@/components/CountryRakhiLanding";
import type { ProductSort } from "@/components/ProductSortBar";
import { getCountryGiftPage } from "@/lib/content/country-gift-pages";
import { getCountryRakhiPage } from "@/lib/content/country-rakhi-pages";
import { loadLocationPageProducts, loadVisibleStorefrontProducts } from "@/lib/product-loader";
import { canonical, pageMetadata } from "@/lib/seo";

const page = getCountryRakhiPage("uk");

const SORT_VALUES: ProductSort[] = ["featured", "price-asc", "price-desc", "name-asc", "name-desc"];

function resolveSort(raw?: string): ProductSort {
  return SORT_VALUES.includes(raw as ProductSort) ? (raw as ProductSort) : "featured";
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateMetadata(): Metadata {
  return {
  ...pageMetadata({
    title: "Send Gifts from UK to USA | Diwali Gift Hampers",
    description:
      "Looking for gifts from the UK to the USA? Explore festive hampers, Indian sweets, chocolates and Diwali gift options with UsaRakhi.",
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
  const sort = resolveSort((await searchParams).sort);
  let products: Awaited<ReturnType<typeof loadLocationPageProducts>> = [];
  try {
    products = await loadLocationPageProducts("rakhi-from-uk");
    if (products.length === 0) products = await loadVisibleStorefrontProducts();
  } catch {
    try {
      products = await loadVisibleStorefrontProducts();
    } catch {
      products = [];
    }
  }

  if (isRakhiContentHidden()) {
    return <CountryGiftLanding page={getCountryGiftPage("uk")} products={products} />;
  }

  return <CountryRakhiLanding page={page} products={products} sort={sort} />;
}
