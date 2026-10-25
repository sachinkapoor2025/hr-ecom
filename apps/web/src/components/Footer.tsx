import Link from "next/link";
import { site, navItems, cityLinks, cityNavHref, rakhiSetsMenu, whatsappChatUrl } from "@/lib/site";
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

/** Soft corner ornaments for the cream footer. Decorative only — no links or copy. */
function FooterFestiveDecor() {
  return (
    <div className="pointer-events-none relative h-24 overflow-hidden sm:h-28" aria-hidden>
      <svg
        className="absolute bottom-1 left-0 h-[4.5rem] w-28 sm:h-24 sm:w-44 md:w-56"
        viewBox="0 0 230 132"
        fill="none"
      >
        <ellipse cx="70" cy="112" rx="68" ry="10" fill="#E7C99A" opacity="0.45" />
        <ellipse cx="24" cy="34" rx="9" ry="5" fill="#E8A598" transform="rotate(-28 24 34)" />
        <ellipse cx="48" cy="18" rx="7" ry="4" fill="#F2C14E" transform="rotate(18 48 18)" />
        <ellipse cx="16" cy="58" rx="6" ry="3.5" fill="#F0B07A" transform="rotate(-55 16 58)" />
        <ellipse cx="78" cy="36" rx="5.5" ry="3" fill="#E7A0B4" transform="rotate(42 78 36)" opacity="0.9" />
        <ellipse cx="40" cy="104" rx="16" ry="5.5" fill="#6B8F5A" transform="rotate(-32 40 104)" />
        <ellipse cx="28" cy="108" rx="11" ry="4" fill="#7D9A62" transform="rotate(18 28 108)" />
        <g transform="translate(62,88)">
          <ellipse rx="20" ry="8" fill="#F0A03A" />
          <ellipse rx="20" ry="8" fill="#E8922A" transform="rotate(45)" />
          <ellipse rx="20" ry="8" fill="#F0A03A" transform="rotate(90)" />
          <ellipse rx="20" ry="8" fill="#E8922A" transform="rotate(135)" />
          <circle r="7.5" fill="#C45C16" />
          <circle r="3" fill="#F8D48A" />
        </g>
        <path
          d="M108 96c8-24 28-36 52-36s44 12 52 36c-16 10-34 15-52 15s-36-5-52-15z"
          fill="#C4784A"
        />
        <path
          d="M122 93c6-15 20-23 38-23s32 8 38 23c-12 6-25 9-38 9s-26-3-38-9z"
          fill="#E8A56B"
        />
        <ellipse cx="160" cy="90" rx="20" ry="5.5" fill="#F6D7A8" opacity="0.8" />
        <rect x="158.2" y="58" width="3.4" height="14" rx="1.2" fill="#6B3A22" />
        <path d="M160 30c9 11 11 22 0 34-11-12-9-23 0-34z" fill="#F6C445" />
        <path d="M160 42c4.5 5.5 5.5 11 0 17-5.5-6-4.5-11.5 0-17z" fill="#F08A2A" />
        <path d="M160 48c2 2.5 2.4 5 0 8-2.4-3-2-5.5 0-8z" fill="#FFF6D0" />
      </svg>
      <svg
        className="absolute bottom-1 right-20 h-[4.5rem] w-28 sm:right-16 sm:h-24 sm:w-44 md:w-56"
        viewBox="0 0 230 132"
        fill="none"
      >
        <ellipse cx="160" cy="112" rx="68" ry="10" fill="#E7C99A" opacity="0.4" />
        <ellipse cx="196" cy="30" rx="9" ry="5" fill="#F2C14E" transform="rotate(24 196 30)" />
        <ellipse cx="214" cy="52" rx="7" ry="4" fill="#E8A598" transform="rotate(-36 214 52)" />
        <ellipse cx="174" cy="18" rx="6" ry="3.5" fill="#E7A0B4" transform="rotate(48 174 18)" />
        <ellipse cx="48" cy="102" rx="14" ry="5" fill="#6B8F5A" transform="rotate(28 48 102)" />
        <g transform="translate(62,90)">
          <ellipse rx="16" ry="6.5" fill="#F0A03A" />
          <ellipse rx="16" ry="6.5" fill="#E8922A" transform="rotate(45)" />
          <ellipse rx="16" ry="6.5" fill="#F0A03A" transform="rotate(90)" />
          <ellipse rx="16" ry="6.5" fill="#E8922A" transform="rotate(135)" />
          <circle r="6" fill="#C45C16" />
          <circle r="2.4" fill="#F8D48A" />
        </g>
        <g transform="translate(108,34)">
          <rect x="2" y="28" width="78" height="50" rx="5" fill="#F6E3B4" stroke="#E0B15A" strokeWidth="1.4" />
          <path d="M0 28h82l-6-14H8L0 28z" fill="#E8C98A" />
          <rect x="35" y="14" width="11" height="64" fill="#9B3D4A" />
          <rect x="2" y="48" width="78" height="9" fill="#9B3D4A" />
          <path d="M40.5 16c-10-16-26-8-16 4 5 4 12 2 16-4z" fill="#B84A58" />
          <path d="M40.5 16c10-16 26-8 16 4-5 4-12 2-16-4z" fill="#9B3D4A" />
          <circle cx="40.5" cy="18" r="4.5" fill="#E0B15A" />
        </g>
      </svg>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-[#E6D7C3] bg-[#FBF6EE] text-primary">
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 text-sm">
          {/* Brand + contact — full width on mobile, one column on desktop */}
          <div className="col-span-2 lg:col-span-3">
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
          <div className="min-w-0 lg:col-span-2">
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
          <div className="min-w-0 lg:col-span-2">
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
          <div className="col-span-2 lg:col-span-5 min-w-0">
            <p className="font-semibold text-primary mb-3 sm:mb-4">Deliver to</p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-slate-600">
              {cityLinks.map((c) => (
                <li key={c.slug}>
                  <Link href={cityNavHref(c)} className="hover:text-primary hover:underline">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payments row */}
        <div className="mt-10 pt-8 border-t border-[#E6D7C3] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Accepted payments</p>
            <PaymentMethodIcons />
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Secure checkout with encrypted payment processing. Prices shown in USD or INR at checkout.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#E6D7C3] bg-[#F4EBDD]">
        <div className="max-w-7xl mx-auto py-5 pl-4 pr-16 sm:pr-20 flex flex-col gap-3 text-xs text-slate-500">
          <p className="text-center sm:text-left">
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
        <FooterFestiveDecor />
      </div>
    </footer>
  );
}
