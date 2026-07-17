"use client";

import { useEffect, useState } from "react";
import { resolveImageUrl } from "@/lib/images";

const ROTATE_MS = 4000;

/**
 * Auto-rotates through a product's gallery images on listing cards.
 * Pauses while hovered; only advances when the card is on-screen.
 */
export function ProductImageRotator({
  images,
  alt,
  className = "",
  /** Stable seed so neighboring cards don't all flip at the same time. */
  staggerKey = "",
  /** First image eager only for above-the-fold cards; listing grids should stay lazy. */
  priority = false,
}: {
  images: string[];
  alt: string;
  className?: string;
  staggerKey?: string;
  priority?: boolean;
}) {
  const urls = images.map(resolveImageUrl).filter(Boolean);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!root || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: "80px", threshold: 0.15 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [root]);

  useEffect(() => {
    if (urls.length <= 1 || paused || !visible) return;

    let hash = 0;
    for (let i = 0; i < staggerKey.length; i++) hash = (hash + staggerKey.charCodeAt(i) * (i + 1)) % 900;
    const delay = ROTATE_MS + hash;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % urls.length);
    }, delay);
    return () => window.clearInterval(id);
  }, [urls.length, paused, visible, staggerKey]);

  if (urls.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 text-slate-400 text-sm ${className}`}>
        No image
      </div>
    );
  }

  return (
    <div
      ref={setRoot}
      className={`relative overflow-hidden bg-slate-50 ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {urls.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${src}-${i}`}
          src={src}
          alt={i === 0 ? alt : ""}
          aria-hidden={i !== index}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          loading={priority && i === 0 ? "eager" : "lazy"}
          decoding="async"
          width={600}
          height={600}
        />
      ))}
      {urls.length > 1 && (
        <div className="absolute bottom-2 left-1/2 z-[1] flex -translate-x-1/2 gap-1" aria-hidden>
          {urls.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === index ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
