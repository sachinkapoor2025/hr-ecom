"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORY_SHOP_ICONS } from "@/lib/category-shop-icons";

function ScrollArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Scroll categories left" : "Scroll categories right"}
      className={`absolute top-[38%] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-800 text-white shadow-md transition disabled:opacity-30 sm:flex ${
        direction === "left" ? "left-1" : "right-1"
      }`}
    >
      <span aria-hidden>{direction === "left" ? "‹" : "›"}</span>
    </button>
  );
}

/** Horizontal shop-by-category icon strip — each tile opens related products. */
export function CategoryShopIcons() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 4);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(320, el.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <section
      className="w-full overflow-x-clip border-b border-slate-100 bg-gradient-to-b from-[#fff7f0] to-white"
      aria-label="Shop Rakhi by category"
    >
      <div className="relative mx-auto min-w-0 max-w-7xl px-3 py-5 sm:px-4 sm:py-8">
        <ScrollArrow direction="left" onClick={() => scrollBy(-1)} disabled={!canLeft} />
        <ScrollArrow direction="right" onClick={() => scrollBy(1)} disabled={!canRight} />

        <div
          ref={scrollerRef}
          className="flex min-w-0 w-full gap-3 overflow-x-auto overscroll-x-contain touch-pan-x scroll-smooth snap-x snap-mandatory pb-1 sm:gap-5 sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORY_SHOP_ICONS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex w-[28%] max-w-[6.5rem] shrink-0 snap-start flex-col items-center gap-1.5 sm:w-[6.75rem] sm:max-w-none sm:gap-2"
            >
              <span className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#fde8d8] shadow-sm ring-1 ring-black/5 transition group-hover:shadow-md group-hover:ring-nav/30">
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 640px) 28vw, 108px"
                  className="object-contain p-1.5 transition duration-300 group-hover:scale-105 sm:p-2"
                />
              </span>
              <span className="line-clamp-2 w-full px-0.5 text-center text-[10px] font-medium leading-snug text-slate-800 sm:text-xs">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
