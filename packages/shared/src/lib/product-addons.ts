import { VENDOR_ORANGE_COUNTY } from "../constants";
import {
  MAX_RAKHI_ADDON_PIECES,
  MINI_RAKHI_ADDONS,
  RAKHI_ADDON_BUNDLE_USD,
  rakhiAddonBundlePriceUsd,
  rakhiAddonId,
} from "./mini-rakhi-combos";

export type ProductAddonGroup = "dry-fruits" | "chocolates" | "rakhis";

export type ProductAddonDef = {
  id: string;
  name: string;
  priceUsd: number;
  group: ProductAddonGroup;
  /** Short weight / pack label for UI. */
  detail: string;
  /** Packs left in warehouse; omit for unlimited (extra rakhis). */
  stockRemaining?: number;
  /** Catalog slug when this add-on is a real rakhi SKU (standalone product price is unchanged). */
  productSlug?: string;
  /** Storefront image for extra-rakhi cards. */
  image?: string;
};

/** Extra-rakhi add-on price for a single piece. Mix 2–5 for bundle rates. */
export const RAKHI_ADDON_PRICE_USD = RAKHI_ADDON_BUNDLE_USD[1];

/** Max packs of a single add-on per cart line. */
export const MAX_PRODUCT_ADDON_QUANTITY = 10;

/** Small dry-fruit add-on (peak-season warehouse packs — no gram weights in copy). */
export const DRY_FRUIT_SMALL_PACK_PRICE_USD = 9.99;

/**
 * Fixed UsaRakhi PDP add-on catalog (USD). Not Dynamo SKUs.
 * `stockRemaining` hides sold-out add-ons on the PDP and caps cart quantity.
 * Chocolate names match storefront: Lindor chocolates / Ferrero Rocher / Mixed chocolates.
 */
export const PRODUCT_ADDONS: readonly ProductAddonDef[] = [
  {
    id: "badam-small-pack",
    name: "Small pack of almonds (badam)",
    priceUsd: DRY_FRUIT_SMALL_PACK_PRICE_USD,
    group: "dry-fruits",
    detail: "Small pack",
    stockRemaining: 6,
  },
  {
    id: "kaju-small-pack",
    name: "Small pack of cashews",
    priceUsd: DRY_FRUIT_SMALL_PACK_PRICE_USD,
    group: "dry-fruits",
    detail: "Small pack",
    stockRemaining: 5,
  },
  {
    id: "pista-small-pack",
    name: "Small pack of pistachios",
    priceUsd: DRY_FRUIT_SMALL_PACK_PRICE_USD,
    group: "dry-fruits",
    detail: "Small pack",
    stockRemaining: 5,
  },
  {
    id: "mixed-nuts-small-pack",
    name: "Small pack of mixed nuts",
    priceUsd: DRY_FRUIT_SMALL_PACK_PRICE_USD,
    group: "dry-fruits",
    detail: "Small pack",
    stockRemaining: 6,
  },
  {
    /** Legacy id — pack is 3 pcs; keep id so existing carts still resolve. */
    id: "lindt-5pc",
    name: "Lindor chocolates (3 pcs)",
    priceUsd: 10.5,
    group: "chocolates",
    detail: "3 pcs",
    stockRemaining: 15,
  },
  {
    id: "ferrero-3pc",
    name: "Ferrero Rocher (3 pcs)",
    priceUsd: 6.5,
    group: "chocolates",
    detail: "3 pcs",
    stockRemaining: 0,
  },
  {
    id: "mixed-chocolates-3pc",
    name: "Mixed chocolates (3 pcs)",
    priceUsd: 4.99,
    group: "chocolates",
    detail: "3 pcs",
    stockRemaining: 30,
  },
  ...MINI_RAKHI_ADDONS.map(
    (rakhi): ProductAddonDef => ({
      id: rakhiAddonId(rakhi.slug),
      name: rakhi.name,
      priceUsd: RAKHI_ADDON_PRICE_USD,
      group: "rakhis",
      detail: "Mix-and-match extra rakhi",
      productSlug: rakhi.slug,
      image: rakhi.image,
    })
  ),
] as const;

