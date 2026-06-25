"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApiClient } from "@/lib/auth-context";

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

export default function AdminAnalyticsPage() {
  const apiClient = useApiClient();
  const [days, setDays] = useState(30);
  const [products, setProducts] = useState<ProductStat[]>([]);
  const [searches, setSearches] = useState<SearchStat[]>([]);
  const [zeroResult, setZeroResult] = useState<SearchStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient<{ products: ProductStat[] }>(`/admin/analytics/products?days=${days}`),
      apiClient<{ searches: SearchStat[]; zeroResult: SearchStat[] }>(
        `/admin/analytics/searches?days=${days}`
      ),
    ])
      .then(([p, s]) => {
        setProducts(p.products);
        setSearches(s.searches);
        setZeroResult(s.zeroResult);
      })
      .catch(() => {
        setProducts([]);
        setSearches([]);
        setZeroResult([]);
      })
      .finally(() => setLoading(false));
  }, [apiClient, days]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-3">Most viewed products</h2>
            {products.length === 0 ? (
              <p className="text-sm text-slate-500">No product views yet.</p>
            ) : (
              <table className="w-full text-sm">
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
            )}
          </section>

          <section className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-3">Top searches</h2>
            {searches.length === 0 ? (
              <p className="text-sm text-slate-500">No searches yet.</p>
            ) : (
              <table className="w-full text-sm">
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
      )}
    </div>
  );
}
