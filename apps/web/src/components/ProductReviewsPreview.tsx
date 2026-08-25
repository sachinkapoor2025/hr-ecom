"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { testimonials } from "@/lib/site";
import { api } from "@/lib/api";
import type { PublicProductReview } from "@hr-ecom/shared";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "text-amber-400" : "text-slate-200"}`}
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

type PreviewItem = { key: string; name: string; rating: number; text: string };

function toPreview(reviews: PublicProductReview[]): PreviewItem[] {
  return reviews.map((r) => ({
    key: r.reviewId,
    name: r.authorName,
    rating: r.rating,
    text: r.body,
  }));
}

const fallbackPreview: PreviewItem[] = testimonials.map((t) => ({
  key: t.name,
  name: t.name,
  rating: t.rating,
  text: t.text,
}));

/** Site-wide customer reviews preview for product pages (social proof). */
export function ProductReviewsPreview() {
  const [items, setItems] = useState<PreviewItem[]>(fallbackPreview);
  const [count, setCount] = useState<number>(testimonials.length);

  useEffect(() => {
    let cancelled = false;
    api<{ reviews: PublicProductReview[] }>("/reviews", { revalidate: false })
      .then((d) => {
        if (cancelled) return;
        const live = d.reviews ?? [];
        if (!live.length) return;
        setItems(toPreview(live));
        setCount(live.length);
      })
      .catch(() => {
        /* keep curated fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const avg = items.reduce((s, t) => s + t.rating, 0) / (items.length || 1);
  const preview = items.slice(0, 2);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <StarRating rating={Math.round(avg)} />
        <span className="text-sm font-semibold text-slate-800">{avg.toFixed(1)} / 5</span>
        <span className="text-xs text-slate-500">from {count} customer stories</span>
      </div>
      <ul className="space-y-3">
        {preview.map((t) => (
          <li key={t.key} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-slate-800">{t.name}</span>
              <StarRating rating={t.rating} />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{t.text}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500">
        Real experiences from UsaRakhi customers.{" "}
        <Link href="/reviews" className="text-nav font-semibold hover:underline">
          Write a review after delivery →
        </Link>
      </p>
    </div>
  );
}
