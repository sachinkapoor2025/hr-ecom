import Link from "next/link";
import type { Product } from "@hr-ecom/shared";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HomeProductCard } from "@/components/HomeProductCard";
import { JsonLd } from "@/components/JsonLd";
import type { CountryGiftPage } from "@/lib/content/country-gift-pages";
import { site, whatsappChatUrl } from "@/lib/site";
import { faqJsonLd, itemListJsonLd } from "@/lib/seo";

/** Products first, then country-specific gift copy. Same card grid as US location pages. */
export function CountryGiftLanding({
  page,
  products,
}: {
  page: CountryGiftPage;
  products: Product[];
}) {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: page.menuLabel },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 min-w-0 overflow-x-hidden">
      <JsonLd
        data={[
          faqJsonLd(page.faqs),
          itemListJsonLd(
            page.menuLabel,
            products.slice(0, 24).map((p) => ({
              name: p.name,
              path: `/products/${p.slug}`,
            }))
          ),
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold text-primary mb-2 break-words">{page.heading}</h1>
      <p className="text-slate-600 mb-8 max-w-3xl">{page.intro}</p>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <HomeProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-slate-600 py-8">
          Gifts are not available to load right now.{" "}
          <Link href="/products" className="text-nav font-semibold hover:underline">
            Browse all gifts
          </Link>
          .
        </p>
      )}

      <div className="mt-12 pt-10 border-t border-slate-200">
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-14">
          <article className="space-y-8 text-slate-700 leading-relaxed min-w-0">
            <header>
              <h2 className="text-2xl font-bold text-primary mb-4">{page.headline}</h2>
            </header>
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="text-xl font-semibold text-primary mb-3">{section.heading}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </article>

          <aside className="space-y-6 min-w-0">
            <section className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">How to send the gift</h3>
              <ol className="space-y-3 text-sm list-decimal list-inside marker:font-semibold marker:text-nav">
                {page.howTo.map((step) => (
                  <li key={step} className="pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Shop by gift type</h3>
              <ul className="space-y-3 text-sm">
                {page.categories.map((cat) => (
                  <li key={cat.href}>
                    <Link href={cat.href} className="font-medium text-nav hover:underline">
                      {cat.label}
                    </Link>
                    <p className="text-slate-500 mt-0.5">{cat.text}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-nav text-white rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Need help choosing?</h3>
              <p className="text-sm text-white/90 mb-4">
                {site.name} can help you match a sweet box, chocolate combo, or hamper to the US address you are sending to.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link
                  href="/contact"
                  className="bg-white text-nav px-4 py-2 rounded-lg font-medium hover:bg-slate-100"
                >
                  Contact us
                </Link>
                <a
                  href={whatsappChatUrl(page.whatsappPrefill)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white/60 px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  WhatsApp
                </a>
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-10 pt-8 border-t border-slate-200">
          <h2 className="text-xl font-semibold text-primary mb-6">Questions about this page</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {page.faqs.map((faq) => (
              <div key={faq.q} className="bg-white border border-slate-100 rounded-xl p-5">
                <h3 className="font-semibold text-primary text-sm mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
