"use client";

import { useCallback, useEffect, useState } from "react";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

export function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const imgs = images.filter(Boolean);
  const current = imgs[selected] ?? "";

  const goPrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setSelected((i) => (i <= 0 ? imgs.length - 1 : i - 1));
    },
    [imgs.length]
  );

  const goNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setSelected((i) => (i >= imgs.length - 1 ? 0 : i + 1));
    },
    [imgs.length]
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, goNext, goPrev]);

  if (!current) {
    return (
      <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
        No image
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div
          className="relative aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 cursor-zoom-in group"
          onClick={() => setLightbox(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setLightbox(true)}
          aria-label="Open image zoom"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current}
            alt={`${alt} — image ${selected + 1} of ${imgs.length}`}
            className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-[1.02]"
          />

          {imgs.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 shadow-md text-primary font-bold hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 shadow-md text-primary font-bold hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ›
              </button>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs bg-black/55 text-white px-2.5 py-1 rounded-full">
                {selected + 1} / {imgs.length}
              </span>
            </>
          )}

          <span className="absolute bottom-3 right-3 text-[11px] bg-white/90 text-slate-600 px-2 py-0.5 rounded shadow-sm">
            Click to zoom
          </span>
        </div>

        {imgs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {imgs.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                aria-label={`View image ${i + 1}`}
                aria-current={i === selected ? "true" : undefined}
                onClick={() => setSelected(i)}
                className={`shrink-0 w-[4.5rem] h-[4.5rem] rounded-lg overflow-hidden border-2 transition ${
                  i === selected ? "border-nav ring-2 ring-nav/20" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/92 flex flex-col items-center justify-center p-4"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Product image zoom"
        >
          <button
            type="button"
            aria-label="Close zoom"
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl leading-none z-10"
          >
            ×
          </button>

          {imgs.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={goPrev}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 text-white text-2xl hover:bg-white/25"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={goNext}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 text-white text-2xl hover:bg-white/25"
              >
                ›
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current}
            alt={alt}
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {imgs.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto max-w-full px-2">
              {imgs.map((src, i) => (
                <button
                  key={`lb-${src}-${i}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(i);
                  }}
                  className={`shrink-0 w-14 h-14 rounded overflow-hidden border-2 ${
                    i === selected ? "border-white" : "border-white/30 opacity-70"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
