import type { Metadata } from "next";
import Link from "next/link";
import { applyInlineLinks } from "@/lib/inline-links";
import { GoogleReviews } from "@/components/GoogleReviews";
import { getGoogleReviews } from "@/lib/google-reviews";
import { ReviewForm } from "@/components/ReviewForm";
import { PublishedReviewsLoader } from "@/components/PublishedReviewsLoader";
import { JsonLd } from "@/components/JsonLd";
import { publicTestimonials, site, testimonials } from "@/lib/site";
import { USARAKHI_MIN_ORDER_USD } from "@hr-ecom/shared";
import { pageMetadata, canonical } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Customer Reviews — Diwali and Bhai Dooj Gifts USA",
  description:
    "Read reviews of UsaRakhi Diwali and Bhai Dooj gift delivery in the USA. Share how your festive hamper, sweets, chocolates, or dry fruits arrived.",
  path: "/reviews",
});

export const revalidate = 21600;

function reviewsPageJsonLd(ratingValue: number, reviewCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Customer Reviews — ${site.name}`,
    url: canonical("/reviews"),
    description: "Customer reviews for UsaRakhi Diwali and Bhai Dooj gift delivery in the USA.",
    mainEntity: {
      "@type": "Product",
      name: `${site.name} Diwali and Bhai Dooj Gifts`,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: ratingValue.toFixed(1),
        reviewCount: String(reviewCount),
        bestRating: "5",
      },
    },
  };
}

export default async function ReviewsPage() {
  const googleReviews = await getGoogleReviews();
  const avg =
    googleReviews.rating ??
    (publicTestimonials().length
      ? publicTestimonials().reduce((s, t) => s + t.rating, 0) / publicTestimonials().length
      : testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length);
  const count = googleReviews.totalCount ?? (publicTestimonials().length || testimonials.length);

  return (
    <div>
      <JsonLd data={reviewsPageJsonLd(avg, count)} />
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-6">
        <h1 className="text-3xl font-bold text-primary mb-3">Customer Reviews</h1>
        <p className="text-slate-600 leading-relaxed mb-2">
          Families order Diwali gift combos and Bhai Dooj gifts from UsaRakhi for delivery across the United States.
          Orders ship from within America, so sweets, chocolates, dry fruits, and pooja sets are not held in
          international customs.
        </p>
        <p className="text-sm text-slate-500">
          Received a Diwali or Bhai Dooj gift?{" "}
          <a href="#write-review" className="text-nav font-semibold hover:underline">
            Write a review below
          </a>{" "}
          — it helps other families choose a festive hamper with confidence.
          {googleReviews.mapsUrl ? (
            <>
              {" "}
              Or{" "}
              <a
                href={googleReviews.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-nav font-semibold hover:underline"
              >
                leave a Google review
              </a>
              .
            </>
          ) : null}
        </p>
      </section>

      <GoogleReviews data={googleReviews} />

      <PublishedReviewsLoader />

      <section className="max-w-3xl mx-auto px-4 pb-4 text-slate-700 leading-relaxed">
        <h2 className="text-xl font-bold text-primary mb-3">How to read reviews before you order</h2>
        <p className="mb-4">
          {applyInlineLinks(
            `This page collects feedback on ${site.name} Diwali and Bhai Dooj gift delivery to US addresses. Google reviews appear when they are available, followed by reviews published on the site. The form is for customers who have already received an order and want to describe that delivery in their own words.`,
            [
              { phrase: "Diwali", href: "/diwali-to-usa" },
              { phrase: "Bhai Dooj", href: "/bhai-dooj-to-usa" },
            ]
          )}
        </p>
        <p>
          Use the comments to judge packaging, communication, and whether the hamper matched its listing. Product
          photos, price, and what is included still come from each product page. Delivery timing and the $
          {USARAKHI_MIN_ORDER_USD} free-shipping minimum are spelled out on the{" "}
          <Link href="/shipping" className="text-nav font-semibold hover:underline">
            shipping page
          </Link>
          .
        </p>
      </section>

      <section id="write-review" className="max-w-xl mx-auto px-4 py-12 scroll-mt-24">
        <h2 className="text-xl font-bold text-primary mb-2">Share your experience</h2>
        <p className="text-sm text-slate-600 mb-6">After delivery, tell us how it went.</p>
        <ReviewForm />
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12 text-center text-sm text-slate-500">
        <Link href="/about" className="text-nav hover:underline">
          About our California team
        </Link>
        {" · "}
        <Link href="/faq" className="text-nav hover:underline">
          FAQ
        </Link>
      </section>
    </div>
  );
}
