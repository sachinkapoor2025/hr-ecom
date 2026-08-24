import { VENDOR_ORANGE_COUNTY } from "../constants";

/**
 * Peak-season disclaimer for UsaRakhi products that include chocolates.
 * Piece counts on the PDP stay the same; brand may vary with warehouse stock.
 */
export const USARAKHI_STOCK_SHORTAGE_NOTE =
  "Chocolates included with this rakhi: if the brand shown on this page is out of stock, we'll send Ferrero Rocher, Lindor, or mixed chocolates instead. The piece count stays the same.";

const NOTE_MARKER = "Chocolates included with this rakhi";

/** Legacy note text from the first rollout (all UsaRakhi PDPs). */
const LEGACY_NOTE =
  "Rakhi stock about to end — any shortage of product will be replaced by 3 Ferrero Rocher / Lindor chocolates.";

/** Previous peak-season replacement wording. */
const LEGACY_NOTE_V2 =
  "Rakhi stock about to end — any shortage of Chocolate product will be replaced by 3 Ferrero Rocher or 3 Lindor chocolates or 3 Mixed chocolates.";

/** Detects chocolate pairing from name, slug, description, tags, or image filenames. */
export const CHOCOLATE_PRODUCT_SIGNAL =
  /chocolate|chocolates|ferrero|lindor|lindt|hershey|kitkat|dairy\s*milk|snicker|milky\s*way|mixed\s*choc|rocher|truffle|assorted\s*choc/i;

type StockNoteProduct = {
  description?: string;
  name?: string;
  slug?: string;
  categorySlug?: string | null;
  tags?: string[] | null;
  vendorSlug?: string | null;
  images?: string[] | null;
};

function isOrangeCounty(product: StockNoteProduct): boolean {
  const v = product.vendorSlug?.trim();
  if (v === VENDOR_ORANGE_COUNTY) return true;
  return (product.images ?? []).some((src) => src.includes("/uploads/orange-county/"));
}

function productBlob(product: StockNoteProduct): string {
  return [
    product.name,
    product.description,
    product.slug,
    ...(product.tags ?? []),
    ...(product.images ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

/** True when the product includes chocolates with the rakhi (any category). */
export function productIncludesChocolates(product: StockNoteProduct): boolean {
  return CHOCOLATE_PRODUCT_SIGNAL.test(productBlob(product));
}

/**
 * True for UsaRakhi products that include chocolates with the rakhi.
 * False for Orange County and plain rakhi-only SKUs.
 */
export function shouldShowUsarakhiStockShortageNote(product: StockNoteProduct): boolean {
  if (isOrangeCounty(product)) return false;

  const tags = product.tags ?? [];
  if (tags.includes("mini-rakhi-set") && !productIncludesChocolates(product)) return false;

  return productIncludesChocolates(product);
}

/** Remove any stock-shortage paragraph we previously appended (old or new wording). */
export function stripUsarakhiStockShortageNote(description: string): string {
  if (
    !description.includes(NOTE_MARKER) &&
    !description.includes("Rakhi stock about to end")
  ) {
    return description;
  }

  let next = description;
  // HTML blocks we append
  next = next.replace(
    /\n?<p><strong>(?:Rakhi stock about to end|Chocolates included with this rakhi)[\s\S]*?<\/strong><\/p>\s*/gi,
    ""
  );
  // Plain-text append
  next = next.replace(
    /\n\n(?:Rakhi stock about to end|Chocolates included with this rakhi)[^\n]*/gi,
    ""
  );
  // Inline leftover
  next = next.replace(
    /\s*(?:Rakhi stock about to end|Chocolates included with this rakhi)[^.]*\./gi,
    ""
  );
  // Exact legacy/current full strings if still present
  next = next
    .replace(LEGACY_NOTE, "")
    .replace(LEGACY_NOTE_V2, "")
    .replace(USARAKHI_STOCK_SHORTAGE_NOTE, "")
    .replace(
      "Chocolates included with this rakhi: we'll send whichever chocolate is currently in stock (Ferrero Rocher, Lindor, or mixed chocolates). The piece count shown on this page stays the same.",
      ""
    );
  return next.trim();
}

/** Idempotent: append stock note only for chocolate UsaRakhi products. */
export function withUsarakhiStockShortageNote<T extends StockNoteProduct>(product: T): T {
  if (isOrangeCounty(product)) return product;

  const cleaned = stripUsarakhiStockShortageNote(product.description ?? "");
  const productForCheck = { ...product, description: cleaned };
  if (!shouldShowUsarakhiStockShortageNote(productForCheck)) {
    if (cleaned === (product.description ?? "")) return product;
    return { ...product, description: cleaned };
  }

  if (cleaned.includes(NOTE_MARKER) && cleaned.includes("piece count")) {
    return cleaned === product.description ? product : { ...product, description: cleaned };
  }

  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(cleaned);
  const noteHtml = `<p><strong>${USARAKHI_STOCK_SHORTAGE_NOTE}</strong></p>`;
  const notePlain = `\n\n${USARAKHI_STOCK_SHORTAGE_NOTE}`;

  return {
    ...product,
    description: cleaned
      ? looksHtml
        ? `${cleaned}\n${noteHtml}`
        : `${cleaned}${notePlain}`
      : looksHtml
        ? noteHtml
        : USARAKHI_STOCK_SHORTAGE_NOTE,
  };
}