export type ProductAddonId = (typeof PRODUCT_ADDONS)[number]["id"];

/** Client / API selection before server fills name & unit price. */
export type ProductAddonSelection = {
  id: string;
  quantity: number;
};

const ADDON_BY_ID = new Map(PRODUCT_ADDONS.map((a) => [a.id, a]));

export function getProductAddon(id: string): ProductAddonDef | undefined {
  return ADDON_BY_ID.get(id);
}

export function isAddonInStock(def: ProductAddonDef): boolean {
  return def.stockRemaining === undefined || def.stockRemaining > 0;
}

/** Add-ons with warehouse stock left (or unlimited rakhis). */
export function availableProductAddons(): readonly ProductAddonDef[] {
  return PRODUCT_ADDONS.filter(isAddonInStock);
}

/** Max quantity a customer can add for one add-on id on a cart line. */
export function addonMaxQuantity(id: string): number {
  const def = getProductAddon(id);
  if (!def) return 0;
  if (def.stockRemaining === undefined) return MAX_PRODUCT_ADDON_QUANTITY;
  return Math.min(MAX_PRODUCT_ADDON_QUANTITY, Math.max(0, def.stockRemaining));
}

/** Hide a rakhi add-on on its own product page so the mix-and-match deal is only for extras. */
export function addonsForProductPage(productSlug: string): readonly ProductAddonDef[] {
  return availableProductAddons().filter((a) => a.productSlug !== productSlug);
}

/** Extra rakhis / dry fruit / chocolate add-ons — UsaRakhi products only. */
export function productAllowsAddons(product: {
  vendorSlug?: string | null;
  categorySlug?: string | null;
  additionalCategorySlugs?: string[] | null;
  images?: string[] | null;
}): boolean {
  const v = product.vendorSlug?.trim();
  if (v === VENDOR_ORANGE_COUNTY) return false;
  if ((product.images ?? []).some((src) => src.includes("/uploads/orange-county/"))) return false;
  return true;
}

export type CartAddonLike = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export function sumAddonPrices(
  addons: Array<{ price: number; quantity: number }> | undefined | null
): number {
  if (!addons?.length) return 0;
  return addons.reduce((sum, a) => sum + a.price * a.quantity, 0);
}

/**
 * Stable merge key: sorted `id:qty` pairs.
 * Empty string = no add-ons. Quantity is part of the signature so 2× of an add-on
 * does not merge with 1× of the same add-on.
 */
export function cartAddonSignature(
  addons: Array<{ id: string; quantity?: number }> | undefined | null
): string {
  if (!addons?.length) return "";
  return [...addons]
    .map((a) => `${a.id}:${Math.max(1, Math.floor(a.quantity ?? 1))}`)
    .sort()
    .join(",");
}

export function cartLineUnitTotal(item: {
  price: number;
  addons?: Array<{ price: number; quantity: number }> | null;
}): number {
  return item.price + sumAddonPrices(item.addons);
}

export type AddonResolveInput = string | { id: string; quantity?: number };

