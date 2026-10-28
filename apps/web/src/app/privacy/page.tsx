import type { Metadata } from "next";
import Link from "next/link";
import { applyInlineLinks, createInlineLinkBudget } from "@/lib/inline-links";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses, and protects your information when you shop for Diwali and Bhai Dooj gifts delivered in the USA.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  const budget = createInlineLinkBudget(4);
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
        <p>
          {site.name} (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains how we handle
          information when you use {site.domain}.
        </p>
        <h2 className="text-xl font-bold text-primary">Information we collect</h2>
        <p>
          {applyInlineLinks(
            "When you shop or contact us, we may collect your name, email, phone number, shipping address, order details, and payment status from our payment partner (Razorpay). We do not store full card numbers.",
            [
              { phrase: "shop", href: "/products" },
              { phrase: "contact us", href: "/contact" },
              { phrase: "shipping address", href: "/shipping" },
            ],
            budget
          )}
        </p>
        <h2 className="text-xl font-bold text-primary">How we use information</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Process and deliver your orders</li>
          <li>Send order updates and respond to support requests</li>
          <li>Improve our website and customer experience</li>
          <li>{applyInlineLinks("Comply with legal obligations", [{ phrase: "legal obligations", href: "/terms" }], budget)}</li>
        </ul>
        <h2 className="text-xl font-bold text-primary">Orders</h2>
        <p>
          A delivery address is used to ship the Diwali or Bhai Dooj gift and to send order updates. Payment status
          comes from Razorpay. Full card numbers are not stored on {site.domain}.
        </p>
        <h2 className="text-xl font-bold text-primary">Analytics</h2>
        <p>
          The site measures which pages are visited so we can see what shoppers use. That measurement does not
          include card numbers.
        </p>
        <h2 className="text-xl font-bold text-primary">Sharing</h2>
        <p>
          We share data only with service providers needed to fulfill orders (payment processors, shipping partners)
          and when required by law. We do not sell your personal information.
        </p>
        <h2 className="text-xl font-bold text-primary">Contact</h2>
        <p>
          Questions about privacy? Email{" "}
          <a href={`mailto:${site.supportEmail}`} className="text-nav underline">
            {site.supportEmail}
          </a>
          .
        </p>
        <p className="text-slate-500 text-sm">Last updated: July 2026</p>
        <p>
          <Link href="/" className="text-nav font-semibold hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
