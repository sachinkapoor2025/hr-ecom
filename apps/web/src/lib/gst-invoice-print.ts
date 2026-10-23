import type { GstSalesInvoice, GstSalesReport } from "@hr-ecom/shared";
import { formatGstDate } from "@hr-ecom/shared";

function esc(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(amount: number, currency: string): string {
  const digits = currency === "INR" ? 0 : 2;
  const formatted = amount.toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return currency === "INR" ? `₹${formatted}` : `$${formatted}`;
}

function invoiceHtml(invoice: GstSalesInvoice, report: GstSalesReport): string {
  const supplier = report.supplier;
  const lines = invoice.lines
    .map(
      (line) => `<tr>
        <td>${line.lineNo}</td>
        <td>${esc(line.description)}</td>
        <td>${esc(line.hsnSac)}</td>
        <td class="num">${line.quantity}</td>
        <td>${esc(line.unit)}</td>
        <td class="num">${money(line.rate, invoice.currency)}</td>
        <td class="num">${money(line.discount, invoice.currency)}</td>
        <td class="num">${money(line.taxableValue, invoice.currency)}</td>
        <td class="num">${line.gstRatePercent}%</td>
        <td class="num">${money(line.igst, invoice.currency)}</td>
        <td class="num">${money(line.lineTotal, invoice.currency)}</td>
      </tr>`
    )
    .join("");

  return `<article class="invoice">
    <header class="top">
      <div>
        <p class="kicker">${esc(invoice.documentType)}</p>
        <h1>${esc(supplier.tradeName || supplier.legalName)}</h1>
        <p>${esc(supplier.legalName)}</p>
        <p>${esc(supplier.address || "Supplier address not set")}</p>
        <p>${esc([supplier.stateName, supplier.stateCode ? `State code ${supplier.stateCode}` : "", supplier.pincode].filter(Boolean).join(" · "))}</p>
        <p>GSTIN: <strong>${esc(supplier.gstin || "Not set")}</strong></p>
        <p>${esc(supplier.email)} ${supplier.phone ? `· ${esc(supplier.phone)}` : ""}</p>
      </div>
      <div class="meta">
        <p><span>Invoice no.</span><strong>${esc(invoice.invoiceNumber)}</strong></p>
        <p><span>Invoice date</span><strong>${esc(formatGstDate(invoice.invoiceDate))}</strong></p>
        <p><span>Financial year</span><strong>${esc(invoice.financialYear)}</strong></p>
        <p><span>Supply type</span><strong>${esc(invoice.supplyType)}</strong></p>
        <p><span>Export type</span><strong>${esc(invoice.exportType || "—")}</strong></p>
        <p><span>Place of supply</span><strong>${esc(invoice.placeOfSupplyName)}</strong></p>
        <p><span>Reverse charge</span><strong>${invoice.reverseCharge}</strong></p>
        <p><span>LUT</span><strong>${esc(supplier.lutNumber || "—")}</strong></p>
      </div>
    </header>
    <section class="parties">
      <div>
        <h2>Bill to / ship to</h2>
        <p><strong>${esc(invoice.customerName)}</strong></p>
        <p>GSTIN: ${esc(invoice.customerGstin)} (unregistered)</p>
        <p>${esc(invoice.shipTo)}</p>
        <p>${esc(invoice.customerEmail)} · ${esc(invoice.customerPhone)}</p>
      </div>
      <div>
        <h2>Payment</h2>
        <p>${esc(invoice.paymentProvider)}${invoice.paymentProviderInferred ? " (inferred)" : ""}</p>
        <p>${esc(invoice.paymentReference || "—")}</p>
        <p>Order ${esc(invoice.orderId)}</p>
        <p>Status ${esc(invoice.status)}</p>
      </div>
    </section>
    <table>
      <thead>
        <tr>
          <th>#</th><th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Unit</th>
          <th>Rate</th><th>Discount</th><th>Taxable value</th><th>GST %</th><th>IGST</th><th>Total</th>
        </tr>
      </thead>
      <tbody>${lines}</tbody>
    </table>
    <section class="totals">
      <p><span>Taxable value</span><strong>${money(invoice.taxableValue, invoice.currency)}</strong></p>
      <p><span>CGST</span><strong>${money(invoice.cgst, invoice.currency)}</strong></p>
      <p><span>SGST</span><strong>${money(invoice.sgst, invoice.currency)}</strong></p>
      <p><span>IGST</span><strong>${money(invoice.igst, invoice.currency)}</strong></p>
      <p class="grand"><span>Invoice value</span><strong>${money(invoice.invoiceValue, invoice.currency)}</strong></p>
      <p><span>Invoice value (INR)</span><strong>₹${invoice.invoiceValueInr.toLocaleString("en-IN")}</strong></p>
      <p><span>USD → INR rate</span><strong>${invoice.usdInrRate}</strong></p>
    </section>
    <p class="declaration">${esc(invoice.declaration)}</p>
    <p class="sign">For ${esc(supplier.legalName)}<br/><br/>Authorised signatory</p>
    <section class="cost">
      <h2>Cost working for the CA — not part of the tax invoice value</h2>
      <table>
        <thead>
          <tr><th>Rakhi purchase</th><th>Add-on purchase</th><th>Orange County purchase</th><th>USPS</th><th>USPS basis</th><th>Gateway</th><th>Total cost</th><th>Gross profit</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>$${invoice.rakhiPurchaseUsd.toFixed(2)}</td>
            <td>$${invoice.addonPurchaseUsd.toFixed(2)}</td>
            <td>$${invoice.orangeCountyPurchaseUsd.toFixed(2)}</td>
            <td>$${invoice.uspsUsd.toFixed(2)}</td>
            <td>${esc(invoice.uspsBasis)}</td>
            <td>${(invoice.gatewayFeeRate * 100).toFixed(2)}% · ${money(invoice.gatewayFee, invoice.currency)} ($${invoice.gatewayFeeUsd.toFixed(2)})</td>
            <td>$${invoice.totalCostUsd.toFixed(2)}</td>
            <td>${invoice.grossProfitUsd == null ? "Purchase price missing" : `$${invoice.grossProfitUsd.toFixed(2)}`}</td>
          </tr>
        </tbody>
      </table>
      <ul>
        ${invoice.lines
          .filter((line) => line.costNote)
          .map((line) => `<li>${esc(line.description)} — ${esc(line.costNote)}</li>`)
          .join("")}
      </ul>
    </section>
  </article>`;
}

export function gstInvoicesPrintHtml(report: GstSalesReport): string {
  const body = report.invoices.map((invoice) => invoiceHtml(invoice, report)).join("");
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>UsaRakhi GST sales invoices ${esc(formatGstDate(report.from))} to ${esc(formatGstDate(report.to))}</title>
  <style>
    @page { margin: 16mm; }
    body { font-family: "Segoe UI", system-ui, sans-serif; color: #0f172a; margin: 0; }
    .invoice { page-break-after: always; padding-bottom: 12px; }
    .invoice:last-child { page-break-after: auto; }
    .top, .parties, .totals { display: flex; justify-content: space-between; gap: 24px; }
    .top h1 { margin: 0 0 4px; font-size: 22px; }
    .kicker { letter-spacing: 0.14em; text-transform: uppercase; font-size: 11px; color: #64748b; margin: 0; }
    .meta { min-width: 240px; }
    .meta p, .totals p { display: flex; justify-content: space-between; gap: 16px; margin: 2px 0; font-size: 13px; }
    .meta span, .totals span { color: #64748b; }
    h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin: 0 0 6px; }
    .parties { margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 12px; }
    th, td { border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 12px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; }
    .num { text-align: right; white-space: nowrap; }
    .grand { font-size: 15px; }
    .declaration { font-size: 12px; border: 1px solid #e2e8f0; padding: 8px 10px; }
    .sign { text-align: right; font-size: 13px; margin-top: 28px; }
    .cost { margin-top: 18px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 12px; }
    .cost ul { margin: 8px 0 0; padding-left: 18px; font-size: 12px; }
    .cover { page-break-after: always; margin-bottom: 24px; }
    .cover h1 { margin: 4px 0 12px; font-size: 22px; }
  </style>
</head>
<body>
  <section class="cover">
    <p class="kicker">UsaRakhi GST sales report</p>
    <h1>${esc(formatGstDate(report.from))} to ${esc(formatGstDate(report.to))}</h1>
    <table>
      <thead>
        <tr><th>Total sales (USD)</th><th>Total sales (INR)</th><th>Total expense (USD)</th><th>Total profit (USD)</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>$${report.summary.invoiceValueUsd.toFixed(2)}</td>
          <td>₹${report.summary.invoiceValueInr.toLocaleString("en-IN")}</td>
          <td>$${report.summary.totalCostUsd.toFixed(2)}</td>
          <td>${report.summary.grossProfitUsd == null ? "Purchase price missing" : `$${report.summary.grossProfitUsd.toFixed(2)}`}</td>
        </tr>
      </tbody>
    </table>
    <p style="font-size:12px;color:#64748b">Expense is rakhi, add-ons, Orange County purchase, USPS, and gateway fees. ${report.summary.invoiceCount} paid invoices. Payment filter: ${esc(report.provider)}.</p>
  </section>
  <p style="font-size:12px;color:#64748b">Paid orders only. Refunded, cancelled, and unpaid orders are not included. ${esc(report.costPolicy.note)}</p>
  ${body || "<p>No paid invoices in this period.</p>"}
</body>
</html>`;
}
