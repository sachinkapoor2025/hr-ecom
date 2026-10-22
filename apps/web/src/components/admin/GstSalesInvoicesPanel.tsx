"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  gstDatePresets,
  type GstProviderFilter,
  type GstSalesReport,
  type GstSupplierSettings,
} from "@hr-ecom/shared";
import { formatMoney, paginate } from "@/lib/admin-utils";
import { useApiClient, useAuth } from "@/lib/auth-context";
import { gstInvoicesPrintHtml } from "@/lib/gst-invoice-print";
import { downloadGstReportExcel, downloadGstReportPdf } from "@/lib/gst-report-download";

const PAGE_SIZE = 20;

function moneyPair(usd: number, inr: number) {
  return `${formatMoney(usd, "USD")} · ${formatMoney(inr, "INR")}`;
}

export function GstSalesInvoicesPanel() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const api = useApiClient();
  const presets = useMemo(() => gstDatePresets(), []);
  const initial = presets.find((preset) => preset.id === "this-fy") ?? presets[0]!;

  const [presetId, setPresetId] = useState(initial.id);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [provider, setProvider] = useState<GstProviderFilter>("all");
  const [rateInput, setRateInput] = useState("");
  const [report, setReport] = useState<GstSalesReport | null>(null);
  const [supplier, setSupplier] = useState<GstSupplierSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const rateRef = useRef(rateInput);
  rateRef.current = rateInput;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ from, to, provider });
    const rate = rateRef.current.trim();
    if (rate) params.set("usdInrRate", rate);
    try {
      const next = await api<GstSalesReport>(`/admin/gst/sales-invoices?${params.toString()}`);
      setReport(next);
      setSupplier(next.supplier);
      if (!rate) setRateInput(String(next.usdInrRate));
    } catch (err) {
      setReport(null);
      setError(err instanceof Error ? err.message : "Could not load GST sales invoices");
    } finally {
      setLoading(false);
    }
  }, [api, from, to, provider]);

  useEffect(() => {
    if (!authLoading && isSuperAdmin) void load();
  }, [authLoading, isSuperAdmin, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const invoices = report?.invoices ?? [];
    if (!q) return invoices;
    return invoices.filter((invoice) =>
      [invoice.invoiceNumber, invoice.customerName, invoice.customerEmail, invoice.paymentReference, invoice.orderId]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [report, search]);

  const paged = paginate(filtered, page, PAGE_SIZE);

  const applyPreset = (id: string) => {
    const preset = presets.find((item) => item.id === id);
    setPresetId(id);
    if (preset) {
      setFrom(preset.from);
      setTo(preset.to);
    }
    setPage(1);
  };

  const saveSupplier = async () => {
    if (!supplier) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = await api<{ settings: GstSupplierSettings }>("/admin/gst/settings", {
        method: "PUT",
        body: JSON.stringify(supplier),
      });
      setSupplier(saved.settings);
      setNotice("Supplier details saved. They will appear on the next download.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save GST details");
    } finally {
      setSaving(false);
    }
  };

  const printInvoices = () => {
    if (!report) return;
    const html = gstInvoicesPrintHtml({ ...report, supplier: supplier ?? report.supplier });
    const win = window.open("", "_blank", "width=980,height=800");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  if (authLoading) return <p className="text-slate-500 p-6">Loading…</p>;

  if (!isSuperAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">GST sales invoices</h1>
        <p className="text-sm text-slate-600 mt-2">
          This report includes purchase prices, so it is available on the super admin account.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">GST sales invoices</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Paid orders only, in the shape a chartered accountant needs for Indian GST. Refunded,
            cancelled, and unpaid orders stay off the register. Export invoices are zero-rated under LUT.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!report}
            onClick={() => report && void downloadGstReportExcel({ ...report, supplier: supplier ?? report.supplier })}
            className="text-sm px-3 py-2 rounded-lg bg-nav text-white disabled:opacity-50"
          >
            Download Excel
          </button>
          <button
            type="button"
            disabled={!report}
            onClick={() => report && void downloadGstReportPdf({ ...report, supplier: supplier ?? report.supplier })}
            className="text-sm px-3 py-2 rounded-lg bg-nav text-white disabled:opacity-50"
          >
            Download PDF
          </button>
          <button
            type="button"
            disabled={!report}
            onClick={printInvoices}
            className="text-sm px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            Print invoices
          </button>
        </div>
      </div>

      {supplier && !supplier.gstin && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Add the GSTIN, state code, and LUT number before you send this file to your CA. The register still downloads with those fields blank.
        </p>
      )}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {notice && <p className="mb-4 text-sm text-emerald-700">{notice}</p>}

      {supplier && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-800">Supplier on the tax invoice</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
            {(
              [
                ["legalName", "Legal name"],
                ["tradeName", "Trade name"],
                ["gstin", "GSTIN"],
                ["stateName", "State"],
                ["stateCode", "State code"],
                ["pincode", "PIN code"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["lutNumber", "LUT number"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-xs text-slate-500 block">
                {label}
                <input
                  value={supplier[key]}
                  onChange={(event) => setSupplier({ ...supplier, [key]: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </label>
            ))}
            <label className="text-xs text-slate-500 block md:col-span-2 xl:col-span-3">
              Address
              <textarea
                value={supplier.address}
                onChange={(event) => setSupplier({ ...supplier, address: event.target.value })}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => void saveSupplier()}
            disabled={saving}
            className="mt-3 text-sm px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save supplier details"}
          </button>
        </section>
      )}

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={`text-sm px-3 py-1.5 rounded-lg border ${
                presetId === preset.id ? "bg-nav text-white border-nav" : "border-slate-300 hover:bg-slate-50"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="text-xs text-slate-500">
            From
            <input
              type="date"
              value={from}
              onChange={(event) => {
                setPresetId("custom");
                setFrom(event.target.value);
                setPage(1);
              }}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="text-xs text-slate-500">
            To
            <input
              type="date"
              value={to}
              onChange={(event) => {
                setPresetId("custom");
                setTo(event.target.value);
                setPage(1);
              }}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="text-xs text-slate-500">
            USD → INR rate
            <input
              value={rateInput}
              onChange={(event) => setRateInput(event.target.value)}
              className="mt-1 block w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            {(
              [
                ["all", "All paid"],
                ["stripe", "Stripe"],
                ["razorpay", "Razorpay"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setProvider(id);
                  setPage(1);
                }}
                className={`text-sm px-3 py-2 ${provider === id ? "bg-nav text-white" : "bg-white hover:bg-slate-50"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="text-sm px-3 py-2 rounded-lg bg-nav text-white"
          >
            Refresh
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Dates are India Standard Time. {report?.costPolicy.note}
        </p>
      </section>

      {loading && <p className="text-sm text-slate-500">Loading paid invoices…</p>}

      {report && !loading && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Summary
              label="Total sales"
              value={moneyPair(report.summary.invoiceValueUsd, report.summary.invoiceValueInr)}
              hint={`${report.summary.invoiceCount} invoices · ${report.summary.stripeCount} Stripe · ${report.summary.razorpayCount} Razorpay`}
            />
            <Summary
              label="Total expense"
              value={formatMoney(report.summary.totalCostUsd, "USD")}
              hint="Purchase, USPS, and gateway fees"
            />
            <Summary
              label="Total profit"
              value={
                report.summary.grossProfitUsd == null
                  ? "—"
                  : formatMoney(report.summary.grossProfitUsd, "USD")
              }
              hint={
                report.summary.grossProfitUsd == null
                  ? `${report.summary.missingPurchaseCostInvoices} invoices missing a purchase price`
                  : "Sales minus expense"
              }
            />
            <Summary
              label="IGST charged"
              value={formatMoney(report.summary.igstInr, "INR")}
              hint={`Taxable ₹${report.summary.taxableValueInr.toLocaleString("en-IN")} · zero on LUT exports`}
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-sm">
            <CostChip label="Rakhi purchase" value={formatMoney(report.summary.rakhiPurchaseUsd, "USD")} />
            <CostChip label="Add-on purchase" value={formatMoney(report.summary.addonPurchaseUsd, "USD")} />
            <CostChip label="Orange County purchase" value={formatMoney(report.summary.orangeCountyPurchaseUsd, "USD")} />
            <CostChip label="USPS" value={formatMoney(report.summary.uspsUsd, "USD")} />
            <CostChip label="Gateway" value={formatMoney(report.summary.gatewayFeeUsd, "USD")} />
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Left out of this view: {report.summary.excluded.refunded} refunded, {report.summary.excluded.cancelled} cancelled, {report.summary.excluded.pendingPayment} unpaid
            {report.summary.excluded.otherProvider > 0 ? `, ${report.summary.excluded.otherProvider} paid on the other payment method` : ""}.
            Rate source: {report.usdInrRateSource} ({report.usdInrRate}).
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search invoice, customer, email, payment id"
              className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500">{filtered.length} invoices</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Invoice</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2 text-right">Invoice value</th>
                  <th className="px-3 py-2 text-right">INR</th>
                  <th className="px-3 py-2 text-right">Cost</th>
                  <th className="px-3 py-2 text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {paged.items.map((invoice) => {
                  const open = openId === invoice.orderId;
                  return (
                    <Fragment key={invoice.orderId}>
                      <tr
                        className="border-t border-slate-100 cursor-pointer hover:bg-slate-50"
                        onClick={() => setOpenId(open ? null : invoice.orderId)}
                      >
                        <td className="px-3 py-2">
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-slate-500">{invoice.invoiceDate} · {invoice.supplyType}</p>
                        </td>
                        <td className="px-3 py-2">
                          <p>{invoice.customerName}</p>
                          <p className="text-xs text-slate-500">{invoice.countryName}</p>
                        </td>
                        <td className="px-3 py-2 capitalize">{invoice.paymentProvider}</td>
                        <td className="px-3 py-2 text-right">{formatMoney(invoice.invoiceValue, invoice.currency)}</td>
                        <td className="px-3 py-2 text-right">{formatMoney(invoice.invoiceValueInr, "INR")}</td>
                        <td className="px-3 py-2 text-right">{formatMoney(invoice.totalCostUsd, "USD")}</td>
                        <td className="px-3 py-2 text-right">
                          {invoice.grossProfitUsd == null ? "—" : formatMoney(invoice.grossProfitUsd, "USD")}
                        </td>
                      </tr>
                      {open && (
                        <tr className="border-t border-slate-100 bg-slate-50">
                          <td colSpan={7} className="px-3 py-3">
                            <p className="text-xs text-slate-600 mb-2">{invoice.shipTo}</p>
                            <p className="text-xs text-slate-600 mb-2">{invoice.declaration}</p>
                            <p className="text-xs text-slate-600 mb-2">USPS: {invoice.uspsBasis} ({formatMoney(invoice.uspsUsd, "USD")})</p>
                            <p className="text-xs text-slate-600 mb-2">
                              Gateway {(invoice.gatewayFeeRate * 100).toFixed(2)}% of {formatMoney(invoice.invoiceValue, invoice.currency)} = {formatMoney(invoice.gatewayFee, invoice.currency)} ({formatMoney(invoice.gatewayFeeUsd, "USD")})
                            </p>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-slate-500">
                                  <th className="text-left py-1">Description</th>
                                  <th className="text-left py-1">HSN/SAC</th>
                                  <th className="text-right py-1">Qty</th>
                                  <th className="text-right py-1">Taxable</th>
                                  <th className="text-right py-1">Purchase</th>
                                </tr>
                              </thead>
                              <tbody>
                                {invoice.lines.map((line) => (
                                  <tr key={line.lineNo}>
                                    <td className="py-1 pr-2">{line.description}</td>
                                    <td className="py-1">{line.hsnSac || "—"}</td>
                                    <td className="py-1 text-right">{line.quantity}</td>
                                    <td className="py-1 text-right">{formatMoney(line.taxableValue, invoice.currency)}</td>
                                    <td className="py-1 text-right">{line.purchaseUsd == null ? "—" : formatMoney(line.purchaseUsd, "USD")}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {paged.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                      No paid invoices for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {paged.totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-3">
              <button type="button" disabled={page <= 1} onClick={() => setPage((n) => n - 1)} className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40">Previous</button>
              <span className="text-xs text-slate-500">Page {paged.page} of {paged.totalPages}</span>
              <button type="button" disabled={page >= paged.totalPages} onClick={() => setPage((n) => n + 1)} className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Summary({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold mt-1">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{hint}</p>
    </div>
  );
}

function CostChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
