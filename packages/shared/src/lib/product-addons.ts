import { VENDOR_ORANGE_COUNTY } from "../constants";

export type ProductAddonGroup = "dry-fruits" | "chocolates";

export type ProductAddonDef = {
  id: string;
  name: string;
  priceUsd: number;
  group: ProductAddonGroup;
  /** Short weight / pack label for UI. */
  detail: string;
};

/** Fixed UsaRakhi PDP add-on catalog (USD). Not Dynamo SKUs. */
export const PRODUCT_ADDONS: readonly ProductAddonDef[] = [
  {
    id: "kaju-katli-200g",
    name: "Kaju Katli — 200 g",
    priceUsd: 11.99,
    group: "dry-fruits",
    detail: "200 g",
  },
  {
    id: "badam-100g",
    name: "Badam (Almonds) — 100 g",
    priceUsd: 9,
    group: "dry-fruits",
    detail: "100 g",
  },
  {
    id: "kaju-100g",
    name: "Kaju (Cashews) — 100 g",
    priceUsd: 9,
    group: "dry-fruits",
    detail: "100 g",
  },
  {
    id: "pista-100g",
    name: "Pista (Pistachios) — 100 g",
    priceUsd: 9,
    group: "dry-fruits",
    detail: "100 g",
  },
  {
    id: "badam-200g",
    name: "Badam (Almonds) — 200 g",
    priceUsd: 15,
    group: "dry-fruits",
    detail: "200 g",
  },
  {
    id: "kaju-200g",
    name: "Kaju (Cashews) — 200 g",
    priceUsd: 15,
    group: "dry-fruits",
    detail: "200 g",
  },
  {
    id: "pista-200g",
    name: "Pista (Pistachios) — 200 g",
    priceUsd: 15,
    group: "dry-fruits",
    detail: "200 g",
  },
  {
    id: "hershey-2pc",
    name: "Hershey’s chocolates (2 pcs)",
    priceUsd: 5,
    group: "chocolates",
    detail: "2 pcs",
  },
  {
    id: "lindt-5pc",
    name: "Lindt Lindor chocolates (5 pcs)",
    priceUsd: 6,
    group: "chocolates",
    detail: "5 pcs",
  },
  {
    id: "ferrero-3pc",
    name: "Ferrero Rocher (3 pcs)",
    priceUsd: 5,
    group: "chocolates",
    detail: "3 pcs",
  },
] as const;

export type ProductAddonId = (typeof PRODUCT_ADDONS)[number]["id"];

const ADDON_BY_ID = new Map(PRODUCT_ADDONS.map((a) => [a.id, a]));

export function getProductAddon(id: string): ProductAddonDef | undefined {
  return ADDON_BY_ID.get(id);
}

export function productAllowsAddons(product: {
  vendorSlug?: string | null;
}): boolean {
  const v = product.vendorSlug?.trim();
  if (!v) return true;
  return v !== VENDOR_ORANGE_COUNTY;
}

export type CartAddonLike = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export function sumAddonPrices(addons: CartAddonLike[] | undefined | null): number {
  if (!addons?.length) return 0;
  return addons.reduce((sum, a) => sum + a.price * a.quantity, 0);
}

/** Stable signature for merge: sorted addon ids joined. Empty string = no addons. */
export function cartAddonSignature(
  addons: Array<{ id: string }> | undefined | null
): string {
  if (!addons?.length) return "";
  return [...addons.map((a) => a.id)].sort().join(",");
}

export function cartLineUnitTotal(item: {
  price: number;
  addons?: CartAddonLike[] | null;
}): number {
  return item.price + sumAddonPrices(item.addons);
}

export function resolveProductAddonsFromIds(
  ids: string[] | undefined | null
): { ok: true; addons: CartAddonLike[] } | { ok: false; error: string } {
  if (!ids?.length) return { ok: true, addons: [] };
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (unique.length > 20) return { ok: false, error: "Too many add-ons selected" };
  const addons: CartAddonLike[] = [];
  for (const id of unique) {
    const def = getProductAddon(id);
    if (!def) return { ok: false, error: `Unknown add-on: ${id}` };
    addons.push({
      id: def.id,
      name: def.name,
      price: def.priceUsd,
      quantity: 1,
    });
  }
  addons.sort((a, b) => a.id.localeCompare(b.id));
  return { ok: true, addons };
}
