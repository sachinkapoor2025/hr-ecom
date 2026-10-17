import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import type { CategoryRichContent, CategoryRichSection } from "@/lib/content/category-rich-content";
import { categoryInlineLinks, normalizeHref } from "@/lib/contextual-links";
import { applyInlineLinks, createInlineLinkBudget } from "@/lib/inline-links";
import { whatsappChatUrl } from "@/lib/site";

interface Props {
  content: CategoryRichContent;
  categoryName: string;
}

function RichText({
  text,
  links,
  budget,
}: {
  text: string;
  links: readonly { phrase: string; href: string }[];
  budget: ReturnType<typeof createInlineLinkBudget>;
}): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {applyInlineLinks(part.slice(2, -2), links, budget)}
            </strong>
          );
        }
        return <Fragment key={i}>{applyInlineLinks(part, links, budget)}</Fragment>;
      })}
    </>
  );
}

function ArticleSection({
  section,
  links,
  budget,
}: {
  section: CategoryRichSection;
  links: readonly { phrase: string; href: string }[];
  budget: ReturnType<typeof createInlineLinkBudget>;
}) {
  return (
    <section>
      <h3 className="text-xl font-semibold text-primary mb-3">{section.heading}</h3>
      {section.paragraphs?.map((p, i) => (
        <p key={i} className="mb-3">
          <RichText text={p} links={links} budget={budget} />
        </p>
      ))}
      {section.items && section.items.length > 0 && (
        <ul className="space-y-2 mb-3">
          {section.items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-nav mt-0.5 shrink-0">•</span>
              <span>
                <RichText text={item} links={links} budget={budget} />
              </span>
            </li>
          ))}
        </ul>
      )}
      {section.steps && section.steps.length > 0 && (
        <ol className="space-y-3 mb-3 list-decimal list-inside marker:font-semibold marker:text-nav">
          {section.steps.map((step, i) => (
            <li key={i} className="pl-1">
              <RichText text={step} links={links} budget={budget} />
            </li>
          ))}
        </ol>
      )}
      {section.closing?.map((p, i) => (
        <p key={i} className="mb-3">
          <RichText text={p} links={links} budget={budget} />
        </p>
      ))}
    </section>
  );
}

