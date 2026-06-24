import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { site, testimonials, faqs, collectionHighlights } from "@/lib/site";
import type { Product } from "@hr-ecom/shared";

export const metadata: Metadata = {
  title: "Send Rakhi to USA Online | Free Shipping",
  description: site.description,
};

export default async function HomePage() {
  let products: Product[] = [];
  try {
    const data = await api<{ products: Product[] }>("/products");
    products = data.products.slice(0, 20);
  } catch {
    products = [];
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{site.tagline}</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Distance may keep you miles apart, but your bond stays strong. Send love, Rakhis, and
            chocolates to your brother in the USA with fast delivery and free shipping on selected orders.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="bg-accent hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Shop All Rakhis
            </Link>
            <a
              href={site.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary">Featured Rakhis</h2>
            <p className="text-slate-600 mt-1">Premium designs with chocolates &amp; free shipping</p>
          </div>
          <Link href="/products" className="text-accent font-semibold hover:underline">
            View All →
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-slate-600 text-center py-8">
            Products loading soon. Run{" "}
            <code className="bg-slate-100 px-1 rounded">npm run import:usarakhi</code> to import from
            usarakhi.com.
          </p>
        )}
      </section>

      {/* Collections */}
      <section className="bg-slate-50 py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-10">
            Explore Our Exclusive Rakhi Collection
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collectionHighlights.map((c) => (
              <Link
                key={c.slug}
                href={`/products?category=${c.slug}`}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-primary/30 transition"
              >
                <h3 className="font-bold text-lg text-primary mb-2">{c.title}</h3>
                <p className="text-slate-600 text-sm">{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-10">
          Why {site.name}.com is Trusted Worldwide
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Fast Delivery", desc: "Same-day dispatch on most orders. 5–7 business days across USA." },
            { title: "Free Shipping", desc: "Free shipping on selected orders — send love without extra cost." },
            { title: "Secure Checkout", desc: "Safe payments with Stripe & Razorpay. Your data is protected." },
            { title: "WhatsApp Support", desc: "Our team helps with orders, tracking, and delivery queries." },
          ].map((f) => (
            <div key={f.title} className="text-center p-6 border border-slate-200 rounded-xl">
              <h3 className="font-bold text-primary mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-primary text-white py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Loved by Brothers &amp; Sisters</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="bg-white/10 rounded-xl p-5 backdrop-blur">
                <p className="text-blue-100 text-sm mb-3">&ldquo;{t.text}&rdquo;</p>
                <footer className="font-semibold">
                  {t.name}{" "}
                  <span className="text-gold text-xs">{"★".repeat(t.rating)}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-10">
          How to Send Rakhi to USA Online
        </h2>
        <ol className="grid md:grid-cols-5 gap-4 text-center">
          {[
            "Choose Your Rakhi",
            "Add Chocolates",
            "Enter USA Address",
            "Secure Payment",
            "Fast Delivery",
          ].map((step, i) => (
            <li key={step} className="flex flex-col items-center">
              <span className="w-10 h-10 rounded-full bg-accent text-white font-bold flex items-center justify-center mb-2">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-slate-700">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-14">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="bg-white border border-slate-200 rounded-lg p-4">
                <summary className="font-semibold text-primary cursor-pointer">{f.q}</summary>
                <p className="text-slate-600 text-sm mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-14 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Make This Raksha Bandhan Truly Special</h2>
        <p className="text-slate-600 mb-6 max-w-xl mx-auto">
          Choose {site.name}.com for trusted delivery, premium quality, and the joy of celebrating together — no
          matter the distance.
        </p>
        <Link href="/products" className="inline-block bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600">
          Shop Now
        </Link>
      </section>
    </div>
  );
}
