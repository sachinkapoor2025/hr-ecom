import { VENDOR_ORANGE_COUNTY } from "../constants";
import { isRakhiSetSizeCategory } from "./rakhi-set-size";

/**
 * Peak-season shortage disclaimer for UsaRakhi chocolate / combo SKUs only
 * (not Orange County, not single/multi rakhi-only products).
 * Uses storefront names: Ferrero Rocher, Lindor chocolates, Mixed chocolates.
 */
export const USARAKHI_STOCK_SHORTAGE_NOTE =
  "Rakhi stock about to end — any shortage of Chocolate product will be replaced by 3 Ferrero Rocher or 3 Lindor chocolates or 3 Mixed chocolates.";

const NOTE_MARKER = "Rakhi stock about to end";

/** Legacy note text from the first rollout (all UsaRakhi PDPs). */
const LEGACY_NOTE =
  "Rakhi stock about to end — any shortage of product will be replaced by 3 Ferrero Rocher / Lindor chocolates.";

const CHOCOLATE_OR_EXTRA_SIGNAL =
  /chocolate|chocolates|ferrero|lindor|lindt|hershey|kitkat|dairy\s*milk|snicker|mixed\s*choc|kaju\s*katli|besan\s*ladd|soan\s*papdi|dry\s*fruit|mithai|hamper/i;

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
  return [product.name, product.description, product.slug, ...(product.tags ?? [])]
    .filter(Boolean)
    .join(" ");
}

/**
 * True for UsaRakhi products that include chocolates or other extras with the rakhi.
 * False for Orange County and for single / multi rakhi-only SKUs.
 */
export function shouldShowUsarakhiStockShortageNote(product: StockNoteProduct): boolean {
  if (isOrangeCounty(product)) return false;

  const category = (product.categorySlug ?? "").trim();
  if (category === "single-rakhi") return false;
  if (isRakhiSetSizeCategory(category)) return false;

  const tags = product.tags ?? [];
  if (tags.includes("mini-rakhi-set")) return false;

  if (category === "rakhi-hampers") return true;

  return CHOCOLATE_OR_EXTRA_SIGNAL.test(productBlob(product));
}

/** Remove any stock-shortage paragraph we previously appended (old or new wording). */
export function stripUsarakhiStockShortageNote(description: string): string {
  if (!description.includes(NOTE_MARKER)) return description;

  let next = description;
  // HTML blocks we append
  next = next.replace(
    /\n?<p><strong>Rakhi stock about to end[\s\S]*?<\/strong><\/p>\s*/gi,
    ""
  );
  // Plain-text append
  next = next.replace(/\n\nRakhi stock about to end[^\n]*/gi, "");
  // Inline leftover
  next = next.replace(/\s*Rakhi stock about to end[^.]*\./gi, "");
  // Exact legacy/current full strings if still present
  next = next.replace(LEGACY_NOTE, "").replace(USARAKHI_STOCK_SHORTAGE_NOTE, "");
  return next.trim();
}

/** Idempotent: append stock note only for chocolate/extra UsaRakhi products. */
export function withUsarakhiStockShortageNote<T extends StockNoteProduct>(product: T): T {
  if (isOrangeCounty(product)) return product;

  const cleaned = stripUsarakhiStockShortageNote(product.description ?? "");
  if (!shouldShowUsarakhiStockShortageNote(product)) {
    if (cleaned === (product.description ?? "")) return product;
    return { ...product, description: cleaned };
  }

  if (cleaned.includes(NOTE_MARKER) && cleaned.includes(USARAKHI_STOCK_SHORTAGE_NOTE)) {
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
