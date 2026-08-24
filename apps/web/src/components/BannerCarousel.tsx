"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
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
  /** Short line shown on the banner image (e.g. delivery guarantee). */
  imageCaption?: string;
  /**
   * How the slide image fills the hero frame.
   * Default `cover` matches existing banners; use `contain` for taller art
   * that must stay fully visible (no top/bottom crop).
   */
  imageFit?: "cover" | "contain";
}

const TRUST_FEATURES = [
  {
    label: "Premium Rakhis",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 12v8H4v-8M12 3v9m0 0L8.5 8.5M12 12l3.5-3.5M6 21h12a2 2 0 002-2v-6H4v6a2 2 0 002 2z"
      />
    ),
  },
  {
    label: "Fast USA Delivery",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0m-4 0V9m0 0H5.5M12 9h6.5M12 9L9 5m3 4l3-4"
      />
    ),
  },
  {
    label: "Secure Shopping",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
  {
    label: "Made with Love",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    ),
  },
] as const;

function Eyebrow({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
      <span className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-nav/60" aria-hidden />
      <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-primary/80 uppercase text-center lg:text-left">
        {text}
      </p>
      <span className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-nav/60" aria-hidden />
    </div>
  );
}

function bannerImageClass(banner: HomeBanner): string {
  return banner.imageFit === "contain"
    ? "object-contain object-center"
    : "object-cover object-center";
}

function deliveryParts(text: string): string[] {
  return text.split("·").map((p) => p.trim()).filter(Boolean);
}

function DeliveryCaption({ text }: { text?: string }) {
  if (!text) return null;
  const parts = deliveryParts(text);
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pb-2.5 pt-8 sm:px-4 sm:pb-3">
      <ul className="mx-auto max-w-2xl space-y-0.5 text-left sm:text-center">
        {parts.map((part) => (
          <li
            key={part}
            className="text-[12px] font-extrabold leading-snug text-white drop-shadow-md sm:text-sm md:text-[15px]"
          >
            <span className="mr-1.5 text-white/90" aria-hidden>
              •
            </span>
            {part}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeliveryHighlight({
  text,
  className = "",
  align = "left",
}: {
  text: string;
  className?: string;
  align?: "left" | "center";
}) {
  const parts = deliveryParts(text);
  return (
    <div
      className={`rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 via-sky-50/80 to-blue-50 px-3.5 py-3 shadow-sm sm:px-4 sm:py-3.5 ${className}`}
      role="note"
    >
      <ul
        className={`space-y-1.5 text-[13px] font-extrabold leading-snug text-primary sm:text-base md:text-[1.05rem] ${
          align === "center" ? "mx-auto max-w-2xl text-left sm:text-center" : "text-left"
        }`}
      >
        {parts.map((part, i) => (
          <li key={part} className="flex gap-2 sm:justify-start">
            <span className="mt-0.5 shrink-0 text-nav" aria-hidden>
              •
            </span>
            <span className={i === 0 ? "text-accent" : "text-primary"}>{part}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SlideImage({
  banner,
  priority,
}: {
  banner: HomeBanner;
  priority?: boolean;
}) {
  const img = (
    <Image
      src={banner.src}
      alt={banner.alt}
      fill
      className={bannerImageClass(banner)}
      sizes="(max-width: 1023px) 100vw, 768px"
      priority={priority}
      fetchPriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
    />
  );
  if (banner.href) {
    return (
      <Link href={banner.href} className="block h-full w-full" tabIndex={priority ? 0 : -1}>
        {img}
      </Link>
    );
  }
  return img;
}

export function BannerCarousel({
  banners,
  lcpImage,
}: {
  banners: readonly HomeBanner[];
  /** Server-rendered first-slide image — always in initial HTML for LCP. */
  lcpImage?: ReactNode;
}) {
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
      className="w-full max-w-full overflow-x-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured promotions"
    >
      <div className="relative overflow-hidden bg-white border-b border-slate-100">
        <div className="relative w-full max-w-7xl mx-auto min-w-0 lg:grid lg:grid-cols-[2fr_3fr] lg:gap-6 lg:items-center lg:px-4 lg:py-4">
          <div className="order-1 lg:order-2 relative w-full min-w-0 max-w-full">
            <div className="relative w-full max-w-full aspect-[5/2] sm:aspect-[1024/420] overflow-hidden bg-slate-900/5">
              {/* Server LCP image for slide 0 */}
              {lcpImage ? (
                <div
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === 0 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                  aria-hidden={index !== 0}
                >
                  {lcpImage}
                </div>
              ) : null}

              {banners.map((b, i) => {
                // When server LCP slot exists, never remount slide 0 as a client Image.
                if (lcpImage && i === 0) return null;
                // Only mount the active slide (+ slide 0 fallback when no lcpImage).
                if (i !== index && !(i === 0 && !lcpImage)) return null;

                return (
                  <div
                    key={b.src}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      i === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                    aria-hidden={i !== index}
                  >
                    <SlideImage banner={b} priority={!lcpImage && i === 0} />
                  </div>
                );
              })}

              {banners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => goTo(index - 1)}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-primary shadow-md border border-blue-100 hover:bg-nav hover:text-white transition"
                    aria-label="Previous slide"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(index + 1)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-primary shadow-md border border-blue-100 hover:bg-nav hover:text-white transition"
                    aria-label="Next slide"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              <DeliveryCaption text={banner.imageCaption} />
            </div>
          </div>

          <div className="order-2 lg:order-1 text-center lg:text-left z-10 min-w-0 px-4 py-6 sm:py-8 lg:py-0 lg:pl-2 lg:pr-4">
            <div key={banner.src}>
              <Eyebrow text={banner.eyebrow} />

              <p className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] leading-tight text-primary mb-4 break-words">
                {banner.title}{" "}
                <span className="text-nav italic">{banner.titleAccent}</span>
              </p>

              <DeliveryHighlight text={banner.description} className="mb-6 max-w-xl mx-auto lg:mx-0" />

              {banner.href && (
                <Link
                  href={banner.href}
                  className="inline-flex items-center justify-center rounded-full bg-nav text-white font-semibold text-sm px-7 py-3 hover:bg-primary transition shadow-md shadow-nav/25"
                >
                  {banner.cta}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              )}

              <ul className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 max-w-lg mx-auto lg:mx-0">
                {TRUST_FEATURES.map((f) => (
                  <li key={f.label} className="flex flex-col items-center lg:items-start gap-2">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-blue-100 text-nav shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        {f.icon}
                      </svg>
                    </span>
                    <span className="text-[11px] font-semibold text-primary/90 leading-tight text-center lg:text-left">
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <ul className="sm:hidden grid grid-cols-4 gap-2 px-4 pb-4">
          {TRUST_FEATURES.map((f) => (
            <li key={f.label} className="flex flex-col items-center gap-1.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-blue-100 text-nav">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  {f.icon}
                </svg>
              </span>
              <span className="text-[9px] font-semibold text-primary/80 text-center leading-tight">{f.label}</span>
            </li>
          ))}
        </ul>

        <div className="px-4 sm:px-6 pb-4 sm:pb-5 max-w-7xl mx-auto">
          <DeliveryHighlight
            text={banner.pill}
            align="center"
            className="rounded-2xl border-amber-500 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100"
          />
        </div>
      </div>

      {banners.length > 1 && (
        <div className="flex justify-center items-center gap-2 py-3 bg-white" role="tablist" aria-label="Banner slides">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-nav" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
