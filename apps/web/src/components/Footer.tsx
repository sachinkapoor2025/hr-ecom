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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] shadow-sm transition hover:opacity-90"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#ffffff" aria-hidden>
                  <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0013.843 3c-2.386 0-4.027 1.455-4.027 4.061v2.431H7.574v3.209h2.242v8.196h3.581z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/usarakhi/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow UsaRakhi on Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-[22%] shadow-sm transition hover:opacity-90"
                style={{
                  background:
                    "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
                }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4.2" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="17.4" cy="6.6" r="1.2" fill="#ffffff" />
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
