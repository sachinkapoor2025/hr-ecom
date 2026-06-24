import Link from "next/link";
import Image from "next/image";
import { site, faqs, navItems } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8 text-sm text-slate-600">
        <div className="md:col-span-1">
          <Image src={site.logoSrc} alt={site.name} width={120} height={40} className="h-9 w-auto mb-3" />
          <p className="mb-3">{site.description}</p>
          <Link href="/contact" className="text-nav font-semibold hover:underline">
            Contact Us
          </Link>
        </div>
        <div>
          <p className="font-semibold text-primary mb-3">Categories</p>
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
          </ul>
        </div>
        <div>
          <p className="font-semibold text-primary mb-3">Support</p>
          <ul className="space-y-2">
            <li><Link href="/account" className="hover:text-nav">My Account</Link></li>
            <li><a href={`mailto:${site.supportEmail}`} className="hover:text-nav">{site.supportEmail}</a></li>
            <li><Link href="/cart" className="hover:text-nav">Cart</Link></li>
            <li><Link href="/blog" className="hover:text-nav">Blogs</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-primary mb-3">FAQ</p>
          <ul className="space-y-2">
            {faqs.slice(0, 3).map((f) => (
              <li key={f.q} className="text-xs leading-relaxed">{f.q}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 text-center py-4 text-xs text-slate-400">
        © {new Date().getFullYear()} {site.name}.com — Send Rakhi to USA with love.
      </div>
    </footer>
  );
}