/** Normalize API / client payload into selections (dedupe by id, clamp qty). */
export function normalizeAddonSelections(
  input: AddonResolveInput[] | undefined | null
): { ok: true; selections: ProductAddonSelection[] } | { ok: false; error: string } {
  if (!input?.length) return { ok: true, selections: [] };

  const byId = new Map<string, number>();
  for (const raw of input) {
    const id = (typeof raw === "string" ? raw : raw.id)?.trim();
    if (!id) continue;
    const qtyRaw = typeof raw === "string" ? 1 : (raw.quantity ?? 1);
    const qty = Math.floor(Number(qtyRaw));
    if (!Number.isFinite(qty) || qty < 1) {
      return { ok: false, error: `Invalid add-on quantity for ${id}` };
    }
    const maxForAddon = addonMaxQuantity(id);
    if (maxForAddon < 1) {
      return { ok: false, error: `${id} is sold out` };
    }
    if (qty > maxForAddon) {
      return {
        ok: false,
        error:
          maxForAddon === 1
            ? `Only 1 pack of this add-on is available`
            : `Only ${maxForAddon} packs of this add-on are available`,
      };
    }
    if (qty > MAX_PRODUCT_ADDON_QUANTITY) {
      return {
        ok: false,
        error: `Add-on quantity cannot exceed ${MAX_PRODUCT_ADDON_QUANTITY}`,
      };
    }
    byId.set(id, (byId.get(id) ?? 0) + qty);
  }

  if (byId.size > 20) return { ok: false, error: "Too many add-ons selected" };

  const selections: ProductAddonSelection[] = [...byId.entries()]
    .map(([id, quantity]) => {
      const clamped = Math.min(quantity, MAX_PRODUCT_ADDON_QUANTITY);
      return { id, quantity: clamped };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  return { ok: true, selections };
}

export function resolveProductAddons(
  input: AddonResolveInput[] | undefined | null
): { ok: true; addons: CartAddonLike[] } | { ok: false; error: string } {
  const normalized = normalizeAddonSelections(input);
  if (!normalized.ok) return normalized;

  const addons: CartAddonLike[] = [];
  for (const sel of normalized.selections) {
    const def = getProductAddon(sel.id);
    if (!def) return { ok: false, error: `Unknown add-on: ${sel.id}` };
    if (!isAddonInStock(def)) {
      return { ok: false, error: `${def.name} is sold out` };
    }
    const maxQty = addonMaxQuantity(sel.id);
    if (sel.quantity > maxQty) {
      return {
        ok: false,
        error:
          maxQty === 1
            ? `Only 1 pack of ${def.name} is available`
            : `Only ${maxQty} packs of ${def.name} are available`,
      };
    }
    addons.push({
      id: def.id,
      name: def.name,
      price: def.priceUsd,
      quantity: sel.quantity,
    });
  }

  const pieceCount = addons
    .filter((addon) => getProductAddon(addon.id)?.group === "rakhis")
    .reduce((sum, addon) => sum + addon.quantity, 0);
  if (pieceCount > MAX_RAKHI_ADDON_PIECES) {
    return {
      ok: false,
      error: `You can mix up to ${MAX_RAKHI_ADDON_PIECES} extra rakhis`,
    };
  }

  const priced = applyRakhiBundlePricing(addons);
  return { ok: true, addons: priced };
}

function applyRakhiBundlePricing(addons: CartAddonLike[]): CartAddonLike[] {
  const rakhiIndexes = addons
    .map((addon, index) => (getProductAddon(addon.id)?.group === "rakhis" ? index : -1))
    .filter((index) => index >= 0);
  const pieceCount = rakhiIndexes.reduce((sum, index) => sum + addons[index]!.quantity, 0);
  if (pieceCount === 0) return addons;
  if (pieceCount > MAX_RAKHI_ADDON_PIECES) {
    return addons;
  }

  const bundleCents = Math.round(rakhiAddonBundlePriceUsd(pieceCount) * 100);
  const perPiece = Math.floor(bundleCents / pieceCount);
  let leftover = bundleCents - perPiece * pieceCount;
  const next = addons.map((addon) => ({ ...addon }));

  for (const index of rakhiIndexes) {
    const qty = next[index]!.quantity;
    let lineCents = perPiece * qty;
    const extra = Math.min(leftover, qty);
    lineCents += extra;
    leftover -= extra;
    next[index]!.price = lineCents / 100 / qty;
  }
  return next;
}

export function selectedAddonsUsdTotal(
  input: AddonResolveInput[] | undefined | null
): number {
  const resolved = resolveProductAddons(input);
  if (!resolved.ok) return 0;
  return sumAddonPrices(resolved.addons);
}

/** @deprecated Prefer resolveProductAddons — kept for call-site compatibility. */
export function resolveProductAddonsFromIds(
  ids: string[] | undefined | null
): { ok: true; addons: CartAddonLike[] } | { ok: false; error: string } {
  return resolveProductAddons(ids);
}
