import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { HomeProductCard } from "@/components/HomeProductCard";
import { SearchBar } from "@/components/SearchBar";
import { SearchTracker } from "@/components/SearchTracker";
import type { Product, Category } from "@hr-ecom/shared";

export const metadata: Metadata = {
  title: "Shop Rakhi — Send Rakhi to USA",
  description: "Browse our full Rakhi collection — combos, kids rakhis, Bhaiya Bhabhi sets, and more.",
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ search?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search;
  const category = params.category;

  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (category) query.set("category", category);
    const qs = query.toString() ? `?${query.toString()}` : "";

    const [productsData, categoriesData] = await Promise.all([
      api<{ products: Product[] }>(`/products${qs}`),
      api<{ categories: Category[] }>("/categories"),
    ]);
    products = productsData.products;
    categories = categoriesData.categories;
  } catch {
    products = [];
    categories = [];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {search ? <SearchTracker query={search} resultCount={products.length} /> : null}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-primary">Shop Rakhi</h1>
        <SearchBar />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/products"
            className={`px-3 py-1 rounded-full text-sm border ${!category ? "bg-nav text-white border-nav" : "border-slate-300 hover:border-nav"}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className={`px-3 py-1 rounded-full text-sm border ${category === c.slug ? "bg-nav text-white border-nav" : "border-slate-300 hover:border-nav"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-slate-600">
          No products in this category yet. Products are imported automatically on deploy — if you
          just set up the site, run the <strong>Import UsaRakhi Catalog</strong> workflow in GitHub
          Actions or wait for the next deploy to finish.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p) => (
            <HomeProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
