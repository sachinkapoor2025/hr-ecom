"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StayUpdatedPrompt } from "@/components/StayUpdatedPrompt";
import { PRICES_DROPPED_STRIP } from "@/lib/prices-dropped-copy";

/** US celebration dates used across the store. */
const DIWALI_DATE = "2026-11-08";
const BHAI_DOOJ_DATE = "2026-11-10";

function pacificCalendarDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function daysUntil(targetYmd: string, todayYmd: string): number {
  const [ty, tm, td] = targetYmd.split("-").map(Number);
  const [y, m, d] = todayYmd.split("-").map(Number);
  const target = Date.UTC(ty!, tm! - 1, td!);
  const today = Date.UTC(y!, m! - 1, d!);
  return Math.round((target - today) / 86_400_000);
}

function daysLeftLabel(name: string, days: number): string | null {
  if (days > 1) return `${days} days left for ${name}`;
  if (days === 1) return `1 day left for ${name}`;
  if (days === 0) return `${name} is today`;
  return null;
}

function festivalCountdown(now = new Date()): string | null {
  const today = pacificCalendarDate(now);
  const parts = [
    daysLeftLabel("Diwali", daysUntil(DIWALI_DATE, today)),
    daysLeftLabel("Bhai Dooj", daysUntil(BHAI_DOOJ_DATE, today)),
  ].filter((part): part is string => part != null);
  return parts.length ? parts.join(" · ") : null;
}

type Variant = "banner" | "inline";

export function PricesDroppedStrip({ variant = "banner" }: { variant?: Variant }) {
  const pathname = usePathname();

  if (variant === "banner" && pathname.startsWith("/admin")) return null;

  const countdown = festivalCountdown();

  if (variant === "inline") {
    return (
      <p className="text-sm text-slate-700">
        Diwali and Bhai Dooj gifts, shipped across the USA.
      </p>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary to-nav text-white px-3 sm:px-4 py-2.5 text-sm">
      <div className="relative max-w-7xl mx-auto flex flex-col items-center justify-center gap-0.5 min-h-[1.75rem] px-2 sm:px-28">
        <p className="text-center text-[12px] sm:text-sm leading-snug">
          <span className="font-bold">{PRICES_DROPPED_STRIP}</span>
          {countdown ? (
            <>
              {" · "}
              <span>{countdown}</span>
            </>
          ) : null}
        </p>
        <Link
          href="/products"
          className="whitespace-nowrap text-[12px] sm:text-sm underline underline-offset-2 hover:text-white/90"
        >
          Place your order now
        </Link>
        <div className="absolute inset-y-0 right-0 hidden items-center sm:flex">
          <StayUpdatedPrompt />
        </div>
      </div>
    </div>
  );
}
