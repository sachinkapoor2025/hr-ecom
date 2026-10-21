import { VENDOR_ORANGE_COUNTY } from "../constants";
import { convertCurrencyAmount, roundForCurrency, type ShopCurrency } from "../currency";
import type { GstSupplierSettings } from "../schemas/gst-sales";
import {
  ADMIN_ANALYTICS_UTC_OFFSET,
  businessDayKey,
  instantToBusinessDay,
} from "./admin-analytics-tz";
import { displayOrderRef } from "./order-number";
import { lineVendorKey } from "./order-vendors";
import { getProductAddon } from "./product-addons";
import { isRevenueOrder } from "./sales-report";

/** Wholesale cost of one UsaRakhi rakhi (the product itself). */
export const USARAKHI_RAKHI_PURCHASE_USD = 1.5;
/** Wholesale cost of one UsaRakhi add-on unit (chocolate, dry fruit, or extra rakhi). */
export const USARAKHI_ADDON_PURCHASE_USD = 1.49;
/** USPS for a UsaRakhi package that does not include chocolates. */
export const USPS_SINGLE_RAKHI_USD = 6.49;
/** USPS for a UsaRakhi package that includes chocolates. */
export const USPS_RAKHI_WITH_CHOCOLATE_USD = 8.39;

/** Imitation jewellery — rakhi. */
export const GST_HSN_RAKHI = "71179090";
/** Chocolate and other food preparations containing cocoa. */
export const GST_HSN_CHOCOLATE = "18069090";
/** Other nuts. */
export const GST_HSN_DRY_FRUIT = "08029000";
/** Goods transport agency — shipping charged to the customer. */
export const GST_SAC_SHIPPING = "996511";
/** GST place-of-supply code for a country other than India. */
export const GST_EXPORT_POS_CODE = "96";

export const GST_EXPORT_DECLARATION =
  "Supply meant for export under bond or Letter of Undertaking without payment of integrated tax.";

const CHOCOLATE_TEXT = /chocolate|ferrero|lindor|lindt|hershey|kitkat|snickers/;
const DRY_FRUIT_TEXT = /dry[-\s]?fruit|almond|cashew|pista|pistachio|kaju|badam|\bnut/;

export type GstPaymentProvider = "stripe" | "razorpay" | "unknown";
export type GstProviderFilter = "all" | "stripe" | "razorpay";
export type GstPackageType = "single-rakhi" | "rakhi-with-chocolate" | "no-usarakhi";

export type GstOrderItemInput = {
  productSlug: string;
  name: string;
  price: number;
  quantity: number;
  vendorSlug?: string | null;
  vendorCost?: number | null;
  image?: string | null;
  addons?: Array<{ id: string; name: string; price: number; quantity: number }> | null;
};

export type GstOrderInput = {
  orderId: string;
  orderNumber?: string | null;
  createdAt: string;
  status: string;
  statusHistory?: Array<{ status: string; at: string }> | null;
  items: GstOrderItemInput[];
  shipments?: Array<{ shipmentId: string; items: GstOrderItemInput[] }> | null;
  subtotal: number;
  discount?: number | null;
  shipping?: number | null;
  tax?: number | null;
  total: number;
  currency: ShopCurrency;
  paymentProvider?: "stripe" | "razorpay" | null;
  paymentIntentId?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
  };
};

export type GstInvoiceLine = {
  lineNo: number;
  kind: "goods" | "shipping" | "adjustment";
  description: string;
  hsnSac: string;
  quantity: number;
  unit: "NOS" | "PAC";
  rate: number;
  discount: number;
  taxableValue: number;
  gstRatePercent: number;
  cgst: number;
  sgst: number;
  igst: number;
  lineTotal: number;
  vendor: "UsaRakhi" | "Orange County" | "";
  purchaseUsd: number | null;
  costNote: string;
};

export type GstShipmentCost = {
  shipmentId: string;
  packageType: GstPackageType;
  uspsUsd: number;
};

