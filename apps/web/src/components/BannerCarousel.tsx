"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Banner {
  src: string;
  alt: string;
  href?: string;
}

export function BannerCarousel({ banners }: { banners: readonly Banner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const banner = banners[index];
  if (!banner) return null;

  const img = (
    <div className="relative w-full aspect-[21/7] md:aspect-[21/6] bg-slate-100 overflow-hidden rounded-lg">
      <Image
        src={banner.src}
        alt={banner.alt}
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority
      />
    </div>
  );

  return (
    <div className="relative max-w-7xl mx-auto px-4 pt-4">
      {banner.href ? <Link href={banner.href}>{img}</Link> : img}
      {banners.length > 1 && (
        <>
          <div className="flex justify-center gap-2 mt-3">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition ${i === index ? "bg-nav" : "bg-slate-300"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
