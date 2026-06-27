import Link from "next/link";
import Image from "next/image";
import { site, faqs, navItems, cityLinks, whatsappChatUrl } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 lg:grid-cols-5 gap-8 text-sm text-slate-600">
        <div className="lg:col-span-2">
          <Image src={site.logoSrc} alt={site.name} width={120} height={40} className="h-9 w-auto mb-3" />
          <p className="mb-3 max-w-sm">{site.description}</p>
          <p className="text-xs text-slate-500 mb-4">
            Send Rakhi to USA from India, UK, Canada &amp; worldwide. Premium Rakhis delivered to all 50 US states.
          </p>
          <div className="mb-4">
            <p className="font-semibold text-primary mb-2">Follow us</p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/usarakhi/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow UsaRakhi on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-primary hover:bg-nav hover:text-white hover:border-nav transition"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/usarakhi/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow UsaRakhi on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-primary hover:bg-nav hover:text-white hover:border-nav transition"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
          <Link href="/contact" className="text-nav font-semibold hover:underline">
            Contact Us
          </Link>
          <p className="mt-2">
            <a
              href={whatsappChatUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-nav font-semibold hover:underline"
            >
              WhatsApp: {site.whatsappDisplay}
            </a>
          </p>
        </div>
        <div>
          <p className="font-semibold text-primary mb-3">Shop Rakhi</p>
          <ul className="space-y-2">
            {navItems
              .filter((n) => "category" in n)
              .map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-nav">
                    {n.label}
                  </Link>
                </li>
              ))}
            <li>
              <Link href="/products" className="hover:text-nav">
                All Products
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-primary mb-3">Guides</p>
          <ul className="space-y-2">
            <li><Link href="/raksha-bandhan" className="hover:text-nav">Raksha Bandhan 2026</Link></li>
            <li><Link href="/blog" className="hover:text-nav">Blog & Guides</Link></li>
            <li><Link href="/shipping" className="hover:text-nav">Shipping & Delivery</Link></li>
            <li><Link href="/faq" className="hover:text-nav">FAQ</Link></li>
            <li><Link href="/about" className="hover:text-nav">About Us</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-primary mb-3">Deliver to</p>
          <ul className="space-y-2">
            {cityLinks.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/cities/${c.slug}`} className="hover:text-nav">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 text-center py-4 text-xs text-slate-400 space-y-1 px-4">
        <p>© {new Date().getFullYear()} {site.name}.com — Send Rakhi to USA with love.</p>
        <p>
          We use first-party analytics (no third-party trackers) to improve your experience.{" "}
          <Link href="/llms.txt" className="hover:text-nav underline">
            LLMs.txt
          </Link>
          {" · "}
          <Link href="/humans.txt" className="hover:text-nav underline">
            Humans.txt
          </Link>{" "}
          for AI assistants.
        </p>
      </div>
    </footer>
  );
}
