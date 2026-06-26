"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

export interface HomeBanner {
  src: string;
  alt: string;
  href?: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  cta: string;
  pill: string;
}

const TRUST_FEATURES = [
  { label: "Premium Rakhis" },
  { label: "Fast USA Delivery" },
  { label: "Secure Shopping" },
  { label: "Made with Love" },
] as const;

function BannerCurrencyTabs() {
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  useEffect(() => {
    const saved = localStorage.getItem("hr_ecom_currency");
    if (saved === "USD" || saved === "INR") setCurrency(saved);
  }, []);

  const select = (c: "USD" | "INR") => {
    setCurrency(c);
    localStorage.setItem("hr_ecom_currency", c);
  };

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex flex-col shadow-lg overflow-hidden rounded-l-md">
      <button
        type="button"
        onClick={() => select("USD")}
        className={`px-2.5 py-2 text-[10px] sm:text-xs font-bold tracking-wide transition ${
          currency === "USD" ? "bg-primary text-white" : "bg-slate-800/80 text-white/80 hover:bg-slate-800"
        }`}
      >
        USD
      </button>
      <button
        type="button"
        onClick={() => select("INR")}
        className={`px-2.5 py-2 text-[10px] sm:text-xs font-bold tracking-wide transition ${
          currency === "INR" ? "bg-accent text-white" : "bg-slate-800/80 text-white/80 hover:bg-slate-800"
        }`}
      >
        INR
      </button>
    </div>
  );
}

export function BannerCarousel({ banners }: { banners: readonly HomeBanner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      if (banners.length === 0) return;
      setIndex(((next % banners.length) + banners.length) % banners.length);
    },
    [banners.length]
  );

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const timer = setInterval(() => goTo(index + 1), 6000);
    return () => clearInterval(timer);
  }, [banners.length, paused, index, goTo]);

  const banner = banners[index];
  if (!banner) return null;

  return (
    <section
      className="w-full bg-white border-b border-slate-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured promotions"
    >
      {/* Top details */}
      <div className="max-w-7xl mx-auto px-4 pt-5 pb-4 text-center" key={`top-${banner.src}`}>
        <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-primary/70 uppercase mb-3">
          {banner.eyebrow}
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl leading-tight text-primary mb-3">
          {banner.title}{" "}
          <span className="text-nav italic">{banner.titleAccent}</span>
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mb-4">{banner.description}</p>
        {banner.href && (
          <Link
            href={banner.href}
            className="inline-flex items-center justify-center rounded-full bg-nav text-white font-semibold text-sm px-6 py-2.5 hover:bg-primary transition"
          >
            {banner.cta}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        )}
      </div>

      {/* Full-width banner image */}
      <div className="relative w-full aspect-[5/2] sm:aspect-[21/7] md:aspect-[21/6] max-h-[min(48vw,440px)] overflow-hidden bg-slate-100">
        {banners.map((b, i) => (
          <div
            key={b.src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            aria-hidden={i !== index}
          >
            {b.href ? (
              <Link href={b.href} className="block h-full w-full" tabIndex={i === index ? 0 : -1}>
                <Image
                  src={b.src}
                  alt={b.alt}
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                  priority={i === 0}
                />
              </Link>
            ) : (
              <Image
                src={b.src}
                alt={b.alt}
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority={i === 0}
              />
            )}
          </div>
        ))}

        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 p-2 text-white/90 hover:text-white transition drop-shadow-md"
              aria-label="Previous slide"
            >
              <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-12 sm:right-14 top-1/2 -translate-y-1/2 z-20 p-2 text-white/90 hover:text-white transition drop-shadow-md"
              aria-label="Next slide"
            >
              <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        <BannerCurrencyTabs />
      </div>

      {/* Bottom details */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5" key={`bottom-${banner.src}`}>
        <ul className="hidden sm:flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4">
          {TRUST_FEATURES.map((f) => (
            <li key={f.label} className="flex items-center gap-2 text-xs font-semibold text-primary/90">
              <span className="h-1.5 w-1.5 rounded-full bg-nav shrink-0" aria-hidden />
              {f.label}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-100/80 via-sky-50 to-blue-100/80 border border-blue-100 px-4 sm:px-6 py-3 text-center mb-4">
          <svg className="w-4 h-4 text-accent shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <p className="text-xs sm:text-sm text-primary font-medium leading-snug">
            {banner.pill.split("·").map((part, i, arr) => (
              <span key={i}>
                {i > 0 && " · "}
                {i === arr.length - 1 ? (
                  <span className="text-nav font-semibold">{part.trim()}</span>
                ) : (
                  part.trim()
                )}
              </span>
            ))}
          </p>
        </div>

        {banners.length > 1 && (
          <div className="flex justify-center items-center gap-2" role="tablist" aria-label="Banner slides">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === index ? "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-nav" : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
