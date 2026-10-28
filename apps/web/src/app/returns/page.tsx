import type { Metadata } from "next";
import Link from "next/link";
import { isRakhiContentHidden } from "@hr-ecom/shared";
import { applyInlineLinks, createInlineLinkBudget } from "@/lib/inline-links";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Returns & Satisfaction Guarantee",
  description: isRakhiContentHidden()
    ? `UsaRakhi returns, replacements, and satisfaction guarantee for festive gifts delivered in the USA.`
    : `UsaRakhi returns, replacements, and satisfaction guarantee for Rakhi orders delivered in the USA.`,
  path: "/returns",
});

export default function ReturnsPage() {
  const budget = createInlineLinkBudget(1);
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-6">Returns &amp; Satisfaction Guarantee</h1>
      <div className="space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
        <p>
          At {site.name}, we want every {isRakhiContentHidden() ? "festive" : "Raksha Bandhan"} delivery to feel
          special. If something goes wrong with your order, we will make it right.
        </p>
        <h2 className="text-xl font-bold text-primary">Damaged or incorrect items</h2>
        <p>
          Contact us within <strong>48 hours</strong> of delivery with your order number and photos. We offer a
          replacement or full refund for items that arrive damaged, defective, or incorrect.
        </p>
        <h2 className="text-xl font-bold text-primary">Delivery issues</h2>
        <p>
          {applyInlineLinks(
            `If your ${isRakhiContentHidden() ? "gift" : "Rakhi"} has not arrived within the estimated 5–7 business day window, reach out on WhatsApp ${site.whatsappDisplay} or email ${site.supportEmail}. We will track your shipment and resolve the issue promptly.`,
            [{ phrase: "5–7 business day", href: "/shipping" }],
            budget
          )}
        </p>
        <h2 className="text-xl font-bold text-primary">Cancellations</h2>
        <p>
          Orders can be cancelled before dispatch. Once shipped within the USA, cancellations may not be possible —
          contact us immediately and we will do our best to help.
        </p>
        <h2 className="text-xl font-bold text-primary">What to include</h2>
        <p>
          A request is faster to check when it includes the order number, the email used at checkout, and the US
          city on the delivery address. For a damaged or incorrect gift, add clear photos of the box and the item.
          Food gifts — sweets, chocolates, and dry fruits — should be reported within the same 48-hour window.
        </p>
        <h2 className="text-xl font-bold text-primary">What this policy does not change</h2>
        <p>
          The included list on the product page is what was ordered. A different sweet, nut, or pooja item is not
          added after checkout. Shipping times and the free-shipping rules stay on the shipping page.
        </p>
        <h2 className="text-xl font-bold text-primary">How to request help</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Email:{" "}
            <a href={`mailto:${site.supportEmail}`} className="text-nav underline">
              {site.supportEmail}
            </a>
          </li>
          <li>WhatsApp: {site.whatsappDisplay}</li>
          <li>
            <Link href="/contact" className="text-nav underline">
              Contact form
            </Link>
          </li>
        </ul>
        <p className="text-slate-500 text-sm">Last updated: July 2026</p>
        <Link href="/" className="text-nav font-semibold hover:underline inline-block">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
