"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DAILY_DEAL_SEGMENTS,
  WELCOME_COUPON_HOURS,
  pickDailyDealDiscount,
} from "@hr-ecom/shared";
import { site } from "@/lib/site";
import { getOrCreateSessionId } from "@/lib/session";
import { api } from "@/lib/api";
import { saveWelcomeCoupon, formatCouponExpiry } from "@/lib/welcome-coupon";
import { trackSessionHeartbeat } from "@/lib/track";

const STORAGE_KEY = "usarakhi_daily_deal_shown";
const SHOW_AFTER_MS = 10_000;
const SPIN_MS = 4200;

const SEGMENTS = [...DAILY_DEAL_SEGMENTS];
const SEGMENT_COLORS = [
  "#183a68",
  "#c4a35a",
  "#4876e8",
  "#e11d48",
  "#0f766e",
  "#c4a35a",
  "#183a68",
  "#e11d48",
];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function segmentIndexForPercent(percent: number): number {
  const matches = SEGMENTS.map((p, i) => (p === percent ? i : -1)).filter((i) => i >= 0);
  if (matches.length === 0) return 0;
  return matches[Math.floor(Math.random() * matches.length)]!;
}

function rotationForSegment(index: number, extraSpins = 6): number {
  const slice = 360 / SEGMENTS.length;
  const centerOfSlice = index * slice + slice / 2;
  return extraSpins * 360 + (360 - centerOfSlice);
}

type CouponResult = {
  code: string;
  expiresAt: string;
  discountPercent: number;
  reused?: boolean;
  alreadyClaimedToday?: boolean;
};

