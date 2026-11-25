"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@hr-ecom/shared";
import { AddToCartControl } from "@/components/AddToCartControl";
import { ProductImageRotator } from "@/components/ProductImageRotator";
import { WishlistButton } from "@/components/WishlistButton";
import { useCart } from "@/lib/cart-context";
import { useCurrency } from "@/lib/currency-context";
import { getDiscountPercent } from "@/lib/pricing";

export function SeasonalProductCard({
  product,
  imageAlt,
  variant = "grid",
}: {
  product: Product;
  imageAlt: string;
  variant?: "grid" | "banner";
}) {
  const { format } = useCurrency();
  const { addItem, sessionReady, quantityFor } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const discount = getDiscountPercent(product.price, product.compareAtPrice);
  const soldOut = (product.inventory ?? 0) <= 0;
  const productHref = `/products/${product.slug}`;

  const buyNow = async () => {
    if (soldOut || busy || !sessionReady) return;
    setError("");
    setBusy(true);
    try {
      if (quantityFor(product.slug) < 1) {
        await addItem(product.slug, 1);
      }
      window.location.assign("/checkout");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setBusy(false);
    }
  };

  const priceRow = (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="text-nav font-bold">{format(product.price, product.currency)}</span>
      {product.compareAtPrice && product.compareAtPrice > product.price && (
        <span className="text-sm text-slate-400 line-through">
          {format(product.compareAtPrice, product.currency)}
        </span>
      )}
      {discount !== null && !soldOut && (
        <span className="text-xs font-semibold text-green-600">{discount}% OFF</span>
      )}
    </div>
  );

  const actions = (
    <div className="mt-3 space-y-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <AddToCartControl productSlug={product.slug} disabled={soldOut} />
      <button
        type="button"
        onClick={() => void buyNow()}
        disabled={soldOut || busy || !sessionReady}
        className="w-full rounded-full bg-accent text-white font-semibold text-xs sm:text-sm px-3 py-2 sm:py-2.5 hover:opacity-90 disabled:opacity-50"
      >
        {soldOut ? "Sold out" : busy ? "Opening checkout..." : "Buy now"}
      </button>
    </div>
  );

  if (variant === "banner") {
    return (
      <article className="grid grid-cols-1 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] gap-4 rounded-2xl bg-white p-4 text-slate-900 shadow-xl">
        <Link href={productHref} className="relative block aspect-square overflow-hidden rounded-xl bg-slate-50">
          <ProductImageRotator
            images={product.images ?? []}
            alt={imageAlt}
            staggerKey={product.slug}
            priority
            className="absolute inset-0 h-full w-full"
          />
        </Link>
        <div className="min-w-0 flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">In stock · ships in the USA</p>
          <h3 className="mt-1 text-lg font-bold text-primary leading-snug">
            <Link href={productHref} className="hover:text-nav">
              {product.name}
            </Link>
          </h3>
          {priceRow}
          {actions}
        </div>
      </article>
    );
  }

  return (
    <article className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow relative flex h-full flex-col">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-slate-50">
        {discount !== null && !soldOut && (
          <span className="absolute top-2 left-2 z-10 bg-accent text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-sm">
            {discount}% OFF
          </span>
        )}
        <WishlistButton product={product} className="!top-2 !right-2 z-20" />
        <Link href={productHref} className="absolute inset-0 block">
          <ProductImageRotator
            images={product.images ?? []}
            alt={imageAlt}
            staggerKey={product.slug}
            className="absolute inset-0 h-full w-full"
          />
        </Link>
      </div>
      <div className="p-3 flex flex-1 flex-col">
        <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 min-h-[2.75rem]">
          <Link href={productHref} className="hover:text-nav">
            {product.name}
          </Link>
        </h3>
        {priceRow}
        <div className="mt-auto">{actions}</div>
      </div>
    </article>
  );
}
