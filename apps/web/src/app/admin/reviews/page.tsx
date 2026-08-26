"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AdminReview, AdminReviewStatus } from "@hr-ecom/shared";
import { ADMIN_REVIEW_ORIGIN, ADMIN_REVIEW_STATUS, SITE_REVIEW_SLUG } from "@hr-ecom/shared";
import { useApiClient } from "@/lib/auth-context";
import { downloadCsv, paginate, sortItems, type SortDir } from "@/lib/admin-utils";
import { TableControls } from "@/components/admin/TableControls";
import { statusLabel } from "@/lib/order-status";

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

function statusBadgeClass(status: AdminReviewStatus): string {
  if (status === ADMIN_REVIEW_STATUS.PUBLISHED) return "bg-green-100 text-green-800";
  if (status === ADMIN_REVIEW_STATUS.UNPUBLISHED) return "bg-amber-100 text-amber-800";
  return "bg-slate-200 text-slate-700";
}

function statusLabelForReview(status: AdminReviewStatus): string {
  if (status === ADMIN_REVIEW_STATUS.PUBLISHED) return "Published";
  if (status === ADMIN_REVIEW_STATUS.UNPUBLISHED) return "Unpublished";
  return "Historical";
}

type SortKey = "createdAt" | "rating" | "authorName" | "status";

