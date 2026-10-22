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
/** Default wholesale cost of one UsaRakhi add-on. Small badam and kaju packs use this price. */
export const USARAKHI_ADDON_PURCHASE_USD = 1.49;
/** Kaju katli included on a UsaRakhi product, or sold as that product. */
export const USARAKHI_KAJU_KATLI_PURCHASE_USD = 11.99;
/** Ferrero Rocher pack. */
export const USARAKHI_FERRERO_PACK_PURCHASE_USD = 3;
/** Lindt / Lindor chocolate pack. */
export const USARAKHI_LINDT_PACK_PURCHASE_USD = 4;
/** 100 g pack of kaju, badam, or pista. */
export const USARAKHI_NUT_100G_PURCHASE_USD = 3.99;
/** 200 g pack of kaju, badam, or pista. */
export const USARAKHI_NUT_200G_PURCHASE_USD = 7.99;
/** USPS for a standard UsaRakhi package that does not include chocolates. */
export const USPS_SINGLE_RAKHI_USD = 6.49;
/** USPS for a standard UsaRakhi package that includes chocolates. */
export const USPS_RAKHI_WITH_CHOCOLATE_USD = 8.39;
/** USPS for a UsaRakhi package when the customer chose express (3-day) or 2-day shipping. */
export const USPS_EXPEDITED_USARAKHI_USD = 9.79;
/** Extra USPS added once per Orange County package on express or 2-day shipping. */
export const USPS_EXPEDITED_ORANGE_COUNTY_USD = 11;
/** Payment gateway expense when the customer was charged in INR. */
export const GATEWAY_FEE_RATE_INR = 0.0219;
/** Payment gateway expense when the customer was charged in USD. */
export const GATEWAY_FEE_RATE_USD = 0.0367;

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

export type GstShippingMethodInput = {
  shippingOption?: string | null;
  shippingServiceName?: string | null;
  shippingServiceCode?: string | null;
};

export type GstShipmentInput = GstShippingMethodInput & {
  shipmentId: string;
  items: GstOrderItemInput[];
};

