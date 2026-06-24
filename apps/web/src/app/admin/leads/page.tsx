"use client";

import { useEffect, useState } from "react";
import { useApiClient } from "@/lib/auth-context";

interface Lead {
  leadId: string;
  name?: string;
  email?: string;
  phone?: string;
  page?: string;
  productSlug?: string;
  source?: string;
  createdAt: string;
}

export default function AdminLeadsPage() {
  const apiClient = useApiClient();
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    apiClient<{ leads: Lead[] }>("/admin/leads")
      .then((d) => setLeads(d.leads))
      .catch(() => setLeads([]));
  }, [apiClient]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Customer Leads</h1>
      <p className="text-slate-600 text-sm mb-6">
        Partial customer data captured as users browse — use for outreach and sales.
      </p>
      {leads.length === 0 ? (
        <p className="text-slate-600">No leads captured yet. Browse products to generate leads.</p>
      ) : (
        <table className="w-full text-sm bg-white rounded-lg overflow-hidden border">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Page</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.leadId} className="border-t">
                <td className="py-3 px-4">{l.name ?? "—"}</td>
                <td className="py-3 px-4">{l.email ?? "—"}</td>
                <td className="py-3 px-4">{l.phone ?? "—"}</td>
                <td className="py-3 px-4">{l.source ?? "—"}</td>
                <td className="py-3 px-4 text-xs">{l.page ?? l.productSlug ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
