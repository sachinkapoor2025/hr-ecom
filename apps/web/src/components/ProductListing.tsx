"use client";

import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  PRODUCT_SORT_OPTIONS,
  isProductSortValue,
  sortProducts,
  type Product,
  type ProductSortValue,
} from "@hr-ecom/shared";
import { HomeProductCard } from "@/components/HomeProductCard";

interface ProductListingProps {
  products: Product[];
  /** Keep `?sort=` in the URL (shop/search pages). */
  syncSortToUrl?: boolean;
}

export function ProductListing(props: ProductListingProps) {
  return (
    <Suspense fallback={<ProductListingFallback products={props.products} />}>
      <ProductListingInner {...props} />
    </Suspense>
  );
}

function ProductListingFallback({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-stretch">
      {products.map((product) => (
        <HomeProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}

function ProductListingInner({ products, syncSortToUrl = false }: ProductListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSort = searchParams.get("sort");
  const [sort, setSort] = useState<ProductSortValue | null>(isProductSortValue(urlSort) ? urlSort : null);

  const sortedProducts = useMemo(
    () => (sort ? sortProducts(products, sort) : products),
    [products, sort]
  );

  const handleSortChange = (value: string) => {
    const next = isProductSortValue(value) ? value : null;
    setSort(next);

    if (!syncSortToUrl) return;

    const params = new URLSearchParams(searchParams.toString());
    if (!next) params.delete("sort");
    else params.set("sort", next);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <label htmlFor="product-sort" className="text-sm text-slate-600 shrink-0">
          Sort by:
        </label>
        <select
          id="product-sort"
          value={sort ?? ""}
          onChange={(e) => handleSortChange(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 bg-white min-w-[11rem] focus:outline-none focus:ring-2 focus:ring-nav/30 focus:border-nav"
        >
          <option value="" disabled>
            Select
          </option>
          {PRODUCT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-stretch">
        {sortedProducts.map((product) => (
          <HomeProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
