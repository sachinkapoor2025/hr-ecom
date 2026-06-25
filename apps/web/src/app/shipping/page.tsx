import type { Metadata } from "next";
import Link from "next/link";
import { site, cityLinks } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { howToSendRakhiJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Rakhi Shipping & Delivery to USA",
  description:
    "UsaRakhi delivers to all 50 US states in 5–7 business days. Free shipping on selected orders. Order from India, UK, Canada worldwide.",
  path: "/shipping",
});

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <JsonLd data={howToSendRakhiJsonLd()} />
      <h1 className="text-3xl font-bold text-primary mb-6">Shipping & Delivery</h1>
      <div className="space-y-6 text-slate-700 leading-relaxed">
        <p>
          {site.name} delivers premium Rakhis to <strong>all 50 United States</strong>. Standard delivery takes{" "}
          <strong>5–7 business days</strong> after dispatch. Orders placed before our daily cut-off ship the same day.
        </p>
        <h2 className="text-xl font-bold text-primary">Ordering from outside the USA</h2>
        <p>
          Sisters in India, United Kingdom, Canada, Australia, and worldwide can order on {site.domain}. Enter your
          brother&apos;s <strong>US delivery address</strong> at checkout — we fulfill and ship domestically within
          America, avoiding international customs delays.
        </p>
        <h2 className="text-xl font-bold text-primary">Free shipping</h2>
        <p>Free shipping is available on selected orders. Check product pages and checkout for current eligibility.</p>
        <h2 className="text-xl font-bold text-primary">Packaging</h2>
        <p>
          Each Rakhi is festival-packed with care. Most single rakhis include complimentary <strong>roli</strong>{" "}
          (kumkum) and <strong>chawal</strong> (rice) for the traditional Raksha Bandhan tilak ceremony.
        </p>
        <h2 className="text-xl font-bold text-primary">Cities we deliver to</h2>
        <p>Popular delivery destinations include:</p>
        <ul className="flex flex-wrap gap-2">
          {cityLinks.map((c) => (
            <li key={c.slug}>
              <Link href={`/cities/${c.slug}`} className="text-nav hover:underline text-sm">
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="pt-4">
          Need help? <Link href="/contact" className="text-nav hover:underline">Contact us</Link> or read our{" "}
          <Link href="/faq" className="text-nav hover:underline">FAQ</Link>.
        </p>
      </div>
    </div>
  );
}
