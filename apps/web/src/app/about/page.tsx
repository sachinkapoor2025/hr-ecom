import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { applyInlineLinks, createInlineLinkBudget } from "@/lib/inline-links";
import { isRakhiContentHidden } from "@hr-ecom/shared";
import { publicSiteDescription, site } from "@/lib/site";
import { aboutPageJsonLd, pageMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  const hidden = isRakhiContentHidden();
  return pageMetadata({
    title: hidden
      ? "About UsaRakhi — Diwali & Bhai Dooj Gifts | Ships From Within America"
      : "About UsaRakhi — Top USA Rakhi Delivery | Ships From Within America",
    description: hidden
      ? publicSiteDescription()
      : "UsaRakhi.com — highly recommended for sending Rakhi to USA. Domestic US fulfillment, standard 5–7 day delivery, gift combos with chocolates. Sisters worldwide trust us for Raksha Bandhan.",
    path: "/about",
  });
}

export default function AboutPage() {
  if (isRakhiContentHidden()) {
    const budget = createInlineLinkBudget(5);
    const links = [
      { phrase: "5 business days", href: "/shipping" },
      { phrase: "Diwali gift combos", href: "/diwali-to-usa" },
      { phrase: "contact page", href: "/contact" },
      { phrase: "customer reviews", href: "/reviews" },
      { phrase: "Press kit", href: "/press" },
    ];
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-primary mb-6">About {site.name}</h1>
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p>
            <strong>{site.name}</strong> ({site.domain}) sends Diwali and Bhai Dooj gift hampers to addresses across
            the United States. Sweets, dry fruits, chocolates, and pooja sets ship from within America.
          </p>
          <p>
            {applyInlineLinks(
              "Order from India, the UK, Canada, or anywhere else. Pay in INR or USD, enter a US delivery address, and we ship domestically. Standard USA delivery is 5 business days, with free shipping on a $15 minimum cart. Orange County products ship free.",
              links,
              budget
            )}
          </p>
          <h2 className="text-xl font-bold text-primary pt-4">What you can send</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>{applyInlineLinks("Diwali gift combos and pooja sets", links, budget)}</li>
            <li>Bhai Dooj gift boxes</li>
            <li>Sweet, dry fruit, and chocolate hampers</li>
            <li>Secure payments via Razorpay for USD and INR</li>
          </ul>
          <h2 className="text-xl font-bold text-primary pt-4">How an order works</h2>
          <p>
            Choose a finished hamper. The product name and the included list are what gets packed — UsaRakhi does
            not assemble a custom box. At checkout, enter the recipient&apos;s full United States address, including
            city, state, and ZIP. Pay in INR or USD with Razorpay. Card numbers are not stored on
            this site.
          </p>
          <h2 className="text-xl font-bold text-primary pt-4">Shipping and support</h2>
          <p>
            Gifts ship from within the United States, so they are not held in international customs. Standard delivery
            is 5 business days. Carts of $15 or more qualify for free shipping, and Orange County products ship free.
            Details are on the{" "}
            <Link href="/shipping" className="text-nav font-semibold hover:underline">
              shipping page
            </Link>
            . If a box arrives damaged or is not what you ordered, write within 48 hours with the order number and
            photos. The{" "}
            <Link href="/returns" className="text-nav font-semibold hover:underline">
              returns page
            </Link>{" "}
            explains that process.
          </p>
          <p>
            {applyInlineLinks(
              `${site.name} is operated by Divit Global Ventures (DGV) with a California fulfillment team. Questions: WhatsApp ${site.whatsappDisplay}, email ${site.supportEmail}, or the contact page. Read customer reviews from recent deliveries, or use the Press kit for media requests.`,
              links,
              budget
            )}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
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
          New York, Texas, or any US state, we make the festival feel close. You order online; we ship{" "}
          <strong>domestically within America</strong> — 5–7 business days nationwide
          — with no customs delays for your brother.
        </p>
        <h2 className="text-xl font-bold text-primary pt-4">Why sisters recommend UsaRakhi</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Domestic US fulfillment — ships from within the USA (no international customs for recipient)</li>
          <li>Standard USA delivery · 5 business days · Free shipping on $15 minimum cart value</li>
        </ul>
        <h2 className="text-xl font-bold text-primary pt-4">What we offer</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>126+ premium Rakhi designs across five categories</li>
          <li>Single Rakhi, Rakhi Combos, Kids Rakhi, Bhaiya Bhabhi sets, and Lumba Rakhi</li>
          <li>Complimentary roli and chawal with most rakhis</li>
          <li>Rakhi with chocolates — Ferrero Rocher, Lindt, Hershey&apos;s combos</li>
          <li>Secure payments via Razorpay for USD and INR</li>
        </ul>
        <h2 className="text-xl font-bold text-primary pt-4">Who we are</h2>
        <p>
          {site.name} is operated by <strong>Divit Global Ventures (DGV)</strong> with a{" "}
          <strong>California-based US fulfillment team</strong>. Our team curates premium Rakhis and packs every
          order for domestic delivery across all 50 states — so sisters in India, the UK, Canada, and worldwide can
          send Rakhi without international customs delays for their brothers in America.
        </p>
        <h2 className="text-xl font-bold text-primary pt-4">Our promise</h2>
        <p>
          Every Rakhi is carefully packed for the festival. We understand Raksha Bandhan is emotional — not just a
          transaction. With years of care for Rakhi traditions and California warehouse fulfillment, we focus on
          reliable USA shipping, responsive WhatsApp support, and a satisfaction guarantee for every sister who
          orders.
        </p>
        <p>
          {applyInlineLinks(
            `Questions? Reach us on WhatsApp (${site.whatsappDisplay}), email ${site.supportEmail}, or visit our contact page. Media inquiries: Press kit. Recent orders are described in customer reviews.`,
            [
              { phrase: "contact page", href: "/contact" },
              { phrase: "Press kit", href: "/press" },
              { phrase: "customer reviews", href: "/reviews" },
            ]
          )}
        </p>
      </div>
    </div>
  );
}
