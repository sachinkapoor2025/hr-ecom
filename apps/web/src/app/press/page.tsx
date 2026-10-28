import type { Metadata } from "next";
import Link from "next/link";
import { isRakhiContentHidden } from "@hr-ecom/shared";
import { applyInlineLinks, createInlineLinkBudget } from "@/lib/inline-links";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";
import { SiteLogoLink } from "@/components/SiteLogo";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Press Kit & Media",
    description: isRakhiContentHidden()
      ? `Media resources, brand story, and contact information for journalists covering ${site.name} and festive gift delivery in the USA.`
      : `Media resources, brand story, and contact information for journalists covering ${site.name} and Rakhi delivery to the USA.`,
    path: "/press",
  });
}

export default function PressPage() {
  if (isRakhiContentHidden()) {
    const budget = createInlineLinkBudget(5);
    const links = [
      { phrase: "Diwali", href: "/diwali-to-usa" },
      { phrase: "Bhai Dooj", href: "/bhai-dooj-to-usa" },
      { phrase: "5 business days", href: "/shipping" },
      { phrase: "pooja sets", href: "/pooja-sets-to-usa" },
      { phrase: "chocolates", href: "/chocolate-combos-to-usa" },
    ];
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-primary mb-6">Press Kit</h1>
        <div className="space-y-8 text-slate-700 leading-relaxed">
          <p>
            {applyInlineLinks(
              `${site.name} (${siteUrl}) sends Diwali and Bhai Dooj gift hampers across the United States. The store is operated by Divit Global Ventures. Orders ship from within America in 5 business days.`,
              links,
              budget
            )}
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              {applyInlineLinks(
                "Diwali combos, Bhai Dooj gifts, sweets, dry fruits, chocolates, and pooja sets",
                links,
                budget
              )}
            </li>
            <li>USA domestic shipping to all 50 states</li>
            <li>Payments: Razorpay for USD and INR</li>
            <li>Fulfillment: San Jose, CA area — US domestic delivery</li>
          </ul>
          <h2 className="text-xl font-bold text-primary">What journalists can say</h2>
          <p>
            {site.name} sells finished Diwali and Bhai Dooj hampers for delivery inside the United States. Shoppers
            can order from India, the UK, Canada, or elsewhere and pay in INR or USD. The gift is packed as the
            product page describes — sweets, dry fruits, chocolates, or a pooja item — and ships domestically.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Operator: Divit Global Ventures (DGV)</li>
            <li>Fulfillment: within the United States, including a California team</li>
            <li>Standard delivery: 5 business days</li>
            <li>Payments: Razorpay for USD and INR. Card numbers are not stored on the site.</li>
            <li>Site: {siteUrl}</li>
          </ul>
          <p>
            Media contact:{" "}
            <a href={`mailto:${site.supportEmail}`} className="text-nav underline">
              {site.supportEmail}
            </a>
            . For delivery terms, see the{" "}
            <Link href="/shipping" className="text-nav font-semibold hover:underline">
              shipping page
            </Link>
            . For brand background, see{" "}
            <Link href="/about" className="text-nav font-semibold hover:underline">
              About {site.name}
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-6">Press Kit</h1>
      <div className="space-y-8 text-slate-700 leading-relaxed">
        <div>
          <SiteLogoLink size="desktop" className="mb-4" />
          <p className="text-sm text-slate-500">High-resolution logo available on request</p>
        </div>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">About {site.name}</h2>
          <p>
            {site.name} ({siteUrl}) is a dedicated online Rakhi store operated by Divit Global Ventures, helping
            sisters worldwide send premium Rakhis to brothers across all 50 US states. Domestic US fulfillment
            delivers in 5–7 business days — sisters order from India, UK, Canada, Australia, and worldwide.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">Key facts</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>126+ Rakhi designs across Single, Combo, Kids, Bhaiya Bhabhi, and Lumba categories</li>
            <li>USA domestic shipping to all 50 states in 5–7 business days</li>
            <li>Raksha Bandhan 2026: August 28, 2026</li>
            <li>Payments: Razorpay for USD and INR</li>
            <li>Fulfillment: San Jose, CA area — US domestic delivery</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">Media contact</h2>
          <p>
            Email:{" "}
            <a href={`mailto:${site.supportEmail}`} className="text-nav underline">
              {site.supportEmail}
            </a>
            <br />
            WhatsApp: {site.whatsappDisplay}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">Suggested story angles</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>First dedicated Rakhi-to-USA e-commerce platform for the NRI diaspora</li>
            <li>How sisters in India bridge distance for Raksha Bandhan with same-week US delivery</li>
            <li>Rakhi combos with premium chocolates — modern gifting for NRI families</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">AI &amp; machine-readable resources</h2>
          <p className="text-sm">
            <Link href="/llms.txt" className="text-nav underline">
              llms.txt
            </Link>
            {" · "}
            <Link href="/llms-full.txt" className="text-nav underline">
              llms-full.txt
            </Link>
          </p>
        </section>

        <Link href="/about" className="text-nav font-semibold hover:underline">
          Read full About Us →
        </Link>
      </div>
    </div>
  );
}
