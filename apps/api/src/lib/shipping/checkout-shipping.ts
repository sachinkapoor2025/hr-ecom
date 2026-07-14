import { GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  DEFAULT_PACKAGE,
  estimatePackageFromItems,
  selectRate,
  type RateQuote,
  type ShippingSettings,
} from "@hr-ecom/shared";
import { productKeys, type Product } from "@hr-ecom/shared";
import { docClient, PRODUCTS_TABLE } from "../db";
import { getShippingProvider, loadShippingSettings } from "./index";

export interface ShippingQuoteResult {
  rates: RateQuote[];
  selected?: RateQuote;
  customerShippingCharge: number;
  estimatedLabelCost?: number;
  fallbackUsed?: boolean;
  warning?: string;
  labelStatus?: "none" | "queued";
  settingsSnapshot: {
    mode: "free" | "pass_through";
    festivalActive?: string;
  };
  packageDetails: typeof DEFAULT_PACKAGE;
}

function activeFestivalName(settings: ShippingSettings): string | undefined {
  const today = new Date().toISOString().slice(0, 10);
  return settings.festivalModeRanges.find(
    (r) => today >= r.startDate && today <= r.endDate
  )?.name;
}

export async function fetchProductDims(
  productSlug: string
): Promise<Pick<Product, "weightOz" | "lengthIn" | "widthIn" | "heightIn">> {
  const result = await docClient.send(
    new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: productKeys.pk(productSlug), SK: productKeys.sk() },
    })
  );
  const product = result.Item as Product | undefined;
  return {
    weightOz: product?.weightOz,
    lengthIn: product?.lengthIn,
    widthIn: product?.widthIn,
    heightIn: product?.heightIn,
  };
}

export async function estimatePackageForCartItems(
  items: Array<{ productSlug: string; quantity: number }>
): Promise<ReturnType<typeof estimatePackageFromItems>> {
  const dims = await Promise.all(
    items.map(async (item) => ({
      ...(await fetchProductDims(item.productSlug)),
      quantity: item.quantity,
    }))
  );
  return estimatePackageFromItems(dims);
}

export interface ResolveShippingInput {
  destination: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  cartItems: Array<{ productSlug: string; quantity: number }>;
  shippingServiceCode?: string;
  shippingRateId?: string;
  settings?: ShippingSettings;
}

export async function resolveShippingForCheckout(
  input: ResolveShippingInput
): Promise<ShippingQuoteResult> {
  const settings = input.settings ?? (await loadShippingSettings());
  const origin = settings.originAddress;

  if (!origin.line1 || !origin.postalCode) {
    return {
      rates: [],
      customerShippingCharge: 0,
      warning: "Shipping origin address not configured in admin settings",
      labelStatus: "queued",
      settingsSnapshot: { mode: settings.customerShippingMode },
      packageDetails: DEFAULT_PACKAGE,
    };
  }

  const pkg = await estimatePackageForCartItems(input.cartItems);
  const destination = {
    name: "Customer",
    ...input.destination,
  };

  let rates: RateQuote[] = [];
  let warning: string | undefined;
  let fallbackUsed = false;

  try {
    const provider = await getShippingProvider(settings);
    rates = await provider.getRates(pkg, origin, destination);
  } catch (err) {
    warning = err instanceof Error ? err.message : "USPS rate lookup failed";
    if (settings.customerShippingMode === "pass_through") {
      fallbackUsed = true;
      return {
        rates: [],
        customerShippingCharge: settings.flatRateFallbackUsd,
        fallbackUsed,
        warning,
        labelStatus: "queued",
        settingsSnapshot: {
          mode: settings.customerShippingMode,
          festivalActive: activeFestivalName(settings),
        },
        packageDetails: pkg,
      };
    }
    return {
      rates: [],
      customerShippingCharge: 0,
      warning,
      labelStatus: "queued",
      settingsSnapshot: {
        mode: settings.customerShippingMode,
        festivalActive: activeFestivalName(settings),
      },
      packageDetails: pkg,
    };
  }

  let selected = selectRate(rates, settings);

  if (input.shippingRateId) {
    const override = rates.find((r) => r.rateId === input.shippingRateId);
    if (override) selected = override;
    else warning = (warning ? `${warning}; ` : "") + "Requested shippingRateId not in rate list";
  } else if (input.shippingServiceCode) {
    const override = rates.find((r) => r.mailClass === input.shippingServiceCode);
    if (override) selected = override;
    else warning = (warning ? `${warning}; ` : "") + "Requested shippingServiceCode not in rate list";
  }

  const estimatedLabelCost = selected?.price;
  let customerShippingCharge = 0;
  if (settings.customerShippingMode === "pass_through") {
    customerShippingCharge = selected?.price ?? settings.flatRateFallbackUsd;
    if (!selected) fallbackUsed = true;
  }

  return {
    rates,
    selected,
    customerShippingCharge,
    estimatedLabelCost,
    fallbackUsed,
    warning,
    labelStatus: selected ? undefined : "queued",
    settingsSnapshot: {
      mode: settings.customerShippingMode,
      festivalActive: activeFestivalName(settings),
    },
    packageDetails: pkg,
  };
}

export async function purchaseLabelForOrder(order: {
  orderId: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
  items: Array<{ productSlug: string; quantity: number }>;
  shippingRateId?: string;
  shippingServiceCode?: string;
}): Promise<{
  trackingNumber: string;
  labelPdfUrl?: string;
  labelCost?: number;
  shippingServiceName?: string;
  shippingServiceCode?: string;
}> {
  const settings = await loadShippingSettings();
  const provider = await getShippingProvider(settings);
  const pkg = await estimatePackageForCartItems(order.items);

  const result = await provider.buyLabel({
    rateId: order.shippingRateId,
    mailClass: order.shippingServiceCode,
    pkg,
    origin: settings.originAddress,
    destination: {
      name: order.shippingAddress.name,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
      phone: order.shippingAddress.phone,
      email: order.shippingAddress.email,
    },
    orderId: order.orderId,
  });

  return {
    trackingNumber: result.trackingNumber,
    labelPdfUrl: result.labelPdfUrl,
    labelCost: result.labelCost,
    shippingServiceName: result.serviceName,
    shippingServiceCode: result.mailClass,
  };
}