export default function AdminReviewsPage() {
  const apiClient = useApiClient();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    apiClient<{ reviews: AdminReview[] }>("/admin/reviews")
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

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, ratingFilter, originFilter, pageSize]);

  const summary = useMemo(
    () => ({
      total: reviews.length,
      published: reviews.filter((r) => r.status === ADMIN_REVIEW_STATUS.PUBLISHED).length,
      historical: reviews.filter((r) => r.origin === ADMIN_REVIEW_ORIGIN.LEGACY_LEAD).length,
    }),
    [reviews]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = reviews.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (originFilter !== "all" && r.origin !== originFilter) return false;
      if (ratingFilter !== "all" && String(r.rating ?? "") !== ratingFilter) return false;
      if (!q) return true;
      const itemHay = (r.orderItems ?? []).map((i) => `${i.name} ${i.productSlug}`).join(" ");
      return [r.authorName, r.authorEmail, r.body, r.city, r.orderId, r.orderNumber, r.productSlug, itemHay]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
    list = sortItems(list, (r) => {
      if (sortKey === "rating") return r.rating ?? 0;
      if (sortKey === "authorName") return (r.authorName || "").toLowerCase();
      if (sortKey === "status") return r.status;
      return r.createdAt || "";
    }, sortDir);
    return list;
  }, [reviews, search, statusFilter, ratingFilter, originFilter, sortKey, sortDir]);

  const { items: pageItems, totalPages, total } = paginate(filtered, page, pageSize);

  const removeReview = async (review: AdminReview) => {
    if (!review.canDelete) return;
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

  const exportReviews = () => {
    downloadCsv(`customer-reviews-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Customer", "Email", "City", "Rating", "Review", "Order", "Products", "Status", "Origin", "Submitted"],
      ...filtered.map((r) => [
        r.authorName,
        r.authorEmail ?? "",
        r.city ?? "",
        r.rating != null ? String(r.rating) : "",
        r.body,
        r.orderNumber || r.orderId || "",
        (r.orderItems ?? []).map((i) => `${i.quantity}× ${i.name}`).join("; "),
        statusLabelForReview(r.status),
        r.origin === ADMIN_REVIEW_ORIGIN.LEGACY_LEAD ? "Historical lead" : "Catalog",
        r.createdAt,
      ]),
    ]);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "authorName" ? "asc" : "desc");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Customer reviews</h1>
      <p className="text-sm text-slate-600 mb-6">
        New reviews publish on the website as soon as a customer submits them. Older reviews
        submitted before this page existed are listed here as <strong>Historical</strong> (they stay
        in the original lead records and are not copied or changed). Remove spam from published
        catalog reviews only.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "All reviews", value: summary.total },
          { label: "Published", value: summary.published },
          { label: "Historical", value: summary.historical },
        ].map((k) => (
          <div key={k.label} className="bg-white border rounded-xl p-4">
            <p className="text-xs uppercase text-slate-400">{k.label}</p>
            <p className="text-xl font-bold mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <input
          type="search"
          placeholder="Search name, email, order, or review text…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value={ADMIN_REVIEW_STATUS.PUBLISHED}>Published</option>
          <option value={ADMIN_REVIEW_STATUS.UNPUBLISHED}>Unpublished</option>
          <option value={ADMIN_REVIEW_STATUS.HISTORICAL}>Historical</option>
        </select>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All ratings</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={String(n)}>
              {n} star{n !== 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <select
          value={originFilter}
          onChange={(e) => setOriginFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All sources</option>
          <option value={ADMIN_REVIEW_ORIGIN.CATALOG}>Catalog (new)</option>
          <option value={ADMIN_REVIEW_ORIGIN.LEGACY_LEAD}>Historical (pre-admin)</option>
        </select>
      </div>

      <TableControls
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        sortLabel={
          sortKey === "createdAt"
            ? "Date"
            : sortKey === "rating"
              ? "Rating"
              : sortKey === "authorName"
                ? "Name"
                : "Status"
        }
        sortDir={sortDir}
        onSortToggle={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
        onExport={exportReviews}
      />

      {message && <p className="text-sm text-green-700 mb-3">{message}</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="bg-white border rounded-lg overflow-x-auto">
        {loading ? (
          <p className="p-4 text-slate-500">Loading reviews…</p>
        ) : pageItems.length === 0 ? (
          <p className="p-4 text-slate-600">No customer reviews match these filters.</p>
        ) : (
          <table className="w-full text-sm min-w-[960px]">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="py-3 px-4">
                  <button type="button" className="font-semibold hover:underline" onClick={() => toggleSort("authorName")}>
                    Customer
                  </button>
                </th>
                <th className="py-3 px-4">Order / product</th>
                <th className="py-3 px-4">
                  <button type="button" className="font-semibold hover:underline" onClick={() => toggleSort("rating")}>
                    Rating
                  </button>
                </th>
                <th className="py-3 px-4">Review</th>
                <th className="py-3 px-4">
                  <button type="button" className="font-semibold hover:underline" onClick={() => toggleSort("status")}>
                    Status
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button type="button" className="font-semibold hover:underline" onClick={() => toggleSort("createdAt")}>
                    Submitted
                  </button>
                </th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((review) => {
                const orderHref = review.resolvedOrderId
                  ? `/admin/orders/${encodeURIComponent(review.resolvedOrderId)}`
                  : null;
                const orderLabel = review.orderNumber || review.orderId;
                return (
                  <tr key={`${review.origin}-${review.reviewId}`} className="border-t align-top">
                    <td className="py-3 px-4">
                      <p className="font-medium">{review.authorName}</p>
                      {review.authorEmail ? (
                        <p className="text-xs text-slate-500">{review.authorEmail}</p>
                      ) : null}
                      {review.city ? <p className="text-xs text-slate-400">{review.city}</p> : null}
                    </td>
                    <td className="py-3 px-4">
                      {orderLabel ? (
                        orderHref ? (
                          <Link href={orderHref} className="text-nav font-medium hover:underline">
                            {orderLabel}
                          </Link>
                        ) : (
                          <p className="font-mono text-xs">{orderLabel}</p>
                        )
                      ) : (
                        <p className="text-xs text-slate-400">No order</p>
                      )}
                      {review.orderStatus ? (
                        <p className="text-[11px] text-slate-500 mt-0.5">{statusLabel(review.orderStatus)}</p>
                      ) : null}
                      {review.orderItems?.length ? (
                        <ul className="mt-1 space-y-0.5">
                          {review.orderItems.slice(0, 4).map((item) => (
                            <li key={`${item.productSlug}-${item.name}`} className="text-[11px] text-slate-500">
                              {item.quantity}× {item.name}
                            </li>
                          ))}
                          {review.orderItems.length > 4 ? (
                            <li className="text-[11px] text-slate-400">
                              +{review.orderItems.length - 4} more
                            </li>
                          ) : null}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-1">
                          {review.productSlug === SITE_REVIEW_SLUG ? "Site review" : review.productSlug}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {review.rating != null ? `${review.rating} / 5` : "—"}
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      {review.title ? <p className="font-medium mb-1">{review.title}</p> : null}
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{review.body}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadgeClass(review.status)}`}
                      >
                        {statusLabelForReview(review.status)}
                      </span>
                      {review.origin === ADMIN_REVIEW_ORIGIN.LEGACY_LEAD ? (
                        <p className="text-[11px] text-slate-400 mt-1">Not on website</p>
                      ) : null}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatWhen(review.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      {review.canDelete ? (
                        <button
                          type="button"
                          onClick={() => void removeReview(review)}
                          disabled={removingId === review.reviewId}
                          className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                        >
                          {removingId === review.reviewId ? "Removing…" : "Remove review"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Read-only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
