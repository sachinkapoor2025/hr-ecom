import { categoryHref } from "@/lib/category-urls";
import { homeSeoContent } from "@/lib/content/home-seo";
import { locationPublicPath } from "@/lib/content/seo-data";
import { applyInlineLinks, createInlineLinkBudget, type InlineLinkBudget } from "@/lib/inline-links";

const BOLD_PHRASE = "Diwali gift combos and sweet combos";

const HOME_SEO_LINKS = [
  { phrase: "Bhai Dooj gift hampers", href: categoryHref("bhai-dooj") },
  { phrase: "traditional Indian mithai", href: categoryHref("sweet-combos") },
  { phrase: "chocolate treats", href: categoryHref("chocolate-combos") },
  { phrase: "dry fruit gift boxes", href: categoryHref("dry-fruit-combos") },
  { phrase: "Diwali gift hampers", href: categoryHref("diwali") },
  { phrase: "New York", href: locationPublicPath("new-york") },
] as const;

function RichParagraph({ text, budget }: { text: string; budget: InlineLinkBudget }) {
  const index = text.indexOf(BOLD_PHRASE);
  if (index < 0) return <p>{applyInlineLinks(text, HOME_SEO_LINKS, budget)}</p>;
  return (
    <p>
      {applyInlineLinks(text.slice(0, index), HOME_SEO_LINKS, budget)}
      <strong>{BOLD_PHRASE}</strong>
      {applyInlineLinks(text.slice(index + BOLD_PHRASE.length), HOME_SEO_LINKS, budget)}
    </p>
  );
}

export function HomeSeoSection() {
  const { sections, whyChoose } = homeSeoContent;
  const budget = createInlineLinkBudget(6);

  return (
    <section className="bg-slate-50 border-y border-slate-200" aria-labelledby="home-seo-heading">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 space-y-8 text-slate-700 leading-relaxed">
        {sections.map((section, index) => (
          <article key={`${section.heading}-${index}`}>
            <h2
              id={index === 0 ? "home-seo-heading" : undefined}
              className="text-xl md:text-2xl font-bold text-primary mb-3"
            >
              {section.heading}
            </h2>
            <div className="space-y-3">
              {section.paragraphs.map((para) => (
                <RichParagraph key={para.slice(0, 64)} text={para} budget={budget} />
              ))}
            </div>
          </article>
        ))}

        <article>
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-3">{whyChoose.heading}</h2>
          <ul className="space-y-2 list-disc pl-5">
            {whyChoose.bullets.map((item) => (
              <li key={`${item.label}-${item.text.slice(0, 24)}`}>
                <strong>{item.label}</strong> {applyInlineLinks(item.text, HOME_SEO_LINKS, budget)}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