export type GstSalesInvoice = {
  orderId: string;
  invoiceNumber: string;
  invoiceDate: string;
  paidAt: string;
  financialYear: string;
  documentType: "Tax Invoice";
  supplyType: "EXPWOP" | "B2C";
  exportType: "WOPAY" | "";
  placeOfSupplyCode: string;
  placeOfSupplyName: string;
  reverseCharge: "N";
  declaration: string;
  paymentProvider: GstPaymentProvider;
  paymentProviderInferred: boolean;
  paymentReference: string;
  currency: ShopCurrency;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGstin: "URP";
  shipTo: string;
  country: string;
  countryName: string;
  state: string;
  lines: GstInvoiceLine[];
  subtotal: number;
  discount: number;
  shippingCharged: number;
  taxCharged: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  invoiceValue: number;
  usdInrRate: number;
  invoiceValueInr: number;
  invoiceValueUsd: number;
  taxableValueInr: number;
  rakhiPurchaseUsd: number;
  addonPurchaseUsd: number;
  orangeCountyPurchaseUsd: number;
  uspsUsd: number;
  uspsBasis: string;
  totalCostUsd: number;
  missingPurchaseCost: boolean;
  grossProfitUsd: number | null;
  shipmentCosts: GstShipmentCost[];
  status: string;
};

export type GstSalesReport = {
  generatedAt: string;
  from: string;
  to: string;
  provider: GstProviderFilter;
  usdInrRate: number;
  usdInrRateSource: string;
  supplier: GstSupplierSettings;
  costPolicy: {
    usarakhiRakhiPurchaseUsd: number;
    usarakhiAddonPurchaseUsd: number;
    uspsSingleRakhiUsd: number;
    uspsRakhiWithChocolateUsd: number;
    note: string;
  };
  summary: {
    invoiceCount: number;
    invoiceValueUsd: number;
    invoiceValueInr: number;
    taxableValueInr: number;
    igstInr: number;
    rakhiPurchaseUsd: number;
    addonPurchaseUsd: number;
    orangeCountyPurchaseUsd: number;
    uspsUsd: number;
    totalCostUsd: number;
    grossProfitUsd: number | null;
    missingPurchaseCostInvoices: number;
    stripeCount: number;
    razorpayCount: number;
    excluded: {
      refunded: number;
      cancelled: number;
      pendingPayment: number;
      otherProvider: number;
    };
  };
  invoices: GstSalesInvoice[];
};

const COST_POLICY_NOTE =
  "UsaRakhi rakhi purchase is $1.50 each. Every add-on unit is $1.49. Orange County purchase is the stored vendor cost. USPS is once per UsaRakhi package: $6.49 when the package has no chocolates, $8.39 when the product or an add-on includes chocolates. Dry-fruit add-ons use the $6.49 package. Refunded, cancelled, and unpaid orders are omitted.";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function money(n: number, currency: ShopCurrency): number {
  return roundForCurrency(n, currency);
}

export function textMentionsChocolate(...parts: Array<string | null | undefined>): boolean {
  return CHOCOLATE_TEXT.test(parts.filter(Boolean).join(" ").toLowerCase());
}

export function textMentionsDryFruit(...parts: Array<string | null | undefined>): boolean {
  return DRY_FRUIT_TEXT.test(parts.filter(Boolean).join(" ").toLowerCase());
}

export function addonIsChocolate(addon: { id: string; name: string }): boolean {
  const def = getProductAddon(addon.id);
  if (def?.group === "chocolates") return true;
  return textMentionsChocolate(addon.name, addon.id);
}

export function lineHasChocolate(item: GstOrderItemInput): boolean {
  if (textMentionsChocolate(item.name, item.productSlug)) return true;
  return (item.addons ?? []).some((addon) => addonIsChocolate(addon));
}

export function isOrangeCountyLine(item: GstOrderItemInput): boolean {
  return lineVendorKey(item) === VENDOR_ORANGE_COUNTY;
}

/** Indian financial year label, e.g. 2026-04-21 → "2026-27". */
export function indianFinancialYear(isoDate: string): string {
  const [yearRaw, monthRaw] = isoDate.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!year || !month) return "";
  const start = month >= 4 ? year : year - 1;
  return `${start}-${String(start + 1).slice(-2)}`;
}

/** GST portal style date dd/mm/yyyy from YYYY-MM-DD. */
export function formatGstDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export function gstInvoiceNumber(order: { orderNumber?: string | null; orderId: string }): string {
  const ref = displayOrderRef(order).replace(/[^A-Za-z0-9/-]/g, "");
  return ref.slice(0, 16);
}

