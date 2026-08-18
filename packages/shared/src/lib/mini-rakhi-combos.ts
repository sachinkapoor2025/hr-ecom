import { DEFAULT_PRODUCT_INVENTORY } from "../constants";
import type { Product } from "../schemas/product";

function usd(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Mix-and-match extra rakhis: 1–5 pieces at these totals. */
export const MAX_RAKHI_ADDON_PIECES = 5;

export const RAKHI_ADDON_BUNDLE_USD = {
  1: 3.99,
  2: 5.99,
  3: 6.99,
  4: 7.99,
  5: 8.5,
} as const;

export type MiniRakhiAddon = {
  slug: string;
  name: string;
  shortName: string;
  image: string;
  /** Current standalone storefront price (for compare-at on set products). */
  standaloneUsd: number;
};

export const MINI_RAKHI_ADDONS: readonly MiniRakhiAddon[] = [
  {
    slug: "blue-beads-pearl-single-rakhi",
    name: "Blue Beads Pearl Single",
    shortName: "Blue Beads Pearl",
    image:
      "https://d301af4ndyn9qx.cloudfront.net/uploads/2026/03/50dada5d-eb61-454a-8fe4-51eb5e420753-e1775488586506.webp",
    standaloneUsd: 6.34,
  },
  {
    slug: "ganesh-single-rakhi",
    name: "Ganesh Single Rakhi",
    shortName: "Ganesh",
    image:
      "https://d301af4ndyn9qx.cloudfront.net/uploads/2026/03/Ganesh-single-rakhi-e1775489480917.webp",
    standaloneUsd: 6.34,
  },
  {
    slug: "mutiple-stone-single-rakhi",
    name: "Mutiple Stone Single Rakhi",
    shortName: "Multi Stone",
    image:
      "https://d301af4ndyn9qx.cloudfront.net/uploads/2026/03/Muticolour-stone-single-rakhi-e1775490341282.webp",
    standaloneUsd: 6.34,
  },
  {
    slug: "om-rakhi-with-roli-chawal-for-brother",
    name: "Om Rakhi with Roli Chawal for Brother",
    shortName: "Om with Roli Chawal",
    image:
      "https://d301af4ndyn9qx.cloudfront.net/uploads/2026/05/WhatsApp-Image-2026-05-06-at-10.36.39-PM-2.jpeg",
    standaloneUsd: 6.34,
  },
  {
    slug: "pearl-single-rakhi",
    name: "Pearl Single Rakhi",
    shortName: "Pearl",
    image:
      "https://d301af4ndyn9qx.cloudfront.net/uploads/2026/03/pearl-single-rakhi-e1779467005952.webp",
    standaloneUsd: 6.34,
  },
  {
    slug: "red-rubi-single-stone-rakhi",
    name: "Red Rubi Single Stone Rakhi",
    shortName: "Red Rubi",
    image:
      "https://d301af4ndyn9qx.cloudfront.net/uploads/2026/03/ec34d0c6-c4e4-4f31-9f9b-958bc2b4a96d-e1776002916322.jpeg",
    standaloneUsd: 6.34,
  },
  {
    slug: "pearl-rakhi-with-gold-single-rakhi",
    name: "Pearl Rakhi With Gold Single Rakhi",
    shortName: "Pearl Gold",
    image:
      "https://d301af4ndyn9qx.cloudfront.net/uploads/2026/03/Pearl-Rakhi-with-Gold-Single-e1779466657774.webp",
    standaloneUsd: 6.71,
  },
  {
    slug: "om-single-rakhi",
    name: "Om Single Rakhi",
    shortName: "Om Single",
    image:
      "https://d301af4ndyn9qx.cloudfront.net/uploads/2026/03/Om-Single-Rakhi-1-e1779466859856.png",
    standaloneUsd: 6.89,
  },
];

const ADDON_BY_SLUG = new Map(MINI_RAKHI_ADDONS.map((a) => [a.slug, a]));

export function rakhiAddonId(slug: string): string {
  return `rakhi-${slug}`;
}

export function getMiniRakhiAddon(slug: string): MiniRakhiAddon | undefined {
  return ADDON_BY_SLUG.get(slug);
}

/** Total extra-rakhi add-on price for `count` pieces (packs of 5 at $8.50, then remainder). */
export function rakhiAddonBundlePriceUsd(count: number): number {
  if (!Number.isFinite(count) || count <= 0) return 0;
  const n = Math.floor(count);
  const packs = Math.floor(n / MAX_RAKHI_ADDON_PIECES);
  const rem = n % MAX_RAKHI_ADDON_PIECES;
  const remPrice = rem === 0 ? 0 : RAKHI_ADDON_BUNDLE_USD[rem as 1 | 2 | 3 | 4 | 5];
  return usd(packs * RAKHI_ADDON_BUNDLE_USD[5] + remPrice);
}

export type MiniRakhiComboDef = {
  slug: string;
  size: 2 | 3 | 4 | 5;
  memberSlugs: readonly string[];
  name: string;
};

export const MINI_RAKHI_SET_COMBOS: readonly MiniRakhiComboDef[] = [
  {
    slug: "designer-rakhi-set-of-2-pearl-and-om",
    size: 2,
    memberSlugs: ["pearl-single-rakhi", "om-rakhi-with-roli-chawal-for-brother"],
    name: "Designer Rakhi Set of 2 — Pearl & Om",
  },
  {
    slug: "designer-rakhi-set-of-2-ganesh-and-red-rubi",
    size: 2,
    memberSlugs: ["ganesh-single-rakhi", "red-rubi-single-stone-rakhi"],
    name: "Designer Rakhi Set of 2 — Ganesh & Red Rubi",
  },
  {
    slug: "designer-rakhi-set-of-2-blue-beads-and-om-single",
    size: 2,
    memberSlugs: ["blue-beads-pearl-single-rakhi", "om-single-rakhi"],
    name: "Designer Rakhi Set of 2 — Blue Beads & Om Single",
  },
  {
    slug: "designer-rakhi-set-of-2-multi-stone-and-pearl-gold",
    size: 2,
    memberSlugs: ["mutiple-stone-single-rakhi", "pearl-rakhi-with-gold-single-rakhi"],
    name: "Designer Rakhi Set of 2 — Multi Stone & Pearl Gold",
  },
  {
    slug: "designer-rakhi-set-of-3-ganesh-pearl-om",
    size: 3,
    memberSlugs: ["ganesh-single-rakhi", "pearl-single-rakhi", "om-rakhi-with-roli-chawal-for-brother"],
    name: "Designer Rakhi Set of 3 — Ganesh, Pearl & Om",
  },
  {
    slug: "designer-rakhi-set-of-3-blue-beads-red-rubi-om",
    size: 3,
    memberSlugs: ["blue-beads-pearl-single-rakhi", "red-rubi-single-stone-rakhi", "om-single-rakhi"],
    name: "Designer Rakhi Set of 3 — Blue Beads, Red Rubi & Om",
  },
  {
    slug: "designer-rakhi-set-of-3-multi-stone-pearl-gold",
    size: 3,
    memberSlugs: [
      "mutiple-stone-single-rakhi",
      "pearl-single-rakhi",
      "pearl-rakhi-with-gold-single-rakhi",
    ],
    name: "Designer Rakhi Set of 3 — Multi Stone, Pearl & Gold",
  },
  {
    slug: "designer-rakhi-set-of-4-classic-mix",
    size: 4,
    memberSlugs: [
      "blue-beads-pearl-single-rakhi",
      "ganesh-single-rakhi",
      "om-rakhi-with-roli-chawal-for-brother",
      "pearl-single-rakhi",
    ],
    name: "Designer Rakhi Set of 4 — Classic Mix",
  },
  {
    slug: "designer-rakhi-set-of-4-stone-and-om-mix",
    size: 4,
    memberSlugs: [
      "mutiple-stone-single-rakhi",
      "red-rubi-single-stone-rakhi",
      "pearl-rakhi-with-gold-single-rakhi",
      "om-single-rakhi",
    ],
    name: "Designer Rakhi Set of 4 — Stone & Om Mix",
  },
  {
    slug: "designer-rakhi-set-of-5-classic-collection",
    size: 5,
    memberSlugs: [
      "blue-beads-pearl-single-rakhi",
      "ganesh-single-rakhi",
      "om-rakhi-with-roli-chawal-for-brother",
      "pearl-single-rakhi",
      "red-rubi-single-stone-rakhi",
    ],
    name: "Designer Rakhi Set of 5 — Classic Collection",
  },
  {
    slug: "designer-rakhi-set-of-5-om-pearl-stone",
    size: 5,
    memberSlugs: [
      "mutiple-stone-single-rakhi",
      "om-rakhi-with-roli-chawal-for-brother",
      "pearl-single-rakhi",
      "pearl-rakhi-with-gold-single-rakhi",
      "om-single-rakhi",
    ],
    name: "Designer Rakhi Set of 5 — Om, Pearl & Stone",
  },
];

const COMBO_BY_SLUG = new Map(MINI_RAKHI_SET_COMBOS.map((c) => [c.slug, c]));

export function isMiniRakhiComboSlug(slug: string | undefined | null): boolean {
  return Boolean(slug && COMBO_BY_SLUG.has(slug));
}

export function getMiniRakhiCombo(slug: string): MiniRakhiComboDef | undefined {
  return COMBO_BY_SLUG.get(slug);
}

function membersFor(def: MiniRakhiComboDef): MiniRakhiAddon[] {
  return def.memberSlugs.map((slug) => {
    const member = ADDON_BY_SLUG.get(slug);
    if (!member) throw new Error(`Unknown mini rakhi slug: ${slug}`);
    return member;
  });
}

export function buildMiniRakhiComboProduct(def: MiniRakhiComboDef): Product {
  const members = membersFor(def);
  const price = RAKHI_ADDON_BUNDLE_USD[def.size];
  const compareAtPrice = usd(members.reduce((sum, m) => sum + m.standaloneUsd, 0));
  const listItems = members.map((m) => `<li>${m.name}</li>`).join("");
  const names = members.map((m) => m.shortName).join(", ");

  return {
    slug: def.slug,
    name: def.name,
    description: `<p>A <strong>Set of ${def.size} Rakhis</strong> mixed from our designer singles (${names}). Each design is also sold on its own product page at the regular price — this set is the bundle price of <strong>$${price.toFixed(2)}</strong>.</p><p><strong>What's included:</strong></p><ul>${listItems}<li>Complimentary Roli</li><li>Complimentary Chawal</li></ul>`,
    price,
    compareAtPrice: Math.max(compareAtPrice, price + 0.01),
    currency: "USD",
    categorySlug: "rakhi-combo",
    images: members.map((m) => m.image),
    inventory: DEFAULT_PRODUCT_INVENTORY,
    tags: ["fixed-price", "mini-rakhi-set"],
    couponExcluded: true,
    seoTitle: `${def.name} | Send Rakhi Set to USA`,
    seoDescription: `Shop ${def.name} for USA delivery — ${def.size} designer rakhis for $${price.toFixed(2)}. Complimentary roli and chawal. Domestic shipping.`,
    published: true,
    createdAt: "2026-08-19T00:00:00.000Z",
    updatedAt: "2026-08-19T00:00:00.000Z",
  };
}

export function allMiniRakhiComboProducts(): Product[] {
  return MINI_RAKHI_SET_COMBOS.map(buildMiniRakhiComboProduct);
}

/** Merge curated 2–5 rakhi sets into a product list without overwriting Dynamo rows. */
export function mergeMiniRakhiComboProducts(existing: Product[]): Product[] {
  const bySlug = new Map(existing.map((p) => [p.slug, p]));
  for (const combo of allMiniRakhiComboProducts()) {
    if (!bySlug.has(combo.slug)) bySlug.set(combo.slug, combo);
  }
  return [...bySlug.values()];
}
