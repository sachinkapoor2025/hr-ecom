import Link from "next/link";
import Image from "next/image";
import { site, faqs, navItems, cityLinks } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 lg:grid-cols-5 gap-8 text-sm text-slate-600">
        <div className="lg:col-span-2">
          <Image src={site.logoSrc} alt={site.name} width={120} height={40} className="h-9 w-auto mb-3" />
          <p className="mb-3 max-w-sm">{site.description}</p>
          <p className="text-xs text-slate-500 mb-3">
            Send Rakhi to USA from India, UK, Canada &amp; worldwide. Premium Rakhis delivered to all 50 US states.
          </p>
          <Link href="/contact" className="text-nav font-semibold hover:underline">
            Contact Us
          </Link>
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
