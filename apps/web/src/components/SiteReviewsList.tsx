import type { PublicProductReview } from "@hr-ecom/shared";

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

function formatReviewWhen(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 14) return `${days} days ago`;
  if (days < 45) return `${Math.round(days / 7)} weeks ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function SiteReviewsList({ reviews }: { reviews: PublicProductReview[] }) {
  if (!reviews.length) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 pb-4">
      <h2 className="text-xl font-bold text-primary mb-4">Reviews from UsaRakhi customers</h2>
      <ul className="space-y-4">
        {reviews.map((review) => (
          <li
            key={review.reviewId}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
              <h3 className="font-semibold text-slate-800">{review.authorName}</h3>
              <StarRating rating={review.rating} />
              {review.city ? <span className="text-xs text-slate-400">{review.city}</span> : null}
              <span className="text-xs text-slate-400">{formatReviewWhen(review.createdAt)}</span>
            </div>
            {review.title ? <p className="text-sm font-medium text-slate-800 mb-1">{review.title}</p> : null}
            <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
