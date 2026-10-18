import { isRakhiContentHidden, isRakhiPublicPath } from "@hr-ecom/shared";
import { categoryHref } from "@/lib/category-urls";
import { allSeoLocationSlugs, getSeoLocation, locationPublicPath, seoLocations } from "@/lib/content/seo-data";

/** In-content links on a public page. Menus, the site footer, and product grids are separate. */
export const MIN_CONTEXTUAL_LINKS = 3;
export const MAX_CONTEXTUAL_LINKS = 5;

export type ContextualLink = {
  /** Exact words to link, as they appear in the copy. */
  phrase: string;
  href: string;
};

type Candidate = {
  phrase: string;
  href: string;
  /** 1 = shop and guide targets. 2 = shipping phrases and city names, used only if slots remain. */
  priority: number;
};

const FESTIVE_CATEGORY_LINKS: Candidate[] = [
  { phrase: "Diwali gift combos", href: categoryHref("diwali"), priority: 1 },
  { phrase: "Diwali gift hampers", href: categoryHref("diwali"), priority: 1 },
  { phrase: "Diwali gifts", href: categoryHref("diwali"), priority: 1 },
  { phrase: "Diwali hampers", href: categoryHref("diwali"), priority: 1 },
  { phrase: "Diwali combos", href: categoryHref("diwali"), priority: 1 },
  { phrase: "Diwali", href: categoryHref("diwali"), priority: 1 },
  { phrase: "Bhai Dooj gifts", href: categoryHref("bhai-dooj"), priority: 1 },
  { phrase: "Bhai Dooj hampers", href: categoryHref("bhai-dooj"), priority: 1 },
  { phrase: "Bhai Dooj hamper", href: categoryHref("bhai-dooj"), priority: 1 },
  { phrase: "Bhai Dooj combos", href: categoryHref("bhai-dooj"), priority: 1 },
  { phrase: "Bhai Dooj", href: categoryHref("bhai-dooj"), priority: 1 },
  { phrase: "traditional sweet boxes", href: categoryHref("sweet-combos"), priority: 1 },
  { phrase: "Indian sweet combos", href: categoryHref("sweet-combos"), priority: 1 },
  { phrase: "sweet combos", href: categoryHref("sweet-combos"), priority: 1 },
  { phrase: "sweet boxes", href: categoryHref("sweet-combos"), priority: 1 },
  { phrase: "Indian sweets", href: categoryHref("sweet-combos"), priority: 1 },
  { phrase: "dry fruit hampers", href: categoryHref("dry-fruit-combos"), priority: 1 },
  { phrase: "dry fruit hamper", href: categoryHref("dry-fruit-combos"), priority: 1 },
  { phrase: "dry fruit combos", href: categoryHref("dry-fruit-combos"), priority: 1 },
  { phrase: "dry fruits", href: categoryHref("dry-fruit-combos"), priority: 1 },
  { phrase: "chocolate assortments", href: categoryHref("chocolate-combos"), priority: 1 },
  { phrase: "chocolate gift boxes", href: categoryHref("chocolate-combos"), priority: 1 },
  { phrase: "chocolate combos", href: categoryHref("chocolate-combos"), priority: 1 },
  { phrase: "Chocolate combos", href: categoryHref("chocolate-combos"), priority: 1 },
  { phrase: "chocolates", href: categoryHref("chocolate-combos"), priority: 1 },
  { phrase: "pooja sets", href: categoryHref("pooja-sets"), priority: 1 },
  { phrase: "pooja set", href: categoryHref("pooja-sets"), priority: 1 },
  { phrase: "Pooja sets", href: categoryHref("pooja-sets"), priority: 1 },
  { phrase: "the UK", href: "/gifts-from-uk", priority: 1 },
  { phrase: "United Kingdom", href: "/gifts-from-uk", priority: 1 },
  { phrase: "Canada", href: "/gifts-from-canada", priority: 1 },
  { phrase: "shipping policy", href: "/shipping", priority: 2 },
  { phrase: "shipping page", href: "/shipping", priority: 2 },
  { phrase: "standard USA delivery", href: "/shipping", priority: 2 },
  { phrase: "domestic USA shipping", href: "/shipping", priority: 2 },
  { phrase: "5–7 business days", href: "/shipping", priority: 2 },
  { phrase: "5-7 business days", href: "/shipping", priority: 2 },
  { phrase: "5 business days", href: "/shipping", priority: 2 },
];

const LOCATION_CANDIDATES: Candidate[] = seoLocations.map((location) => ({
  phrase: location.name,
  href: locationPublicPath(location.slug),
  priority: 2,
}));

const CANDIDATES: Candidate[] = [...FESTIVE_CATEGORY_LINKS, ...LOCATION_CANDIDATES];

