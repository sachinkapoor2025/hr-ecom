"use client";

import { useEffect, useState } from "react";
import { useApiClient } from "@/lib/auth-context";
import type { PaymentConfig } from "@hr-ecom/shared";

export default function AdminPaymentsPage() {
  const apiClient = useApiClient();
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiClient<{ config: PaymentConfig }>("/config/payments").then((d) => setConfig(d.config));
  }, [apiClient]);

  const save = async () => {
    if (!config) return;
    try {
      await apiClient("/config/payments", { method: "PUT", body: JSON.stringify(config) });
      setMessage("Payment config saved");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    }
  };

  if (!config) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Payment Configuration</h1>

      <div className="space-y-4 bg-white border rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium mb-1">Default region</label>
          <select
            value={config.defaultRegion}
            onChange={(e) => setConfig({ ...config, defaultRegion: e.target.value as "US" | "IN" })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="US">United States (Stripe)</option>
            <option value="IN">India (Razorpay)</option>
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.regions.US.enabled}
            onChange={(e) =>
              setConfig({
                ...config,
                regions: { ...config.regions, US: { ...config.regions.US, enabled: e.target.checked } },
              })
            }
          />
          Stripe enabled (USA)
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.regions.IN.enabled}
            onChange={(e) =>
              setConfig({
                ...config,
                regions: { ...config.regions, IN: { ...config.regions.IN, enabled: e.target.checked } },
              })
            }
          />
          Razorpay enabled (India)
        </label>

        <button onClick={save} className="bg-accent text-white px-6 py-2 rounded-lg">
          Save Config
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}
