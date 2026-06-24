"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@hr-ecom/shared";
import { useCart } from "@/lib/cart-context";

function formatPrice(product: Product) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency }).format(product.price);
}

function discountPercent(product: Product) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

export function HomeProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = discountPercent(product);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addItem(product.slug);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow relative flex flex-col">
      {discount && (
        <span className="absolute top-3 left-3 z-10 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
          {discount}% OFF
        </span>
      )}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square bg-slate-50">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image</div>
          )}
        </div>
        <div className="p-3 flex-1">
          <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 min-h-[2.5rem] hover:text-nav">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-nav font-bold">{formatPrice(product)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency }).format(
                  product.compareAtPrice
                )}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding || product.inventory <= 0}
          className="btn-cart w-full text-sm"
        >
          {added ? "Added ✓" : product.inventory <= 0 ? "Out of Stock" : adding ? "Adding..." : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
