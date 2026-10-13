"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@hr-ecom/shared";
import { resolveImageUrl } from "@/lib/images";

const WISHLIST_KEY = "hr_ecom_wishlist";

export type WishlistItem = {
  slug: string;
  name: string;
  image?: string;
  price: number;
  currency: string;
  compareAtPrice?: number;
};

interface WishlistContextValue {
  items: WishlistItem[];
  /** False until the saved list has been read from this browser. */
  ready: boolean;
  toggle: (product: Product) => void;
  remove: (slug: string) => void;
  /**
   * Drop saved items that are not in the current visible catalog, and refresh
   * name, image, and price for items that are. Does not add products the
   * shopper did not save.
   */
  retainVisible: (products: readonly Product[]) => void;
  isWishlisted: (slug: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function toWishlistItem(product: Product): WishlistItem {
  return {
    slug: product.slug,
    name: product.name,
    image: resolveImageUrl(product.images?.[0]),
    price: product.price,
    currency: product.currency,
    compareAtPrice: product.compareAtPrice,
  };
}

function sameWishlistItem(a: WishlistItem, b: WishlistItem): boolean {
  return (
    a.slug === b.slug &&
    a.name === b.name &&
    a.image === b.image &&
    a.price === b.price &&
    a.currency === b.currency &&
    a.compareAtPrice === b.compareAtPrice
  );
}

function readWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readWishlist());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }, [items, ready]);

  const isWishlisted = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);

  const toggle = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.slug === product.slug);
      if (exists) return prev.filter((i) => i.slug !== product.slug);
      return [...prev, toWishlistItem(product)];
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const retainVisible = useCallback((products: readonly Product[]) => {
    if (products.length === 0) return;
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    setItems((prev) => {
      let changed = false;
      const next: WishlistItem[] = [];
      for (const item of prev) {
        const product = bySlug.get(item.slug);
        if (!product) {
          changed = true;
          continue;
        }
        const fresh = toWishlistItem(product);
        if (!sameWishlistItem(item, fresh)) changed = true;
        next.push(fresh);
      }
      return changed ? next : prev;
    });
  }, []);

  return (
    <WishlistContext.Provider
      value={{ items, ready, toggle, remove, retainVisible, isWishlisted, count: items.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
