"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StayUpdatedPrompt } from "@/components/StayUpdatedPrompt";
import { PRICES_DROPPED_STRIP } from "@/lib/prices-dropped-copy";

type Variant = "banner" | "inline";

export function PricesDroppedStrip({ variant = "banner" }: { variant?: Variant }) {
  const pathname = usePathname();

  if (variant === "banner" && pathname.startsWith("/admin")) return null;

  if (variant === "inline") {
    return (
      <p className="text-sm text-slate-700">
        <span className="font-semibold text-accent">Prices dropped.</span> You can still send
        Rakhi — a design of love for your brother, any day.
      </p>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary to-nav text-white px-3 sm:px-4 py-2.5 text-sm">
      <div className="relative max-w-7xl mx-auto flex items-center justify-center gap-3 min-h-[1.75rem]">
        <p className="min-w-0 text-center text-[12px] sm:text-sm leading-snug px-2 sm:px-24">
          <span className="font-bold">{PRICES_DROPPED_STRIP}</span>
          {" · "}
          <Link href="/products" className="underline underline-offset-2 hover:text-white/90">
            Shop now
          </Link>
        </p>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:block">
          <StayUpdatedPrompt />
        </div>
      </div>
    </div>
  );
}
