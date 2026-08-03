"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@hr-ecom/shared";
import {
  FLASH_COMBO_SALE,
  flashComboSaleEndsAt,
  isFlashComboSaleActive,
} from "@hr-ecom/shared";
import { AddToCartControl } from "@/components/AddToCartControl";
import { useCurrency } from "@/lib/currency-context";
import { resolveImageUrl } from "@/lib/images";

type Remaining = { h: string; m: string; s: string };

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

function remainingUntil(endsAt: Date, now: Date): Remaining | null {
  const ms = endsAt.getTime() - now.getTime();
  if (ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h: pad(h), m: pad(m), s: pad(s) };
}

export function FlashSaleSection({ product }: { product: Product | null }) {
  const { format } = useCurrency();
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setActive(isFlashComboSaleActive(now));
      setRemaining(remainingUntil(flashComboSaleEndsAt(), now));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!product || !active || !remaining) return null;

  const images = (product.images ?? []).slice(0, 3).map((src) => resolveImageUrl(src));

  return (
    <section className="relative overflow-hidden border-y border-rose-200/80 bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #e11d48 0, transparent 40%), radial-gradient(circle at 80% 0%, #d97706 0, transparent 35%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-stretch">
          <div className="lg:w-[44%] grid grid-cols-2 gap-2 sm:gap-3">
            {images[0] && (
              <Link
                href={`/products/${product.slug}`}
                className="relative col-span-2 aspect-[4/3] overflow-hidden rounded-xl bg-white border border-rose-100 shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[0]}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </Link>
            )}
            {images.slice(1, 3).map((src, i) => (
              <Link
                key={`${src}-${i}`}
                href={`/products/${product.slug}`}
                className="relative aspect-square overflow-hidden rounded-xl bg-white border border-rose-100 shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </Link>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-accent mb-2">
              {FLASH_COMBO_SALE.title}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-primary leading-tight mb-2">
              {FLASH_COMBO_SALE.headline}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mb-4 max-w-xl">
              Blue Beads Pearl Single + Om Rakhi with Roli Chawal + Wonderful Pistachios 21g pack —
              one limited combo. No coupon codes on this offer.
            </p>

            <ul className="text-sm text-slate-700 space-y-1.5 mb-5">
              {FLASH_COMBO_SALE.includes.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-end gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Flash price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-accent">
                    {format(product.price, product.currency)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-slate-400 line-through text-lg">
                      {format(product.compareAtPrice, product.currency)}
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-primary text-white px-4 py-3 shadow-md">
                <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">
                  Offer ends in
                </p>
                <div className="flex gap-2 font-mono text-xl font-bold tabular-nums">
                  <span>{remaining.h}</span>
                  <span className="opacity-60">:</span>
                  <span>{remaining.m}</span>
                  <span className="opacity-60">:</span>
                  <span>{remaining.s}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[200px]">
                <AddToCartControl
                  productSlug={product.slug}
                  disabled={product.inventory <= 0}
                  variant="detail"
                />
              </div>
              <Link
                href={`/products/${product.slug}`}
                className="text-sm font-semibold text-nav hover:underline"
              >
                View combo details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
