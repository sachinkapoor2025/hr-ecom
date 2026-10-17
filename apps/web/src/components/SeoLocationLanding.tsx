import Link from "next/link";
import type { SeoLocation } from "@/lib/content/seo-data";
import { locationEditorialLinks } from "@/lib/contextual-links";
import { applyInlineLinks, createInlineLinkBudget } from "@/lib/inline-links";
import { site, whatsappChatUrl } from "@/lib/site";

const sharedCategories = [
  { label: "Diwali Gift Combos", slug: "diwali", text: "Festive hampers with sweets, dry fruits, and Diwali treats." },
  { label: "Bhai Dooj Gifts", slug: "bhai-dooj", text: "Sweets, chocolates, and gift boxes for your brother." },
  { label: "Sweet Combos", slug: "sweet-combos", text: "Traditional mithai boxes for family and friends." },
  { label: "Chocolate Combos", slug: "chocolate-combos", text: "Festive chocolate boxes for Diwali and Bhai Dooj." },
  { label: "Dry Fruit Hampers", slug: "dry-fruit-combos", text: "Almonds, cashews, pistachios, and mixed-nut gift boxes." },
  { label: "Pooja Sets", slug: "pooja-sets", text: "Thali sets and festive essentials for the Diwali puja." },
] as const;

function displayName(location: SeoLocation): string {
  if (location.region === "state") return location.name;
  if (location.state) return `${location.name}, ${location.state}`;
  return location.name;
}

function warehouseCopy(location: SeoLocation): string {
  if (!location.isCaliforniaWarehouse) return "";
  return " Our California warehouse enables faster regional dispatch to the Bay Area, Southern California, and nearby western states — a real advantage when Diwali and Bhai Dooj gifts need to arrive on time.";
}

export function buildLocationContent(location: SeoLocation) {
  const place = displayName(location);

  return {
    headline: `Send Diwali and Bhai Dooj Gifts to ${place}`,
    intro: [
      `Send Diwali gifts and Bhai Dooj gifts to ${place} with ${site.name}. We deliver festive gift combos, sweets, chocolates, and dry fruit hampers with domestic USA shipping, so your family avoids international customs delays. Relatives in India, the UK, Canada, Australia, and worldwide can order online; we fulfill from our US operations, including a California warehouse team.${warehouseCopy(location)}`,
      `Shop Diwali gift combos, Bhai Dooj hampers for your brother, traditional sweet boxes, chocolate assortments, and dry fruit hampers. Each product page lists what is packed inside.`,
    ],
    delivery: {
      heading: location.isCaliforniaWarehouse
        ? `Fast Diwali Gift Delivery to ${place} from Our California Warehouse`
        : `Diwali and Bhai Dooj Delivery Across ${place}`,
      paragraphs: [
        location.isCaliforniaWarehouse
          ? `Orders to ${place} benefit from our California-based fulfillment — many shipments dispatch quickly for 2–5 business day delivery across the metro area after processing. We use trusted US carriers with tracking.`
          : `UsaRakhi ships to homes, apartments, offices, and university addresses across ${place}. Standard nationwide delivery is 5–7 business days after dispatch. Order ahead of Diwali (November 8, 2026) and Bhai Dooj (November 10, 2026) so sweets and hampers arrive in time.`,
        `Pay securely in USD (Stripe) or INR (Razorpay). Enter the recipient's full US address at checkout. You can order from outside America while we ship domestically within the USA.`,
      ],
    },
    faqs: [
      {
        q: `Can I send Diwali gifts to ${place} from India?`,
        a: `Yes. Enter the ${place} delivery address at checkout on UsaRakhi.com. We ship domestically within the USA, so your family avoids international customs.`,
      },
      {
        q: `How long does Diwali gift delivery take to ${place}?`,
        a: location.isCaliforniaWarehouse
          ? `Many ${place} orders arrive in 2–5 business days after dispatch from our California warehouse team.`
          : `Most orders to ${place} arrive in 5–7 business days after dispatch.`,
      },
      {
        q: `When should I order for Diwali and Bhai Dooj 2026?`,
        a: "Diwali 2026 is November 8, and Bhai Dooj is November 10. Order early enough for standard USA delivery so sweets, chocolates, and dry fruit hampers arrive before the celebrations.",
      },
    ],
  };
}

