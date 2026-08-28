import Link from "next/link";
import {
  HOME_BANNER_DELIVERY_NOTE,
  PRICES_DROPPED_BODY,
} from "@/lib/prices-dropped-copy";

/** Prices-dropped, anytime-love message — not tied to a festival date. */
export function UsarakhiShareEmotionsBanner() {
  return (
    <aside
      className="border-b border-rose-200/80 bg-gradient-to-r from-rose-50 via-orange-50/90 to-amber-50"
      aria-label="Prices dropped — place your order now"
    >
      <div className="max-w-7xl mx-auto px-4 py-5 sm:py-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary leading-snug mb-3">
            {PRICES_DROPPED_BODY}
          </h2>
          <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed">
            {HOME_BANNER_DELIVERY_NOTE}
          </p>
          <p className="mt-3 text-sm">
            <Link href="/products" className="font-semibold text-nav hover:underline">
              Place your order now →
            </Link>
          </p>
        </div>
      </div>
    </aside>
  );
}
