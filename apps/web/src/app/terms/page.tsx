import type { Metadata } from "next";
import Link from "next/link";
import { applyInlineLinks } from "@/lib/inline-links";
import { USARAKHI_MIN_ORDER_USD } from "@hr-ecom/shared";
import { trustFacts } from "@/lib/trust";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description: `Terms and conditions for shopping on ${site.name}.com — Diwali and Bhai Dooj gift delivery in the United States.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-6">Terms &amp; Conditions</h1>
      <div className="space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
        <p>
          Welcome to {site.name}.com. By accessing our website or placing an order, you agree to the following Terms
          &amp; Conditions. Please read them carefully before making a purchase.
        </p>
        <p>
          {site.name}.com is operated by {trustFacts.operator}. Questions about an order can be sent to{" "}
          <a href={`mailto:${site.supportEmail}`} className="text-nav underline">
            {site.supportEmail}
          </a>{" "}
          or WhatsApp {site.whatsappDisplay}.
        </p>

        <h2 className="text-xl font-bold text-primary">1. Orders &amp; Delivery</h2>
        <p>
          {applyInlineLinks(
            "UsaRakhi delivers Diwali and Bhai Dooj gift combos to addresses within the United States. Estimated delivery time is typically 5–7 business days, depending on the delivery location and other circumstances.",
            [
              { phrase: "Diwali", href: "/diwali-to-usa" },
              { phrase: "Bhai Dooj", href: "/bhai-dooj-to-usa" },
            ]
          )}
        </p>
        <p>
          Customers are responsible for providing a complete and accurate US shipping address and valid contact details
          at checkout. Delivery delays may occur due to unforeseen circumstances, courier issues, or other factors
          beyond our control.
        </p>
        <p>
          Standard USA delivery and the ${USARAKHI_MIN_ORDER_USD} free-shipping minimum are described on our{" "}
          <Link href="/shipping" className="text-nav underline">
            Shipping &amp; Delivery
          </Link>{" "}
          page. Gifts are fulfilled for delivery inside the United States.
        </p>

        <h2 className="text-xl font-bold text-primary">2. Pricing &amp; Payment</h2>
        <p>Product prices are displayed in the applicable currency, USD or INR, as shown at checkout.</p>
        <p>
          Payments are processed securely through Razorpay for both USD and INR. UsaRakhi
          does not store customers’ card details on its servers.
        </p>
        <p>
          Customers are responsible for reviewing the final order total and applicable charges before completing
          payment.
        </p>

        <h2 className="text-xl font-bold text-primary">3. Cancellations &amp; Order Changes</h2>
        <p>
          For cancellation requests or changes to an existing order, please contact our support team as soon as
          possible. Requests are subject to order processing status. Orders can be cancelled before dispatch. Once a
          parcel has shipped within the USA, a cancellation may not be possible.
        </p>
        <p>
          Damaged, defective, or incorrect items are covered on our{" "}
          <Link href="/returns" className="text-nav underline">
            Returns &amp; Satisfaction Guarantee
          </Link>{" "}
          page, including the request to contact us within 48 hours of delivery with the order number and photos.
        </p>

        <h2 className="text-xl font-bold text-primary">4. Delivery Issues &amp; Customer Support</h2>
        <p>If you experience a delivery issue or need assistance with your order, please contact us using the details below:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${site.supportEmail}`} className="text-nav underline">
              {site.supportEmail}
            </a>
          </li>
          <li>
            <strong>WhatsApp:</strong> {site.whatsappDisplay}
          </li>
        </ul>
        <p>Our support team will assist you with your order-related queries.</p>

        <h2 className="text-xl font-bold text-primary">5. Changes to These Terms</h2>
        <p>
          UsaRakhi reserves the right to update or modify these Terms &amp; Conditions when necessary. Any changes will
          be published on this page.
        </p>

        <h2 className="text-xl font-bold text-primary">6. Privacy</h2>
        <p>
          How we handle name, email, phone, shipping address, and payment status is described in our{" "}
          <Link href="/privacy" className="text-nav underline">
            Privacy Policy
          </Link>
          . Payment partners process card payments. {site.name} does not store full card numbers.
        </p>

        <h2 className="text-xl font-bold text-primary">7. Contact Us</h2>
        <p>
          For questions regarding these Terms &amp; Conditions, please contact us at{" "}
          <a href={`mailto:${site.supportEmail}`} className="text-nav underline">
            {site.supportEmail}
          </a>
          .
        </p>

        <p className="text-slate-500 text-sm">Last updated: October 2026</p>
      </div>
    </div>
  );
}
