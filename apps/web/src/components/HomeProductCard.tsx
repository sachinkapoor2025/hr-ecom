"use client";

import Link from "next/link";
import type { Product } from "@hr-ecom/shared";
import { AddToCartControl } from "@/components/AddToCartControl";
import { WishlistButton } from "@/components/WishlistButton";
import { useCurrency } from "@/lib/currency-context";

function discountPercent(product: Product) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

export function HomeProductCard({ product }: { product: Product }) {
  const { format } = useCurrency();
  const discount = discountPercent(product);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow relative flex flex-col">
      {discount && (
        <span className="absolute top-3 left-3 z-10 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
          {discount}% OFF
        </span>
      )}
      <div className="relative aspect-square bg-slate-50">
        <WishlistButton product={product} />
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image</div>
          )}
        </Link>
      </div>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="p-3 flex-1">
          <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 min-h-[2.5rem] hover:text-nav">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-nav font-bold">{format(product.price, product.currency)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {format(product.compareAtPrice, product.currency)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <AddToCartControl productSlug={product.slug} disabled={product.inventory <= 0} />
      </div>
    </div>
  );
}
