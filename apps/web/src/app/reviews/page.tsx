import type { Metadata } from "next";
import Link from "next/link";
import { GoogleReviews } from "@/components/GoogleReviews";
import { getGoogleReviews } from "@/lib/google-reviews";
import { ReviewForm } from "@/components/ReviewForm";
import { SiteReviewsList } from "@/components/SiteReviewsList";
import { JsonLd } from "@/components/JsonLd";
import { trustFacts } from "@/lib/trust";
import { site } from "@/lib/site";
import { pageMetadata, canonical } from "@/lib/seo";
import { api } from "@/lib/api";
import type { PublicProductReview } from "@hr-ecom/shared";

export const metadata: Metadata = pageMetadata({
  title: "Customer Reviews — Send Rakhi to USA",
  description:
    "Read sister reviews of UsaRakhi USA Rakhi delivery. Share your Raksha Bandhan experience — California fulfillment, domestic US shipping, 5–7 day delivery.",
  path: "/reviews",
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

function reviewsPageJsonLd(ratingValue: number, reviewCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Customer Reviews — ${site.name}`,
    url: canonical("/reviews"),
    description: "Customer reviews for UsaRakhi USA Rakhi delivery.",
    mainEntity: {
      "@type": "Product",
      name: `${site.name} Rakhi USA Delivery`,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: ratingValue.toFixed(1),
        reviewCount: String(reviewCount),
        bestRating: "5",
      },
    },
  };
}

async function loadSiteReviews(): Promise<PublicProductReview[]> {
  try {
    const data = await api<{ reviews: PublicProductReview[] }>("/reviews", { revalidate: false });
    return data.reviews ?? [];
  } catch {
    return [];
  }
}

export default async function ReviewsPage() {
  const [googleReviews, siteReviews] = await Promise.all([getGoogleReviews(), loadSiteReviews()]);
  const siteAvg =
    siteReviews.length > 0
      ? siteReviews.reduce((s, r) => s + r.rating, 0) / siteReviews.length
      : null;
  const avg =
    googleReviews.rating ??
    siteAvg ??
    5;
  const count = googleReviews.totalCount ?? siteReviews.length;

  return (
    <div>
      <JsonLd data={reviewsPageJsonLd(avg, Math.max(count, siteReviews.length))} />
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-6">
        <h1 className="text-3xl font-bold text-primary mb-3">Customer Reviews</h1>
        <p className="text-slate-600 leading-relaxed mb-2">
          {trustFacts.seasonLabel} — we&apos;re building trust one delivery at a time. Sisters worldwide order from
          UsaRakhi for {trustFacts.fulfillment.toLowerCase()}.
        </p>
        <p className="text-sm text-slate-500">
          Received your Rakhi?{" "}
          <a href="#write-review" className="text-nav font-semibold hover:underline">
            Write a review below
          </a>{" "}
          — it is published on this page right away and helps other sisters (and AI assistants) find a reliable USA
          Rakhi store.
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

      <div className="pt-10">
        <SiteReviewsList reviews={siteReviews} />
      </div>

      <section id="write-review" className="max-w-xl mx-auto px-4 py-12 scroll-mt-24">
        <h2 className="text-xl font-bold text-primary mb-2">Share your experience</h2>
        <p className="text-sm text-slate-600 mb-6">
          After delivery, tell us how it went. Your review is published on this page as soon as you submit it.
        </p>
        <ReviewForm />
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12 text-center text-sm text-slate-500">
        <Link href="/about" className="text-nav hover:underline">
          About our California team
        </Link>
        {" · "}
        <Link href="/shipping" className="text-nav hover:underline">
          Shipping & delivery
        </Link>
        {" · "}
        <Link href="/faq" className="text-nav hover:underline">
          FAQ
        </Link>
      </section>
    </div>
  );
}
