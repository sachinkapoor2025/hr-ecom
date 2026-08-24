import Link from "next/link";
import { USARAKHI_MIN_ORDER_USD } from "@hr-ecom/shared";

/**
 * Peak-season message: rakhis at cost so customers can send to more brothers.
 */
export function UsarakhiShareEmotionsBanner() {
  return (
    <aside
      className="border-b border-rose-200/80 bg-gradient-to-r from-rose-50 via-orange-50/90 to-amber-50"
      aria-label="Rakhi at cost — share your love"
    >
      <div className="max-w-7xl mx-auto px-4 py-5 sm:py-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-rose-700/90 mb-2">
            Raksha Bandhan is for sharing — not holding back
          </p>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary leading-snug mb-3">
            Send rakhi to every brother who matters
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            This season, fast delivery and peak shipping make every order costlier — but we have
            priced our <strong>single &amp; combo rakhis at cost</strong> ($3, $5 &amp; $7) so you
            can share your emotions with more brothers, not just one. Standard orders need a{" "}
            <strong>${USARAKHI_MIN_ORDER_USD} minimum</strong>; if your cart is smaller, we top up
            the difference at checkout so nothing stops you from celebrating the bond.
          </p>
          <p className="mt-3 text-xs sm:text-sm text-slate-600">
            Chocolates, dry fruits &amp; hampers keep their regular prices.{" "}
            <Link href="/shipping" className="font-semibold text-nav hover:underline">
              Shipping details →
            </Link>
          </p>
        </div>
      </div>
    </aside>
  );
}
