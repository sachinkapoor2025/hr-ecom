import Image from "next/image";
import Link from "next/link";
import type { Product } from "@hr-ecom/shared";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SeasonalProductCard } from "@/components/SeasonalProductCard";
import { deliveryClaims } from "@/lib/ai-recommendation";
import { applyInlineLinks, createInlineLinkBudget } from "@/lib/inline-links";
import { resolveImageUrl } from "@/lib/images";
import {
  categoryLinksFromProducts,
  groupSeasonalProducts,
  type SeasonalSection,
} from "@/lib/seasonal-gifts";
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from "@/lib/seo";
import { cityLinks, cityNavHref, site } from "@/lib/site";

const FEATURED_CITY_SLUGS = ["california", "new-york", "texas", "florida", "new-jersey", "chicago"] as const;

export type SeasonalFaq = { q: string; a: string };

export type SeasonalPageCopy = {
  path: string;
  breadcrumb: string;
  eyebrow: string;
  h1: string;
  lead: string;
  dateLabel: string;
  dateValue: string;
  dateNote: string;
  tone: "thanksgiving" | "new-year";
  intro: string[];
  introLinks: { phrase: string; href: string }[];
  sections: SeasonalSection[];
  bannerHeading: string;
  bannerText: string;
  faqs: SeasonalFaq[];
  otherOccasion: { href: string; label: string; text: string };
};

