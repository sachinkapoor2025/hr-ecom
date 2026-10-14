import Link from "next/link";
import type { GoogleReview } from "@/lib/google-reviews";

const FESTIVAL_REVIEW = /diwali|bhai\s*dooj/i;

const placeholders = [
  {
    title: "Diwali gift combos",
    detail:
      "Placeholder for a note about a Diwali hamper with mithai, dry fruits, chocolates, or a pooja set, delivered to a US address.",
  },
  {
    title: "Bhai Dooj gifts",
    detail:
      "Placeholder for a note about a Bhai Dooj box for a brother in the USA, such as sweets, chocolates, or a dry fruit hamper.",
  },
  {
    title: "Festive sweets and chocolates",
    detail:
      "Placeholder for a note about kaju katli, laddoo, or a chocolate combo shared at a Diwali or Bhai Dooj celebration.",
  },
  {
    title: "Dry fruit hampers",
    detail:
      "Placeholder for a note about almonds, cashews, or pistachios packed in a festive gift box and delivered in the USA.",
  },
] as const;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-amber-400" : "text-slate-200"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function FestivalCustomerReviews({ reviews }: { reviews: GoogleReview[] }) {
  const festival = reviews.filter((review) => review.fromGoogle && FESTIVAL_REVIEW.test(review.text));

  return (
    <section className="border-t border-slate-100 bg-white py-10 md:py-14" aria-labelledby="festival-reviews-heading">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 id="festival-reviews-heading" className="text-xl font-bold text-slate-900 md:text-2xl">
              Diwali &amp; Bhai Dooj customer reviews
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {festival.length > 0
                ? "Feedback from customers that mentions Diwali or Bhai Dooj gifts."
                : "Festival-specific reviews are not available yet. The cards below are labelled placeholders, not customer testimonials."}
            </p>
          </div>
          <Link
            href="/reviews"
            className="shrink-0 rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            All reviews
          </Link>
        </div>

        {festival.length > 0 ? (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-3">
            {festival.map((review) => (
              <article
                key={review.id}
                className="flex w-[min(100%,20.5rem)] shrink-0 snap-start flex-col rounded-2xl border border-slate-200 bg-[#f7f8fa] p-4 shadow-sm md:w-full"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-nav">Customer review</p>
                <p className="mt-2 font-semibold text-slate-900">{review.authorName}</p>
                {review.dateLabel ? <p className="text-sm text-slate-400">{review.dateLabel}</p> : null}
                <div className="mt-2">
                  <StarRating rating={review.rating} />
                </div>
                {review.text ? <p className="mt-3 text-sm leading-relaxed text-slate-700">{review.text}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {placeholders.map((item) => (
              <article
                key={item.title}
                className="flex flex-col rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4"
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Placeholder — not a customer review
                </p>
                <h3 className="mt-2 font-semibold text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.detail}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