export function currentIndianFinancialYearToDate(now = new Date()): { from: string; to: string; label: string } {
  const today = businessDayKey(now);
  const [yearRaw, monthRaw] = today.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const startYear = month >= 4 ? year : year - 1;
  return {
    from: `${startYear}-04-01`,
    to: today,
    label: `FY ${indianFinancialYear(today)}`,
  };
}

export type GstDatePreset = { id: string; label: string; from: string; to: string };

export function gstDatePresets(now = new Date()): GstDatePreset[] {
  const today = businessDayKey(now);
  const [yearRaw, monthRaw] = today.split("-").map(Number);
  const monthStart = `${yearRaw}-${String(monthRaw).padStart(2, "0")}-01`;
  const prevMonthDate = new Date(`${monthStart}T12:00:00${ADMIN_ANALYTICS_UTC_OFFSET}`);
  prevMonthDate.setTime(prevMonthDate.getTime() - 86_400_000);
  const prevKey = businessDayKey(prevMonthDate);
  const [py, pm] = prevKey.split("-");
  const fy = currentIndianFinancialYearToDate(now);
  const [fyStartYear] = fy.from.split("-").map(Number);
  const lastFyFrom = `${fyStartYear - 1}-04-01`;
  const lastFyTo = `${fyStartYear}-03-31`;
  return [
    { id: "this-month", label: "This month", from: monthStart, to: today },
    { id: "last-month", label: "Last month", from: `${py}-${pm}-01`, to: prevKey },
    { id: "this-fy", label: fy.label, from: fy.from, to: fy.to },
    { id: "last-fy", label: `FY ${indianFinancialYear(lastFyFrom)}`, from: lastFyFrom, to: lastFyTo },
  ];
}

export function resolveGstPaymentProvider(order: Pick<
  GstOrderInput,
  "paymentProvider" | "currency" | "paymentIntentId" | "razorpayOrderId" | "razorpayPaymentId"
>): { provider: GstPaymentProvider; inferred: boolean } {
  if (order.paymentProvider === "stripe" || order.paymentProvider === "razorpay") {
    return { provider: order.paymentProvider, inferred: false };
  }
  if (order.razorpayPaymentId || order.razorpayOrderId) return { provider: "razorpay", inferred: true };
  if (order.paymentIntentId) return { provider: "stripe", inferred: true };
  if (order.currency === "INR") return { provider: "razorpay", inferred: true };
  if (order.currency === "USD") return { provider: "stripe", inferred: true };
  return { provider: "unknown", inferred: true };
}

function countryName(code: string): string {
  const names: Record<string, string> = {
    US: "United States",
    IN: "India",
    CA: "Canada",
    GB: "United Kingdom",
    AU: "Australia",
    AE: "United Arab Emirates",
    SG: "Singapore",
  };
  const upper = code.trim().toUpperCase();
  return names[upper] ?? (upper || "Unknown");
}

