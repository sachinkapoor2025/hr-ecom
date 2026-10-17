import { isRakhiContentHidden, textMentionsRakhi } from "@hr-ecom/shared";
import type { GoogleReview } from "@/lib/google-reviews";

const FESTIVAL_REVIEW = /diwali|bhai\s*dooj/i;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-gold" : "text-slate-200"}`}
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

function CustomerBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      UsaRakhi customer
    </span>
  );
}

function visibleFestivalReviews(reviews: GoogleReview[]): GoogleReview[] {
  return reviews.filter((review) => {
    if (!review.text?.trim()) return false;
    if (isRakhiContentHidden() && textMentionsRakhi(review.text)) return false;
    return FESTIVAL_REVIEW.test(review.text);
  });
}

/** Same portrait cards as the original customer stories. No placeholder quotes. */
export function FestivalCustomerReviews({ reviews }: { reviews: GoogleReview[] }) {
  const festival = visibleFestivalReviews(reviews);
  if (!festival.length) return null;

  return (
    <section className="bg-white border-t border-slate-100 py-12 md:py-16" aria-labelledby="festival-reviews-heading">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 id="festival-reviews-heading" className="text-2xl md:text-3xl font-bold text-primary">
              Diwali &amp; Bhai Dooj customer reviews
            </h2>
            <p className="mt-3 text-slate-600 text-sm md:text-base max-w-2xl leading-relaxed">
              Stories from customers who mentioned a Diwali or Bhai Dooj gift.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {festival.map((review) => (
            <article key={review.id} className="flex flex-col">
              <div className="relative w-full max-w-[220px] aspect-[2/3] rounded-[999px] overflow-hidden bg-slate-100 mb-5 mx-auto sm:mx-0">
                {review.profilePhotoUrl ? (
                  <img
                    src={review.profilePhotoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-3xl font-bold text-white">
                    {(review.authorName.trim().charAt(0) || "?").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                <h3 className="text-lg font-bold text-slate-800">{review.authorName}</h3>
                <CustomerBadge />
                {review.dateLabel ? <span className="text-xs text-slate-400">{review.dateLabel}</span> : null}
              </div>
              <StarRating rating={review.rating} />
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{review.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
