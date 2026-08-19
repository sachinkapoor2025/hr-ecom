import type { BlogFaqItem } from "@/lib/content/blog-posts";

/** Accordion FAQs — same pattern as the site FAQ page, for consistent blog layout. */
export function BlogFaqSection({ faqs }: { faqs: BlogFaqItem[] }) {
  if (!faqs.length) return null;
  return (
    <section className="mt-10 min-w-0">
      <h2 className="text-xl font-bold text-primary mb-4 break-words">Frequently asked questions</h2>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <details key={faq.q} className="border border-slate-200 rounded-lg p-5 bg-white group">
            <summary className="font-semibold text-primary cursor-pointer list-none flex justify-between items-start gap-4">
              <span className="break-words pr-2">{faq.q}</span>
              <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl leading-none shrink-0">
                +
              </span>
            </summary>
            <p className="text-slate-600 mt-3 leading-relaxed break-words">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
