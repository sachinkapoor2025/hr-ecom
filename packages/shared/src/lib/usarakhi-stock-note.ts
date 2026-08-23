import { VENDOR_ORANGE_COUNTY } from "../constants";

/**
 * Peak-season shortage disclaimer for UsaRakhi SKUs only (not Orange County).
 * Uses storefront chocolate names: Ferrero Rocher / Lindor chocolates.
 */
export const USARAKHI_STOCK_SHORTAGE_NOTE =
  "Rakhi stock about to end — any shortage of product will be replaced by 3 Ferrero Rocher / Lindor chocolates.";

const NOTE_MARKER = "Rakhi stock about to end";

function isOrangeCounty(product: {
  vendorSlug?: string | null;
  images?: string[] | null;
}): boolean {
  const v = product.vendorSlug?.trim();
  if (v === VENDOR_ORANGE_COUNTY) return true;
  return (product.images ?? []).some((src) => src.includes("/uploads/orange-county/"));
}

/** Idempotent: append stock note to UsaRakhi product descriptions for storefront display. */
export function withUsarakhiStockShortageNote<
  T extends {
    description?: string;
    vendorSlug?: string | null;
    images?: string[] | null;
  },
>(product: T): T {
  if (isOrangeCounty(product)) return product;
  const description = product.description ?? "";
  if (description.includes(NOTE_MARKER)) return product;

  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(description);
  const noteHtml = `<p><strong>${USARAKHI_STOCK_SHORTAGE_NOTE}</strong></p>`;
  const notePlain = `\n\n${USARAKHI_STOCK_SHORTAGE_NOTE}`;

  return {
    ...product,
    description: description
      ? looksHtml
        ? `${description.trim()}\n${noteHtml}`
        : `${description.trim()}${notePlain}`
      : looksHtml
        ? noteHtml
        : USARAKHI_STOCK_SHORTAGE_NOTE,
  };
}
