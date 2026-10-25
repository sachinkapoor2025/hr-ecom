import { deliveryClaims } from "@/lib/ai-recommendation";
import { categoryHref } from "@/lib/category-urls";
import { applyInlineLinks, createInlineLinkBudget } from "@/lib/inline-links";
import { site, whatsappChatUrl } from "@/lib/site";
import { TrustBadges } from "@/components/TrustBadges";

const highlights = [
  {
    icon: "🛒",
    title: "Order Diwali and Bhai Dooj gifts online",
    detail:
      "Choose a ready-to-gift hamper, enter a US address, and check out on the site. Diwali combos and Bhai Dooj combos are listed separately so the box matches the occasion.",
  },
  {
    icon: "🇺🇸",
    title: "Delivery information for USA addresses",
    detail: `${deliveryClaims.standard}. Ships from within the USA with domestic fulfillment, so the parcel is not an international customs shipment.`,
  },
  {
    icon: "🎁",
    title: "Gift selection you can read before you buy",
    detail:
      "Hampers list what is inside: sweets, dry fruits, chocolates, pooja sets, and Bhai Dooj cards where the product includes them.",
  },
  {
    icon: "🔒",
    title: "Secure checkout",
    detail: "Pay in USD with Stripe or in INR with Razorpay. Card numbers are not stored on UsaRakhi.",
  },
  {
    icon: "💬",
    title: "Customer support",
    detail: `${site.whatsappDisplay} on WhatsApp and ${site.supportEmail} for order questions before and after delivery.`,
    href: whatsappChatUrl("Hi UsaRakhi, I have a question about a Diwali or Bhai Dooj gift."),
    external: true,
  },
  {
    icon: "🚚",
    title: "Ships within the United States",
    detail: `${deliveryClaims.dispatch}. The parcel to your family is a domestic US shipment.`,
  },
] as const;

export function WhyTrustUsSection() {
  return (
    <section className="bg-white border-y border-slate-100" aria-labelledby="why-trust-heading">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-14">
        <div className="mb-10 text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-nav mb-2">Diwali &amp; Bhai Dooj gifts</p>
          <h2 id="why-trust-heading" className="text-2xl md:text-3xl font-bold text-primary mb-3">
            Why families trust UsaRakhi for Diwali and Bhai Dooj delivery in the USA
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {applyInlineLinks(
              `Send Diwali gifts and Bhai Dooj gifts to people you love in the United States. ${site.name} lists festive hampers you can order online, with domestic shipping, secure checkout, and support if you need help with the address or the order.`,
              [
                { phrase: "Diwali gifts", href: categoryHref("diwali") },
                { phrase: "Bhai Dooj gifts", href: categoryHref("bhai-dooj") },
              ]
            )}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {highlights.map((item) => {
            const inner = (
              <>
                <span className="text-2xl mb-2 block" aria-hidden>
                  {item.icon}
                </span>
                <h3 className="font-bold text-primary text-sm mb-1.5">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {applyInlineLinks(
                    item.detail,
                    [
                      { phrase: "pooja sets", href: categoryHref("pooja-sets") },
                      { phrase: "domestic fulfillment", href: "/shipping" },
                    ],
                    createInlineLinkBudget(1)
                  )}
                </p>
              </>
            );
            if ("href" in item && item.href && "external" in item && item.external) {
              return (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 hover:border-nav hover:shadow-sm transition"
                >
                  {inner}
                </a>
              );
            }
            return (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                {inner}
              </div>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto">
          <TrustBadges />
        </div>
      </div>
    </section>
  );
}
