/**
 * Storefront Rakhi / Raksha Bandhan copy and products stay hidden through
 * 10 November 2026 (America/Los_Angeles) and return on 11 November.
 * Records in DynamoDB are not deleted.
 */
export const RAKHI_CONTENT_VISIBLE_ON = "2026-11-11";

const PACIFIC = "America/Los_Angeles";

export function pacificCalendarDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PACIFIC,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** True while the Pacific calendar date is before 11 November 2026. */
export function isRakhiContentHidden(now = new Date()): boolean {
  return pacificCalendarDate(now) < RAKHI_CONTENT_VISIBLE_ON;
}

/**
 * Festival or product wording. The store name UsaRakhi is not a match.
 */
export function textMentionsRakhi(value: string): boolean {
  const withoutBrand = value.replace(/usarakhi/gi, " ");
  return /\brakhis?\b|\braksha\s*bandhan\b/i.test(withoutBrand);
}

export function isRakhiPublicPath(pathname: string, now = new Date()): boolean {
  if (!isRakhiContentHidden(now)) return false;
  const path = pathname.toLowerCase();
  if (
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.startsWith("/account")
  ) {
    return false;
  }
  const readable = decodeURIComponent(path).replace(/[-_/]+/g, " ");
  return textMentionsRakhi(readable);
}

const FESTIVE_CATEGORY_SLUGS = new Set([
  "bhai-dooj",
  "diwali",
  "sweet-combos",
  "dry-fruit-combos",
  "chocolate-combos",
  "pooja-sets",
]);

export function isFestiveCategorySlug(slug: string | null | undefined): boolean {
  return Boolean(slug && FESTIVE_CATEGORY_SLUGS.has(slug));
}

type ProductIdentity = {
  slug?: string | null;
  name?: string | null;
  categorySlug?: string | null;
  additionalCategorySlugs?: string[] | null;
};

/** A product whose identity is a Rakhi SKU, not a Diwali or Bhai Dooj hamper. */
export function isRakhiPrimaryProduct(product: ProductIdentity): boolean {
  const categories = [product.categorySlug, ...(product.additionalCategorySlugs ?? [])].filter(
    (slug): slug is string => Boolean(slug)
  );
  if (categories.some((slug) => textMentionsRakhi(slug.replace(/-/g, " ")))) return true;
  const identity = `${product.slug ?? ""} ${product.name ?? ""}`.replace(/-/g, " ");
  return textMentionsRakhi(identity);
}

export function stripRakhiSentences(text: string): string {
  if (!text || !textMentionsRakhi(text)) return text;
  const parts = text.split(/(?<=[.!?])\s+/);
  const kept = parts.filter((part) => !textMentionsRakhi(part));
  return kept.join(" ").replace(/\s+/g, " ").trim();
}
