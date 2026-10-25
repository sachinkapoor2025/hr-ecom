import type { Metadata } from "next";
import Link from "next/link";
import { applyInlineLinks, createInlineLinkBudget } from "@/lib/inline-links";
import { site, usCityLinks } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata, canonical } from "@/lib/seo";
import { RAKHI_DELIVERY_MESSAGING, USARAKHI_MIN_ORDER_USD } from "@hr-ecom/shared";
import { RakhiDeliveryBulletList } from "@/components/RakhiDeliveryBulletList";

export const metadata: Metadata = pageMetadata({
  title: "Diwali and Bhai Dooj Shipping & Delivery in the USA",
  description:
    "UsaRakhi ships Diwali and Bhai Dooj gifts inside the USA. Standard delivery is 5 business days, with free shipping on a $15 minimum cart.",
  path: "/shipping",
});

const festivalDeliveryWindows = [
  {
    label: "Diwali 2026",
    orderBy: "Before November 8, 2026",
    notes: "Standard delivery is 5 business days after dispatch. Order early enough for sweets and hampers to arrive before Diwali.",
  },
  {
    label: "Bhai Dooj 2026",
    orderBy: "Before November 10, 2026",
    notes: "Bhai Dooj gifts use the same domestic window. A 5-business-day shipment should be ordered ahead of the celebration.",
  },
  {
    label: "Orange County products",
    orderBy: "Order now",
    notes: "Standard USA delivery, with free shipping on those products.",
  },
] as const;

function festivalShippingJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to send Diwali and Bhai Dooj gifts to a US address",
    description:
      "Order Diwali gift combos, Bhai Dooj gifts, sweets, chocolates, and dry fruit hampers for delivery in the United States.",
    totalTime: "P5D",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Choose a festive gift",
        text: "Browse Diwali gift combos, Bhai Dooj gifts, sweet boxes, chocolate combos, dry fruit hampers, and pooja sets.",
        url: canonical("/products"),
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Add the gift to your cart",
        text: "Check the included list on the product page so you know which sweets, chocolates, dry fruits, or pooja items are packed.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Enter the US delivery address",
        text: "At checkout, enter the recipient's full United States address, including city, state, and ZIP code.",
        url: canonical("/shipping"),
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Pay securely",
        text: "Pay with Stripe in USD or Razorpay in INR. Card numbers are not stored on UsaRakhi.",
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Track the domestic shipment",
        text: "UsaRakhi ships inside the United States. Standard delivery is 5 business days after dispatch.",
      },
    ],
  };
}

export default function ShippingPage() {
  const budget = createInlineLinkBudget(3);
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <JsonLd data={festivalShippingJsonLd()} />
      <h1 className="text-3xl font-bold text-primary mb-6">Diwali and Bhai Dooj Shipping</h1>
      <div className="space-y-6 text-slate-700 leading-relaxed">
        <p>
          {applyInlineLinks(
            `${site.name} delivers Diwali gift combos and Bhai Dooj gifts to all 50 United States with domestic US fulfillment. Sweets, chocolates, dry fruit hampers, and pooja sets ship inside America, so the recipient is not waiting on international customs.`,
            [
              { phrase: "Diwali gift combos", href: "/diwali-to-usa" },
              { phrase: "Bhai Dooj gifts", href: "/bhai-dooj-to-usa" },
              { phrase: "dry fruit hampers", href: "/dry-fruit-combos-to-usa" },
            ],
            budget
          )}
        </p>
        <h2 className="text-xl font-bold text-primary">Shipping options</h2>
        <p className="text-sm font-semibold text-slate-900">
          {RAKHI_DELIVERY_MESSAGING.lastMinuteNote}
        </p>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-800">
          <RakhiDeliveryBulletList
            items={RAKHI_DELIVERY_MESSAGING.shippingBullets}
            highlightFirst
          />
        </div>
        <h2 className="text-xl font-bold text-primary">Shipping rates</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Standard USA delivery</strong> — 5 business days.{" "}
            <strong>Free shipping on a ${USARAKHI_MIN_ORDER_USD} minimum cart value</strong>. Carts
            below ${USARAKHI_MIN_ORDER_USD} pay the remaining amount as shipping.
          </li>
          <li>
            <strong>Orange County products</strong> — free shipping on all of those products.
          </li>
          <li>
            <strong>Mixed carts</strong> (Orange County and UsaRakhi in the same order) — shipping is
            calculated separately. UsaRakhi needs a ${USARAKHI_MIN_ORDER_USD}{" "}
            minimum; Orange County ships free.
          </li>
        </ul>
        <h2 className="text-xl font-bold text-primary">Diwali and Bhai Dooj 2026 delivery timing</h2>
        <p>
          Diwali 2026 is <strong>November 8</strong>, and Bhai Dooj is <strong>November 10</strong>. Standard
          delivery is 5 business days after dispatch, so place the order early enough for the celebration.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 rounded-lg">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-3 border-b">Window</th>
                <th className="text-left p-3 border-b">Order by</th>
                <th className="text-left p-3 border-b">Notes</th>
              </tr>
            </thead>
            <tbody>
              {festivalDeliveryWindows.map((d) => (
                <tr key={d.label} className="border-b border-slate-100">
                  <td className="p-3 font-medium">{d.label}</td>
                  <td className="p-3">{d.orderBy}</td>
                  <td className="p-3">{d.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 className="text-xl font-bold text-primary">Ordering from outside the USA</h2>
        <p>
          Family in India, the United Kingdom, Canada, Australia, and worldwide can order on {site.domain}. Enter the
          recipient&apos;s <strong>US delivery address</strong> at checkout. We pack and ship the gift inside the
          United States.
        </p>
        <h2 className="text-xl font-bold text-primary">Packaging</h2>
        <p>
          Diwali and Bhai Dooj gifts are packed so they are ready to give. A box may include traditional
          sweets, chocolates, dry fruits, or pooja items. The product page lists exactly what is inside.
        </p>
        <h2 className="text-xl font-bold text-primary">Cities we deliver to</h2>
        <p>Popular destinations for Diwali and Bhai Dooj gifts include:</p>
        <ul className="flex flex-wrap gap-2">
          {usCityLinks.map((c) => (
            <li key={c.slug} className="text-sm text-slate-700">
              {c.label}
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
