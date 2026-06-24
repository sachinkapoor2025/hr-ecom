import Link from "next/link";
import Image from "next/image";
import { site, faqs } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8 text-sm text-slate-600">
        <div className="md:col-span-1">
          <Image src={site.logoSrc} alt={site.name} width={120} height={40} className="h-9 w-auto mb-3" />
          <p className="mb-3">{site.description}</p>
          <a href={site.whatsappUrl} className="text-green-600 font-semibold hover:underline">
            WhatsApp Support
          </a>
        </div>
        <div>
          <p className="font-semibold text-primary mb-3">Shop</p>
          <ul className="space-y-2">
            <li><Link href="/products" className="hover:text-accent">All Rakhis</Link></li>
            <li><Link href="/products?category=rakhi-combo" className="hover:text-accent">Rakhi Combo</Link></li>
            <li><Link href="/products?category=single-rakhi" className="hover:text-accent">Single Rakhi</Link></li>
            <li><Link href="/products?category=bhaiya-bhabhi-rakhi" className="hover:text-accent">Bhaiya Bhabhi</Link></li>
            <li><Link href="/products?category=kids-rakhi" className="hover:text-accent">Kids Rakhi</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-primary mb-3">Support</p>
          <ul className="space-y-2">
            <li><Link href="/account" className="hover:text-accent">My Account</Link></li>
            <li><a href={`mailto:${site.supportEmail}`} className="hover:text-accent">{site.supportEmail}</a></li>
            <li><Link href="/cart" className="hover:text-accent">Cart</Link></li>
            <li><Link href="/checkout" className="hover:text-accent">Checkout</Link></li>
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
