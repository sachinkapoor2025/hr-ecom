"use client";

import { useMemo, useState } from "react";
import { formatViewerLocation, type LiveVisitor } from "@hr-ecom/shared";
import { referrerLabel } from "@/lib/admin-utils";

const W = 1000;
const H = 500;

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * W;
  const y = ((90 - lat) / 180) * H;
  return { x, y };
}

function visitorLabel(v: LiveVisitor): string {
  if (v.name) return v.name;
  if (v.email) return v.email;
  if (v.phone) return v.phone;
  return `Visitor ${v.sessionId.slice(0, 8)}…`;
}

function locationOf(v: LiveVisitor): string {
  return formatViewerLocation(
    {
      country: v.country,
      city: v.city,
      region: v.region,
      regionName: v.regionName,
    },
    { timezone: v.timezone, locale: v.locale }
  );
}

function agoLabel(seconds: number): string {
  if (seconds < 15) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  return `${m}m ago`;
}

type Props = {
  visitors: LiveVisitor[];
  activeWithinSeconds: number;
};

export function LiveVisitorsMap({ visitors, activeWithinSeconds }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const hover = useMemo(
    () => visitors.find((v) => v.sessionId === hoverId) ?? null,
    [visitors, hoverId]
  );

  const points = useMemo(
    () =>
      visitors.map((v) => {
        const { x, y } = project(v.lat, v.lng);
        return { v, x, y };
      }),
    [visitors]
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-primary flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Live on website
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Active in the last {Math.round(activeWithinSeconds / 60)} minutes · hover a dot for
            details · map positions are approximate (country/city)
          </p>
        </div>
        <p className="text-2xl font-bold text-primary tabular-nums">{visitors.length}</p>
      </div>

      <div className="relative bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50/40">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto max-h-[340px]"
          role="img"
          aria-label="Live visitors world map"
        >
          {/* Simple land / grid backdrop */}
          <rect width={W} height={H} fill="#e0f2fe" />
          {Array.from({ length: 12 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={(i * W) / 12}
              y1={0}
              x2={(i * W) / 12}
              y2={H}
              stroke="#bae6fd"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={(i * H) / 6}
              x2={W}
              y2={(i * H) / 6}
              stroke="#bae6fd"
              strokeWidth={1}
            />
          ))}
          {/* Equator / prime meridian */}
          <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#7dd3fc" strokeWidth={1.5} />
          <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke="#7dd3fc" strokeWidth={1.5} />

          {points.map(({ v, x, y }) => {
            const active = hoverId === v.sessionId;
            return (
              <g key={v.sessionId}>
                <circle
                  cx={x}
                  cy={y}
                  r={active ? 14 : 10}
                  fill="rgba(16,185,129,0.18)"
                  className="pointer-events-none"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={active ? 7 : 5}
                  fill={active ? "#047857" : "#10b981"}
                  stroke="#fff"
                  strokeWidth={1.5}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverId(v.sessionId)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <title>
                    {visitorLabel(v)} · {locationOf(v)} · {v.path}
                  </title>
                </circle>
              </g>
            );
          })}
        </svg>

        {hover && (
          <div className="absolute left-3 right-3 bottom-3 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 rounded-lg border border-slate-200 bg-white/95 shadow-lg p-3 text-sm pointer-events-none">
            <p className="font-semibold text-primary">{visitorLabel(hover)}</p>
            <p className="text-slate-600 mt-0.5">{locationOf(hover)}</p>
            <p className="mt-2">
              <span className="text-slate-500">Viewing: </span>
              <span className="font-medium break-all">{hover.path}</span>
            </p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs text-slate-600">
              <dt>Device</dt>
              <dd>
                {[hover.deviceType, hover.browser, hover.os].filter(Boolean).join(" · ") || "—"}
              </dd>
              <dt>Referrer</dt>
              <dd className="truncate">{referrerLabel(hover.referrer)}</dd>
              <dt>Active</dt>
              <dd>{agoLabel(hover.secondsAgo)}</dd>
              {hover.email && (
                <>
                  <dt>Email</dt>
                  <dd className="truncate">{hover.email}</dd>
                </>
              )}
              {hover.phone && (
                <>
                  <dt>Phone</dt>
                  <dd>{hover.phone}</dd>
                </>
              )}
              {hover.timezone && (
                <>
                  <dt>Timezone</dt>
                  <dd>{hover.timezone}</dd>
                </>
              )}
            </dl>
          </div>
        )}

        {!visitors.length && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
            No active visitors right now
          </p>
        )}
      </div>

      <div className="px-4 py-3 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-slate-800 mb-2">Live visitor details</h4>
        {!visitors.length ? (
          <p className="text-sm text-slate-500">Waiting for storefront activity…</p>
        ) : (
          <ul className="space-y-2 max-h-72 overflow-y-auto">
            {visitors.map((v) => (
              <li
                key={v.sessionId}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  hoverId === v.sessionId
                    ? "border-emerald-300 bg-emerald-50/60"
                    : "border-slate-100 bg-slate-50/50"
                }`}
                onMouseEnter={() => setHoverId(v.sessionId)}
                onMouseLeave={() => setHoverId(null)}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-primary">
                    {visitorLabel(v)}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      {v.sessionId.slice(0, 8)}…
                    </span>
                  </p>
                  <span className="text-xs text-emerald-700 font-medium">{agoLabel(v.secondsAgo)}</span>
                </div>
                <p className="text-slate-600 mt-0.5">{locationOf(v)}</p>
                <p className="mt-1">
                  <span className="text-slate-500">Page: </span>
                  <span className="font-medium break-all">{v.path}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {[v.deviceType, v.browser, v.os].filter(Boolean).join(" · ") || "Device unknown"}
                  {" · "}
                  Ref: {referrerLabel(v.referrer)}
                  {v.email ? ` · ${v.email}` : ""}
                  {v.phone ? ` · ${v.phone}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
