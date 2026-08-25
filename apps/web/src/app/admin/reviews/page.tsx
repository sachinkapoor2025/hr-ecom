"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProductReview } from "@hr-ecom/shared";

const SITE_REVIEW_SLUG = "_site";
import { useApiClient } from "@/lib/auth-context";

function formatWhen(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminReviewsPage() {
  const apiClient = useApiClient();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    apiClient<{ reviews: ProductReview[] }>("/admin/reviews")
      .then((d) => setReviews(d.reviews ?? []))
      .catch((err) => {
        setReviews([]);
        setError(err instanceof Error ? err.message : "Could not load reviews");
      })
      .finally(() => setLoading(false));
  }, [apiClient]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((r) =>
      [r.authorName, r.authorEmail, r.body, r.city, r.orderId, r.productSlug]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [reviews, search]);

  const removeReview = async (review: ProductReview) => {
    const preview = review.body.length > 80 ? `${review.body.slice(0, 80)}…` : review.body;
    if (
      !confirm(
        `Remove this review by ${review.authorName}?\n\n"${preview}"\n\nIt will disappear from the website immediately.`
      )
    ) {
      return;
    }
    setRemovingId(review.reviewId);
    setMessage("");
    setError("");
    try {
      await apiClient(
        `/admin/reviews/${encodeURIComponent(review.productSlug)}/${encodeURIComponent(review.reviewId)}`,
        { method: "DELETE" }
      );
      setReviews((prev) => prev.filter((r) => r.reviewId !== review.reviewId));
      setMessage(`Removed review by ${review.authorName}. It is no longer shown on the website.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove review");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Customer reviews</h1>
      <p className="text-sm text-slate-600 mb-6">
        Reviews are published on the website as soon as a customer submits them. Remove spam,
        abusive, or inappropriate reviews here — they are deleted from the storefront immediately.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="search"
          placeholder="Search name, email, or review text…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-full sm:w-80"
        />
        <p className="text-xs text-slate-500">{filtered.length} review{filtered.length === 1 ? "" : "s"}</p>
      </div>

      {message && <p className="text-sm text-green-700 mb-3">{message}</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="bg-white border rounded-lg overflow-x-auto">
        {loading ? (
          <p className="p-4 text-slate-500">Loading reviews…</p>
        ) : filtered.length === 0 ? (
          <p className="p-4 text-slate-600">No customer reviews yet.</p>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Review</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review.reviewId} className="border-t align-top">
                  <td className="py-3 px-4">
                    <p className="font-medium">{review.authorName}</p>
                    {review.authorEmail ? (
                      <p className="text-xs text-slate-500">{review.authorEmail}</p>
                    ) : null}
                    {review.city ? <p className="text-xs text-slate-400">{review.city}</p> : null}
                    <p className="text-[11px] text-slate-400 mt-1">
                      {review.productSlug === SITE_REVIEW_SLUG ? "Site review" : review.productSlug}
                      {review.orderId ? ` · ${review.orderId}` : ""}
                    </p>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">{review.rating} / 5</td>
                  <td className="py-3 px-4 max-w-md">
                    {review.title ? <p className="font-medium mb-1">{review.title}</p> : null}
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{review.body}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                    {formatWhen(review.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => void removeReview(review)}
                      disabled={removingId === review.reviewId}
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                    >
                      {removingId === review.reviewId ? "Removing…" : "Remove review"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
