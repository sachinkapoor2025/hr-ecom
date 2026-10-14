import Link from "next/link";
import { categoryHref } from "@/lib/category-urls";
import type { SecondaryCity } from "@/lib/content/city-delivery-tiers";
import { secondaryCityIntro } from "@/lib/content/city-delivery-tiers";
import { locationPublicPath } from "@/lib/content/seo-data";
import { site, whatsappChatUrl } from "@/lib/site";

/** Shared thin template for secondary /send-gifts-to-{city} doorways (5–7 day standard). */
export function buildSecondaryCityFaqs(city: SecondaryCity) {
  const place = `${city.name}, ${city.state}`;
  return [
    {
      q: `Can I send gifts to ${place} from India?`,
      a: `Yes. Enter the ${place} delivery address at checkout on UsaRakhi.com. We ship domestically within the USA, so your family avoids international customs.`,
    },
    {
      q: `How long does Diwali gift delivery take to ${place}?`,
      a: `Most orders to ${place} arrive in 5–7 business days after dispatch. For faster windows to major metros, see our ${city.nearbyMetroLabel} delivery page.`,
    },
    {
      q: `When should I order Diwali and Bhai Dooj gifts for ${city.name}?`,
      a: "Diwali 2026 is November 8, and Bhai Dooj is November 10. Order early enough for standard USA delivery so sweets, chocolates, and dry fruit hampers arrive before the celebrations.",
    },
  ] as const;
}

export function SecondaryCityLanding({ city }: { city: SecondaryCity }) {
  const place = `${city.name}, ${city.state}`;
  const faqs = buildSecondaryCityFaqs(city);

  return (
    <div className="mt-12 pt-10 border-t border-slate-200 max-w-3xl space-y-8 text-slate-700 leading-relaxed">
      <section>
        <h2 className="text-2xl font-bold text-primary mb-4">
          Send Diwali and Bhai Dooj Gifts to {place}
        </h2>
        <p className="mb-4">
          {secondaryCityIntro(city.slug, city.name, city.state)} Families in India, the UK, Canada, and
          worldwide order online. We fulfill from our US operations, so the gift avoids international
          customs delays.
        </p>
        <p>
          Shop Diwali gift combos, Bhai Dooj gifts, sweet boxes, chocolate assortments, and dry fruit
          hampers. Check out with Stripe (USD) or Razorpay (INR).
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-primary mb-3">Diwali and Bhai Dooj delivery to {city.name}</h3>
        <p className="mb-3">
          Standard delivery to {place} is 5–7 business days after dispatch. Nearby major-metro coverage
          is listed on our{" "}
          <Link
            href={locationPublicPath(city.nearbyMetroSlug)}
            className="text-nav font-medium hover:underline"
          >
            {city.nearbyMetroLabel} gifts delivery
          </Link>{" "}
          page.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-primary mb-3">Shop Diwali and Bhai Dooj gifts</h3>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {(
            [
              ["diwali", "Diwali Gift Combos"],
              ["bhai-dooj", "Bhai Dooj Gifts"],
              ["sweet-combos", "Sweet Combos"],
              ["chocolate-combos", "Chocolate Combos"],
              ["dry-fruit-combos", "Dry Fruit Hampers"],
              ["pooja-sets", "Pooja Sets"],
            ] as const
          ).map(([slug, label]) => (
            <li key={slug}>
              <Link href={categoryHref(slug)} className="text-nav font-medium hover:underline">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-primary mb-4">FAQ — Diwali gifts to {city.name}</h3>
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.q}>
              <h4 className="font-semibold text-primary text-sm mb-1">{f.q}</h4>
              <p className="text-sm text-slate-600">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-sm">
        Need help?{" "}
        <a
          href={whatsappChatUrl(`Hi! I want to send gifts to ${place}.`)}
          className="text-nav font-semibold hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp {site.name}
        </a>
      </p>
    </div>
  );
}
