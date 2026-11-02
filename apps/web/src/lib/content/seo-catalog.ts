import {
  FESTIVAL_TRACKED_KEYWORDS,
  metaKeywordsForTarget,
  normalizeSeoKeyword,
  type SeoLandingPage,
  type SeoOccasion,
  type TrackedSeoKeyword,
} from "@hr-ecom/shared";
import { categoryHref } from "../category-urls";
import keywordsData from "./seo-keywords.data.json";

type KeywordFile = {
  core: string[];
  occasion: string[];
  productByTarget: Record<string, string[]>;
};

const data = keywordsData as KeywordFile;

function trackedRow(
  keyword: string,
  occasion: SeoOccasion,
  targetPath: string,
  priority: TrackedSeoKeyword["priority"]
): TrackedSeoKeyword {
  return { keyword: normalizeSeoKeyword(keyword), occasion, targetPath, priority };
}

/** Existing Rakhi sheet. Left intact and still tracked in the SEO dashboard. */
export function rakhiTrackedKeywords(): TrackedSeoKeyword[] {
  const rows: TrackedSeoKeyword[] = [];
  for (const keyword of data.core) rows.push(trackedRow(keyword, "rakhi", "/", "head"));
  for (const keyword of data.occasion) rows.push(trackedRow(keyword, "rakhi", "/raksha-bandhan", "head"));
  for (const [path, keywords] of Object.entries(data.productByTarget)) {
    for (const keyword of keywords) rows.push(trackedRow(keyword, "rakhi", path, "supporting"));
  }
  return dedupeTracked(rows);
}

const METROS: Array<[slug: string, name: string]> = [
  ["los-angeles", "los angeles"],
  ["san-francisco", "san francisco"],
  ["san-jose", "san jose"],
  ["new-york", "new york"],
  ["new-jersey", "new jersey"],
  ["california", "california"],
  ["texas", "texas"],
  ["houston", "houston"],
  ["dallas", "dallas"],
  ["austin", "austin"],
  ["chicago", "chicago"],
  ["atlanta", "atlanta"],
  ["florida", "florida"],
  ["fairfax-virginia", "fairfax"],
];

function metroKeywords(): TrackedSeoKeyword[] {
  const rows: TrackedSeoKeyword[] = [];
  for (const [slug, name] of METROS) {
    const path = `/send-gifts-to-${slug}`;
    rows.push(
      trackedRow(`diwali gifts ${name}`, "diwali", path, "supporting"),
      trackedRow(`bhai dooj gifts ${name}`, "bhai-dooj", path, "supporting"),
      trackedRow(`send diwali gifts to ${name}`, "diwali", path, "supporting"),
      trackedRow(`send bhai dooj gifts to ${name}`, "bhai-dooj", path, "supporting")
    );
  }
  return rows;
}

function dedupeTracked(rows: TrackedSeoKeyword[]): TrackedSeoKeyword[] {
  const seen = new Set<string>();
  const out: TrackedSeoKeyword[] = [];
  for (const row of rows) {
    const key = `${row.occasion}:${row.keyword}`;
    if (!row.keyword || seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

export function allTrackedSeoKeywords(): TrackedSeoKeyword[] {
  return dedupeTracked([...rakhiTrackedKeywords(), ...FESTIVAL_TRACKED_KEYWORDS, ...metroKeywords()]);
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter((part) => part !== "to" && part !== "usa")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function seoLandingPages(): SeoLandingPage[] {
  const pages: SeoLandingPage[] = [
    { path: "/", label: "Home", occasions: ["rakhi", "bhai-dooj", "diwali"] },
    { path: "/raksha-bandhan", label: "Raksha Bandhan", occasions: ["rakhi"] },
    { path: "/send-rakhi-from-india", label: "Send Rakhi from India", occasions: ["rakhi"] },
  ];
  for (const path of Object.keys(data.productByTarget)) {
    pages.push({
      path,
      label: titleFromSlug(path.replace(/^\//, "")),
      occasions: ["rakhi"],
    });
  }
  const festive: Array<[string, string, SeoOccasion[]]> = [
    ["bhai-dooj", "Bhai Dooj gifts", ["bhai-dooj"]],
    ["diwali", "Diwali gifts", ["diwali"]],
    ["sweet-combos", "Sweet combos", ["diwali", "bhai-dooj"]],
    ["dry-fruit-combos", "Dry fruit combos", ["diwali", "bhai-dooj"]],
    ["chocolate-combos", "Chocolate combos", ["diwali", "bhai-dooj"]],
    ["pooja-sets", "Pooja sets", ["diwali", "bhai-dooj"]],
  ];
  for (const [slug, label, occasions] of festive) {
    pages.push({ path: categoryHref(slug), label, occasions });
  }
  pages.push(
    { path: "/gifts-from-uk", label: "Gifts from UK", occasions: ["diwali", "bhai-dooj"] },
    { path: "/gifts-from-canada", label: "Gifts from Canada", occasions: ["diwali", "bhai-dooj"] },
    { path: "/blog/send-diwali-gifts-to-usa", label: "Send Diwali gifts", occasions: ["diwali"] },
    { path: "/blog/diwali-gift-hampers-for-family-in-america", label: "Diwali hampers", occasions: ["diwali"] },
    { path: "/blog/diwali-pooja-gift-box-usa-delivery", label: "Diwali pooja box", occasions: ["diwali"] },
    {
      path: "/blog/diwali-sweets-and-dry-fruits-shipped-in-the-usa",
      label: "Diwali sweets and dry fruits",
      occasions: ["diwali"],
    },
    {
      path: "/blog/order-diwali-gifts-online-from-india-to-usa",
      label: "Order Diwali gifts from India",
      occasions: ["diwali"],
    },
    {
      path: "/blog/bhai-dooj-gifts-for-a-brother-in-the-usa",
      label: "Bhai Dooj gifts for a brother",
      occasions: ["bhai-dooj"],
    },
    {
      path: "/blog/bhai-dooj-or-diwali-hamper-which-to-send",
      label: "Bhai Dooj or Diwali hamper",
      occasions: ["bhai-dooj", "diwali"],
    },
    {
      path: "/blog/bhai-dooj-kaju-katli-kumkum-gifts-usa",
      label: "Bhai Dooj kaju katli",
      occasions: ["bhai-dooj"],
    },
    {
      path: "/blog/bhai-dooj-chocolate-and-dry-fruit-boxes-usa",
      label: "Bhai Dooj chocolate and dry fruit",
      occasions: ["bhai-dooj"],
    },
    {
      path: "/blog/when-to-order-bhai-dooj-gifts-for-usa-delivery",
      label: "When to order Bhai Dooj gifts",
      occasions: ["bhai-dooj"],
    }
  );
  for (const [slug, name] of METROS) {
    pages.push({
      path: `/send-gifts-to-${slug}`,
      label: name.replace(/\b\w/g, (letter) => letter.toUpperCase()),
      occasions: ["diwali", "bhai-dooj"],
    });
  }
  return pages;
}

/** Meta keywords for a category page. Rakhi categories keep the existing sheet terms. */
export function categoryMetaKeywords(slug: string): string | undefined {
  const path = categoryHref(slug);
  if (FESTIVAL_TRACKED_KEYWORDS.some((row) => row.targetPath === path)) {
    const text = metaKeywordsForTarget(path);
    return text || undefined;
  }
  const product = data.productByTarget[path];
  if (!product?.length) return undefined;
  return product
    .slice(0, 12)
    .map((keyword) => normalizeSeoKeyword(keyword))
    .join(", ");
}
