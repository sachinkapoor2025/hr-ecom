import type { Product } from "@hr-ecom/shared";
import { looksLikeHtml, stripHtml } from "./html-text";

type ProductLike = Pick<Product, "name" | "description" | "categorySlug" | "tags">;

function hasChocolateSignal(text: string): boolean {
  return /chocolate|ferrero|hershey|lindor|lindt|kitkat|dairy\s*milk|snicker/i.test(text);
}

/** Parse explicit "Includes N … chocolates" or "with N Brand" from name/description. */
export function parseChocolateInclude(text: string): string | null {
  const patterns: { re: RegExp; label: (n: string) => string }[] = [
    {
      re: /includes\s+(\d+)\s+ferrero\s*rocher\s+chocolates?/i,
      label: (n) => `${n} Ferrero Rocher Chocolates`,
    },
    {
      re: /includes\s+(\d+)\s+hershey'?s?\s+chocolates?/i,
      label: (n) => `${n} Hershey's Chocolates`,
    },
    {
      re: /includes\s+(\d+)\s+lind(?:or|t(?:\s+lindor)?)\s+chocolates?/i,
      label: (n) => `${n} Lindor Chocolates`,
    },
    {
      re: /includes\s+(\d+)\s+assorted\s+chocolates?/i,
      label: (n) => `${n} Assorted Chocolates`,
    },
    {
      re: /includes\s+(\d+)\s+chocolates?/i,
      label: (n) => `${n} Chocolates`,
    },
    {
      re: /with\s+(\d+)\s+hershey'?s?\s+chocolates?/i,
      label: (n) => `${n} Hershey's Chocolates`,
    },
    {
      re: /with\s+(\d+)\s+ferrero\s*rocher\s+chocolates?/i,
      label: (n) => `${n} Ferrero Rocher Chocolates`,
    },
    {
      re: /with\s+(\d+)\s+lind(?:or|t)\s+chocolates?/i,
      label: (n) => `${n} Lindor Chocolates`,
    },
    {
      re: /with\s+(\d+)\s+(?:assorted\s+)?chocolates?/i,
      label: (n) => `${n} Assorted Chocolates`,
    },
  ];

  for (const { re, label } of patterns) {
    const m = text.match(re);
    if (m?.[1]) return label(m[1]);
  }

  if (!hasChocolateSignal(text)) return null;

  // Brand defaults when qty is not stated (standard UsaRakhi pack sizes).
  if (/ferrero/i.test(text)) return "3 Ferrero Rocher Chocolates";
  if (/hershey/i.test(text)) return "2 Hershey's Chocolates";
  if (/lindor|lindt/i.test(text)) return "5 Lindor Chocolates";
  return "5 Assorted Chocolates";
}

function rakhiLines(categorySlug: string): string[] {
  switch (categorySlug) {
    case "bhaiya-bhabhi-rakhi":
      return ["1 Bhaiya Rakhi", "1 Lumba Rakhi for Bhabhi"];
    case "lumba-rakhi":
      return ["1 Designer Lumba Rakhi"];
    case "kids-rakhi":
      return ["1 Kids Designer Rakhi"];
    case "rakhi-combo":
      return ["1 Designer Rakhi"];
    case "single-rakhi":
      return ["1 Designer Rakhi"];
    default:
      return ["1 Designer Rakhi"];
  }
}

function ritualPackets(): string[] {
  return ["Packet of Roli", "Packet of Moli"];
}

function fromHtmlList(description: string): string[] {
  return [...description.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => stripHtml(m[1]!))
    .filter(Boolean);
}

/**
 * Customer-facing "What's included" lines for product detail pages.
 * Hampers use HTML list items; other categories use category defaults + chocolate parsing.
 */
export function getProductIncludes(product: ProductLike): string[] {
  const { description, name, categorySlug, tags } = product;

  if (categorySlug === "rakhi-hampers" || (looksLikeHtml(description) && /<li[\s>]/i.test(description))) {
    const fromHtml = fromHtmlList(description);
    if (fromHtml.length > 0) return fromHtml;
  }

  if (categorySlug === "rakhi-hampers") return [];

  const blob = [name, description, ...(tags ?? [])].join(" ");
  const plain = looksLikeHtml(blob) ? stripHtml(blob) : blob;

  const items = [...rakhiLines(categorySlug), ...ritualPackets()];

  const chocolate = parseChocolateInclude(plain);
  if (chocolate) items.push(chocolate);

  return items;
}
