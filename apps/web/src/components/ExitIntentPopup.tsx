"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DAILY_DEAL_SEGMENTS, WELCOME_COUPON_HOURS } from "@hr-ecom/shared";
import { getOrCreateSessionId } from "@/lib/session";
import { api } from "@/lib/api";
import { saveWelcomeCoupon, formatCouponExpiry } from "@/lib/welcome-coupon";

const STORAGE_KEY = "usarakhi_daily_deal_shown";

const SEGMENTS = [...DAILY_DEAL_SEGMENTS];
const SEGMENT_COLORS = ["#183a68", "#4876e8", "#0f766e", "#e11d48", "#183a68", "#4876e8", "#d97706", "#e11d48"];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function segmentIndexForPercent(percent: number): number {
  const matches = SEGMENTS.map((p, i) => (p === percent ? i : -1)).filter((i) => i >= 0);
  if (matches.length === 0) return 0;
  return matches[Math.floor(Math.random() * matches.length)]!;
}

/** Degrees to rotate so the chosen segment lands under the top pointer. */
function rotationForSegment(index: number, extraSpins = 5): number {
  const slice = 360 / SEGMENTS.length;
  const centerOfSlice = index * slice + slice / 2;
  // Pointer is at top (0°). Wheel rotates clockwise in CSS; land segment center at top.
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

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY > 10) return;
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
    };

    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
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

  const spin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (phase !== "idle") return;
    if (!isValidEmail(trimmedEmail)) {
      setError("Enter a valid email to spin for today’s discount.");
      return;
    }

    setError("");
    setPhase("spinning");
    const sessionId = getOrCreateSessionId();

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
          metadata: { offer: "discount_of_the_day", trigger: "exit_intent_wheel" },
        }),
      });

      if (!res.coupon) {
        setPhase("idle");
        setError("Could not start the spin. Please try again.");
        return;
      }

      const result = res.coupon;
      const expired = new Date(result.expiresAt).getTime() < Date.now();

      if (result.alreadyClaimedToday && expired) {
        setCoupon(result);
        setPhase("blocked");
        return;
      }

      if (result.alreadyClaimedToday && result.reused) {
        // Already have today's code — short spin to that segment, then reveal
        const idx = segmentIndexForPercent(result.discountPercent);
        setRotation(rotationForSegment(idx, 3));
        setCoupon(result);
        saveWelcomeCoupon({ ...result, email: trimmedEmail });
        window.setTimeout(() => setPhase("done"), 2800);
        return;
      }

      const idx = segmentIndexForPercent(result.discountPercent);
      setRotation(rotationForSegment(idx, 6));
      setCoupon(result);
      saveWelcomeCoupon({ ...result, email: trimmedEmail });
      window.setTimeout(() => setPhase("done"), 4200);
    } catch (err) {
      setPhase("idle");
      setError(
        err instanceof Error
          ? err.message
          : "Could not spin right now. Try again or email order@usarakhi.com."
      );
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60"
      role="dialog"
      aria-label="Discount of the Day"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-primary to-nav px-5 pt-5 pb-4 text-white">
          <button
            type="button"
            onClick={close}
            className="absolute top-3 right-3 rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Today only</p>
          <h2 className="text-2xl font-bold mt-1">Discount of the Day</h2>
          <p className="text-sm text-white/85 mt-1 max-w-sm">
            Spin for 5–20% off. One spin per email each day · code valid for {WELCOME_COUPON_HOURS} hour.
          </p>
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
              <p className="text-sm uppercase tracking-wide text-nav font-semibold mb-1">You won</p>
              <p className="text-3xl font-bold text-primary mb-2">{coupon.discountPercent}% off</p>
              <p className="text-sm text-slate-600 mb-3">
                {coupon.reused
                  ? "Here’s your active Discount of the Day code:"
                  : `Your code is valid for ${WELCOME_COUPON_HOURS} hour — use it at checkout:`}
              </p>
              <div className="rounded-xl border-2 border-dashed border-nav bg-slate-50 px-4 py-3 mb-3">
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
                className="inline-block rounded-lg bg-accent text-white font-semibold text-sm px-5 py-2.5 hover:opacity-90"
              >
                Shop with my discount
              </Link>
            </div>
          ) : (
            <>
              <div className="relative mx-auto mb-5 w-[240px] h-[240px] sm:w-[280px] sm:h-[280px]">
                {/* Pointer */}
                <div
                  className="absolute left-1/2 -top-1 z-20 -translate-x-1/2"
                  aria-hidden
                >
                  <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-accent drop-shadow" />
                </div>

                <div
                  className="absolute inset-0 rounded-full shadow-inner border-[6px] border-primary"
                  style={{
                    background: wheelGradient,
                    transform: `rotate(${rotation}deg)`,
                    transition:
                      phase === "spinning"
                        ? "transform 4s cubic-bezier(0.15, 0.85, 0.25, 1)"
                        : undefined,
                  }}
                >
                  {SEGMENTS.map((pct, i) => {
                    const slice = 360 / SEGMENTS.length;
                    const angle = i * slice + slice / 2;
                    return (
                      <span
                        key={`${pct}-${i}`}
                        className="absolute left-1/2 top-1/2 text-[11px] sm:text-xs font-bold text-white drop-shadow"
                        style={{
                          transform: `rotate(${angle}deg) translateY(-88px) rotate(${-angle}deg)`,
                          transformOrigin: "center",
                        }}
                      >
                        {pct}%
                      </span>
                    );
                  })}
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-14 w-14 rounded-full bg-white border-4 border-primary shadow flex items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary leading-tight text-center">
                      Spin
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => void spin(e)} className="space-y-3">
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
                  className="w-full rounded-lg bg-accent text-white font-bold text-sm py-3 hover:opacity-90 disabled:opacity-60"
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