export function CategoryContentSection({ content, categoryName }: Props) {
  const articleText = [
    ...content.intro,
    ...(content.sections ?? []).flatMap((section) => [
      ...(section.paragraphs ?? []),
      ...(section.items ?? []),
      ...(section.steps ?? []),
      ...(section.closing ?? []),
    ]),
    ...(content.delivery?.paragraphs ?? []),
    ...(content.highlights?.paragraphs ?? []),
    ...(content.highlights?.items ?? []),
    ...(content.tradition?.paragraphs ?? []),
    ...(content.whyUs?.bullets ?? []),
    ...(content.howTo?.steps ?? []),
    ...content.faqs.map((faq) => faq.a),
    content.support?.body ?? "",
  ].join("\n");
  const inlineLinks = categoryInlineLinks(content.slug, articleText);
  const budget = createInlineLinkBudget(4);
  const usedHrefs = new Set(inlineLinks.map((link) => normalizeHref(link.href)));
  const usedAnchors = new Set(inlineLinks.map((link) => link.phrase.toLowerCase()));
  const sidebarRoom = Math.max(0, 4 - inlineLinks.length);
  const sidebarHrefs = new Set<string>();
  for (const cat of content.relatedCategories) {
    if (sidebarHrefs.size >= sidebarRoom) break;
    const href = normalizeHref(cat.href);
    const anchor = cat.label.toLowerCase();
    if (usedHrefs.has(href) || usedAnchors.has(anchor)) continue;
    if (href === "/contact") continue;
    usedHrefs.add(href);
    usedAnchors.add(anchor);
    sidebarHrefs.add(cat.href);
  }
  const supportHeading = content.support?.heading ?? `Need help choosing ${categoryName}?`;
  const supportBody =
    content.support?.body ??
    "Our team helps sisters pick the perfect rakhi and confirm US delivery addresses.";
  const whatsappText =
    content.support?.whatsappText ?? `Hi, I need help with ${categoryName}.`;

  return (
    <div className="mt-12 pt-10 border-t border-slate-200">
      <div className="grid lg:grid-cols-3 gap-10 xl:gap-12 items-start">
        <article className="lg:col-span-2 space-y-8 text-slate-700 leading-relaxed">
          <header>
            <h2 className="text-2xl font-bold text-primary mb-4">{content.headline}</h2>
            {content.intro.map((p, i) => (
              <p key={i} className="mb-4">
                <RichText text={p} links={inlineLinks} budget={budget} />
              </p>
            ))}
          </header>

          {content.sections && content.sections.length > 0 ? (
            content.sections.map((section) => (
              <ArticleSection key={section.heading} section={section} links={inlineLinks} budget={budget} />
            ))
          ) : (
            <>
              {content.delivery && (
                <section>
                  <h3 className="text-xl font-semibold text-primary mb-3">{content.delivery.heading}</h3>
                  {content.delivery.paragraphs.map((p, i) => (
                    <p key={i} className="mb-3">
                      <RichText text={p} links={inlineLinks} budget={budget} />
                    </p>
                  ))}
                </section>
              )}

              {content.highlights && (
                <section>
                  <h3 className="text-xl font-semibold text-primary mb-3">{content.highlights.heading}</h3>
                  {content.highlights.paragraphs && content.highlights.paragraphs.length > 0 ? (
                    <div className="space-y-3 text-slate-700 leading-relaxed">
                      {content.highlights.paragraphs.map((p, i) => (
                        <p key={i}>
                          <RichText text={p} links={inlineLinks} budget={budget} />
                        </p>
                      ))}
                    </div>
                  ) : (
                    <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                      {content.highlights.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-nav mt-0.5 shrink-0">✓</span>
                          <RichText text={item} links={inlineLinks} budget={budget} />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {content.tradition && (
                <section>
                  <h3 className="text-xl font-semibold text-primary mb-3">{content.tradition.heading}</h3>
                  {content.tradition.paragraphs.map((p, i) => (
                    <p key={i} className="mb-3">
                      <RichText text={p} links={inlineLinks} budget={budget} />
                    </p>
                  ))}
                </section>
              )}

              {(content.whyUs || content.howTo) && (
                <div className="grid sm:grid-cols-2 gap-6">
                  {content.whyUs && (
                    <section className="bg-slate-50 rounded-xl p-6 h-full">
                      <h3 className="text-lg font-semibold text-primary mb-4">{content.whyUs.heading}</h3>
                      <ul className="space-y-2 text-sm">
                        {content.whyUs.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2">
                            <span className="text-accent font-bold shrink-0">•</span>
                            <RichText text={b} links={inlineLinks} budget={budget} />
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {content.howTo && (
                    <section className="bg-white border border-slate-200 rounded-xl p-6 h-full">
                      <h3 className="text-lg font-semibold text-primary mb-4">{content.howTo.heading}</h3>
                      <ol className="space-y-3 text-sm list-decimal list-inside marker:font-semibold marker:text-nav">
                        {content.howTo.steps.map((step, i) => (
                          <li key={i} className="pl-1">
                            <RichText text={step} links={inlineLinks} budget={budget} />
                          </li>
                        ))}
                      </ol>
                    </section>
                  )}
                </div>
              )}
            </>
          )}
        </article>

        <aside className="lg:sticky lg:top-[calc(var(--site-header-height,10.5rem)+1rem)] lg:z-10">
          <section className="bg-nav text-white rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">{supportHeading}</h3>
            <p className="text-sm text-white/90 mb-4">
              <RichText text={supportBody} links={inlineLinks} budget={budget} />
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href="/contact"
                className="bg-white text-nav px-4 py-2 rounded-lg font-medium hover:bg-slate-100"
              >
                Contact us
              </Link>
              <a
                href={whatsappChatUrl(whatsappText)}
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

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <section className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            {content.relatedHeading ?? "Explore More Collections"}
          </h3>
          <ul className="space-y-3 text-sm">
            {content.relatedCategories.map((cat) => (
              <li key={cat.href}>
                {sidebarHrefs.has(cat.href) ? (
                  <Link href={cat.href} className="font-medium text-nav hover:underline">
                    {cat.label}
                  </Link>
                ) : (
                  <span className="font-medium text-primary">{cat.label}</span>
                )}
                <p className="text-slate-500 mt-0.5">
                  <RichText text={cat.text} links={inlineLinks} budget={budget} />
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-primary mb-3">{supportHeading}</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            <RichText text={supportBody} links={inlineLinks} budget={budget} />
          </p>
          <a
            href={whatsappChatUrl(whatsappText)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-semibold text-nav hover:underline"
          >
            Chat on WhatsApp →
          </a>
        </section>
      </div>

      {content.faqs.length > 0 && (
        <section className="mt-10 pt-8 border-t border-slate-200">
          <h3 className="text-xl font-semibold text-primary mb-6">
            {content.faqHeading ?? `Frequently Asked Questions — ${categoryName}`}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {content.faqs.map((faq) => (
              <div key={faq.q} className="bg-white border border-slate-100 rounded-xl p-5">
                <h4 className="font-semibold text-primary text-sm mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <RichText text={faq.a} links={inlineLinks} budget={budget} />
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