function HeroDecor({ tone }: { tone: SeasonalPageCopy["tone"] }) {
  if (tone === "new-year") {
    return (
      <svg className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 text-amber-200/30" viewBox="0 0 120 120" aria-hidden>
        <path fill="currentColor" d="M60 4l8 28h30l-24 18 9 28-23-16-23 16 9-28L22 32h30z" />
        <circle cx="18" cy="88" r="3" fill="currentColor" />
        <circle cx="96" cy="96" r="2" fill="currentColor" />
        <circle cx="100" cy="18" r="2.5" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg className="pointer-events-none absolute -left-4 bottom-0 h-32 w-40 text-amber-200/25" viewBox="0 0 160 100" aria-hidden>
      <path
        fill="currentColor"
        d="M20 80c18-28 28-28 40-8 8-24 28-36 48-28 6 18-4 36-22 44-20 8-46 6-66-8z"
      />
      <path fill="currentColor" d="M108 18c10 8 12 20 4 30-12-2-22-12-22-24 6-4 12-6 18-6z" />
    </svg>
  );
}

function HeroCollage({
  products,
  occasion,
}: {
  products: Product[];
  occasion: string;
}) {
  const shots = products.filter((product) => product.images?.[0]).slice(0, 3);
  if (!shots.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {shots.map((product, index) => (
        <Link
          key={product.slug}
          href={`/products/${product.slug}`}
          className={`relative block overflow-hidden rounded-2xl border border-white/25 bg-white shadow-lg ${
            index === 0 ? "col-span-2 aspect-[16/10] sm:aspect-[16/9]" : "aspect-square"
          }`}
        >
          <Image
            src={resolveImageUrl(product.images[0])}
            alt={`${product.name} — ${occasion} gift box for delivery in the USA`}
            fill
            priority={index === 0}
            sizes={index === 0 ? "(max-width: 768px) 100vw, 480px" : "(max-width: 768px) 45vw, 220px"}
            className="object-contain p-3"
          />
        </Link>
      ))}
    </div>
  );
}

export function SeasonalOccasionLanding({
  copy,
  products,
}: {
  copy: SeasonalPageCopy;
  products: Product[];
}) {
  const groups = groupSeasonalProducts(products, copy.sections);
  const visibleProducts = groups.flatMap((group) => group.products);
  const featured = visibleProducts[0];
  const categoryLinks = categoryLinksFromProducts(visibleProducts);
  const budget = createInlineLinkBudget(6);
  const cities = FEATURED_CITY_SLUGS.map((slug) => cityLinks.find((city) => city.slug === slug)).filter(
    (city): city is (typeof cityLinks)[number] => Boolean(city)
  );
  const imageAltSuffix =
    copy.tone === "thanksgiving"
      ? "Thanksgiving gift box for USA delivery"
      : "New Year gift box for USA delivery";

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: copy.breadcrumb, path: copy.path },
    ]),
    faqJsonLd(copy.faqs),
    itemListJsonLd(
      copy.h1,
      visibleProducts.map((product) => ({
        name: product.name,
        path: `/products/${product.slug}`,
      }))
    ),
  ];

  return (
    <div>
      <JsonLd data={jsonLd} />
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: copy.breadcrumb }]} />
      </div>

      <section className="relative overflow-hidden bg-primary text-white">
        <HeroDecor tone={copy.tone} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              copy.tone === "thanksgiving"
                ? "radial-gradient(ellipse at 85% 0%, rgba(217,119,6,0.38), transparent 46%), radial-gradient(ellipse at 0% 100%, rgba(225,29,72,0.22), transparent 42%)"
                : "radial-gradient(ellipse at 80% 10%, rgba(251,191,36,0.35), transparent 42%), radial-gradient(ellipse at 10% 90%, rgba(72,118,232,0.45), transparent 46%)",
          }}
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-amber-100 mb-3">{copy.eyebrow}</p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">{copy.h1}</h1>
            <p className="text-lg text-white/90 leading-relaxed mb-6">{copy.lead}</p>
            <div className="inline-block px-5 py-3 rounded-xl border border-amber-200/40 bg-white/10 backdrop-blur mb-6">
              <p className="text-sm text-white/75">{copy.dateLabel}</p>
              <p className="text-2xl font-bold">{copy.dateValue}</p>
              <p className="text-sm text-white/75 mt-1">{copy.dateNote}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#gifts" className="px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:opacity-90">
                Shop gift boxes
              </a>
              <Link href="/shipping" className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90">
                Shipping details
              </Link>
            </div>
            <p className="mt-5 text-sm text-white/80">{deliveryClaims.standard}</p>
          </div>
          <HeroCollage products={visibleProducts} occasion={copy.breadcrumb} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-3xl space-y-4 text-slate-700 leading-relaxed">
          {copy.intro.map((paragraph) => (
            <p key={paragraph}>{applyInlineLinks(paragraph, copy.introLinks, budget)}</p>
          ))}
        </div>
        {categoryLinks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-primary mb-3">Shop the collections these gifts come from</h2>
            <ul className="flex flex-wrap gap-2">
              {categoryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary hover:border-nav hover:text-nav"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/products"
                  className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary hover:border-nav hover:text-nav"
                >
                  All gifts
                </Link>
              </li>
            </ul>
          </div>
        )}
      </section>

      {featured && (
        <section className="relative overflow-hidden bg-primary text-white" aria-label={copy.bannerHeading}>
          <div className="absolute inset-0 opacity-25">
            {featured.images?.[0] && (
              <Image
                src={resolveImageUrl(featured.images[0])}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-14 grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest text-amber-100 mb-2">Featured from the catalog</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">{copy.bannerHeading}</h2>
              <p className="text-white/90 leading-relaxed mb-4">{copy.bannerText}</p>
              <p className="text-sm text-white/75">{deliveryClaims.fulfillment}</p>
            </div>
            <SeasonalProductCard
              product={featured}
              variant="banner"
              imageAlt={`${featured.name} — ${imageAltSuffix}`}
            />
          </div>
        </section>
      )}

      <div id="gifts" className="scroll-mt-[calc(var(--site-header-height,5rem)+1rem)]">
        {groups.map((group) => (
          <section
            key={group.section.id}
            id={group.section.id}
            className="max-w-7xl mx-auto px-4 py-12 scroll-mt-[calc(var(--site-header-height,5rem)+1rem)]"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">{group.section.heading}</h2>
            <p className="text-slate-600 mb-8 max-w-3xl leading-relaxed">{group.section.intro}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
              {group.products.map((product) => (
                <SeasonalProductCard
                  key={product.slug}
                  product={product}
                  imageAlt={`${product.name} — ${imageAltSuffix}`}
                />
              ))}
            </div>
          </section>
        ))}
        {groups.length === 0 && (
          <section className="max-w-7xl mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold text-primary mb-3">Gift boxes</h2>
            <p className="text-slate-600 mb-4">
              Nothing in this group is in stock right now. Browse the live shop for gift boxes that can be ordered today.
            </p>
            <Link href="/products" className="text-nav font-semibold hover:underline">
              Shop all gifts
            </Link>
          </section>
        )}
      </div>

      <section className="bg-slate-50 border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary mb-6">How to send a gift with {site.name}</h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Choose an in-stock gift box on this page. The photo, name, and price are the live catalog.",
              "Use Add to cart to keep browsing, or Buy now to open checkout with that gift.",
              "Enter the US delivery address and pay with the same Razorpay or Stripe options used sitewide.",
              "We pack the order in the United States and ship it domestically. Standard delivery is 5 business days with free shipping.",
            ].map((step, index) => (
              <li key={step} className="rounded-xl bg-white border border-slate-200 p-4">
                <p className="text-nav font-bold mb-2">0{index + 1}</p>
                <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-slate-600">
            <Link href="/shipping" className="text-nav font-semibold hover:underline">
              Read shipping and delivery
            </Link>
            {" · "}
            <Link href="/faq" className="text-nav font-semibold hover:underline">
              Ordering FAQ
            </Link>
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-primary mb-4">Delivered across the United States</h2>
        <p className="text-slate-600 mb-5 max-w-3xl leading-relaxed">
          These gift boxes ship to a US address. Family in another state can open the same dry fruits, sweets, or chocolates you chose here.
        </p>
        <ul className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <li key={city.slug}>
              <Link
                href={cityNavHref(city)}
                className="inline-flex rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-medium text-primary hover:text-nav"
              >
                Gifts to {city.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 md:flex md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-primary mb-2">{copy.otherOccasion.label}</h2>
            <p className="text-slate-600 leading-relaxed max-w-2xl">{copy.otherOccasion.text}</p>
          </div>
          <Link
            href={copy.otherOccasion.href}
            className="mt-4 md:mt-0 inline-flex shrink-0 px-5 py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90"
          >
            {copy.otherOccasion.label}
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-primary mb-4">Frequently asked questions</h2>
        <div className="space-y-3">
          {copy.faqs.map((faq) => (
            <details key={faq.q} className="border border-slate-200 rounded-lg p-5 bg-white group">
              <summary className="font-semibold text-primary cursor-pointer list-none flex justify-between items-start gap-4">
                <h3 className="m-0 text-base font-semibold text-primary">{faq.q}</h3>
                <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl leading-none shrink-0">
                  +
                </span>
              </summary>
              <p className="text-slate-600 mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