function formatAddress(order: GstOrderInput): string {
  const a = order.shippingAddress;
  return [a.line1, a.line2, a.city, a.state, a.postalCode, countryName(a.country)]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

function hsnForProduct(item: GstOrderItemInput): string {
  if (textMentionsChocolate(item.name, item.productSlug)) return GST_HSN_CHOCOLATE;
  if (textMentionsDryFruit(item.name, item.productSlug)) return GST_HSN_DRY_FRUIT;
  return GST_HSN_RAKHI;
}

function hsnForAddon(addon: { id: string; name: string }): string {
  const def = getProductAddon(addon.id);
  if (def?.group === "chocolates" || addonIsChocolate(addon)) return GST_HSN_CHOCOLATE;
  if (def?.group === "dry-fruits" || textMentionsDryFruit(addon.name, addon.id)) return GST_HSN_DRY_FRUIT;
  return GST_HSN_RAKHI;
}

function packageTypeForItems(items: GstOrderItemInput[]): GstPackageType {
  const ours = items.filter((item) => !isOrangeCountyLine(item));
  if (!ours.length) return "no-usarakhi";
  if (ours.some((item) => lineHasChocolate(item))) return "rakhi-with-chocolate";
  return "single-rakhi";
}

function uspsForPackage(type: GstPackageType): number {
  if (type === "rakhi-with-chocolate") return USPS_RAKHI_WITH_CHOCOLATE_USD;
  if (type === "single-rakhi") return USPS_SINGLE_RAKHI_USD;
  return 0;
}

export function shipmentCostsForOrder(order: Pick<GstOrderInput, "items" | "shipments">): GstShipmentCost[] {
  const groups =
    order.shipments && order.shipments.length > 0
      ? order.shipments.map((shipment) => ({
          shipmentId: shipment.shipmentId,
          items: shipment.items,
        }))
      : [{ shipmentId: "primary", items: order.items }];

  return groups.map((group) => {
    const packageType = packageTypeForItems(group.items);
    return {
      shipmentId: group.shipmentId,
      packageType,
      uspsUsd: uspsForPackage(packageType),
    };
  });
}

function uspsBasisLabel(costs: GstShipmentCost[]): string {
  const billed = costs.filter((cost) => cost.uspsUsd > 0);
  if (!billed.length) return "No UsaRakhi package";
  return billed
    .map((cost) => {
      if (cost.packageType === "rakhi-with-chocolate") {
        return `Rakhi with chocolates $${USPS_RAKHI_WITH_CHOCOLATE_USD.toFixed(2)}`;
      }
      return `Single rakhi $${USPS_SINGLE_RAKHI_USD.toFixed(2)}`;
    })
    .join("; ");
}

type DraftLine = Omit<GstInvoiceLine, "lineNo" | "discount" | "taxableValue" | "lineTotal" | "cgst" | "sgst" | "igst"> & {
  gross: number;
};

function purchaseForProduct(item: GstOrderItemInput): { usd: number | null; note: string; vendor: "UsaRakhi" | "Orange County" } {
  const qty = item.quantity;
  if (isOrangeCountyLine(item)) {
    if (typeof item.vendorCost === "number" && Number.isFinite(item.vendorCost) && item.vendorCost >= 0) {
      return {
        usd: round2(item.vendorCost * qty),
        note: `Orange County purchase $${item.vendorCost.toFixed(2)} × ${qty}`,
        vendor: "Orange County",
      };
    }
    return { usd: null, note: "Orange County purchase price missing on this line", vendor: "Orange County" };
  }
  return {
    usd: round2(USARAKHI_RAKHI_PURCHASE_USD * qty),
    note: `UsaRakhi rakhi $${USARAKHI_RAKHI_PURCHASE_USD.toFixed(2)} × ${qty}`,
    vendor: "UsaRakhi",
  };
}

function draftLines(order: GstOrderInput): { lines: DraftLine[]; rakhiPurchaseUsd: number; addonPurchaseUsd: number; orangeCountyPurchaseUsd: number; missingPurchaseCost: boolean } {
  const lines: DraftLine[] = [];
  let rakhiPurchaseUsd = 0;
  let addonPurchaseUsd = 0;
  let orangeCountyPurchaseUsd = 0;
  let missingPurchaseCost = false;

  for (const item of order.items) {
    const product = purchaseForProduct(item);
    if (product.usd == null) missingPurchaseCost = true;
    else if (product.vendor === "Orange County") orangeCountyPurchaseUsd += product.usd;
    else rakhiPurchaseUsd += product.usd;

    const gross = money(item.price * item.quantity, order.currency);
    lines.push({
      kind: "goods",
      description: item.name,
      hsnSac: hsnForProduct(item),
      quantity: item.quantity,
      unit: "NOS",
      rate: money(item.price, order.currency),
      gross,
      gstRatePercent: 0,
      vendor: product.vendor,
      purchaseUsd: product.usd,
      costNote: product.note,
    });

    for (const addon of item.addons ?? []) {
      const addonQty = addon.quantity * item.quantity;
      const addonCost = round2(USARAKHI_ADDON_PURCHASE_USD * addonQty);
      if (!isOrangeCountyLine(item)) addonPurchaseUsd += addonCost;
      const addonGross = money(addon.price * addon.quantity * item.quantity, order.currency);
      lines.push({
        kind: "goods",
        description: `${addon.name} (add-on on ${item.name})`,
        hsnSac: hsnForAddon(addon),
        quantity: addonQty,
        unit: "PAC",
        rate: money(addon.price, order.currency),
        gross: addonGross,
        gstRatePercent: 0,
        vendor: isOrangeCountyLine(item) ? "Orange County" : "UsaRakhi",
        purchaseUsd: isOrangeCountyLine(item) ? 0 : addonCost,
        costNote: isOrangeCountyLine(item)
          ? "Add-on on an Orange County line"
          : `UsaRakhi add-on $${USARAKHI_ADDON_PURCHASE_USD.toFixed(2)} × ${addonQty}`,
      });
    }
  }

  return {
    lines,
    rakhiPurchaseUsd: round2(rakhiPurchaseUsd),
    addonPurchaseUsd: round2(addonPurchaseUsd),
    orangeCountyPurchaseUsd: round2(orangeCountyPurchaseUsd),
    missingPurchaseCost,
  };
}

function allocateDiscount(lines: DraftLine[], discount: number, currency: ShopCurrency): GstInvoiceLine[] {
  const goods = lines.filter((line) => line.kind === "goods");
  const gross = goods.reduce((sum, line) => sum + line.gross, 0);
  let remaining = money(Math.max(0, discount), currency);
  return lines.map((line, index) => {
    let lineDiscount = 0;
    if (line.kind === "goods" && gross > 0 && remaining > 0) {
      const isLastGoods = goods[goods.length - 1] === line;
      lineDiscount = isLastGoods ? remaining : money((discount * line.gross) / gross, currency);
      lineDiscount = Math.min(lineDiscount, line.gross, remaining);
      remaining = money(remaining - lineDiscount, currency);
    }
    const taxableValue = money(line.gross - lineDiscount, currency);
    return {
      lineNo: index + 1,
      kind: line.kind,
      description: line.description,
      hsnSac: line.hsnSac,
      quantity: line.quantity,
      unit: line.unit,
      rate: line.rate,
      discount: lineDiscount,
      taxableValue,
      gstRatePercent: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      lineTotal: taxableValue,
      vendor: line.vendor,
      purchaseUsd: line.purchaseUsd,
      costNote: line.costNote,
    };
  });
}

export function buildGstSalesInvoice(
  order: GstOrderInput,
  options: { usdInrRate: number; paidAt: string }
): GstSalesInvoice {
  const currency = order.currency;
  const paidDay = instantToBusinessDay(options.paidAt) ?? options.paidAt.slice(0, 10);
  const country = (order.shippingAddress.country || "").trim().toUpperCase();
  const isExport = country !== "IN";
  const { provider, inferred } = resolveGstPaymentProvider(order);
  const draft = draftLines(order);
  const discount = money(order.discount ?? 0, currency);
  const shippingCharged = money(order.shipping ?? 0, currency);
  const taxCharged = money(order.tax ?? 0, currency);
  const lines = allocateDiscount(draft.lines, discount, currency);

  if (shippingCharged > 0) {
    lines.push({
      lineNo: lines.length + 1,
      kind: "shipping",
      description: "Shipping charged to customer",
      hsnSac: GST_SAC_SHIPPING,
      quantity: 1,
      unit: "NOS",
      rate: shippingCharged,
      discount: 0,
      taxableValue: shippingCharged,
      gstRatePercent: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      lineTotal: shippingCharged,
      vendor: "",
      purchaseUsd: null,
      costNote: "Customer shipping is invoice value. USPS cost is in the cost working, not in taxable value.",
    });
  }

  const taxableBeforeAdjust = money(
    lines.reduce((sum, line) => sum + line.taxableValue, 0),
    currency
  );
  const invoiceValue = money(order.total, currency);
  const expected = money(taxableBeforeAdjust + taxCharged, currency);
  const drift = money(invoiceValue - expected, currency);
  if (Math.abs(drift) >= (currency === "INR" ? 1 : 0.01)) {
    lines.push({
      lineNo: lines.length + 1,
      kind: "adjustment",
      description: "Rounding / invoice adjustment",
      hsnSac: "",
      quantity: 1,
      unit: "NOS",
      rate: drift,
      discount: 0,
      taxableValue: drift,
      gstRatePercent: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      lineTotal: drift,
      vendor: "",
      purchaseUsd: null,
      costNote: "Aligns the line total with the amount collected on the order",
    });
  }

  const taxableValue = money(
    lines.reduce((sum, line) => sum + line.taxableValue, 0),
    currency
  );
  const igst = isExport ? taxCharged : 0;
  const domesticTax = country === "IN" ? taxCharged : 0;
  const cgst = domesticTax ? money(domesticTax / 2, currency) : 0;
  const sgst = domesticTax ? money(domesticTax - cgst, currency) : 0;

  const shipmentCosts = shipmentCostsForOrder(order);
  const uspsUsd = round2(shipmentCosts.reduce((sum, cost) => sum + cost.uspsUsd, 0));
  const totalCostUsd = round2(
    draft.rakhiPurchaseUsd + draft.addonPurchaseUsd + draft.orangeCountyPurchaseUsd + uspsUsd
  );
  const invoiceValueUsd = round2(convertCurrencyAmount(invoiceValue, currency, "USD", options.usdInrRate));
  const invoiceValueInr = roundForCurrency(
    convertCurrencyAmount(invoiceValue, currency, "INR", options.usdInrRate),
    "INR"
  );
  const taxableValueInr = roundForCurrency(
    convertCurrencyAmount(taxableValue, currency, "INR", options.usdInrRate),
    "INR"
  );

  return {
    orderId: order.orderId,
    invoiceNumber: gstInvoiceNumber(order),
    invoiceDate: paidDay,
    paidAt: options.paidAt,
    financialYear: indianFinancialYear(paidDay),
    documentType: "Tax Invoice",
    supplyType: isExport ? "EXPWOP" : "B2C",
    exportType: isExport ? "WOPAY" : "",
    placeOfSupplyCode: isExport ? GST_EXPORT_POS_CODE : "",
    placeOfSupplyName: isExport ? `${GST_EXPORT_POS_CODE} - Other Country (${countryName(country)})` : order.shippingAddress.state,
    reverseCharge: "N",
    declaration: isExport
      ? GST_EXPORT_DECLARATION
      : "Tax invoice issued to an unregistered person. Tax columns show the tax collected on the order.",
    paymentProvider: provider,
    paymentProviderInferred: inferred,
    paymentReference:
      order.razorpayPaymentId || order.paymentIntentId || order.razorpayOrderId || "",
    currency,
    customerName: order.shippingAddress.name,
    customerEmail: order.shippingAddress.email,
    customerPhone: order.shippingAddress.phone,
    customerGstin: "URP",
    shipTo: formatAddress(order),
    country,
    countryName: countryName(country),
    state: order.shippingAddress.state,
    lines,
    subtotal: money(order.subtotal, currency),
    discount,
    shippingCharged,
    taxCharged,
    taxableValue,
    cgst,
    sgst,
    igst,
    invoiceValue,
    usdInrRate: options.usdInrRate,
    invoiceValueInr,
    invoiceValueUsd,
    taxableValueInr,
    rakhiPurchaseUsd: draft.rakhiPurchaseUsd,
    addonPurchaseUsd: draft.addonPurchaseUsd,
    orangeCountyPurchaseUsd: draft.orangeCountyPurchaseUsd,
    uspsUsd,
    uspsBasis: uspsBasisLabel(shipmentCosts),
    totalCostUsd,
    missingPurchaseCost: draft.missingPurchaseCost,
    grossProfitUsd: draft.missingPurchaseCost ? null : round2(invoiceValueUsd - totalCostUsd),
    shipmentCosts,
    status: order.status,
  };
}

function paidAtOf(order: GstOrderInput): string | null {
  if (!isRevenueOrder(order.status)) return null;
  const paidEntry = order.statusHistory?.find((entry) => entry.status === "paid");
  return paidEntry?.at ?? order.createdAt;
}

function createdDay(order: GstOrderInput): string | undefined {
  return instantToBusinessDay(order.createdAt);
}

function inRange(day: string | undefined, from: string, to: string): boolean {
  return Boolean(day && day >= from && day <= to);
}

export function buildGstSalesReport(input: {
  orders: GstOrderInput[];
  from: string;
  to: string;
  provider: GstProviderFilter;
  usdInrRate: number;
  usdInrRateSource: string;
  supplier: GstSupplierSettings;
  generatedAt?: string;
}): GstSalesReport {
  const excluded = { refunded: 0, cancelled: 0, pendingPayment: 0, otherProvider: 0 };
  const invoices: GstSalesInvoice[] = [];

  for (const order of input.orders) {
    const createdInRange = inRange(createdDay(order), input.from, input.to);
    if (order.status === "refunded") {
      if (createdInRange) excluded.refunded += 1;
      continue;
    }
    if (order.status === "cancelled") {
      if (createdInRange) excluded.cancelled += 1;
      continue;
    }
    if (order.status === "pending_payment") {
      if (createdInRange) excluded.pendingPayment += 1;
      continue;
    }
    if (!isRevenueOrder(order.status)) continue;

    const paidAt = paidAtOf(order);
    if (!paidAt) continue;
    const paidDay = instantToBusinessDay(paidAt);
    if (!inRange(paidDay, input.from, input.to)) continue;

    const { provider } = resolveGstPaymentProvider(order);
    if (input.provider !== "all" && provider !== input.provider) {
      excluded.otherProvider += 1;
      continue;
    }

    invoices.push(buildGstSalesInvoice(order, { usdInrRate: input.usdInrRate, paidAt }));
  }

  invoices.sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate) || a.invoiceNumber.localeCompare(b.invoiceNumber));

  const sum = (pick: (invoice: GstSalesInvoice) => number) =>
    round2(invoices.reduce((total, invoice) => total + pick(invoice), 0));

  const missing = invoices.filter((invoice) => invoice.missingPurchaseCost).length;
  const profitKnown = missing === 0;

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    from: input.from,
    to: input.to,
    provider: input.provider,
    usdInrRate: input.usdInrRate,
    usdInrRateSource: input.usdInrRateSource,
    supplier: input.supplier,
    costPolicy: {
      usarakhiRakhiPurchaseUsd: USARAKHI_RAKHI_PURCHASE_USD,
      usarakhiAddonPurchaseUsd: USARAKHI_ADDON_PURCHASE_USD,
      uspsSingleRakhiUsd: USPS_SINGLE_RAKHI_USD,
      uspsRakhiWithChocolateUsd: USPS_RAKHI_WITH_CHOCOLATE_USD,
      note: COST_POLICY_NOTE,
    },
    summary: {
      invoiceCount: invoices.length,
      invoiceValueUsd: sum((invoice) => invoice.invoiceValueUsd),
      invoiceValueInr: invoices.reduce((total, invoice) => total + invoice.invoiceValueInr, 0),
      taxableValueInr: invoices.reduce((total, invoice) => total + invoice.taxableValueInr, 0),
      igstInr: invoices.reduce((total, invoice) => {
        const igstInr = convertCurrencyAmount(invoice.igst, invoice.currency, "INR", input.usdInrRate);
        return total + roundForCurrency(igstInr, "INR");
      }, 0),
      rakhiPurchaseUsd: sum((invoice) => invoice.rakhiPurchaseUsd),
      addonPurchaseUsd: sum((invoice) => invoice.addonPurchaseUsd),
      orangeCountyPurchaseUsd: sum((invoice) => invoice.orangeCountyPurchaseUsd),
      uspsUsd: sum((invoice) => invoice.uspsUsd),
      totalCostUsd: sum((invoice) => invoice.totalCostUsd),
      grossProfitUsd: profitKnown ? sum((invoice) => invoice.grossProfitUsd ?? 0) : null,
      missingPurchaseCostInvoices: missing,
      stripeCount: invoices.filter((invoice) => invoice.paymentProvider === "stripe").length,
      razorpayCount: invoices.filter((invoice) => invoice.paymentProvider === "razorpay").length,
      excluded,
    },
    invoices,
  };
}

