"use client";

import Link from "next/link";
import type { Product } from "@hr-ecom/shared";
import { WishlistButton } from "@/components/WishlistButton";

function formatPrice(product: Product) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
  }).format(product.price);
}

function discountPercent(product: Product) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product);

  return (
    <div className="group border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white relative">
      {discount && (
        <span className="absolute top-3 left-3 z-10 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
          {discount}% OFF
        </span>
      )}
      <div className="relative aspect-square bg-slate-50 flex items-center justify-center text-slate-400">
        <WishlistButton product={product} />
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span>No image</span>
          )}
        </Link>
      </div>
      <Link href={`/products/${product.slug}`} className="block p-4">
        <h3 className="font-semibold text-slate-900 group-hover:text-primary line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-accent font-bold">{formatPrice(product)}</p>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <p className="text-sm text-slate-400 line-through">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency }).format(
                product.compareAtPrice
              )}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
