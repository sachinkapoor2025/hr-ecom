import type { Metadata } from "next";
import { isRakhiContentHidden } from "@hr-ecom/shared";
import { CountryGiftLanding } from "@/components/CountryGiftLanding";
import { CountryRakhiLanding } from "@/components/CountryRakhiLanding";
import type { ProductSort } from "@/components/ProductSortBar";
import { getCountryGiftPage } from "@/lib/content/country-gift-pages";
import { getCountryRakhiPage } from "@/lib/content/country-rakhi-pages";
import { loadLocationPageProducts } from "@/lib/product-loader";
import { canonical, pageMetadata } from "@/lib/seo";

const page = getCountryRakhiPage("canada");

const SORT_VALUES: ProductSort[] = ["featured", "price-asc", "price-desc", "name-asc", "name-desc"];

function resolveSort(raw?: string): ProductSort {
  return SORT_VALUES.includes(raw as ProductSort) ? (raw as ProductSort) : "featured";
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateMetadata(): Metadata {
  return {
    ...pageMetadata({
      title: "Send Gifts from Canada to USA | UsaRakhi",
      description:
        "Explore gift options from Canada to the USA with UsaRakhi. Discover Indian sweets, chocolates and festive hampers for Diwali and Bhai Dooj.",
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

export default async function RakhiFromCanadaPage({ searchParams }: Props) {
  const sort = resolveSort((await searchParams).sort);
  let products: Awaited<ReturnType<typeof loadLocationPageProducts>> = [];
  try {
    products = await loadLocationPageProducts("rakhi-from-canada");
  } catch {
    products = [];
  }

  if (isRakhiContentHidden()) {
    return <CountryGiftLanding page={getCountryGiftPage("canada")} products={products} />;
  }

  return <CountryRakhiLanding page={page} products={products} sort={sort} />;
}