const EXPLORE_LABELS: Record<string, string> = {
  diwali: "Diwali gift combos",
  "bhai-dooj": "Bhai Dooj gifts",
  "sweet-combos": "Sweet combos",
  "dry-fruit-combos": "Dry fruit hampers",
  "chocolate-combos": "Chocolate combos",
  "pooja-sets": "Pooja sets",
};

export function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function normalizeHref(href: string): string {
  const path = href.split("?")[0] ?? href;
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export function findPhrase(text: string, phrase: string): { start: number; end: number; anchor: string } | null {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|[^A-Za-z0-9])(${escaped})(?=$|[^A-Za-z0-9])`, "i").exec(text);
  if (!match || match[1] == null || match.index == null) return null;
  const anchor = match[1];
  const start = match.index + match[0].lastIndexOf(anchor);
  return { start, end: start + anchor.length, anchor };
}

function hrefAllowed(href: string, selfHref: string, blocked: Set<string>): boolean {
  const path = normalizeHref(href);
  if (!path.startsWith("/")) return false;
  if (path === normalizeHref(selfHref)) return false;
  if (blocked.has(path)) return false;
  if (isRakhiContentHidden() && isRakhiPublicPath(path)) return false;
  return true;
}

export function pickTopicalLinks(
  text: string,
  options: {
    selfHref: string;
    max?: number;
    salt?: number;
    blockedHrefs?: readonly string[];
    preferHrefs?: readonly string[];
  }
): ContextualLink[] {
  const max = options.max ?? MAX_CONTEXTUAL_LINKS;
  if (max <= 0 || !text.trim()) return [];
  const blocked = new Set((options.blockedHrefs ?? []).map(normalizeHref));
  const prefer = new Set((options.preferHrefs ?? []).map(normalizeHref));

  const spans: { start: number; end: number; href: string; anchor: string; priority: number }[] = [];
  const hrefUsed = new Set<string>();
  const ordered = [...CANDIDATES].sort((a, b) => b.phrase.length - a.phrase.length || a.priority - b.priority);

  for (const candidate of ordered) {
    if (!hrefAllowed(candidate.href, options.selfHref, blocked)) continue;
    const path = normalizeHref(candidate.href);
    if (hrefUsed.has(path)) continue;
    const found = findPhrase(text, candidate.phrase);
    if (!found) continue;
    if (spans.some((span) => found.start < span.end && found.end > span.start)) continue;
    spans.push({ ...found, href: candidate.href, priority: candidate.priority });
    hrefUsed.add(path);
  }

  const chosen: ContextualLink[] = [];
  const anchors = new Set<string>();
  const hrefs = new Set<string>();

  const take = (group: typeof spans) => {
    for (const span of group) {
      if (chosen.length >= max) return;
      const anchorKey = span.anchor.toLowerCase().replace(/\s+/g, " ");
      const path = normalizeHref(span.href);
      if (anchors.has(anchorKey) || hrefs.has(path)) continue;
      anchors.add(anchorKey);
      hrefs.add(path);
      chosen.push({ phrase: span.anchor, href: span.href });
    }
  };

  const priority1 = spans.filter((span) => span.priority === 1);
  const preferred = priority1.filter((span) => prefer.has(normalizeHref(span.href)));
  const rest = priority1.filter((span) => !prefer.has(normalizeHref(span.href)));
  const offset = rest.length ? (options.salt ?? 0) % rest.length : 0;
  take(preferred);
  take(rest.slice(offset).concat(rest.slice(0, offset)));
  if (chosen.length < max) {
    const priority2 = spans.filter((span) => span.priority === 2);
    const offset2 = priority2.length ? (options.salt ?? 0) % priority2.length : 0;
    take(priority2.slice(offset2).concat(priority2.slice(0, offset2)));
  }
  return chosen;
}

export function nextLocationLink(slug: string): ContextualLink | null {
  const slugs = allSeoLocationSlugs();
  const index = slugs.indexOf(slug);
  if (index < 0 || slugs.length < 2) return null;
  const next = getSeoLocation(slugs[(index + 1) % slugs.length]);
  if (!next) return null;
  return {
    phrase: `Diwali gifts to ${next.name}`,
    href: locationPublicPath(next.slug),
  };
}

/** First two location pages reserve a country-landing link so those pages are not orphans. */
export function countryPreference(slug: string): string[] {
  const slugs = allSeoLocationSlugs();
  if (slug === slugs[0]) return ["/gifts-from-uk"];
  if (slug === slugs[1]) return ["/gifts-from-canada"];
  return [];
}

const LOCATION_FILL_LINKS: ContextualLink[] = [
  { phrase: "Sweet combos", href: categoryHref("sweet-combos") },
  { phrase: "Chocolate combos", href: categoryHref("chocolate-combos") },
  { phrase: "Dry fruit hampers", href: categoryHref("dry-fruit-combos") },
  { phrase: "Pooja sets", href: categoryHref("pooja-sets") },
  { phrase: "Shipping", href: "/shipping" },
];

export function locationEditorialLinks(
  slug: string,
  text: string,
  options?: {
    nearby?: ContextualLink | null;
    /** Slots already used by a support button such as Contact. */
    extraReserved?: number;
    blockedHrefs?: readonly string[];
  }
): {
  topical: ContextualLink[];
  cycle: ContextualLink | null;
  nearby: ContextualLink | null;
  extras: ContextualLink[];
} {
  const cycle = nextLocationLink(slug);
  const nearby = options?.nearby ?? null;
  const nearbyCounts = Boolean(nearby && cycle && normalizeHref(nearby.href) !== normalizeHref(cycle.href));
  const reserved = (cycle ? 1 : 0) + (nearbyCounts ? 1 : 0) + (options?.extraReserved ?? 0);
  const blocked = [...(options?.blockedHrefs ?? []), cycle?.href, nearby?.href].filter(
    (href): href is string => Boolean(href)
  );
  const topical = pickTopicalLinks(text, {
    selfHref: locationPublicPath(slug),
    max: Math.max(0, MAX_CONTEXTUAL_LINKS - reserved),
    salt: hashString(slug),
    blockedHrefs: blocked,
    preferHrefs: countryPreference(slug),
  });
  const used = new Set(
    [...topical, ...(cycle ? [cycle] : []), ...(nearbyCounts && nearby ? [nearby] : [])].map((link) =>
      normalizeHref(link.href)
    )
  );
  const extras: ContextualLink[] = [];
  let total = topical.length + reserved;
  for (const candidate of LOCATION_FILL_LINKS) {
    if (total >= MIN_CONTEXTUAL_LINKS || total >= MAX_CONTEXTUAL_LINKS) break;
    const path = normalizeHref(candidate.href);
    if (used.has(path) || path === normalizeHref(locationPublicPath(slug))) continue;
    extras.push(candidate);
    used.add(path);
    total += 1;
  }
  return { topical, cycle, nearby: nearbyCounts ? nearby : null, extras };
}

export function productExploreLinks(productSlug: string, categorySlug?: string | null): ContextualLink[] {
  const keys = Object.keys(EXPLORE_LABELS).filter((slug) => slug !== categorySlug);
  if (keys.length < 2) return [];
  const hash = hashString(productSlug);
  const picked: string[] = [];
  for (let i = 0; i < keys.length && picked.length < 4; i++) {
    const key = keys[(hash + i) % keys.length]!;
    if (!picked.includes(key)) picked.push(key);
  }
  const locations = allSeoLocationSlugs();
  const location = getSeoLocation(locations[hash % locations.length]!);
  const links = picked.map((key) => ({ phrase: EXPLORE_LABELS[key]!, href: categoryHref(key) }));
  if (location) {
    links.push({ phrase: `Diwali gifts to ${location.name}`, href: locationPublicPath(location.slug) });
  }
  return links.slice(0, MAX_CONTEXTUAL_LINKS);
}

const BLOG_FALLBACK_LINKS: ContextualLink[] = [
  { phrase: "Diwali gifts", href: categoryHref("diwali") },
  { phrase: "Bhai Dooj gifts", href: categoryHref("bhai-dooj") },
  { phrase: "shipping policy", href: "/shipping" },
  { phrase: "gift shop", href: "/products" },
  { phrase: "FAQ", href: "/faq" },
];

export function blogInlineLinks(slug: string, text: string): ContextualLink[] {
  return pickTopicalLinks(text, {
    selfHref: `/blog/${slug}`,
    max: MAX_CONTEXTUAL_LINKS,
    salt: hashString(slug),
  });
}

/** Extra links shown only when the article body matched fewer than the minimum. */
export function blogFallbackLinks(slug: string, inline: readonly ContextualLink[]): ContextualLink[] {
  if (inline.length >= MIN_CONTEXTUAL_LINKS) return [];
  const usedHrefs = new Set(inline.map((link) => normalizeHref(link.href)));
  const usedAnchors = new Set(inline.map((link) => link.phrase.toLowerCase()));
  const extra: ContextualLink[] = [];
  for (const candidate of BLOG_FALLBACK_LINKS) {
    if (inline.length + extra.length >= MIN_CONTEXTUAL_LINKS) break;
    const path = normalizeHref(candidate.href);
    const anchor = candidate.phrase.toLowerCase();
    if (usedHrefs.has(path) || usedAnchors.has(anchor) || path === `/blog/${slug}`) continue;
    if (isRakhiContentHidden() && isRakhiPublicPath(path)) continue;
    extra.push(candidate);
    usedHrefs.add(path);
    usedAnchors.add(anchor);
  }
  return extra;
}

export function categoryInlineLinks(slug: string, text: string): ContextualLink[] {
  return pickTopicalLinks(text, {
    selfHref: categoryHref(slug),
    max: MAX_CONTEXTUAL_LINKS - 1,
    salt: hashString(slug),
    blockedHrefs: ["/contact"],
  });
}
