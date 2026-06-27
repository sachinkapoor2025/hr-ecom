"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useApiClient } from "@/lib/auth-context";
import { downloadCsv, formatDurationMs, formatMoney } from "@/lib/admin-utils";

interface CartItem {
  productSlug: string;
  name: string;
  quantity: number;
  price: number;
}

interface AbandonedCart {
  userKey: string;
  sessionId?: string;
  itemCount: number;
  value: number;
  currency?: string;
  updatedAt: string;
  createdAt?: string;
  items: CartItem[];
  name?: string;
  email?: string;
  phone?: string;
}

type RecoveryStatus = "not_sent" | "email_sent" | "whatsapp_sent" | "recovered" | "expired";

export default function AdminCartsPage() {
  const apiClient = useApiClient();
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [recoveryMap, setRecoveryMap] = useState<Record<string, RecoveryStatus>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient<{ carts: AbandonedCart[] }>("/admin/carts/abandoned")
      .then((d) => setCarts(d.carts))
      .catch(() => setCarts([]))
      .finally(() => setLoading(false));
  }, [apiClient]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return carts;
    return carts.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    );
  }, [carts, search]);

  const totalValue = useMemo(() => filtered.reduce((sum, c) => sum + c.value, 0), [filtered]);

  const abandonedDuration = (c: AbandonedCart) => {
    const start = c.createdAt ?? c.updatedAt;
    return formatDurationMs(Date.now() - new Date(start).getTime());
  };

  const exportCsv = () => {
    downloadCsv(
      `abandoned-carts-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        [
          "Name",
          "Email",
          "Phone",
          "Guest/Registered",
          "Items",
          "Quantity",
          "Value",
          "Currency",
          "Abandoned duration",
          "Last activity",
          "Recovery status",
        ],
        ...filtered.map((c) => [
          c.name ?? "",
          c.email ?? "",
          c.phone ?? "",
          c.name || c.email ? "Registered/Guest with contact" : "Anonymous guest",
          c.items.map((i) => `${i.quantity}x ${i.name}`).join("; "),
          String(c.itemCount),
          c.value.toFixed(2),
          c.currency ?? "USD",
          abandonedDuration(c),
          c.updatedAt,
          recoveryMap[c.userKey] ?? "not_sent",
        ]),
      ]
    );
  };

  const setRecovery = (userKey: string, status: RecoveryStatus) => {
    setRecoveryMap((prev) => ({ ...prev, [userKey]: status }));
  };

  const sendRecoveryEmail = (c: AbandonedCart) => {
    if (!c.email) {
      alert("No email on file for this cart.");
      return;
    }
    window.location.href = `mailto:${c.email}?subject=Complete your order&body=You left items in your cart. Visit our store to complete checkout.`;
    setRecovery(c.userKey, "email_sent");
  };

  const whatsappReminder = (c: AbandonedCart) => {
    if (!c.phone) {
      alert("No phone number on file.");
      return;
    }
    const phone = c.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=Hi! You left items in your cart. Complete your order on our website.`, "_blank");
    setRecovery(c.userKey, "whatsapp_sent");
  };

  const recoveryLabel = (key: string) => {
    const s = recoveryMap[key] ?? "not_sent";
    const labels: Record<RecoveryStatus, string> = {
      not_sent: "Not sent",
      email_sent: "Email sent",
      whatsapp_sent: "WhatsApp sent",
      recovered: "Recovered",
      expired: "Expired",
    };
    return labels[s];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Abandoned Carts</h1>
        {filtered.length > 0 && (
          <button
            onClick={exportCsv}
            className="bg-nav text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Export CSV
          </button>
        )}
      </div>
      <p className="text-slate-600 text-sm mb-4">
        Carts still holding items — potential sales to recover.{" "}
        {filtered.length > 0 && (
          <span className="font-medium">
            {filtered.length} carts ·{" "}
            {formatMoney(totalValue, filtered[0]?.currency ?? "USD")} at risk
          </span>
        )}
      </p>

      <input
        type="search"
        placeholder="Search name, email, phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 border rounded-lg px-3 py-2 text-sm"
      />

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-600">No abandoned carts right now.</p>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden border overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Cart value</th>
                <th className="py-3 px-4">Abandoned</th>
                <th className="py-3 px-4">Recovery</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <Fragment key={c.userKey}>
                  <tr className="border-t align-top">
                    <td className="py-3 px-4">
                      {c.name || c.email || c.phone ? (
                        <div>
                          {c.name && <div className="font-medium">{c.name}</div>}
                          <div className="text-xs text-slate-500">
                            {c.email || c.phone ? "Guest/Registered" : "Guest"}
                          </div>
                          {c.email && <div className="text-xs text-slate-500">{c.email}</div>}
                          {c.phone && <div className="text-xs text-slate-500">{c.phone}</div>}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Anonymous guest</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <ul className="space-y-0.5">
                        {c.items.slice(0, 2).map((i) => (
                          <li key={i.productSlug} className="text-xs text-slate-600">
                            {i.quantity}× {i.name}
                          </li>
                        ))}
                        {c.items.length > 2 && (
                          <li className="text-xs text-slate-400">+{c.items.length - 2} more</li>
                        )}
                      </ul>
                    </td>
                    <td className="py-3 px-4 font-medium whitespace-nowrap">
                      {formatMoney(c.value, c.currency ?? "USD")}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      <div>{abandonedDuration(c)} ago</div>
                      <div>{new Date(c.updatedAt).toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={recoveryMap[c.userKey] ?? "not_sent"}
                        onChange={(e) => setRecovery(c.userKey, e.target.value as RecoveryStatus)}
                        className="text-xs border rounded px-1 py-0.5"
                      >
                        <option value="not_sent">Not sent</option>
                        <option value="email_sent">Email sent</option>
                        <option value="whatsapp_sent">WhatsApp sent</option>
                        <option value="recovered">Recovered</option>
                        <option value="expired">Expired</option>
                      </select>
                      <div className="text-[10px] text-slate-400 mt-1">{recoveryLabel(c.userKey)}</div>
                    </td>
                    <td className="py-3 px-4 text-xs space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === c.userKey ? null : c.userKey)}
                        className="text-nav hover:underline"
                      >
                        View
                      </button>
                      {c.email && (
                        <button
                          type="button"
                          onClick={() => sendRecoveryEmail(c)}
                          className="text-nav hover:underline"
                        >
                          Email
                        </button>
                      )}
                      {c.phone && (
                        <button
                          type="button"
                          onClick={() => whatsappReminder(c)}
                          className="text-nav hover:underline"
                        >
                          WhatsApp
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded === c.userKey && (
                    <tr className="border-t bg-slate-50">
                      <td colSpan={6} className="py-3 px-4">
                        <p className="text-xs font-medium mb-2">Cart details</p>
                        <ul className="text-sm space-y-1">
                          {c.items.map((i) => (
                            <li key={i.productSlug}>
                              {i.quantity}× {i.name} — {formatMoney(i.price * i.quantity, c.currency ?? "USD")}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-slate-500 mt-2">
                          Session: {c.sessionId ?? c.userKey} · SMS reminders: use phone via WhatsApp or external SMS
                          tool
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
