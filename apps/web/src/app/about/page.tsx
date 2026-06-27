import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { site, categoryOrder, whatsappChatUrl } from "@/lib/site";
import { aboutPageJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About UsaRakhi — Send Rakhi to USA Online",
  description:
    "UsaRakhi.com helps sisters worldwide send premium Rakhis to brothers in all 50 US states. Learn about our mission, delivery, and Raksha Bandhan commitment.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <JsonLd data={aboutPageJsonLd()} />
      <h1 className="text-3xl font-bold text-primary mb-6">About {site.name}</h1>
      <div className="space-y-6 text-slate-700 leading-relaxed">
        <p>
          <strong>{site.name}</strong> ({site.domain}) is a dedicated online Rakhi store built for one purpose: helping
          sisters send Rakhi to brothers across the United States — reliably, beautifully, and on time for Raksha
          Bandhan.
        </p>
        <p>
          Whether you live in India, the UK, Canada, Australia, or anywhere else while your brother is in California,
          New York, Texas, or any US state, we make the festival feel close. You order online; we deliver domestically
          within America in 5–7 business days.
        </p>
        <h2 className="text-xl font-bold text-primary pt-4">What we offer</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>126+ premium Rakhi designs across five categories</li>
          <li>Single Rakhi, Rakhi Combos, Kids Rakhi, Bhaiya Bhabhi sets, and Lumba Rakhi</li>
          <li>Complimentary roli and chawal with most rakhis</li>
          <li>Rakhi with chocolates — Ferrero Rocher, Lindt, Hershey&apos;s combos</li>
          <li>Secure payments via Razorpay and Stripe</li>
        </ul>
        <h2 className="text-xl font-bold text-primary pt-4">Our promise</h2>
        <p>
          Every Rakhi is carefully packed for the festival. We understand Raksha Bandhan is emotional — not just a
          transaction. That is why thousands of sisters trust {site.name} to send love when they cannot be there in
          person.
        </p>
        <p>
          Questions? Reach us on{" "}
          <a
            href={whatsappChatUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-nav hover:underline"
          >
            WhatsApp ({site.whatsappDisplay})
          </a>
          , email{" "}
          <a href={`mailto:${site.supportEmail}`} className="text-nav hover:underline">
            {site.supportEmail}
          </a>
          , or visit our <Link href="/contact" className="text-nav hover:underline">contact page</Link>.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        {categoryOrder.map((slug) => (
          <Link
            key={slug}
            href={`/categories/${slug}`}
            className="px-4 py-2 rounded-full border border-slate-200 text-sm hover:border-nav capitalize"
          >
            {slug.replace(/-/g, " ")}
          </Link>
        ))}
      </div>
    </div>
  );
}
