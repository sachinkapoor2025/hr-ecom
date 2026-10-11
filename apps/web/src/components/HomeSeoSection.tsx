import { homeSeoContent } from "@/lib/content/home-seo";

const BOLD_PHRASE = "Diwali gift combos and sweet combos";

function paragraphWithBold(text: string) {
  const index = text.indexOf(BOLD_PHRASE);
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <strong>{BOLD_PHRASE}</strong>
      {text.slice(index + BOLD_PHRASE.length)}
    </>
  );
}

export function HomeSeoSection() {
  const { sections, whyChoose } = homeSeoContent;

  return (
    <section className="bg-slate-50 border-y border-slate-200" aria-labelledby="home-seo-heading">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8 text-slate-700 leading-relaxed">
        {sections.map((section, index) => (
          <article key={section.heading}>
            <h2
              id={index === 0 ? "home-seo-heading" : undefined}
              className="text-xl md:text-2xl font-bold text-primary mb-3"
            >
              {section.heading}
            </h2>
            {section.paragraphs.map((para) => (
              <p key={para.slice(0, 48)}>{paragraphWithBold(para)}</p>
            ))}
          </article>
        ))}

        <article>
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-3">{whyChoose.heading}</h2>
          <ul className="space-y-2">
            {whyChoose.bullets.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong> {item.text}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