function csvCell(value: string | number | null | undefined): string {
  return value == null ? "" : String(value);
}

export function gstSalesRegisterRows(report: GstSalesReport): string[][] {
  const supplier = report.supplier;
  const header = [
    "UsaRakhi GST sales register",
    `Period ${formatGstDate(report.from)} to ${formatGstDate(report.to)}`,
    `Payment ${report.provider}`,
    `USD-INR ${report.usdInrRate}`,
  ];
  const columns = [
    "Invoice number",
    "Invoice date",
    "Financial year",
    "Document type",
    "Supply type",
    "Export type",
    "Place of supply",
    "Supplier legal name",
    "Supplier GSTIN",
    "Supplier state code",
    "LUT number",
    "Customer name",
    "Customer GSTIN",
    "Ship to",
    "Country",
    "State",
    "Email",
    "Phone",
    "Payment provider",
    "Payment reference",
    "Currency",
    "Taxable value",
    "GST rate %",
    "CGST",
    "SGST",
    "IGST",
    "Invoice value",
    "Invoice value INR",
    "Invoice value USD",
    "USD-INR rate",
    "Reverse charge",
    "Shipping bill number",
    "Shipping bill date",
    "Port code",
    "Rakhi purchase USD",
    "Add-on purchase USD",
    "Orange County purchase USD",
    "USPS USD",
    "USPS basis",
    "Total cost USD",
    "Gross profit USD",
    "Order status",
    "Order id",
    "Declaration",
  ];
  const rows = report.invoices.map((invoice) => [
    invoice.invoiceNumber,
    formatGstDate(invoice.invoiceDate),
    invoice.financialYear,
    invoice.documentType,
    invoice.supplyType,
    invoice.exportType,
    invoice.placeOfSupplyName,
    supplier.legalName,
    supplier.gstin,
    supplier.stateCode,
    supplier.lutNumber,
    invoice.customerName,
    invoice.customerGstin,
    invoice.shipTo,
    invoice.countryName,
    invoice.state,
    invoice.customerEmail,
    invoice.customerPhone,
    invoice.paymentProvider,
    invoice.paymentReference,
    invoice.currency,
    invoice.taxableValue.toFixed(invoice.currency === "INR" ? 0 : 2),
    "0",
    invoice.cgst.toFixed(2),
    invoice.sgst.toFixed(2),
    invoice.igst.toFixed(2),
    invoice.invoiceValue.toFixed(invoice.currency === "INR" ? 0 : 2),
    String(invoice.invoiceValueInr),
    invoice.invoiceValueUsd.toFixed(2),
    String(invoice.usdInrRate),
    invoice.reverseCharge,
    "",
    "",
    "",
    invoice.rakhiPurchaseUsd.toFixed(2),
    invoice.addonPurchaseUsd.toFixed(2),
    invoice.orangeCountyPurchaseUsd.toFixed(2),
    invoice.uspsUsd.toFixed(2),
    invoice.uspsBasis,
    invoice.totalCostUsd.toFixed(2),
    invoice.grossProfitUsd == null ? "" : invoice.grossProfitUsd.toFixed(2),
    invoice.status,
    invoice.orderId,
    invoice.declaration,
  ]);
  return [header, [], columns, ...rows];
}

