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
import { ProductImageRotator } from "@/components/ProductImageRotator";
import { useCurrency } from "@/lib/currency-context";

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

function TimerBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[4.25rem] sm:min-w-[5rem]">
      <div className="w-full rounded-2xl bg-gradient-to-b from-[#244f88] to-primary px-3 py-3 sm:py-3.5 shadow-[0_10px_28px_rgba(24,58,104,0.4)] ring-1 ring-white/20">
        <span className="block text-center font-mono text-3xl sm:text-4xl font-bold tabular-nums text-white leading-none tracking-wider">
          {value}
        </span>
      </div>
      <span className="mt-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary/80">
        {label}
      </span>
    </div>
  );
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

  const gallery =
    product.images?.length ? product.images : [...FLASH_COMBO_SALE.images];
  const shippingLabel = format(FLASH_COMBO_SALE.shippingUsd, "USD");

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
        <div className="grid lg:grid-cols-[minmax(280px,420px)_1fr] gap-6 lg:gap-10 items-center">
          {/* Same rotator pattern as product cards / listings */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
                <Link href={`/products/${product.slug}`} className="absolute inset-0 block">
                  <ProductImageRotator
                    images={gallery}
                    alt={product.name}
                    staggerKey={product.slug}
                    priority
                    className="absolute inset-0 h-full w-full"
                  />
                </Link>
                <span className="absolute top-3 left-3 z-10 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded">
                  {FLASH_COMBO_SALE.title}
                </span>
              </div>
              <Link href={`/products/${product.slug}`} className="block px-3 py-3">
                <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 hover:text-nav">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-nav font-bold">
                    {format(product.price, product.currency)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-xs text-slate-400 line-through">
                      {format(product.compareAtPrice, product.currency)}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Right column — offer copy + prominent timer */}
          <div className="flex flex-col justify-center min-w-0">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-accent mb-2">
              {FLASH_COMBO_SALE.title}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-primary leading-tight mb-3">
              {FLASH_COMBO_SALE.headline}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mb-4 max-w-xl">
              Blue Beads Pearl Single + Om Rakhi + Roli packet + Chawal packet + Wonderful
              Pistachios 21g. No coupon codes on this offer.
            </p>

            <ul className="text-sm text-slate-700 space-y-1.5 mb-5 columns-1 sm:columns-2 gap-x-8 max-w-xl">
              {FLASH_COMBO_SALE.includes.map((line) => (
                <li key={line} className="flex gap-2 break-inside-avoid mb-1.5">
                  <span className="text-accent font-bold">✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="mb-3">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Flash price</p>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-accent">
                  {format(product.price, product.currency)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-slate-400 line-through text-lg">
                    {format(product.compareAtPrice, product.currency)}
                  </span>
                )}
                <span className="text-sm font-semibold text-primary">
                  + {shippingLabel} shipping
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-white/90 px-4 py-4 sm:px-6 sm:py-5 shadow-md mb-5 w-full max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent mb-3 text-center sm:text-left">
                Offer ends in
              </p>
              <div className="flex items-end justify-center sm:justify-start gap-2.5 sm:gap-3">
                <TimerBlock value={remaining.h} label="Hrs" />
                <span className="pb-7 text-2xl font-bold text-accent/60">:</span>
                <TimerBlock value={remaining.m} label="Min" />
                <span className="pb-7 text-2xl font-bold text-accent/60">:</span>
                <TimerBlock value={remaining.s} label="Sec" />
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
