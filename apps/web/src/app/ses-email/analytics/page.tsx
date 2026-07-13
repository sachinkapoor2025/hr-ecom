"use client";

import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@/lib/auth-context";

type Analytics = {
  totals: {
    queued: number;
    sent: number;
    delivered: number;
    failed: number;
    bounced: number;
    complaints: number;
    opens: number;
    clicks: number;
  };
  byCampaign: { name: string; sent: number; opens: number; clicks: number; failed: number }[];
};

export default function AnalyticsPage() {
  const api = useApiClient();
  const [data, setData] = useState<Analytics | null>(null);

  const load = useCallback(async () => {
    setData(await api<Analytics>("/ses-email/analytics"));
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!data) return <p className="text-slate-500">Loading analytics…</p>;

  const maxSent = Math.max(1, ...data.byCampaign.map((c) => c.sent));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Analytics</h1>
      <div className="grid sm:grid-cols-4 gap-3">
        {(
          [
            ["Queued", data.totals.queued],
            ["Sent", data.totals.sent],
            ["Delivered", data.totals.delivered],
            ["Failed", data.totals.failed],
            ["Bounced", data.totals.bounced],
            ["Complaints", data.totals.complaints],
            ["Opens", data.totals.opens],
            ["Clicks", data.totals.clicks],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-white p-4">
            <p className="text-xs text-slate-500 uppercase">{label}</p>
            <p className="text-xl font-bold text-primary mt-1">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold mb-4">Sent by campaign</h2>
        <div className="space-y-3">
          {data.byCampaign.map((c) => (
            <div key={c.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="truncate pr-2">{c.name}</span>
                <span className="text-slate-500 shrink-0">
                  {c.sent} sent · {c.opens} opens · {c.clicks} clicks
                </span>
              </div>
              <div className="h-3 rounded bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-nav"
                  style={{ width: `${Math.round((c.sent / maxSent) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          {data.byCampaign.length === 0 && <p className="text-sm text-slate-500">No data yet.</p>}
        </div>
      </section>
    </div>
  );
}
