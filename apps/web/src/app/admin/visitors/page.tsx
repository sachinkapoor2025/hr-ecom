"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useApiClient } from "@/lib/auth-context";

interface SessionSummary {
  sessionId: string;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
  lastPath?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  locale?: string;
  referrer?: string;
  pages: string[];
  products: string[];
}

interface TimelineEvent {
  type: string;
  path?: string;
  productSlug?: string;
  query?: string;
  resultCount?: number;
  value?: number;
  createdAt?: string;
  at?: string;
  metadata?: Record<string, string>;
}

interface Timeline {
  sessionId: string;
  profile: { name?: string; email?: string; phone?: string } | null;
  leads: { source?: string; name?: string; email?: string; phone?: string; createdAt?: string }[];
  events: TimelineEvent[];
}

const EVENT_LABELS: Record<string, string> = {
  page_view: "Viewed page",
  product_view: "Viewed product",
  search: "Searched",
  cart_add: "Added to cart",
  cart_remove: "Removed from cart",
  checkout_start: "Started checkout",
  purchase: "Purchased",
};

const EVENT_COLOR: Record<string, string> = {
  purchase: "bg-green-500",
  checkout_start: "bg-purple-500",
  cart_add: "bg-indigo-500",
  cart_remove: "bg-slate-400",
  search: "bg-amber-500",
  product_view: "bg-blue-500",
  page_view: "bg-slate-300",
};

function describe(e: TimelineEvent): string {
  if (e.type === "search") {
    return `"${e.query}"${e.resultCount === 0 ? " — no results" : ` (${e.resultCount ?? 0} results)`}`;
  }
  if (e.productSlug) return e.productSlug;
  return e.path ?? "";
}

function countryLabel(s: SessionSummary): string {
  if (s.country) return s.country;
  if (s.timezone?.includes("Kolkata") || s.timezone?.includes("Calcutta")) return "IN (est.)";
  if (s.locale?.startsWith("en-IN")) return "IN (est.)";
  if (s.locale?.startsWith("en-US")) return "US (est.)";
  return s.timezone ?? "—";
}

function visitorLabel(s: SessionSummary): string {
  if (s.name) return s.name;
  if (s.email) return s.email;
  if (s.phone) return s.phone;
  return `${s.sessionId.slice(0, 8)}…`;
}

export default function AdminVisitorsPage() {
  const apiClient = useApiClient();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    apiClient<{ sessions: SessionSummary[] }>("/admin/sessions?days=7")
      .then((d) => setSessions(d.sessions))
      .catch((err) => {
        setSessions([]);
        setError(err instanceof Error ? err.message : "Could not load sessions");
      })
      .finally(() => setLoading(false));
  }, [apiClient]);

  const openSession = useCallback(
    (sessionId: string) => {
      setActive(sessionId);
      setTimeline(null);
      setTimelineLoading(true);
      apiClient<Timeline>(`/admin/sessions/${sessionId}`)
        .then(setTimeline)
        .catch(() => setTimeline(null))
        .finally(() => setTimelineLoading(false));
    },
    [apiClient]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Visitors</h1>
      <p className="text-slate-600 text-sm mb-6">
        Recent sessions (last 7 days). Click a visitor to see pages visited, products viewed, and where
        they dropped off.
      </p>

      {loading ? (
        <p className="text-slate-500">Loading sessions…</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : sessions.length === 0 ? (
        <p className="text-slate-600">
          No visitor sessions recorded yet. Once shoppers browse the storefront, sessions will appear here.
        </p>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden border overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="py-3 px-4">Visitor</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Last activity</th>
                <th className="py-3 px-4">Events</th>
                <th className="py-3 px-4">Pages visited</th>
                <th className="py-3 px-4">Products</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr
                  key={s.sessionId}
                  onClick={() => openSession(s.sessionId)}
                  className="border-t hover:bg-blue-50/50 cursor-pointer align-top"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium">{visitorLabel(s)}</div>
                    {(s.email || s.phone) && s.name && (
                      <div className="text-xs text-slate-400">
                        {[s.email, s.phone].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{countryLabel(s)}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(s.lastSeen).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">{s.eventCount}</td>
                  <td className="py-3 px-4 text-xs text-slate-500 max-w-[180px]">
                    {s.pages.length ? (
                      <span title={s.pages.join(", ")}>
                        {s.pages.slice(0, 2).join(", ")}
                        {s.pages.length > 2 ? ` +${s.pages.length - 2}` : ""}
                      </span>
                    ) : (
                      s.lastPath ?? "—"
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 max-w-[160px]">
                    {s.products.length ? (
                      <span title={s.products.join(", ")}>
                        {s.products.slice(0, 2).join(", ")}
                        {s.products.length > 2 ? ` +${s.products.length - 2}` : ""}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setActive(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Visitor journey</h2>
              <button onClick={() => setActive(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            {timelineLoading ? (
              <p className="text-slate-500 text-sm">Loading…</p>
            ) : !timeline ? (
              <p className="text-slate-500 text-sm">Could not load timeline.</p>
            ) : (
              <>
                {timeline.profile && (timeline.profile.name || timeline.profile.email || timeline.profile.phone) && (
                  <div className="mb-4 text-sm bg-slate-50 rounded-lg p-3">
                    {timeline.profile.name && <p className="font-medium">{timeline.profile.name}</p>}
                    {timeline.profile.email && <p className="text-slate-500">{timeline.profile.email}</p>}
                    {timeline.profile.phone && <p className="text-slate-500">{timeline.profile.phone}</p>}
                  </div>
                )}

                {timeline.events[0]?.metadata?.country && (
                  <p className="text-xs text-slate-500 mb-4">
                    Country: {timeline.events[0].metadata.country}
                    {timeline.events[0].metadata.timezone ? ` · ${timeline.events[0].metadata.timezone}` : ""}
                  </p>
                )}

                <ol className="relative border-l border-slate-200 ml-2">
                  {timeline.events.map((e, i) => (
                    <li key={i} className="ml-4 pb-4 last:pb-0">
                      <div
                        className={`absolute -left-1.5 w-3 h-3 rounded-full ${
                          EVENT_COLOR[e.type] ?? "bg-slate-300"
                        }`}
                      />
                      <p className="text-sm font-medium">{EVENT_LABELS[e.type] ?? e.type}</p>
                      <p className="text-xs text-slate-500 break-all">
                        {e.type === "product_view" && e.productSlug ? (
                          <Link href={`/products/${e.productSlug}`} className="text-nav hover:underline">
                            {describe(e)}
                          </Link>
                        ) : (
                          describe(e)
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(e.createdAt ?? e.at ?? "").toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ol>

                {timeline.events.length === 0 && (
                  <p className="text-sm text-slate-500">No events for this session.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
