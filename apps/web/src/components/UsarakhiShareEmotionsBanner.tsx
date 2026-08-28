import Link from "next/link";
import { USARAKHI_MIN_ORDER_USD } from "@hr-ecom/shared";
import {
  PRICES_DROPPED_BODY,
  PRICES_DROPPED_EYEBROW,
  PRICES_DROPPED_HEADLINE,
} from "@/lib/prices-dropped-copy";

/** Prices-dropped, anytime-love message — not tied to a festival date. */
export function UsarakhiShareEmotionsBanner() {
  return (
    <aside
      className="border-b border-rose-200/80 bg-gradient-to-r from-rose-50 via-orange-50/90 to-amber-50"
      aria-label="Prices dropped — still send Rakhi"
    >
      <div className="max-w-7xl mx-auto px-4 py-5 sm:py-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-rose-700/90 mb-2">
            {PRICES_DROPPED_EYEBROW}
          </p>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary leading-snug mb-3">
            {PRICES_DROPPED_HEADLINE}
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{PRICES_DROPPED_BODY}</p>
          <p className="mt-3 text-xs sm:text-sm text-slate-600">
            Standard orders need a <strong>${USARAKHI_MIN_ORDER_USD} minimum</strong> for free
            shipping; if your cart is smaller, we add the difference as shipping. Orange County
            products always ship free.{" "}
            <Link href="/products" className="font-semibold text-nav hover:underline">
              Shop rakhis →
            </Link>
          </p>
        </div>
      </div>
    </aside>
  );
}