export function gstSalesLineRows(report: GstSalesReport): string[][] {
  const columns = [
    "Invoice number",
    "Invoice date",
    "Line",
    "Description",
    "HSN/SAC",
    "Quantity",
    "Unit",
    "Rate",
    "Discount",
    "Taxable value",
    "GST rate %",
    "CGST",
    "SGST",
    "IGST",
    "Line total",
    "Currency",
    "Vendor",
    "Purchase USD",
    "Cost note",
    "Customer name",
    "Payment provider",
  ];
  const rows: string[][] = [];
  for (const invoice of report.invoices) {
    for (const line of invoice.lines) {
      rows.push([
        invoice.invoiceNumber,
        formatGstDate(invoice.invoiceDate),
        String(line.lineNo),
        line.description,
        line.hsnSac,
        String(line.quantity),
        line.unit,
        line.rate.toFixed(invoice.currency === "INR" ? 0 : 2),
        line.discount.toFixed(invoice.currency === "INR" ? 0 : 2),
        line.taxableValue.toFixed(invoice.currency === "INR" ? 0 : 2),
        String(line.gstRatePercent),
        line.cgst.toFixed(2),
        line.sgst.toFixed(2),
        line.igst.toFixed(2),
        line.lineTotal.toFixed(invoice.currency === "INR" ? 0 : 2),
        invoice.currency,
        line.vendor,
        line.purchaseUsd == null ? "" : line.purchaseUsd.toFixed(2),
        line.costNote,
        invoice.customerName,
        invoice.paymentProvider,
      ].map(csvCell));
    }
  }
  return [
    ["UsaRakhi GST invoice lines", `Period ${formatGstDate(report.from)} to ${formatGstDate(report.to)}`],
    [],
    columns,
    ...rows,
  ];
}
