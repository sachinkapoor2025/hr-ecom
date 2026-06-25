import type { Metadata } from "next";
import Link from "next/link";
import { site, categoryOrder, faqs } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd, pageMetadata, rakshaBandhanEventJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Raksha Bandhan 2026 USA — Send Rakhi Online",
  description:
    "Celebrate Raksha Bandhan 2026 with UsaRakhi. Send Rakhi to brothers in all 50 US states. August 28, 2026. Fast delivery, premium rakhis, order from India.",
  path: "/raksha-bandhan",
  keywords:
    "raksha bandhan 2026, raksha bandhan USA, send rakhi USA, rakhi delivery USA, raksha bandhan date 2026, usarakhi",
});

export default function RakshaBandhanPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <JsonLd data={[faqJsonLd(faqs.slice(0, 4)), rakshaBandhanEventJsonLd()]} />
      <h1 className="text-3xl font-bold text-primary mb-4">Raksha Bandhan 2026 — Send Rakhi to USA</h1>
      <p className="text-lg text-slate-600 mb-8 leading-relaxed">
        Raksha Bandhan celebrates the sacred bond between brothers and sisters. When miles separate you,{" "}
        {site.name} delivers your love — premium Rakhis to every corner of America.
      </p>

      <section className="space-y-6 text-slate-700 leading-relaxed">
        <div className="p-6 bg-red-50 border border-red-100 rounded-xl">
          <h2 className="font-bold text-primary mb-2">Raksha Bandhan 2026 Date</h2>
          <p>
            <strong>Friday, August 28, 2026</strong> — order by early August for guaranteed on-time delivery to your
            brother in the USA.
          </p>
        </div>

        <h2 className="text-xl font-bold text-primary">How to celebrate Raksha Bandhan across distances</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Choose a Rakhi from our collections below</li>
          <li>Enter your brother&apos;s US address at checkout</li>
          <li>We deliver in 5–7 business days with roli chawal included</li>
          <li>Video call on Raksha Bandhan day for the tilak ceremony</li>
        </ol>

        <h2 className="text-xl font-bold text-primary">Shop by category</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {categoryOrder.map((slug) => (
            <Link
              key={slug}
              href={`/categories/${slug}`}
              className="p-4 border rounded-xl hover:border-nav hover:shadow-sm transition capitalize font-medium text-primary"
            >
              {slug.replace(/-/g, " ")} →
            </Link>
          ))}
        </div>

        <p>
          Read our complete guide:{" "}
          <Link href="/blog/raksha-bandhan-2026-usa" className="text-nav font-semibold hover:underline">
            Raksha Bandhan 2026 USA — date, muhurat & delivery tips
          </Link>
        </p>
      </section>
    </div>
  );
}
