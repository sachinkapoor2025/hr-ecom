import {
  formatGstDate,
  gstSalesLineRows,
  gstSalesRegisterRows,
  gstSalesSummaryRows,
  type GstSalesReport,
} from "@hr-ecom/shared";

function fileStem(report: GstSalesReport): string {
  return `usarakhi-gst-sales-${report.from}-to-${report.to}`;
}

function profitLabel(report: GstSalesReport): string {
  return report.summary.grossProfitUsd == null
    ? "Purchase price missing"
    : report.summary.grossProfitUsd.toFixed(2);
}

/** Workbook with the totals, the GST sales register, and the line items. */
export async function downloadGstReportExcel(report: GstSalesReport): Promise<void> {
  const XLSX = await import("xlsx");
  const book = XLSX.utils.book_new();
  const summary = XLSX.utils.aoa_to_sheet(gstSalesSummaryRows(report));
  summary["!cols"] = [{ wch: 28 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(book, summary, "Summary");
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(gstSalesRegisterRows(report)), "Sales register");
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(gstSalesLineRows(report)), "Line items");
  XLSX.writeFile(book, `${fileStem(report)}.xlsx`);
}

/** Landscape PDF of the period totals and one row per paid invoice. */
export async function downloadGstReportPdf(report: GstSalesReport): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const summary = report.summary;

  doc.setFontSize(16);
  doc.text("UsaRakhi GST sales report", 40, 40);
  doc.setFontSize(10);
  doc.text(
    `${formatGstDate(report.from)} to ${formatGstDate(report.to)}  ·  ${report.provider}  ·  USD-INR ${report.usdInrRate}  ·  ${summary.invoiceCount} invoices`,
    40,
    60
  );
  doc.setFontSize(12);
  doc.text(`Total sales    USD ${summary.invoiceValueUsd.toFixed(2)}     INR ${summary.invoiceValueInr}`, 40, 86);
  doc.text(`Total expense  USD ${summary.totalCostUsd.toFixed(2)}`, 40, 104);
  doc.text(`Total profit   USD ${profitLabel(report)}`, 40, 122);
  doc.setFontSize(9);
  doc.text(
    `Expense breakdown  Rakhi ${summary.rakhiPurchaseUsd.toFixed(2)}   Add-ons ${summary.addonPurchaseUsd.toFixed(2)}   Orange County ${summary.orangeCountyPurchaseUsd.toFixed(2)}   USPS ${summary.uspsUsd.toFixed(2)}   Gateway ${summary.gatewayFeeUsd.toFixed(2)}`,
    40,
    142
  );

  autoTable(doc, {
    startY: 158,
    head: [["Invoice", "Date", "Customer", "Payment", "Currency", "Sales", "Sales INR", "Expense USD", "Profit USD"]],
    body: report.invoices.map((invoice) => [
      invoice.invoiceNumber,
      formatGstDate(invoice.invoiceDate),
      invoice.customerName,
      invoice.paymentProvider,
      invoice.currency,
      invoice.invoiceValue.toFixed(invoice.currency === "INR" ? 0 : 2),
      String(invoice.invoiceValueInr),
      invoice.totalCostUsd.toFixed(2),
      invoice.grossProfitUsd == null ? "" : invoice.grossProfitUsd.toFixed(2),
    ]),
    foot: [[
      "Total",
      "",
      "",
      "",
      "",
      "",
      String(summary.invoiceValueInr),
      summary.totalCostUsd.toFixed(2),
      profitLabel(report),
    ]],
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [15, 23, 42] },
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: "bold" },
    margin: { left: 40, right: 40 },
  });

  doc.save(`${fileStem(report)}.pdf`);
}
