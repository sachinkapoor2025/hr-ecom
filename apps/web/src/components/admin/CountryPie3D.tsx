"use client";

import { useMemo, useState } from "react";

export interface CountrySlice {
  country: string;
  visitors: number;
  purchased: number;
  checkoutStarted: number;
  withCart: number;
  identified: number;
  events: number;
  share: number;
  devices?: Record<string, number>;
}

const COLORS = [
  "#183a68",
  "#0f766e",
  "#b45309",
  "#be123c",
  "#7c3aed",
  "#0369a1",
  "#15803d",
  "#c2410c",
  "#a21caf",
  "#475569",
];

function countryLabel(code: string): string {
  if (!code || code === "UNKNOWN") return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function topDevice(devices?: Record<string, number>): string {
  if (!devices) return "—";
  const entries = Object.entries(devices).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? "—";
}

interface Props {
  data: CountrySlice[];
  size?: number;
}

export function CountryPie3D({ data, size = 260 }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });

  const slices = useMemo(() => {
    if (!data.length) return [];
    const total = data.reduce((sum, d) => sum + d.visitors, 0) || 1;
    let cursor = 0;
    return data.map((d, i) => {
      const start = cursor;
      const sweep = (d.visitors / total) * 360;
      cursor += sweep;
      return {
        ...d,
        color: COLORS[i % COLORS.length]!,
        start,
        end: cursor,
        label: countryLabel(d.country),
      };
    });
  }, [data]);

  const gradient = useMemo(() => {
    if (!slices.length) return "conic-gradient(#e2e8f0 0deg 360deg)";
    const parts = slices.map((s) => `${s.color} ${s.start}deg ${s.end}deg`);
    return `conic-gradient(from -90deg, ${parts.join(", ")})`;
  }, [slices]);

  const findSlice = (clientX: number, clientY: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(rect.width, rect.height) / 2;
    if (dist > radius || dist < radius * 0.22) {
      setHover(null);
      return;
    }
    // Match conic-gradient(from -90deg): 0° at top, clockwise
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    const idx = slices.findIndex((s) => deg >= s.start && deg < s.end);
    setHover(idx >= 0 ? idx : slices.length - 1);
    setTipPos({ x: clientX - rect.left, y: clientY - rect.top });
  };

  if (!slices.length) {
    return <p className="text-sm text-slate-500">No visitor country data yet.</p>;
  }

  const active = hover != null ? slices[hover] : null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size * 0.78, perspective: 900 }}
        onMouseLeave={() => setHover(null)}
      >
        {/* Depth rim */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: size,
            height: size,
            top: size * 0.12,
            background: "radial-gradient(circle at 50% 40%, #94a3b8, #475569)",
            transform: "rotateX(62deg)",
            boxShadow: "0 28px 40px rgba(15, 23, 42, 0.28)",
          }}
        />
        {/* Extruded layers for 3D thickness */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: size,
              height: size,
              top: size * 0.12 - i * 1.5,
              background: gradient,
              filter: "brightness(0.72)",
              transform: "rotateX(62deg)",
              opacity: 0.95,
            }}
          />
        ))}
        {/* Top face */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full cursor-crosshair"
          style={{
            width: size,
            height: size,
            top: size * 0.12 - 12,
            background: gradient,
            transform: "rotateX(62deg)",
            boxShadow: "inset 0 0 40px rgba(255,255,255,0.18)",
          }}
          onMouseMove={(e) => findSlice(e.clientX, e.clientY, e.currentTarget)}
        >
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            style={{ width: "38%", height: "38%", boxShadow: "0 2px 8px rgba(15,23,42,0.12)" }}
          />
        </div>

        {active && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-[220px]"
            style={{
              left: Math.min(Math.max(tipPos.x + 12, 8), size - 180),
              top: Math.max(tipPos.y - 8, 8),
            }}
          >
            <p className="font-semibold text-sm mb-1">{active.label}</p>
            <p>
              Visitors: <span className="font-medium">{active.visitors.toLocaleString()}</span>
            </p>
            <p>Share: {(active.share * 100).toFixed(1)}%</p>
            <p>Purchased: {active.purchased}</p>
            <p>Checkout: {active.checkoutStarted}</p>
            <p>With cart: {active.withCart}</p>
            <p>Identified: {active.identified}</p>
            <p>Events: {active.events.toLocaleString()}</p>
            <p>Top device: {topDevice(active.devices)}</p>
          </div>
        )}
      </div>

      <ul className="flex-1 w-full space-y-2 max-h-72 overflow-y-auto pr-1">
        {slices.map((s, i) => (
          <li key={s.country}>
            <button
              type="button"
              className={`w-full flex items-center gap-3 text-left rounded-lg px-2 py-1.5 text-sm transition-colors ${
                hover === i ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
              onMouseEnter={() => {
                setHover(i);
                setTipPos({ x: size * 0.55, y: size * 0.25 });
              }}
              onMouseLeave={() => setHover(null)}
            >
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="flex-1 truncate text-slate-700">{s.label}</span>
              <span className="tabular-nums text-slate-500 shrink-0">
                {s.visitors.toLocaleString()} · {(s.share * 100).toFixed(0)}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
