import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultGstSupplierSettings } from "../schemas/gst-sales";
import {
  GST_EXPORT_POS_CODE,
  GST_HSN_CHOCOLATE,
  GST_HSN_DRY_FRUIT,
  GST_HSN_RAKHI,
  USARAKHI_KAJU_KATLI_PURCHASE_USD,
  USARAKHI_LINDT_PACK_PURCHASE_USD,
  USARAKHI_RAKHI_PURCHASE_USD,
  USPS_EXPEDITED_ORANGE_COUNTY_USD,
  USPS_EXPEDITED_USARAKHI_USD,
  USPS_RAKHI_WITH_CHOCOLATE_USD,
  USPS_SINGLE_RAKHI_USD,
  buildGstSalesInvoice,
  buildGstSalesReport,
  gstInvoiceNumber,
  gstSalesRegisterRows,
  gstSalesSummaryRows,
  type GstOrderInput,
} from "./gst-sales-invoice";

function address(country = "US") {
  return {
    name: "Asha Shah",
    line1: "1 Market St",
    city: "San Jose",
    state: "CA",
    postalCode: "95113",
    country,
    phone: "+1 408 555 0100",
    email: "asha@example.com",
  };
}

function order(partial: Partial<GstOrderInput> & Pick<GstOrderInput, "orderId" | "items">): GstOrderInput {
  const subtotal = partial.subtotal ?? partial.items.reduce((sum, item) => {
    const addons = (item.addons ?? []).reduce((addonSum, addon) => addonSum + addon.price * addon.quantity, 0);
    return sum + (item.price + addons) * item.quantity;
  }, 0);
  return {
    orderNumber: partial.orderNumber ?? "US10001",
    createdAt: partial.createdAt ?? "2026-08-01T10:00:00.000Z",
    status: partial.status ?? "paid",
    statusHistory: partial.statusHistory ?? [{ status: "paid", at: "2026-08-01T10:05:00.000Z" }],
    shipments: partial.shipments,
    subtotal,
    discount: partial.discount ?? 0,
    shipping: partial.shipping ?? 0,
    tax: partial.tax ?? 0,
    total: partial.total ?? subtotal + (partial.shipping ?? 0) + (partial.tax ?? 0) - (partial.discount ?? 0),
    currency: partial.currency ?? "USD",
    paymentProvider: partial.paymentProvider ?? "stripe",
    paymentIntentId: partial.paymentIntentId,
    razorpayOrderId: partial.razorpayOrderId,
    razorpayPaymentId: partial.razorpayPaymentId,
    shippingOption: partial.shippingOption,
    shippingServiceName: partial.shippingServiceName,
    shippingServiceCode: partial.shippingServiceCode,
    shippingAddress: partial.shippingAddress ?? address(),
    orderId: partial.orderId,
    items: partial.items,
  };
}

const rate = 96;