export type GstOrderInput = GstShippingMethodInput & {
  orderId: string;
  orderNumber?: string | null;
  createdAt: string;
  status: string;
  statusHistory?: Array<{ status: string; at: string }> | null;
  items: GstOrderItemInput[];
  shipments?: GstShipmentInput[] | null;
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
  expedited: boolean;
  usarakhiUspsUsd: number;
  orangeCountyUspsUsd: number;
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
  /** Share of the charged amount kept by the payment gateway. */
  gatewayFeeRate: number;
  /** Gateway expense in the currency the customer was charged. */
  gatewayFee: number;
  gatewayFeeUsd: number;
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
    kajuKatliPurchaseUsd: number;
    ferreroPackPurchaseUsd: number;
    lindtPackPurchaseUsd: number;
    nut100gPurchaseUsd: number;
    nut200gPurchaseUsd: number;
    uspsSingleRakhiUsd: number;
    uspsRakhiWithChocolateUsd: number;
    uspsExpeditedUsarakhiUsd: number;
    uspsExpeditedOrangeCountyUsd: number;
    gatewayFeeRateInr: number;
    gatewayFeeRateUsd: number;
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
    gatewayFeeUsd: number;
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
  "UsaRakhi rakhi purchase is $1.50 each. Kaju katli is $11.99. A Ferrero Rocher pack is $3. A Lindt chocolate pack is $4. Small packs of badam and kaju stay $1.49, and other add-ons stay $1.49 until a specific price is set. A 100 g pack of kaju, badam, or pista is $3.99, and a 200 g pack is $7.99. When a rakhi also includes one of these, that cost is added to the $1.50 rakhi. Orange County purchase is the stored vendor cost. Standard delivery USPS is once per UsaRakhi package: $6.49 when the package has no chocolates, $8.39 when the product or an add-on includes chocolates. Dry-fruit add-ons stay on the $6.49 package. Orange County standard delivery has no USPS charge. Any other delivery method — express, 3-day, 2-day, Priority, or another service — uses $9.79 once per UsaRakhi package and adds $11.00 once per Orange County package on top of the product purchase price. The payment gateway expense is 2.19% of the amount charged in INR and 3.67% of the amount charged in USD. Refunded, cancelled, and unpaid orders are omitted.";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Gateway expense on the amount collected. INR charges use 2.19%. USD charges use 3.67%. */
export function gatewayChargeExpense(
  chargedAmount: number,
  currency: ShopCurrency,
  usdInrRate: number
): { rate: number; fee: number; feeUsd: number } {
  const rate = currency === "INR" ? GATEWAY_FEE_RATE_INR : GATEWAY_FEE_RATE_USD;
  const fee = round2(Math.max(0, chargedAmount) * rate);
  const feeUsd = round2(convertCurrencyAmount(fee, currency, "USD", usdInrRate));
  return { rate, fee, feeUsd };
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

const STANDARD_OPTION = /^(standard|normal|ground|ground_advantage)$/;

/** USPS classes that are the everyday standard label, not a faster service. */
const STANDARD_SERVICE_CODES = new Set([
  "STANDARD",
  "USPS_GROUND_ADVANTAGE",
  "GROUND_ADVANTAGE",
]);

function isStandardServiceName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return false;
  if (/\b(express|overnight|priority)\b/.test(normalized)) return false;
  if (/\b[23][-\s]?day\b/.test(normalized)) return false;
  return /\b(standard|normal|ground)\b/.test(normalized);
}

/**
 * Standard / normal delivery keeps the $6.49 and $8.39 rates.
 * Express, 3-day, 2-day, Priority, and any other recorded method use the higher postage.
 * A blank method is standard: that is the delivery used when no other speed was stored.
 */
export function isExpeditedShippingMethod(method: GstShippingMethodInput | null | undefined): boolean {
  if (!method) return false;
  const option = (method.shippingOption ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const code = (method.shippingServiceCode ?? "").trim().toUpperCase();
  const name = (method.shippingServiceName ?? "").trim();
  const codeIsStandard = !code || STANDARD_SERVICE_CODES.has(code);
  const nameIsStandard = !name || isStandardServiceName(name);

  if (option) {
    if (!STANDARD_OPTION.test(option)) return true;
    return !(codeIsStandard && nameIsStandard);
  }

  if (!code && !name) return false;
  return !(codeIsStandard && nameIsStandard);
}

function postageForItems(items: GstOrderItemInput[], expedited: boolean): Pick<
  GstShipmentCost,
  "packageType" | "usarakhiUspsUsd" | "orangeCountyUspsUsd" | "uspsUsd"
> {
  const packageType = packageTypeForItems(items);
  const hasUsarakhi = items.some((item) => !isOrangeCountyLine(item));
  const hasOrangeCounty = items.some((item) => isOrangeCountyLine(item));
  const usarakhiUspsUsd = expedited
    ? hasUsarakhi ? USPS_EXPEDITED_USARAKHI_USD : 0
    : uspsForPackage(packageType);
  const orangeCountyUspsUsd = expedited && hasOrangeCounty ? USPS_EXPEDITED_ORANGE_COUNTY_USD : 0;
  return {
    packageType,
    usarakhiUspsUsd,
    orangeCountyUspsUsd,
    uspsUsd: round2(usarakhiUspsUsd + orangeCountyUspsUsd),
  };
}

export function shipmentCostsForOrder(
  order: Pick<GstOrderInput, "items" | "shipments" | "shippingOption" | "shippingServiceName" | "shippingServiceCode">
): GstShipmentCost[] {
  const orderExpedited = isExpeditedShippingMethod(order);
  const groups =
    order.shipments && order.shipments.length > 0
      ? order.shipments
      : [{ shipmentId: "primary", items: order.items }];

  return groups.map((group) => {
    const expedited = orderExpedited || isExpeditedShippingMethod(group);
    return {
      shipmentId: group.shipmentId,
      expedited,
      ...postageForItems(group.items, expedited),
    };
  });
}

function moneyLabel(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function uspsBasisLabel(costs: GstShipmentCost[]): string {
  const billed = costs.filter((cost) => cost.uspsUsd > 0);
  if (!billed.length) return "No postage on this order";
  return billed
    .map((cost) => {
      const parts: string[] = [];
      if (cost.usarakhiUspsUsd > 0) {
        if (cost.expedited) parts.push(`UsaRakhi other delivery ${moneyLabel(cost.usarakhiUspsUsd)}`);
        else if (cost.packageType === "rakhi-with-chocolate") {
          parts.push(`Rakhi with chocolates ${moneyLabel(cost.usarakhiUspsUsd)}`);
        } else parts.push(`Single rakhi ${moneyLabel(cost.usarakhiUspsUsd)}`);
      }
      if (cost.orangeCountyUspsUsd > 0) {
        parts.push(`Orange County other delivery ${moneyLabel(cost.orangeCountyUspsUsd)}`);
      }
      return parts.join(" + ");
    })
    .join("; ");
}

type DraftLine = Omit<GstInvoiceLine, "lineNo" | "discount" | "taxableValue" | "lineTotal" | "cgst" | "sgst" | "igst"> & {
  gross: number;
};

const NUT_WORD = "kaju|cashews?|badam|almonds?|pista|pistachios?";

function nutKind(word: string): "kaju" | "badam" | "pista" {
  if (/kaju|cashew/.test(word)) return "kaju";
  if (/badam|almond/.test(word)) return "badam";
  return "pista";
}

/** 100 g and 200 g kaju, badam, and pista packs. Kaju katli is not a nut pack. */
export function nutPackCounts(raw: string): { g100: number; g200: number } {
  const withoutKatli = raw.replace(
    /(?:\d+\s*(?:g|gm|grm|grams?)\s*)?kaju[\s-]*katli(?:\s*\d+\s*(?:g|gm|grm|grams?))?/gi,
    " "
  );
  const text = withoutKatli
    .toLowerCase()
    .replace(/(\d+)\s*(?:gm|grm|grams?|g)\b/g, "$1 g")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
  const re = new RegExp(`(?:(100|200) g (${NUT_WORD})|(${NUT_WORD}) (100|200) g)`, "g");
  const seen = new Set<string>();
  let g100 = 0;
  let g200 = 0;
  for (const match of text.matchAll(re)) {
    const weight = match[1] || match[4] || "";
    const nut = (match[2] || match[3] || "").toLowerCase();
    const key = `${weight}:${nutKind(nut)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (weight === "100") g100 += 1;
    if (weight === "200") g200 += 1;
  }
  return { g100, g200 };
}

/**
 * Purchase cost of one UsaRakhi unit from its name and slug.
 * A plain rakhi stays $1.50. Named sweets, chocolate packs, and weighed nut packs
 * use their own cost, and a rakhi that includes them keeps the $1.50 as well.
 */
export function usarakhiUnitPurchase(name: string, slug = ""): { usd: number; note: string } {
  const text = `${name} ${slug}`.toLowerCase();
  const parts: string[] = [];
  let extra = 0;
  if (/kaju[\s-]*katli/.test(text)) {
    extra += USARAKHI_KAJU_KATLI_PURCHASE_USD;
    parts.push(`Kaju katli $${USARAKHI_KAJU_KATLI_PURCHASE_USD.toFixed(2)}`);
  }
  if (/ferrero|rocher/.test(text)) {
    extra += USARAKHI_FERRERO_PACK_PURCHASE_USD;
    parts.push(`Ferrero Rocher pack $${USARAKHI_FERRERO_PACK_PURCHASE_USD.toFixed(2)}`);
  }
  if (/lindt|lindor/.test(text)) {
    extra += USARAKHI_LINDT_PACK_PURCHASE_USD;
    parts.push(`Lindt chocolate pack $${USARAKHI_LINDT_PACK_PURCHASE_USD.toFixed(2)}`);
  }
  const nuts = nutPackCounts(text);
  if (nuts.g100) {
    extra += USARAKHI_NUT_100G_PURCHASE_USD * nuts.g100;
    parts.push(`100 g nuts $${USARAKHI_NUT_100G_PURCHASE_USD.toFixed(2)} × ${nuts.g100}`);
  }
  if (nuts.g200) {
    extra += USARAKHI_NUT_200G_PURCHASE_USD * nuts.g200;
    parts.push(`200 g nuts $${USARAKHI_NUT_200G_PURCHASE_USD.toFixed(2)} × ${nuts.g200}`);
  }
  const rakhi = /\brakhis?\b/.test(text);
  if (!parts.length || rakhi) {
    parts.unshift(`UsaRakhi rakhi $${USARAKHI_RAKHI_PURCHASE_USD.toFixed(2)}`);
    return { usd: round2(USARAKHI_RAKHI_PURCHASE_USD + extra), note: parts.join(" + ") };
  }
  return { usd: round2(extra), note: parts.join(" + ") };
}

/** Add-on purchase. Small badam and kaju packs, extra rakhis, and mixed chocolates stay $1.49. */
export function usarakhiAddonUnitPurchaseUsd(addon: { id: string; name: string }): number {
  const text = `${addon.id} ${addon.name}`.toLowerCase();
  if (/kaju[\s-]*katli/.test(text)) return USARAKHI_KAJU_KATLI_PURCHASE_USD;
  if (/ferrero|rocher/.test(text)) return USARAKHI_FERRERO_PACK_PURCHASE_USD;
  if (/lindt|lindor/.test(text)) return USARAKHI_LINDT_PACK_PURCHASE_USD;
  const nuts = nutPackCounts(text);
  if (nuts.g100 || nuts.g200) {
    return round2(nuts.g100 * USARAKHI_NUT_100G_PURCHASE_USD + nuts.g200 * USARAKHI_NUT_200G_PURCHASE_USD);
  }
  return USARAKHI_ADDON_PURCHASE_USD;
}

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
  const unit = usarakhiUnitPurchase(item.name, item.productSlug);
  return {
    usd: round2(unit.usd * qty),
    note: `(${unit.note}) × ${qty}`,
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
      const addonUnit = usarakhiAddonUnitPurchaseUsd(addon);
      const addonCost = round2(addonUnit * addonQty);
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
          : `UsaRakhi add-on $${addonUnit.toFixed(2)} × ${addonQty}`,
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
  const gateway = gatewayChargeExpense(invoiceValue, currency, options.usdInrRate);
  const totalCostUsd = round2(
    draft.rakhiPurchaseUsd +
      draft.addonPurchaseUsd +
      draft.orangeCountyPurchaseUsd +
      uspsUsd +
      gateway.feeUsd
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
    gatewayFeeRate: gateway.rate,
    gatewayFee: gateway.fee,
    gatewayFeeUsd: gateway.feeUsd,
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
      kajuKatliPurchaseUsd: USARAKHI_KAJU_KATLI_PURCHASE_USD,
      ferreroPackPurchaseUsd: USARAKHI_FERRERO_PACK_PURCHASE_USD,
      lindtPackPurchaseUsd: USARAKHI_LINDT_PACK_PURCHASE_USD,
      nut100gPurchaseUsd: USARAKHI_NUT_100G_PURCHASE_USD,
      nut200gPurchaseUsd: USARAKHI_NUT_200G_PURCHASE_USD,
      uspsSingleRakhiUsd: USPS_SINGLE_RAKHI_USD,
      uspsRakhiWithChocolateUsd: USPS_RAKHI_WITH_CHOCOLATE_USD,
      uspsExpeditedUsarakhiUsd: USPS_EXPEDITED_USARAKHI_USD,
      uspsExpeditedOrangeCountyUsd: USPS_EXPEDITED_ORANGE_COUNTY_USD,
      gatewayFeeRateInr: GATEWAY_FEE_RATE_INR,
      gatewayFeeRateUsd: GATEWAY_FEE_RATE_USD,
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
      gatewayFeeUsd: sum((invoice) => invoice.gatewayFeeUsd),
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

/** Totals block for the on-screen report and for Excel and PDF downloads. */
export function gstSalesSummaryRows(report: GstSalesReport): string[][] {
  const summary = report.summary;
  const profit =
    summary.grossProfitUsd == null ? "Purchase price missing" : summary.grossProfitUsd.toFixed(2);
  return [
    ["UsaRakhi GST sales report", `${formatGstDate(report.from)} to ${formatGstDate(report.to)}`],
    ["Payment", report.provider],
    ["USD-INR rate", String(report.usdInrRate)],
    ["Invoices", String(summary.invoiceCount)],
    [],
    ["Total sales (USD)", summary.invoiceValueUsd.toFixed(2)],
    ["Total sales (INR)", String(summary.invoiceValueInr)],
    ["Total expense (USD)", summary.totalCostUsd.toFixed(2)],
    ["Total profit (USD)", profit],
    [],
    ["Expense breakdown (USD)", ""],
    ["Rakhi purchase", summary.rakhiPurchaseUsd.toFixed(2)],
    ["Add-on purchase", summary.addonPurchaseUsd.toFixed(2)],
    ["Orange County purchase", summary.orangeCountyPurchaseUsd.toFixed(2)],
    ["USPS", summary.uspsUsd.toFixed(2)],
    ["Gateway fees", summary.gatewayFeeUsd.toFixed(2)],
    ["Total expense", summary.totalCostUsd.toFixed(2)],
  ];
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
    "Gateway rate",
    "Gateway fee",
    "Gateway fee USD",
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
    `${(invoice.gatewayFeeRate * 100).toFixed(2)}%`,
    invoice.gatewayFee.toFixed(2),
    invoice.gatewayFeeUsd.toFixed(2),
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
