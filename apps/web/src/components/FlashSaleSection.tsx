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

function TimerBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative min-w-[3.25rem] sm:min-w-[3.75rem] rounded-xl bg-gradient-to-b from-[#1f4b82] to-primary px-2.5 py-2 sm:px-3 sm:py-2.5 shadow-[0_8px_20px_rgba(24,58,104,0.35)] ring-1 ring-white/15">
        <span className="block font-mono text-2xl sm:text-3xl font-bold tabular-nums text-white leading-none tracking-wider animate-pulse">
          {value}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-primary/80">
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

  const images = (product.images ?? []).slice(0, 4).map((src) => resolveImageUrl(src));
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
            {images.slice(1).map((src, i) => (
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
              Blue Beads Pearl Single + Om Rakhi + Roli packet + Chawal packet + Wonderful
              Pistachios 21g — limited 24-hour combo. No coupon codes on this offer.
            </p>

            <ul className="text-sm text-slate-700 space-y-1.5 mb-5">
              {FLASH_COMBO_SALE.includes.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-end gap-5 mb-5">
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
                <p className="text-sm font-semibold text-primary mt-1">
                  + {shippingLabel} shipping
                </p>
              </div>

              <div className="rounded-2xl border border-rose-200/80 bg-white/80 backdrop-blur-sm px-4 py-3 sm:px-5 sm:py-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-2.5 text-center">
                  Offer ends in
                </p>
                <div className="flex items-end gap-2 sm:gap-2.5">
                  <TimerBlock value={remaining.h} label="Hrs" />
                  <span className="pb-6 text-xl font-bold text-accent/70">:</span>
                  <TimerBlock value={remaining.m} label="Min" />
                  <span className="pb-6 text-xl font-bold text-accent/70">:</span>
                  <TimerBlock value={remaining.s} label="Sec" />
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