export function ExitIntentPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "spinning" | "done" | "blocked">("idle");
  const [error, setError] = useState("");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [animateSpin, setAnimateSpin] = useState(false);

  const wheelGradient = useMemo(() => {
    const slice = 100 / SEGMENTS.length;
    const stops = SEGMENTS.map((_, i) => {
      const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      return `${color} ${i * slice}% ${(i + 1) * slice}%`;
    });
    return `conic-gradient(from -${180 / SEGMENTS.length}deg, ${stops.join(", ")})`;
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const TIMER_START_KEY = "usarakhi_daily_deal_timer_start";
    let startedAt = Number(sessionStorage.getItem(TIMER_START_KEY) || 0);
    if (!startedAt) {
      startedAt = Date.now();
      sessionStorage.setItem(TIMER_START_KEY, String(startedAt));
    }

    const remaining = Math.max(0, SHOW_AFTER_MS - (Date.now() - startedAt));
    const timer = window.setTimeout(() => {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      const path = window.location.pathname;
      if (path.startsWith("/admin") || path.startsWith("/checkout")) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
      trackSessionHeartbeat("daily_deal_shown", SHOW_AFTER_MS, path);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  const copyCode = async () => {
    if (!coupon) return;
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const close = () => setOpen(false);

  const spin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (phase !== "idle") return;
    if (!isValidEmail(trimmedEmail)) {
      setError("Enter a valid email to spin for today’s discount.");
      return;
    }

    setError("");
    setPhase("spinning");

    // Pick result + start wheel immediately (no waiting on network)
    const wonPercent = pickDailyDealDiscount();
    const idx = segmentIndexForPercent(wonPercent);
    setAnimateSpin(true);
    setRotation((prev) => prev + rotationForSegment(idx, 7));

    const sessionId = getOrCreateSessionId();

    void (async () => {
      try {
        const res = await api<{
          ok: boolean;
          coupon?: CouponResult;
        }>("/leads", {
          method: "POST",
          sessionId,
          body: JSON.stringify({
            sessionId,
            email: trimmedEmail,
            page: pathname,
            source: "newsletter",
            metadata: {
              offer: "discount_of_the_day",
              trigger: "daily_deal_wheel",
              discountPercent: String(wonPercent),
            },
          }),
        });

        if (!res.coupon) {
          setAnimateSpin(false);
          setPhase("idle");
          setError("Could not save your discount. Please try again.");
          return;
        }

        const result = res.coupon;
        const expired = new Date(result.expiresAt).getTime() < Date.now();

        if (result.alreadyClaimedToday && expired) {
          setAnimateSpin(false);
          setCoupon(result);
          setPhase("blocked");
          return;
        }

        // If server returned a different % (reuse), nudge wheel to that segment
        if (result.discountPercent !== wonPercent) {
          const reuseIdx = segmentIndexForPercent(result.discountPercent);
          setRotation((prev) => prev + rotationForSegment(reuseIdx, 2));
        }

        setCoupon(result);
        saveWelcomeCoupon({ ...result, email: trimmedEmail });
        window.setTimeout(() => {
          setAnimateSpin(false);
          setPhase("done");
        }, SPIN_MS);
      } catch (err) {
        setAnimateSpin(false);
        setPhase("idle");
        setError(
          err instanceof Error
            ? err.message
            : "Could not spin right now. Try again or email order@usarakhi.com."
        );
      }
    })();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-[2px]"
      role="dialog"
      aria-label="Discount of the Day"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* Rakhi hero strip */}
        <div className="relative h-28 sm:h-32 overflow-hidden">
          <Image
            src="/banners/banner-2-connecting-hearts.png"
            alt="Premium Rakhi for USA delivery"
            fill
            className="object-cover object-center"
            sizes="512px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/75 to-primary/40" />
          <button
            type="button"
            onClick={close}
            className="absolute top-3 right-3 z-10 rounded-full p-1.5 text-white/90 hover:bg-white/15"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute inset-x-0 bottom-0 px-5 pb-4 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200">Rakhi offer · Today only</p>
            <h2 className="text-2xl font-bold leading-tight mt-0.5">Discount of the Day</h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1">
              Spin for 5–20% off your Rakhi · 1 spin / email / day · valid {WELCOME_COUPON_HOURS}h
            </p>
          </div>
        </div>

        <div className="px-5 py-5">
          {phase === "blocked" ? (
            <div className="text-center py-2">
              <p className="text-lg font-bold text-primary mb-2">You already spun today</p>
              <p className="text-sm text-slate-600 mb-4">
                Each email gets one Discount of the Day spin per day. Come back tomorrow for another chance.
              </p>
              <button
                type="button"
                onClick={close}
                className="rounded-lg bg-primary text-white font-semibold text-sm px-5 py-2.5"
              >
                Continue shopping
              </button>
            </div>
          ) : phase === "done" && coupon ? (
            <div className="text-center py-2">
              <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-amber-400 shadow">
                <Image
                  src="/banners/banner-2-connecting-hearts.png"
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-sm uppercase tracking-wide text-nav font-semibold mb-1">You won</p>
              <p className="text-4xl font-bold text-primary mb-2">{coupon.discountPercent}% off</p>
              <p className="text-sm text-slate-600 mb-3">
                {coupon.reused
                  ? "Here’s your active Discount of the Day code:"
                  : `Your Rakhi discount is valid for ${WELCOME_COUPON_HOURS} hour — use it at checkout:`}
              </p>
              <div className="rounded-xl border-2 border-dashed border-nav bg-gradient-to-b from-slate-50 to-amber-50/40 px-4 py-3 mb-3">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xl font-bold tracking-widest text-primary">{coupon.code}</p>
                  <button
                    type="button"
                    onClick={() => void copyCode()}
                    className="shrink-0 rounded-md border border-nav bg-white px-2.5 py-1.5 text-xs font-semibold text-nav hover:bg-blue-50"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Expires {formatCouponExpiry(coupon.expiresAt)}</p>
              </div>
              <p className="text-xs text-slate-500 mb-4">Also sent to your email.</p>
              <Link
                href="/products"
                onClick={close}
                className="inline-block rounded-lg bg-accent text-white font-semibold text-sm px-5 py-2.5 hover:opacity-90 shadow-sm"
              >
                Shop Rakhi with my discount
              </Link>
            </div>
          ) : (
            <>
              <div className="relative mx-auto mb-5 w-[260px] h-[260px] sm:w-[300px] sm:h-[300px]">
                {/* Outer decorative ring */}
                <div
                  className="absolute -inset-1 rounded-full opacity-90"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #c4a35a, #183a68, #c4a35a, #e11d48, #c4a35a, #4876e8, #c4a35a)",
                  }}
                  aria-hidden
                />
                <div className="absolute inset-0 rounded-full bg-white" aria-hidden />

                {/* Pointer */}
                <div className="absolute left-1/2 -top-0.5 z-30 -translate-x-1/2 drop-shadow-md" aria-hidden>
                  <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-accent" />
                </div>

                {/* Wheel */}
                <div
                  className="absolute inset-[6px] rounded-full shadow-[inset_0_0_24px_rgba(0,0,0,0.25)] border-[3px] border-amber-200/80"
                  style={{
                    background: wheelGradient,
                    transform: `rotate(${rotation}deg)`,
                    transition: animateSpin
                      ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.75, 0.18, 1)`
                      : undefined,
                    boxShadow: "0 8px 28px rgba(24,58,104,0.28)",
                  }}
                >
                  {SEGMENTS.map((pct, i) => {
                    const slice = 360 / SEGMENTS.length;
                    const angle = i * slice + slice / 2;
                    const radius = 78;
                    return (
                      <span
                        key={`${pct}-${i}`}
                        className="absolute left-1/2 top-1/2 text-[12px] sm:text-sm font-extrabold text-white"
                        style={{
                          transform: `rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle}deg)`,
                          transformOrigin: "center",
                          textShadow: "0 1px 2px rgba(0,0,0,0.45)",
                        }}
                      >
                        {pct}%
                      </span>
                    );
                  })}
                </div>

                {/* Center logo hub */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="flex h-[72px] w-[72px] sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white border-[3px] border-primary shadow-lg ring-2 ring-amber-300/70 overflow-hidden p-1.5">
                    <Image
                      src={site.logoSrc}
                      alt={site.name}
                      width={64}
                      height={28}
                      className="h-auto w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              <form onSubmit={spin} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  disabled={phase === "spinning"}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nav disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={phase === "spinning"}
                  className="w-full rounded-lg bg-accent text-white font-bold text-sm py-3.5 hover:opacity-90 disabled:opacity-70 shadow-md shadow-accent/25"
                >
                  {phase === "spinning" ? "Spinning…" : "Spin the wheel"}
                </button>
                {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              </form>

              <button
                type="button"
                onClick={close}
                className="mt-3 w-full text-center text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2"
              >
                No thanks — continue without a discount
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
