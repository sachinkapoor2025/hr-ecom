"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApiClient } from "@/lib/auth-context";
import { HorizontalBarChart, AreaChart } from "@/components/admin/Charts";
import { SalesReportPanel } from "@/components/admin/SalesReportPanel";
import { downloadCsv } from "@/lib/admin-utils";

interface ProductStat {
  slug: string;
  views: number;
  adds: number;
}
interface SearchStat {
  term: string;
  count: number;
  zero: number;
}
interface Overview {
  totals: Record<string, number>;
  trafficByDay: { day: string; pageViews: number; purchases: number }[];
}

export default function AdminAnalyticsPage() {
  const apiClient = useApiClient();
  const [days, setDays] = useState(30);
  const [products, setProducts] = useState<ProductStat[]>([]);
  const [searches, setSearches] = useState<SearchStat[]>([]);
  const [zeroResult, setZeroResult] = useState<SearchStat[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      apiClient<{ products: ProductStat[] }>(`/admin/analytics/products?days=${days}`),
      apiClient<{ searches: SearchStat[]; zeroResult: SearchStat[] }>(
        `/admin/analytics/searches?days=${days}`
      ),
      apiClient<Overview>(`/admin/analytics/overview?days=${days}`),
    ])
      .then(([p, s, o]) => {
        setProducts(p.products);
        setSearches(s.searches);
        setZeroResult(s.zeroResult);
        setOverview(o);
      })
      .catch((err) => {
        setProducts([]);
        setSearches([]);
        setZeroResult([]);
        setOverview(null);
        setError(err instanceof Error ? err.message : "Could not load analytics");
      })
      .finally(() => setLoading(false));
  }, [apiClient, days]);

  const productChart = products.slice(0, 8).map((p) => ({
    label: p.slug.replace(/-/g, " "),
    value: p.views,
    sub: `${p.adds} adds`,
  }));

  const searchChart = searches.slice(0, 8).map((s) => ({
    label: s.term,
    value: s.count,
    sub: s.zero ? `${s.zero} zero-result` : undefined,
  }));

  const conversionRate =
    overview && overview.totals.page_view
      ? (((overview.totals.purchase ?? 0) / overview.totals.page_view) * 100).toFixed(2)
      : "0";

  const exportAnalytics = () => {
    if (!overview) return;
    downloadCsv(`analytics-${days}d-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Metric", "Value"],
      ["Page views", String(overview.totals.page_view ?? 0)],
      ["Product views", String(overview.totals.product_view ?? 0)],
      ["Cart adds", String(overview.totals.cart_add ?? 0)],
      ["Searches", String(overview.totals.search ?? 0)],
      ["Purchases", String(overview.totals.purchase ?? 0)],
      ["Conversion rate %", conversionRate],
      [],
      ["Day", "Page views", "Purchases"],
      ...overview.trafficByDay.map((d) => [d.day, String(d.pageViews), String(d.purchases)]),
      [],
      ["Product", "Views", "Adds"],
      ...products.map((p) => [p.slug, String(p.views), String(p.adds)]),
      [],
      ["Search term", "Count", "Zero results"],
      ...searches.map((s) => [s.term, String(s.count), String(s.zero ?? 0)]),
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          {overview && (
            <button
              type="button"
              onClick={exportAnalytics}
              className="text-sm bg-nav text-white px-3 py-1.5 rounded-lg"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : (
        <>
          <div className="mb-8">
            <SalesReportPanel />
          </div>

          {overview && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {[
                { label: "Page views", value: overview.totals.page_view ?? 0 },
                { label: "Product views", value: overview.totals.product_view ?? 0 },
                { label: "Cart adds", value: overview.totals.cart_add ?? 0 },
                { label: "Searches", value: overview.totals.search ?? 0 },
                { label: "Conversion rate", value: `${conversionRate}%` },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white border rounded-xl p-4">
                  <p className="text-xs uppercase text-slate-400">{kpi.label}</p>
                  <p className="text-xl font-bold mt-1">
                    {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {overview && overview.trafficByDay.length > 0 && (
            <section className="bg-white border rounded-xl p-5 mb-6">
              <h2 className="font-semibold mb-1">Orders & traffic trend</h2>
              <p className="text-xs text-slate-500 mb-4">Page views and purchases per day</p>
              <AreaChart
                data={overview.trafficByDay.map((d) => ({ label: d.day, value: d.pageViews }))}
                height={160}
              />
              <div className="mt-4 grid grid-cols-7 gap-1 text-[10px] text-slate-500">
                {overview.trafficByDay.slice(-7).map((d) => (
                  <div key={d.day} className="text-center">
                    <div>{d.day.slice(5)}</div>
                    <div className="font-medium text-green-700">{d.purchases} orders</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <section className="bg-white border rounded-xl p-5">
              <h2 className="font-semibold mb-3">Most viewed products</h2>
              {products.length === 0 ? (
                <p className="text-sm text-slate-500">No product views yet. Browse the storefront to start tracking.</p>
              ) : (
                <>
                  <HorizontalBarChart items={productChart} color="#2563eb" />
                  <table className="w-full text-sm mt-6 border-t pt-4">
                    <thead className="text-left text-slate-400 text-xs">
                      <tr>
                        <th className="py-1">Product</th>
                        <th className="py-1 text-right">Views</th>
                        <th className="py-1 text-right">Adds</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.slug} className="border-t">
                          <td className="py-2">
                            <Link href={`/products/${p.slug}`} className="text-nav hover:underline">
                              {p.slug}
                            </Link>
                          </td>
                          <td className="py-2 text-right">{p.views}</td>
                          <td className="py-2 text-right">{p.adds}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </section>

            <section className="bg-white border rounded-xl p-5">
              <h2 className="font-semibold mb-3">Top searches</h2>
              {searches.length === 0 ? (
                <p className="text-sm text-slate-500">No searches yet.</p>
              ) : (
                <>
                  <HorizontalBarChart items={searchChart} color="#d97706" />
                  <table className="w-full text-sm mt-6 border-t pt-4">
                    <thead className="text-left text-slate-400 text-xs">
                      <tr>
                        <th className="py-1">Query</th>
                        <th className="py-1 text-right">Count</th>
                        <th className="py-1 text-right">No results</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searches.map((s) => (
                        <tr key={s.term} className="border-t">
                          <td className="py-2">{s.term}</td>
                          <td className="py-2 text-right">{s.count}</td>
                          <td className="py-2 text-right">{s.zero || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {zeroResult.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-red-600 mb-2">
                    Zero-result searches (product gaps)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {zeroResult.map((s) => (
                      <span
                        key={s.term}
                        className="px-2 py-1 rounded-full text-xs bg-red-50 text-red-700"
                        title={`${s.zero} searches with no results`}
                      >
                        {s.term} ({s.zero})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
