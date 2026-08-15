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
      className={`absolute top-1/2 z-10 hidden sm:flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-800 text-white shadow-md transition disabled:opacity-30 ${
        direction === "left" ? "left-0" : "right-0"
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
      className="border-b border-slate-100 bg-gradient-to-b from-[#fff7f0] to-white"
      aria-label="Shop Rakhi by category"
    >
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <ScrollArrow direction="left" onClick={() => scrollBy(-1)} disabled={!canLeft} />
        <ScrollArrow direction="right" onClick={() => scrollBy(1)} disabled={!canRight} />

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth px-1 pb-1 sm:gap-5 sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORY_SHOP_ICONS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex w-[5.75rem] shrink-0 flex-col items-center gap-2 sm:w-[6.75rem]"
            >
              <span className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#fde8d8] shadow-sm ring-1 ring-black/5 transition group-hover:shadow-md group-hover:ring-nav/30">
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 640px) 92px, 108px"
                  className="object-contain p-2 transition duration-300 group-hover:scale-105"
                />
              </span>
              <span className="text-center text-[11px] font-medium leading-tight text-slate-800 sm:text-xs">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