interface Props {
  location: SeoLocation;
}

export function SeoLocationLanding({ location }: Props) {
  const content = buildLocationContent(location);
  const place = displayName(location);
  const articleText = [
    ...content.intro,
    ...content.delivery.paragraphs,
    ...content.faqs.map((faq) => faq.a),
  ].join("\n");
  const editorial = locationEditorialLinks(location.slug, articleText);
  const budget = createInlineLinkBudget(editorial.topical.length);

  return (
    <div className="mt-12 pt-10 border-t border-slate-200">
      {location.isCaliforniaWarehouse && (
        <div className="mb-8 rounded-xl bg-nav/5 border border-nav/20 px-5 py-4 text-sm text-slate-700">
          <strong className="text-nav">California warehouse advantage:</strong> Faster dispatch to {place} from
          our US fulfillment team — Diwali and Bhai Dooj gifts, packed and shipped domestically across America.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-10 xl:gap-12 items-start">
        <article className="lg:col-span-2 space-y-8 text-slate-700 leading-relaxed">
          <header>
            <h2 className="text-2xl font-bold text-primary mb-4">{content.headline}</h2>
            {content.intro.map((p, i) => (
              <p key={i} className="mb-4">
                {applyInlineLinks(p, editorial.topical, budget)}
              </p>
            ))}
          </header>

          <section>
            <h3 className="text-xl font-semibold text-primary mb-3">{content.delivery.heading}</h3>
            {content.delivery.paragraphs.map((p, i) => (
              <p key={i} className="mb-3">
                {applyInlineLinks(p, editorial.topical, budget)}
              </p>
            ))}
          </section>

          <section>
            <h3 className="text-xl font-semibold text-primary mb-3">Popular Diwali gift searches for {place}</h3>
            <ul className="flex flex-wrap gap-2 text-sm">
              {location.keywords.slice(0, 12).map((kw) => (
                <li key={kw} className="bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-600">
                  {kw}
                </li>
              ))}
            </ul>
          </section>
        </article>

        <aside className="space-y-6">
          <section className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Shop Diwali and Bhai Dooj Gifts for {place}</h3>
            <ul className="space-y-3 text-sm">
              {sharedCategories.map((cat) => (
                <li key={cat.slug}>
                  <span className="font-medium text-primary">{cat.label}</span>
                  <p className="text-slate-500 mt-0.5">{cat.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-nav text-white rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Order Diwali Gifts to {place}</h3>
            <p className="text-sm text-white/90 mb-4">Need help with address or delivery timing? We respond on WhatsApp and email.</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <a href={whatsappChatUrl(`Hi, I want to send gifts to ${place}.`)} target="_blank" rel="noopener noreferrer" className="border border-white/60 px-4 py-2 rounded-lg hover:bg-white/10">
                WhatsApp
              </a>
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-10 pt-8 border-t border-slate-200">
        <h3 className="text-xl font-semibold text-primary mb-6">FAQ — Diwali and Bhai Dooj Gifts to {place}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {content.faqs.map((faq) => (
            <div key={faq.q} className="bg-white border border-slate-100 rounded-xl p-5">
              <h4 className="font-semibold text-primary text-sm mb-2">{faq.q}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {applyInlineLinks(faq.a, editorial.topical, budget)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {editorial.cycle ? (
        <section className="mt-10 p-6 bg-slate-50 rounded-xl text-sm">
          <h2 className="font-semibold text-primary mb-3">Also deliver Diwali gifts nearby</h2>
          <Link href={editorial.cycle.href} className="text-nav hover:underline">
            {editorial.cycle.phrase}
          </Link>
        </section>
      ) : null}
    </div>
  );
}
