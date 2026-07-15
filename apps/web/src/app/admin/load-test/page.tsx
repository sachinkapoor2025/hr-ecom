"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  LOAD_TEST_PRESETS,
  type LoadTestPreset,
  type LoadTestRunResult,
} from "@hr-ecom/shared";
import { useAuth, useApiClient } from "@/lib/auth-context";
import { runBrowserLoadTest } from "@/lib/admin-load-test";

interface LoadTestInfo {
  loadTestMode: boolean;
  presets: typeof LOAD_TEST_PRESETS;
  limits: { maxConcurrency: number; maxLoops: number; maxWallMs: number };
  note: string;
}

export default function AdminLoadTestPage() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const api = useApiClient();
  const [info, setInfo] = useState<LoadTestInfo | null>(null);
  const [preset, setPreset] = useState<LoadTestPreset>("smoke");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<LoadTestRunResult | null>(null);
  const [error, setError] = useState("");

  const loadInfo = useCallback(async () => {
    try {
      const data = await api<LoadTestInfo>("/admin/load-test");
      setInfo(data);
    } catch {
      // Info is optional — browser runner does not need the API orchestrator.
      setInfo(null);
    }
  }, [api]);

  useEffect(() => {
    if (!authLoading && isSuperAdmin) void loadInfo();
  }, [authLoading, isSuperAdmin, loadInfo]);

  const run = async () => {
    setRunning(true);
    setError("");
    setResult(null);
    try {
      // Run from the browser so we do not occupy the API Lambda while also calling it
      // (that pattern caused 503s / Fail under concurrent smoke).
      const next = await runBrowserLoadTest({ preset });
      if (info) next.loadTestMode = info.loadTestMode;
      setResult(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load test failed");
    } finally {
      setRunning(false);
    }
  };

  if (authLoading) {
    return <div className="p-10 text-slate-500">Loading…</div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">Super admin only</h1>
        <p className="text-sm text-slate-600 mb-6">
          Manual load testing is limited to Cognito users in the <code>super-admin</code> group.
        </p>
        <Link href="/admin" className="text-sm text-accent hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const selected = LOAD_TEST_PRESETS[preset];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Manual load test</h1>
      <p className="text-slate-600 text-sm mb-6">
        Runs a bounded concurrent shopper smoke from your browser against the live API (health →
        catalog → PDP → cart → events). For a full ~1000 VU k6 run, use{" "}
        <code className="text-xs">scripts/load</code> on staging.
      </p>

      {info && (
        <div
          className={`rounded-xl border p-4 mb-6 text-sm ${
            info.loadTestMode
              ? "bg-emerald-50 border-emerald-100 text-emerald-900"
              : "bg-amber-50 border-amber-100 text-amber-950"
          }`}
        >
          <p className="font-medium">
            LOAD_TEST_MODE: {info.loadTestMode ? "ON (payments/email/USPS stubbed)" : "OFF"}
          </p>
          {!info.loadTestMode && (
            <p className="mt-1 text-xs opacity-90">
              On production, browse/cart endpoints are real. Prefer staging with stubs enabled for
              heavier presets.
            </p>
          )}
          <p className="mt-2 text-xs opacity-80">{info.note}</p>
        </div>
      )}

      <div className="bg-white border rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Preset</label>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(LOAD_TEST_PRESETS) as LoadTestPreset[]).map((key) => {
              const p = LOAD_TEST_PRESETS[key];
              const active = preset === key;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={running}
                  onClick={() => setPreset(key)}
                  className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                    active
                      ? "border-nav bg-nav/5 ring-1 ring-nav"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="block text-sm font-semibold">{p.label}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">{p.description}</span>
                  <span className="block text-[11px] text-slate-400 mt-1">
                    {p.concurrency} × {p.loops} loops
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Selected: <span className="font-medium text-slate-800">{selected.label}</span> —{" "}
          {selected.description}. Keep this tab open while it runs.
        </p>

        <button
          type="button"
          onClick={run}
          disabled={running}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-nav px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {running ? "Running load test…" : `Run ${selected.label} test`}
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-6 bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold">Results</h2>
            <span
              className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                result.pass ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              }`}
            >
              {result.pass ? "Pass" : "Fail"}
            </span>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <Stat label="Duration" value={`${(result.durationMs / 1000).toFixed(1)}s`} />
            <Stat label="Journeys" value={String(result.journeys)} />
            <Stat label="Requests" value={String(result.requestsApprox)} />
            <Stat label="Errors" value={String(result.errors)} />
            <Stat label="Fail rate" value={`${(result.failedRate * 100).toFixed(2)}%`} />
            <Stat label="p50" value={`${result.p50} ms`} />
            <Stat label="p95" value={`${result.p95} ms`} />
            <Stat label="p99" value={`${result.p99} ms`} />
          </dl>

          {result.truncated && (
            <p className="mt-4 text-xs text-amber-700">
              Run truncated early. Results may be incomplete — try Smoke again.
            </p>
          )}

          {result.sampleErrors?.length ? (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Sample errors</p>
              <ul className="text-xs text-red-700 space-y-1 font-mono">
                {result.sampleErrors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="mt-4 text-[11px] text-slate-400 break-all">Target: {result.apiBase}</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-semibold text-slate-800">{value}</dd>
    </div>
  );
}
