"use client";

import Link from "next/link";
import type { Product } from "@hr-ecom/shared";
import { AddToCartControl } from "@/components/AddToCartControl";
import { WishlistButton } from "@/components/WishlistButton";
import { useCurrency } from "@/lib/currency-context";
import { getDiscountPercent } from "@/lib/pricing";

export function HomeProductCard({ product }: { product: Product }) {
  const { format } = useCurrency();
  const discount = getDiscountPercent(product.price, product.compareAtPrice);

  return (
    <article className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow relative flex h-full flex-col">
      {discount !== null && (
        <span className="absolute top-2 left-2 z-10 bg-accent text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
          {discount}% OFF
        </span>
      )}

      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-slate-50 border-b border-slate-100">
        <WishlistButton product={product} />
        <Link href={`/products/${product.slug}`} className="absolute inset-0 block" aria-label={product.name}>
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-contain object-center p-2 sm:p-3"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">No image</div>
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 h-10 leading-5 hover:text-nav">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 h-10 flex items-center gap-1.5 w-full min-w-0">
          <span className="text-nav font-bold text-sm shrink-0">{format(product.price, product.currency)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[11px] sm:text-xs text-slate-400 line-through truncate">
              {format(product.compareAtPrice, product.currency)}
            </span>
          )}
          {discount !== null && (
            <span className="text-[11px] sm:text-xs font-semibold text-green-600 ml-auto shrink-0 whitespace-nowrap">
              {discount}% OFF
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 min-h-[2.5rem]">
          <AddToCartControl productSlug={product.slug} disabled={product.inventory <= 0} />
        </div>
      </div>
    </article>
  );
}
