import Link from "next/link";
import { cityLinks, site, whatsappChatUrl } from "@/lib/site";
import { homeSeoContent } from "@/lib/content/home-seo";

function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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

        <div className="mt-10 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <p className="text-slate-600 text-sm sm:text-base max-w-md">
            Questions about your order or rakhi delivery? Chat with our support team on WhatsApp —{" "}
            <span className="font-medium text-slate-800">{site.whatsappDisplay}</span>
          </p>
          <a
            href={whatsappChatUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] text-white font-semibold text-sm px-5 py-2.5 hover:bg-[#20bd5a] transition shadow-sm"
          >
            <WhatsAppIcon className="w-5 h-5" />
            WhatsApp Support
          </a>
        </div>
      </div>
    </section>
  );
}
