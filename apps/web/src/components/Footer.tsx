import Link from "next/link";
import { site, navItems, usCityLinks, cityNavHref, rakhiSetsMenu, whatsappChatUrl } from "@/lib/site";
import { PaymentMethodIcons } from "@/components/PaymentMethodIcons";
import { SiteLogoLink } from "@/components/SiteLogo";
import { trustFacts } from "@/lib/trust";

const FACEBOOK_URL = "https://www.facebook.com/usarakhi/";
const INSTAGRAM_URL = "https://www.instagram.com/usarakhi/";

/**
 * Temporary for the Diwali and Bhai Dooj season.
 * Set to true to show Raksha Bandhan footer links again. Pages, URLs, and content stay in place.
 */
const SHOW_RAKHI_SEASON_FOOTER_LINKS = false;

/** Footer Shop Rakhi labels only — append "to USA" without changing shared nav/URLs. */
function shopRakhiFooterLabel(label: string): string {
  return /to\s+usa$/i.test(label.trim()) ? label : `${label} to USA`;
}

/** Faint corner line florals. Decorative only — no links or copy. */
function FooterFloralCorner({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 220 150" fill="none" aria-hidden>
      <path
        d="M18 28c18 8 28 22 30 40M28 36c14 2 26 12 32 28"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M46 18c8 14 8 28 2 42"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="34" cy="22" r="7" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="34" cy="22" r="2.2" fill="currentColor" />
      <path
        d="M62 14c10 6 16 16 16 28"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="78" cy="16" r="6" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M8 58c16 4 28 16 34 32"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <ellipse cx="14" cy="70" rx="8" ry="4" transform="rotate(-35 14 70)" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="70" cy="48" rx="9" ry="4.5" transform="rotate(28 70 48)" stroke="currentColor" strokeWidth="1" />
      <path
        d="M88 40c12 10 16 24 12 40"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle cx="104" cy="36" r="5.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** Corner art only. Sits beside the bottom row so it does not cover copy. */
function FooterCornerArt({ side, className = "" }: { side: "left" | "right"; className?: string }) {
  const isLeft = side === "left";
  return (
    <img
      src={isLeft ? "/footer/diya-left.png" : "/footer/gift-right.png"}
      alt=""
      className={`pointer-events-none w-auto shrink-0 ${
        isLeft ? "h-16 max-w-[42%] lg:h-20" : "h-[4.5rem] max-w-[46%] lg:mr-14 lg:h-24"
      } ${className}`}
    />
  );
}

export function Footer() {
  return (
    <footer
      className="relative mt-auto overflow-hidden border-t border-[#e6dcc8] text-primary"
      style={{ background: "linear-gradient(180deg, #fbf8f3 0%, #f6f1e8 100%)" }}
    >
      <FooterFloralCorner className="pointer-events-none absolute -left-2 top-0 z-0 h-20 w-32 text-[#c4a094] opacity-50 sm:h-24 sm:w-40" />
      <FooterFloralCorner className="pointer-events-none absolute -right-2 top-0 z-0 h-20 w-32 -scale-x-100 text-[#c4a094] opacity-50 sm:h-24 sm:w-40" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8 pb-2 sm:pt-9">
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 text-sm lg:grid-cols-12 lg:gap-0 lg:divide-x lg:divide-[#e4d8c8]">
          {/* Brand + contact — full width on mobile, one column on desktop */}
          <div className="col-span-2 lg:col-span-3 lg:pr-6">
            <SiteLogoLink size="desktop" className="mb-5" />
            <p className="text-slate-600 leading-relaxed mb-4 max-w-xs">
              Diwali and Bhai Dooj gift hampers delivered across the United States.
            </p>
            <div className="space-y-2 text-slate-700">
              <p>
                <span className="text-slate-500 text-xs uppercase tracking-wide block mb-0.5">Email</span>
                <a href={`mailto:${site.supportEmail}`} className="font-medium text-primary hover:underline">
                  {site.supportEmail}
                </a>
              </p>
              <p>
                <span className="text-slate-500 text-xs uppercase tracking-wide block mb-0.5">WhatsApp</span>
                <a
                  href={whatsappChatUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {site.whatsappDisplay}
                </a>
              </p>
            </div>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Follow us</p>
              <div className="flex items-center gap-3">
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="UsaRakhi on Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] hover:scale-105 transition-transform"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                    <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0013.843 3c-2.386 0-4.027 1.455-4.027 4.061v2.431H7.574v3.209h2.242v8.196h3.581z" />
                  </svg>
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="UsaRakhi on Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-[22%] hover:scale-105 transition-transform"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
                  }}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="#fff" strokeWidth="2" />
                    <circle cx="12" cy="12" r="4.2" stroke="#fff" strokeWidth="2" />
                    <circle cx="17.4" cy="6.6" r="1.2" fill="#fff" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div className="min-w-0 lg:col-span-2 lg:px-6">
            <p className="font-semibold text-primary mb-3 sm:mb-4">Shop</p>
            <ul className="space-y-2 text-slate-600">
              {SHOW_RAKHI_SEASON_FOOTER_LINKS &&
                rakhiSetsMenu.items.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="hover:text-primary hover:underline">
                      {shopRakhiFooterLabel(n.label)}
                    </Link>
                  </li>
                ))}
              {navItems
                .filter((n) => "category" in n)
                .map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="hover:text-primary hover:underline">
                      {shopRakhiFooterLabel(n.label)}
                    </Link>
                  </li>
                ))}
              <li>
                <Link href="/products" className="hover:text-primary hover:underline">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div className="min-w-0 lg:col-span-2 lg:px-6">
            <p className="font-semibold text-primary mb-3 sm:mb-4">Help &amp; Info</p>
            <ul className="space-y-2 text-slate-600">
              {SHOW_RAKHI_SEASON_FOOTER_LINKS && (
                <>
                  <li>
                    <Link href="/send-rakhi-from-india" className="hover:text-primary hover:underline">
                      Send Rakhi from India
                    </Link>
                  </li>
                  <li>
                    <Link href="/raksha-bandhan" className="hover:text-primary hover:underline">
                      Raksha Bandhan 2026
                    </Link>
                  </li>
                </>
              )}
              <li><Link href="/blog" className="hover:text-primary hover:underline">Blog &amp; Guides</Link></li>
              <li><Link href="/shipping" className="hover:text-primary hover:underline">Shipping &amp; Delivery</Link></li>
              <li><Link href="/faq" className="hover:text-primary hover:underline">FAQ</Link></li>
              <li><Link href="/reviews" className="hover:text-primary hover:underline">Customer Reviews</Link></li>
              <li><Link href="/about" className="hover:text-primary hover:underline">About Us</Link></li>
              <li><Link href="/returns" className="hover:text-primary hover:underline">Returns &amp; Guarantee</Link></li>
              <li><Link href="/contact" className="hover:text-primary hover:underline">Contact Us</Link></li>
              <li>
                <Link href="/terms" className="hover:text-primary hover:underline">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Cities — 3 columns so footer height stays balanced */}
          <div className="col-span-2 lg:col-span-5 min-w-0 lg:pl-6">
            <p className="font-semibold text-primary mb-3 sm:mb-4">Deliver to</p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-slate-600">
              {usCityLinks.map((c) => (
                <li key={c.slug}>
                  <Link href={cityNavHref(c)} className="hover:text-primary hover:underline">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payments, company line, and copyright — one compact band */}
        <div className="mt-6 border-t border-[#e6dcc8] pt-4 flex flex-col gap-3 text-xs text-slate-500 lg:flex-row lg:items-end lg:gap-4">
          <FooterCornerArt side="left" className="hidden lg:block" />
          <div className="min-w-0 flex-1 space-y-2 lg:py-1">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Accepted payments</p>
                <PaymentMethodIcons />
              </div>
              <p className="text-xs text-slate-500 max-w-md lg:text-right">
                Secure checkout with encrypted payment processing. Prices shown in USD or INR at checkout.
              </p>
            </div>
            <p>
              Operated by {trustFacts.operator}.{" "}
              <Link href="/about" className="text-slate-700 hover:text-primary underline underline-offset-2">
                About our team
              </Link>
              {" · "}
              <Link href="/reviews" className="text-slate-700 hover:text-primary underline underline-offset-2">
                Share your review
              </Link>
              {" · "}
              <Link href="/returns" className="text-slate-700 hover:text-primary underline underline-offset-2">
                Satisfaction guarantee
              </Link>
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>
                © {new Date().getFullYear()} {site.name}.com. All rights reserved. Celebrating sibling love across
                every mile.
              </p>
              <p className="flex flex-wrap gap-x-3 gap-y-1">
                <Link href="/terms" className="hover:text-primary underline underline-offset-2">
                  Terms and Conditions
                </Link>
                <Link href="/privacy" className="hover:text-primary underline underline-offset-2">
                  Privacy
                </Link>
                <Link href="/press" className="hover:text-primary underline underline-offset-2">
                  Press
                </Link>
              </p>
            </div>
          </div>
          <FooterCornerArt side="right" className="hidden lg:block" />
        </div>
      </div>
      <div className="relative z-0 flex items-end justify-between pl-2 pr-20 lg:hidden" aria-hidden>
        <FooterCornerArt side="left" />
        <FooterCornerArt side="right" />
      </div>
    </footer>
  );
}
