import Link from "next/link";
import { cityLinks } from "@/lib/site";
import { homeSeoContent } from "@/lib/content/home-seo";

export function HomeSeoSection() {
  const { intro, categories, delivery, howItWorks, tradition } = homeSeoContent;

  return (
    <section className="bg-slate-50 border-y border-slate-200" aria-labelledby="home-seo-heading">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-14">
        <div className="grid lg:grid-cols-2 gap-x-12 gap-y-10">
          <div className="space-y-6">
            <div>
              <h2 id="home-seo-heading" className="text-xl sm:text-2xl font-bold text-primary mb-4">
                {intro.heading}
              </h2>
              {intro.paragraphs.map((para, i) => (
                <p key={i} className="text-slate-700 leading-relaxed text-sm sm:text-base mb-4 last:mb-0">
                  {para}
                </p>
              ))}
            </div>

            <div>
              <h2 className="text-lg font-bold text-primary mb-3">{tradition.heading}</h2>
              {tradition.paragraphs.map((para, i) => (
                <p key={i} className="text-slate-700 leading-relaxed text-sm sm:text-base mb-4 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-primary mb-2">{categories.heading}</h2>
              <p className="text-slate-600 text-sm mb-4">{categories.intro}</p>
              <ul className="space-y-3">
                {categories.links.map((item) => (
                  <li key={item.href} className="text-sm sm:text-base">
                    <Link href={item.href} className="font-semibold text-nav hover:underline">
                      {item.label}
                    </Link>
                    <span className="text-slate-600"> — {item.text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm">
                <Link href="/products" className="text-nav font-semibold hover:underline">
                  View all rakhis →
                </Link>
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-primary mb-3">{howItWorks.heading}</h2>
              <ol className="space-y-2 text-slate-700 text-sm sm:text-base list-decimal list-inside">
                {howItWorks.steps.map((step, i) => (
                  <li key={i} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm">
                <Link href="/shipping" className="text-nav font-semibold hover:underline">
                  Shipping & delivery details →
                </Link>
                {" · "}
                <Link href="/blog/send-rakhi-to-usa-from-india" className="text-nav font-semibold hover:underline">
                  Send from India guide →
                </Link>
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-primary mb-3">{delivery.heading}</h2>
              {delivery.paragraphs.map((para, i) => (
                <p key={i} className="text-slate-700 leading-relaxed text-sm sm:text-base mb-4 last:mb-0">
                  {para}
                </p>
              ))}
              <div className="flex flex-wrap gap-2 mt-4">
                {cityLinks.slice(0, 8).map((city) => (
                  <Link
                    key={city.slug}
                    href={`/cities/${city.slug}`}
                    className="text-xs sm:text-sm px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-nav hover:text-nav transition"
                  >
                    Rakhi to {city.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