describe("GST sales invoices", () => {
  it("prices a single UsaRakhi rakhi at $1.50 plus $6.49 USPS and a zero-rated export invoice", () => {
    const invoice = buildGstSalesInvoice(
      order({
        orderId: "11111111-1111-1111-1111-111111111111",
        orderNumber: "US10021",
        items: [{ productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 14.99, quantity: 1 }],
        shipping: 0,
      }),
      { usdInrRate: rate, paidAt: "2026-08-01T10:05:00.000Z" }
    );

    assert.equal(invoice.invoiceNumber, "US10021");
    assert.ok(invoice.invoiceNumber.length <= 16);
    assert.equal(invoice.supplyType, "EXPWOP");
    assert.equal(invoice.exportType, "WOPAY");
    assert.equal(invoice.placeOfSupplyCode, GST_EXPORT_POS_CODE);
    assert.equal(invoice.igst, 0);
    assert.equal(invoice.customerGstin, "URP");
    assert.equal(invoice.lines[0]?.hsnSac, GST_HSN_RAKHI);
    assert.equal(invoice.rakhiPurchaseUsd, USARAKHI_RAKHI_PURCHASE_USD);
    assert.equal(invoice.addonPurchaseUsd, 0);
    assert.equal(invoice.uspsUsd, USPS_SINGLE_RAKHI_USD);
    assert.equal(invoice.gatewayFeeRate, 0.0367);
    assert.equal(invoice.gatewayFee, 0.55);
    assert.equal(invoice.gatewayFeeUsd, 0.55);
    assert.equal(invoice.totalCostUsd, 8.54);
    assert.equal(invoice.invoiceDate, "2026-08-01");
    assert.equal(invoice.financialYear, "2026-27");
  });

  it("uses the chocolate USPS rate and $1.49 per add-on unit, including line quantity", () => {
    const invoice = buildGstSalesInvoice(
      order({
        orderId: "22222222-2222-2222-2222-222222222222",
        items: [
          {
            productSlug: "om-single-rakhi",
            name: "Om Single Rakhi",
            price: 14.99,
            quantity: 2,
            addons: [{ id: "lindt-5pc", name: "Lindor chocolates (3 pcs)", price: 10.5, quantity: 1 }],
          },
        ],
      }),
      { usdInrRate: rate, paidAt: "2026-08-02T04:00:00.000Z" }
    );

    assert.equal(invoice.rakhiPurchaseUsd, USARAKHI_RAKHI_PURCHASE_USD * 2);
    assert.equal(invoice.addonPurchaseUsd, 4 * 2);
    assert.equal(invoice.uspsUsd, USPS_RAKHI_WITH_CHOCOLATE_USD);
    assert.equal(invoice.lines[1]?.hsnSac, GST_HSN_CHOCOLATE);
    assert.equal(invoice.lines[1]?.quantity, 2);
  });

  it("treats a chocolate combo product as the higher USPS package without an add-on cost", () => {
    const invoice = buildGstSalesInvoice(
      order({
        orderId: "33333333-3333-3333-3333-333333333333",
        items: [
          {
            productSlug: "kids-doraemon-rakhi-with-chocolates",
            name: "Kids Doraemon Rakhi with chocolates",
            price: 19.99,
            quantity: 1,
          },
        ],
      }),
      { usdInrRate: rate, paidAt: "2026-08-02T04:00:00.000Z" }
    );

    assert.equal(invoice.uspsUsd, USPS_RAKHI_WITH_CHOCOLATE_USD);
    assert.equal(invoice.addonPurchaseUsd, 0);
    assert.equal(invoice.rakhiPurchaseUsd, 1.5);
    assert.equal(invoice.lines[0]?.hsnSac, GST_HSN_CHOCOLATE);
  });

  it("keeps the $6.49 USPS rate for a dry-fruit add-on and costs that add-on at $1.49", () => {
    const invoice = buildGstSalesInvoice(
      order({
        orderId: "44444444-4444-4444-4444-444444444444",
        items: [
          {
            productSlug: "om-single-rakhi",
            name: "Om Single Rakhi",
            price: 14.99,
            quantity: 1,
            addons: [{ id: "kaju-small-pack", name: "Small pack of cashews", price: 9.99, quantity: 1 }],
          },
        ],
      }),
      { usdInrRate: rate, paidAt: "2026-08-02T04:00:00.000Z" }
    );

    assert.equal(invoice.uspsUsd, USPS_SINGLE_RAKHI_USD);
    assert.equal(invoice.addonPurchaseUsd, 1.49);
    assert.equal(invoice.lines[1]?.hsnSac, GST_HSN_DRY_FRUIT);
  });

  it("charges USPS once per UsaRakhi package and uses Orange County vendor cost with no USPS", () => {
    const invoice = buildGstSalesInvoice(
      order({
        orderId: "55555555-5555-5555-5555-555555555555",
        orderNumber: "OC10008",
        items: [
          { productSlug: "pearl-rakhi", name: "Pearl Designer Rakhi", price: 24, quantity: 2, vendorSlug: "orange-county", vendorCost: 11.2 },
          { productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 14.99, quantity: 1, vendorSlug: "usarakhi" },
        ],
        shipments: [
          {
            shipmentId: "oc",
            items: [{ productSlug: "pearl-rakhi", name: "Pearl Designer Rakhi", price: 24, quantity: 2, vendorSlug: "orange-county", vendorCost: 11.2 }],
          },
          {
            shipmentId: "us",
            items: [{ productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 14.99, quantity: 1, vendorSlug: "usarakhi" }],
          },
        ],
      }),
      { usdInrRate: rate, paidAt: "2026-08-03T04:00:00.000Z" }
    );

    assert.equal(invoice.orangeCountyPurchaseUsd, 22.4);
    assert.equal(invoice.rakhiPurchaseUsd, 1.5);
    assert.equal(invoice.uspsUsd, USPS_SINGLE_RAKHI_USD);
    assert.equal(invoice.invoiceNumber, "OC10008");
  });

  it("leaves gross profit blank when an Orange County purchase price is missing", () => {
    const invoice = buildGstSalesInvoice(
      order({
        orderId: "66666666-6666-6666-6666-666666666666",
        items: [{ productSlug: "mystery-hamper", name: "Mystery Hamper", price: 30, quantity: 1, vendorSlug: "orange-county" }],
      }),
      { usdInrRate: rate, paidAt: "2026-08-03T04:00:00.000Z" }
    );
    assert.equal(invoice.missingPurchaseCost, true);
    assert.equal(invoice.grossProfitUsd, null);
    assert.equal(invoice.uspsUsd, 0);
  });

  it("converts an INR Razorpay invoice with the supplied rate", () => {
    const invoice = buildGstSalesInvoice(
      order({
        orderId: "77777777-7777-7777-7777-777777777777",
        currency: "INR",
        paymentProvider: "razorpay",
        razorpayPaymentId: "pay_abc",
        items: [{ productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 960, quantity: 1 }],
        shippingAddress: { ...address("US"), country: "US" },
      }),
      { usdInrRate: rate, paidAt: "2026-08-04T04:00:00.000Z" }
    );
    assert.equal(invoice.paymentProvider, "razorpay");
    assert.equal(invoice.paymentReference, "pay_abc");
    assert.equal(invoice.invoiceValueUsd, 10);
    assert.equal(invoice.invoiceValueInr, 960);
    assert.equal(invoice.supplyType, "EXPWOP");
    assert.equal(invoice.gatewayFeeRate, 0.0219);
    assert.equal(invoice.gatewayFee, 21.02);
    assert.equal(invoice.gatewayFeeUsd, 0.22);
  });

  it("keeps paid orders only and filters Stripe vs Razorpay", () => {
    const paid = (id: string, provider: "stripe" | "razorpay", number: string): GstOrderInput =>
      order({
        orderId: id,
        orderNumber: number,
        paymentProvider: provider,
        items: [{ productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 10, quantity: 1 }],
      });

    const report = buildGstSalesReport({
      from: "2026-08-01",
      to: "2026-08-31",
      provider: "razorpay",
      usdInrRate: rate,
      usdInrRateSource: "test",
      supplier: defaultGstSupplierSettings,
      orders: [
        paid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "stripe", "US10001"),
        paid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "razorpay", "US10002"),
        order({
          orderId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
          orderNumber: "US10003",
          status: "refunded",
          items: [{ productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 10, quantity: 1 }],
        }),
        order({
          orderId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
          orderNumber: "US10004",
          status: "pending_payment",
          paymentProvider: "razorpay",
          items: [{ productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 10, quantity: 1 }],
        }),
        order({
          orderId: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
          orderNumber: "US10005",
          status: "cancelled",
          items: [{ productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 10, quantity: 1 }],
        }),
      ],
    });

    assert.deepEqual(report.invoices.map((invoice) => invoice.invoiceNumber), ["US10002"]);
    assert.equal(report.summary.excluded.refunded, 1);
    assert.equal(report.summary.excluded.pendingPayment, 1);
    assert.equal(report.summary.excluded.cancelled, 1);
    assert.equal(report.summary.excluded.otherProvider, 1);
    assert.equal(report.summary.razorpayCount, 1);
    assert.equal(report.summary.stripeCount, 0);

    const csv = gstSalesRegisterRows(report);
    assert.equal(csv[2]?.[0], "Invoice number");
    assert.equal(csv[3]?.[0], "US10002");
    assert.equal(csv[3]?.[1], "01/08/2026");

    const summary = gstSalesSummaryRows(report);
    assert.equal(summary.find((row) => row[0] === "Total sales (USD)")?.[1], report.summary.invoiceValueUsd.toFixed(2));
    assert.equal(summary.find((row) => row[0] === "Total expense (USD)")?.[1], report.summary.totalCostUsd.toFixed(2));
    assert.equal(summary.find((row) => row[0] === "Total profit (USD)")?.[1], report.summary.grossProfitUsd?.toFixed(2));
    assert.equal(summary.find((row) => row[0] === "Invoices")?.[1], "1");
  });

  it("uses $9.79 USPS for express or 2-day UsaRakhi packages, including chocolate", () => {
    const express = buildGstSalesInvoice(
      order({
        orderId: "88888888-8888-8888-8888-888888888888",
        shippingOption: "three_day",
        shippingServiceName: "3-Day Express Delivery",
        shippingServiceCode: "EXPEDITED_3_DAY",
        items: [
          {
            productSlug: "om-single-rakhi",
            name: "Om Single Rakhi",
            price: 14.99,
            quantity: 1,
            addons: [{ id: "lindt-5pc", name: "Lindor chocolates (3 pcs)", price: 10.5, quantity: 1 }],
          },
        ],
      }),
      { usdInrRate: rate, paidAt: "2026-08-05T04:00:00.000Z" }
    );
    assert.equal(express.uspsUsd, USPS_EXPEDITED_USARAKHI_USD);
    assert.equal(express.addonPurchaseUsd, 4);
    assert.equal(express.uspsBasis, "UsaRakhi other delivery $9.79");

    const twoDay = buildGstSalesInvoice(
      order({
        orderId: "99999999-9999-9999-9999-999999999999",
        shippingServiceName: "2-Day Delivery",
        shippingServiceCode: "EXPEDITED_2_DAY",
        items: [{ productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 14.99, quantity: 1 }],
      }),
      { usdInrRate: rate, paidAt: "2026-08-05T04:00:00.000Z" }
    );
    assert.equal(twoDay.uspsUsd, 9.79);
    assert.equal(twoDay.totalCostUsd, 1.5 + 9.79 + 0.55);
  });

  it("adds $11 USPS on an expedited Orange County package and keeps the product purchase", () => {
    const invoice = buildGstSalesInvoice(
      order({
        orderId: "abababab-abab-abab-abab-abababababab",
        shippingOption: "two_day",
        items: [
          { productSlug: "pearl-rakhi", name: "Pearl Designer Rakhi", price: 24, quantity: 2, vendorSlug: "orange-county", vendorCost: 11.2 },
          { productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 14.99, quantity: 1, vendorSlug: "usarakhi" },
        ],
        shipments: [
          {
            shipmentId: "oc",
            items: [{ productSlug: "pearl-rakhi", name: "Pearl Designer Rakhi", price: 24, quantity: 2, vendorSlug: "orange-county", vendorCost: 11.2 }],
          },
          {
            shipmentId: "us",
            items: [{ productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 14.99, quantity: 1, vendorSlug: "usarakhi" }],
          },
        ],
      }),
      { usdInrRate: rate, paidAt: "2026-08-06T04:00:00.000Z" }
    );

    assert.equal(invoice.orangeCountyPurchaseUsd, 22.4);
    assert.equal(invoice.rakhiPurchaseUsd, 1.5);
    assert.equal(invoice.uspsUsd, USPS_EXPEDITED_ORANGE_COUNTY_USD + USPS_EXPEDITED_USARAKHI_USD);
    assert.equal(invoice.totalCostUsd, 22.4 + 1.5 + 11 + 9.79 + 2.31);
    assert.match(invoice.uspsBasis, /Orange County other delivery \$11\.00/);
    assert.match(invoice.uspsBasis, /UsaRakhi other delivery \$9\.79/);
  });

  it("keeps standard and Ground Advantage on the regular USPS rates", () => {
    const standard = buildGstSalesInvoice(
      order({
        orderId: "cdcdcdcd-cdcd-cdcd-cdcd-cdcdcdcdcdcd",
        shippingOption: "standard",
        shippingServiceName: "Standard shipping",
        shippingServiceCode: "STANDARD",
        items: [{ productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 14.99, quantity: 1 }],
      }),
      { usdInrRate: rate, paidAt: "2026-08-06T04:00:00.000Z" }
    );
    assert.equal(standard.uspsUsd, USPS_SINGLE_RAKHI_USD);

    const ground = buildGstSalesInvoice(
      order({
        orderId: "dededede-dede-dede-dede-dededededede",
        shippingOption: "standard",
        shippingServiceName: "USPS Ground Advantage",
        shippingServiceCode: "USPS_GROUND_ADVANTAGE",
        items: [{ productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 14.99, quantity: 1 }],
      }),
      { usdInrRate: rate, paidAt: "2026-08-06T04:00:00.000Z" }
    );
    assert.equal(ground.uspsUsd, USPS_SINGLE_RAKHI_USD);
  });

  it("uses the higher postage for Priority Mail and any other non-standard service", () => {
    const priority = buildGstSalesInvoice(
      order({
        orderId: "efefefef-efef-efef-efef-efefefefefef",
        shippingServiceName: "USPS Priority Mail",
        shippingServiceCode: "PRIORITY_MAIL",
        items: [{ productSlug: "om-single-rakhi", name: "Om Single Rakhi", price: 14.99, quantity: 1 }],
      }),
      { usdInrRate: rate, paidAt: "2026-08-06T04:00:00.000Z" }
    );
    assert.equal(priority.uspsUsd, USPS_EXPEDITED_USARAKHI_USD);

    const other = buildGstSalesInvoice(
      order({
        orderId: "fefefefe-fefe-fefe-fefe-fefefefefefe",
        shippingOption: "overnight",
        items: [
          { productSlug: "pearl-rakhi", name: "Pearl Designer Rakhi", price: 24, quantity: 1, vendorSlug: "orange-county", vendorCost: 11.2 },
        ],
      }),
      { usdInrRate: rate, paidAt: "2026-08-06T04:00:00.000Z" }
    );
    assert.equal(other.orangeCountyPurchaseUsd, 11.2);
    assert.equal(other.uspsUsd, USPS_EXPEDITED_ORANGE_COUNTY_USD);
    assert.equal(other.totalCostUsd, 11.2 + 11 + 0.88);
  });

  it("uses specific purchase prices for kaju katli, chocolate packs, and weighed nut packs", () => {
    const katli = buildGstSalesInvoice(
      order({
        orderId: "12121212-1212-1212-1212-121212121212",
        items: [{ productSlug: "kaju-katli-200g", name: "Kaju Katli 200 g", price: 24, quantity: 1 }],
      }),
      { usdInrRate: rate, paidAt: "2026-08-07T04:00:00.000Z" }
    );
    assert.equal(katli.rakhiPurchaseUsd, USARAKHI_KAJU_KATLI_PURCHASE_USD);

    const withPacks = buildGstSalesInvoice(
      order({
        orderId: "13131313-1313-1313-1313-131313131313",
        items: [
          {
            productSlug: "pearl-designer-rakhi-with-lindor-chocolates",
            name: "Pearl Designer Rakhi with Lindor Chocolates",
            price: 19.99,
            quantity: 1,
            addons: [
              { id: "ferrero-3pc", name: "Ferrero Rocher (3 pcs)", price: 6.5, quantity: 1 },
              { id: "badam-small-pack", name: "Small pack of almonds (badam)", price: 9.99, quantity: 1 },
              { id: "kaju-small-pack", name: "Small pack of cashews", price: 9.99, quantity: 1 },
              { id: "kaju-100g", name: "100 g cashews", price: 9.99, quantity: 1 },
              { id: "badam-200g", name: "200 g almonds", price: 14.99, quantity: 1 },
              { id: "pista-200g", name: "200 g pistachios", price: 14.99, quantity: 1 },
            ],
          },
        ],
      }),
      { usdInrRate: rate, paidAt: "2026-08-07T04:00:00.000Z" }
    );
    assert.equal(withPacks.rakhiPurchaseUsd, USARAKHI_RAKHI_PURCHASE_USD + USARAKHI_LINDT_PACK_PURCHASE_USD);
    assert.equal(withPacks.addonPurchaseUsd, 25.95);

    const nuts = buildGstSalesInvoice(
      order({
        orderId: "14141414-1414-1414-1414-141414141414",
        items: [
          {
            productSlug: "100g-kaju-200g-badam-200g-pista",
            name: "100 g kaju, 200 g badam and 200 g pista",
            price: 30,
            quantity: 2,
          },
        ],
      }),
      { usdInrRate: rate, paidAt: "2026-08-07T04:00:00.000Z" }
    );
    assert.equal(nuts.rakhiPurchaseUsd, 39.94);
  });

  it("uses a short invoice number when the order has no human number", () => {
    assert.equal(gstInvoiceNumber({ orderId: "abcdef1234567890abcdef" }).length <= 16, true);
  });
});
