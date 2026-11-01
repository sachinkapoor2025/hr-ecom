"use client";

import { useEffect, useMemo, useState } from "react";
import { useApiClient } from "@/lib/auth-context";
import { downloadCsv } from "@/lib/admin-utils";
import { allTrackedSeoKeywords, seoLandingPages } from "@/lib/content/seo-catalog";
import {
  buildSeoDashboard,
  SEO_OCCASION_LABELS,
  SEO_OCCASIONS,
  summarizeSeoMetrics,
  type GscPageMetric,
  type GscQueryMetric,
  type SeoOccasion,
} from "@hr-ecom/shared";

const TRACKED = allTrackedSeoKeywords();
const LANDING_PAGES = seoLandingPages();

type OccasionFilter = "all" | SeoOccasion;
type DayWindow = 7 | 28 | 90;

interface SeoPerformanceResponse {
  days: number;
  startDate: string;
  endDate: string;
  searchConsole: {
    connected: boolean;
    siteUrl: string | null;
    error: string | null;
    queryRows: number;
    pageRows: number;
  };
  queries: GscQueryMetric[];
  pages: GscPageMetric[];
}

function formatCount(value: number | null): string {
  if (value == null) return "—";
  return value.toLocaleString("en-US");
}

function formatCtr(value: number | null): string {
  if (value == null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function formatPosition(value: number | null): string {
  if (value == null) return "—";
  return value.toFixed(1);
}

export function SeoDashboard() {
  const apiClient = useApiClient();
  const [days, setDays] = useState<DayWindow>(28);
  const [occasion, setOccasion] = useState<OccasionFilter>("all");
  const [search, setSearch] = useState("");
  const [report, setReport] = useState<SeoPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    apiClient<SeoPerformanceResponse>(`/admin/seo/performance?days=${days}`)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setReport(null);
          setError(err instanceof Error ? err.message : "Search Console report is unavailable");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiClient, days]);

  const model = useMemo(
    () => buildSeoDashboard(TRACKED, report?.queries ?? [], report?.pages ?? [], LANDING_PAGES),
    [report]
  );

  const summaries = useMemo(
    () =>
      Object.fromEntries(
        SEO_OCCASIONS.map((id) => [
          id,
          summarizeSeoMetrics(model.keywords.filter((row) => row.occasion === id)),
        ])
      ) as Record<SeoOccasion, ReturnType<typeof summarizeSeoMetrics>>,
    [model.keywords]
  );

  const needle = search.trim().toLowerCase();
  const keywords = model.keywords.filter((row) => {
    if (occasion !== "all" && row.occasion !== occasion) return false;
    if (!needle) return true;
    return row.keyword.includes(needle) || row.targetPath.includes(needle);
  });
  const pages = model.pages.filter((row) => {
    if (occasion !== "all" && !row.occasions.includes(occasion)) return false;
    if (!needle) return true;
    return row.label.toLowerCase().includes(needle) || row.path.includes(needle);
  });

  const status = loading
    ? "Loading Search Console…"
    : error
      ? `${error} Tracked keywords are still listed below.`
      : report?.searchConsole.connected
        ? `Google Search Console · ${report.searchConsole.siteUrl} · ${report.startDate} to ${report.endDate}.`
        : report?.searchConsole.error
          ? `Search Console could not be read (${report.searchConsole.error}). Tracked keywords are still listed.`
          : "Rakhi, Bhai Dooj, and Diwali keywords are tracked. Impressions, clicks, CTR, and average position fill in when Search Console credentials are configured on the API.";

  const exportKeywords = () => {
    downloadCsv(`usarakhi-seo-${occasion}-${days}d.csv`, [
      ["Keyword", "Category", "Page", "Impressions", "Clicks", "CTR", "Average position", "Source"],
      ...keywords.map((row) => [
        row.keyword,
        SEO_OCCASION_LABELS[row.occasion],
        row.targetPath,
        row.impressions == null ? "" : String(row.impressions),
        row.clicks == null ? "" : String(row.clicks),
        row.ctr == null ? "" : (row.ctr * 100).toFixed(1),
        row.position == null ? "" : row.position.toFixed(1),
        row.discovered ? "Search Console" : "Tracked",
      ]),
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">SEO keywords</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">{status}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {([7, 28, 90] as const).map((window) => (
            <button
              key={window}
              type="button"
              onClick={() => setDays(window)}
              className={`text-sm px-3 py-1.5 rounded-lg border ${
                days === window ? "bg-nav text-white border-nav" : "border-slate-300 hover:bg-slate-50"
              }`}
            >
              {window} days
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {SEO_OCCASIONS.map((id) => {
          const summary = summaries[id];
          const active = occasion === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setOccasion(active ? "all" : id)}
              className={`text-left rounded-xl border p-4 bg-white ${
                active ? "border-nav ring-1 ring-nav" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">{SEO_OCCASION_LABELS[id]}</h2>
                <span className="text-xs text-slate-500">{summary.keywords} keywords</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <dt className="text-slate-500">Impressions</dt>
                <dd className="text-right font-medium">{formatCount(summary.withData ? summary.impressions : null)}</dd>
                <dt className="text-slate-500">Clicks</dt>
                <dd className="text-right font-medium">{formatCount(summary.withData ? summary.clicks : null)}</dd>
                <dt className="text-slate-500">CTR</dt>
                <dd className="text-right font-medium">{formatCtr(summary.ctr)}</dd>
                <dt className="text-slate-500">Avg. position</dt>
                <dd className="text-right font-medium">{formatPosition(summary.position)}</dd>
              </dl>
              <p className="mt-2 text-xs text-slate-500">
                {summary.withData} with Search Console data
              </p>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">
        Rakhi keywords are the existing sheet. Bhai Dooj and Diwali are tracked beside them. A Search Console query that names two festivals is listed under each category.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={occasion === "all"} onClick={() => setOccasion("all")} label="All" />
          {SEO_OCCASIONS.map((id) => (
            <FilterChip
              key={id}
              active={occasion === id}
              onClick={() => setOccasion(id)}
              label={SEO_OCCASION_LABELS[id]}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search keywords or pages"
            className="border rounded-lg px-3 py-2 text-sm w-full sm:w-64"
            aria-label="Search keywords or pages"
          />
          <button type="button" onClick={exportKeywords} className="border rounded-lg px-3 py-2 text-sm">
            Export
          </button>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold">Keywords</h2>
          <p className="text-xs text-slate-500">{keywords.length} shown</p>
        </div>
        <div className="overflow-auto max-h-[32rem]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-left">
                <th className="py-3 px-4">Keyword</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Page</th>
                <th className="py-3 px-4 text-right">Impressions</th>
                <th className="py-3 px-4 text-right">Clicks</th>
                <th className="py-3 px-4 text-right">CTR</th>
                <th className="py-3 px-4 text-right">Avg. position</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((row) => (
                <tr key={`${row.occasion}:${row.keyword}`} className="border-t">
                  <td className="py-2.5 px-4">
                    <span className="font-medium">{row.keyword}</span>
                    {row.discovered ? (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-500">Search Console</span>
                    ) : null}
                  </td>
                  <td className="py-2.5 px-4">{SEO_OCCASION_LABELS[row.occasion]}</td>
                  <td className="py-2.5 px-4 text-xs text-slate-600">{row.targetPath}</td>
                  <td className="py-2.5 px-4 text-right">{formatCount(row.impressions)}</td>
                  <td className="py-2.5 px-4 text-right">{formatCount(row.clicks)}</td>
                  <td className="py-2.5 px-4 text-right">{formatCtr(row.ctr)}</td>
                  <td className="py-2.5 px-4 text-right">{formatPosition(row.position)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Pages</h2>
          <p className="text-xs text-slate-500 mt-1">
            Category, guide, and city pages for the three festivals. Page metrics come from Search Console when that URL had impressions.
          </p>
        </div>
        <div className="overflow-auto max-h-[28rem]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-left">
                <th className="py-3 px-4">Page</th>
                <th className="py-3 px-4">Categories</th>
                <th className="py-3 px-4 text-right">Impressions</th>
                <th className="py-3 px-4 text-right">Clicks</th>
                <th className="py-3 px-4 text-right">CTR</th>
                <th className="py-3 px-4 text-right">Avg. position</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((row) => (
                <tr key={row.path} className="border-t">
                  <td className="py-2.5 px-4">
                    <div className="font-medium">{row.label}</div>
                    <div className="text-xs text-slate-500">{row.path}</div>
                  </td>
                  <td className="py-2.5 px-4 text-xs">
                    {row.occasions.map((id) => SEO_OCCASION_LABELS[id]).join(", ")}
                  </td>
                  <td className="py-2.5 px-4 text-right">{formatCount(row.impressions)}</td>
                  <td className="py-2.5 px-4 text-right">{formatCount(row.clicks)}</td>
                  <td className="py-2.5 px-4 text-right">{formatCtr(row.ctr)}</td>
                  <td className="py-2.5 px-4 text-right">{formatPosition(row.position)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm px-3 py-1.5 rounded-lg border ${
        active ? "bg-nav text-white border-nav" : "border-slate-300 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
