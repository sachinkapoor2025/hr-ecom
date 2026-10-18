import type { Metadata } from "next";
import Link from "next/link";
import { applyInlineLinks } from "@/lib/inline-links";
import { isRakhiContentHidden } from "@hr-ecom/shared";
import { site } from "@/lib/site";
import { pageMetadata, contactPageJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { ContactForm } from "./ContactForm";

export function generateMetadata(): Metadata {
  const hidden = isRakhiContentHidden();
  return pageMetadata({
    title: hidden ? "Contact Us — Festive Gift Delivery Support" : "Contact Us — Rakhi Delivery Support",
    description: hidden
      ? `Contact ${site.name} for Diwali and Bhai Dooj gift delivery and order help. ${site.supportEmail}`
      : `Contact ${site.name} for Rakhi delivery support, order help, and Raksha Bandhan inquiries. ${site.supportEmail}`,
    path: "/contact",
  });
}

export default function ContactPage() {
  const hidden = isRakhiContentHidden();
  return (
    <>
      <JsonLd data={contactPageJsonLd()} />
      <ContactForm />
      <section className="max-w-3xl mx-auto px-4 pb-12 text-slate-700 leading-relaxed">
        <h2 className="text-xl font-bold text-primary mb-3">What to include in your message</h2>
        <p className="mb-4">
          The form above reaches the {site.name} support team for order questions
          {hidden ? " and festive gift delivery." : " and Raksha Bandhan delivery help."} A complete note is easier
          to answer: your name, the email used at checkout, the order number if you have one, and the US city where
          the gift should arrive.
        </p>
        <h3 className="text-lg font-semibold text-primary mb-2">Typical questions we can take from this page</h3>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Whether an order can still be changed before it is dispatched</li>
          <li>Help reading a tracking update after the parcel has shipped inside the USA</li>
          <li>Damaged or incorrect items — contact us within 48 hours of delivery and include photos</li>
          <li>
            {hidden
              ? applyInlineLinks(
                  "Choosing a Diwali hamper, a Bhai Dooj box, sweets, dry fruits, or a pooja set",
                  [
                    { phrase: "Diwali hamper", href: "/diwali-to-usa" },
                    { phrase: "Bhai Dooj box", href: "/bhai-dooj-to-usa" },
                  ]
                )
              : "Choosing between a single rakhi, a combo, a hamper, or a Bhaiya Bhabhi set"}
          </li>
        </ul>
        <p className="text-sm">
          Written policies live on{" "}
          <Link href="/shipping" className="text-nav font-semibold hover:underline">
            shipping
          </Link>
          ,{" "}
          <Link href="/returns" className="text-nav font-semibold hover:underline">
            returns
          </Link>
          , and the{" "}
          <Link href="/faq" className="text-nav font-semibold hover:underline">
            FAQ
          </Link>
          . Those pages are the reference when you want the delivery window or the satisfaction terms before you write
          in.
        </p>
      </section>
    </>
  );
}
