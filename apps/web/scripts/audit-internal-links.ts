/**
 * Checks contextual internal links: at most 3 per page, unique anchors,
 * unique destinations, no self-links, no redirecting URLs, and coverage of
 * important public pages.
 *
 * Run from apps/web: npx tsx --tsconfig tsconfig.json scripts/audit-internal-links.ts
 */
import { isRakhiContentHidden, textMentionsRakhi } from "@hr-ecom/shared";
import { categoryHref } from "../src/lib/category-urls";
import { getCityContent } from "../src/lib/content/city-pages";
import { allSecondaryCitySlugs, getSecondaryCity, isExpressMetro, secondaryCityIntro } from "../src/lib/content/city-delivery-tiers";
import { listAllBlogPosts } from "../src/lib/content/blog-posts";
import { getCategoryRichContent } from "../src/lib/content/category-rich-content";
import { allSeoLocationSlugs, getSeoLocation, locationPublicPath } from "../src/lib/content/seo-data";
import { homeCategoryOrder } from "../src/lib/site";
import { buildSecondaryCityFaqs } from "../src/components/SecondaryCityLanding";
import { buildLocationContent } from "../src/components/SeoLocationLanding";
import {
  blogInlineLinks,
  categoryInlineLinks,
  locationEditorialLinks,
  normalizeHref,
  productExploreLinks,
  type ContextualLink,
} from "../src/lib/contextual-links";

type PageLinks = { id: string; self: string; links: { anchor: string; href: string }[] };

const problems: string[] = [];

function add(id: string, self: string, links: { anchor: string; href: string }[]): PageLinks {
  return { id, self, links };
}

function categoryText(slug: string): string {
  const content = getCategoryRichContent(slug);
  if (!content) return "";
  return [
    ...content.intro,
    ...(content.sections ?? []).flatMap((section) => [
      ...(section.paragraphs ?? []),
      ...(section.items ?? []),
      ...(section.steps ?? []),
      ...(section.closing ?? []),
    ]),
    ...(content.delivery?.paragraphs ?? []),
    ...(content.faqs ?? []).map((faq) => faq.a),
    content.support?.body ?? "",
  ].join("\n");
}

function cityText(slug: string): string {
  const content = getCityContent(slug);
  if (!content) return "";
  return [...content.intro, ...content.delivery.paragraphs, ...content.faqs.map((faq) => faq.a)].join("\n");
}

const pages: PageLinks[] = [
  add("home", "/", [
    { anchor: "Diwali gifts", href: categoryHref("diwali") },
    { anchor: "Bhai Dooj gifts", href: categoryHref("bhai-dooj") },
    { anchor: "read our full FAQ page", href: "/faq" },
  ]),
  add("about", "/about", [
    { anchor: "contact page", href: "/contact" },
    { anchor: "customer reviews", href: "/reviews" },
    { anchor: "Press kit", href: "/press" },
  ]),
  add("faq", "/faq", [
    { anchor: "Diwali gifts", href: "/diwali-to-usa" },
    { anchor: "Blog", href: "/blog" },
    { anchor: "Shipping", href: "/shipping" },
  ]),
  add("shipping", "/shipping", [
    { anchor: "Diwali gift combos", href: "/diwali-to-usa" },
    { anchor: "Contact us", href: "/contact" },
    { anchor: "FAQ", href: "/faq" },
  ]),
  add("contact", "/contact", [
    { anchor: "shipping", href: "/shipping" },
    { anchor: "returns", href: "/returns" },
    { anchor: "FAQ", href: "/faq" },
  ]),
  add("returns", "/returns", [
    { anchor: "5–7 business day", href: "/shipping" },
    { anchor: "Contact form", href: "/contact" },
    { anchor: "← Back to home", href: "/" },
  ]),
  add("reviews", "/reviews", [
    { anchor: "shipping page", href: "/shipping" },
    { anchor: "About our California team", href: "/about" },
    { anchor: "FAQ", href: "/faq" },
  ]),
  add("press", "/press", [
    { anchor: "Diwali", href: "/diwali-to-usa" },
    { anchor: "Bhai Dooj", href: "/bhai-dooj-to-usa" },
    { anchor: "5 business days", href: "/shipping" },
  ]),
  add("privacy", "/privacy", [
    { anchor: "contact us", href: "/contact" },
    { anchor: "legal obligations", href: "/terms" },
    { anchor: "← Back to home", href: "/" },
  ]),
  add("terms", "/terms", [
    { anchor: "Shipping & Delivery", href: "/shipping" },
    { anchor: "Returns & Satisfaction Guarantee", href: "/returns" },
    { anchor: "Privacy Policy", href: "/privacy" },
  ]),
  add("products", "/products", [
    { anchor: "Bhai Dooj combos", href: categoryHref("bhai-dooj") },
    { anchor: "Diwali combos", href: categoryHref("diwali") },
    { anchor: "Shipping", href: "/shipping" },
  ]),
  add("blog-index", "/blog", [
    { anchor: "Diwali", href: "/diwali-to-usa" },
    { anchor: "Bhai Dooj", href: "/bhai-dooj-to-usa" },
    { anchor: "Browse the shop", href: "/products" },
  ]),
  add("gifts-uk", "/gifts-from-uk", [
    { anchor: "Chocolate combos", href: "/chocolate-combos-to-usa" },
    { anchor: "Pooja sets", href: "/pooja-sets-to-usa" },
    { anchor: "Contact us", href: "/contact" },
  ]),
  add("gifts-canada", "/gifts-from-canada", [
    { anchor: "Indian sweet combos", href: "/sweet-combos-to-usa" },
    { anchor: "Dry fruit combos", href: "/dry-fruit-combos-to-usa" },
    { anchor: "Contact us", href: "/contact" },
  ]),
];

for (const slug of homeCategoryOrder) {
  const inline = categoryInlineLinks(slug, categoryText(slug));
  const content = getCategoryRichContent(slug);
  const used = new Set(inline.map((link) => normalizeHref(link.href)));
  const sidebar: ContextualLink[] = [];
  for (const cat of content?.relatedCategories ?? []) {
    if (inline.length + sidebar.length >= 2) break;
    if (used.has(normalizeHref(cat.href))) continue;
    used.add(normalizeHref(cat.href));
    sidebar.push({ phrase: cat.label, href: cat.href });
  }
  pages.push(
    add(`category:${slug}`, categoryHref(slug), [
      ...inline.map((link) => ({ anchor: link.phrase, href: link.href })),
      ...sidebar.map((link) => ({ anchor: link.phrase, href: link.href })),
      { anchor: "Contact us", href: "/contact" },
    ])
  );
}

for (const slug of allSeoLocationSlugs()) {
  const location = getSeoLocation(slug);
  if (!location) continue;
  if (isExpressMetro(slug) && getCityContent(slug)) {
    const editorial = locationEditorialLinks(slug, cityText(slug), {
      extraReserved: 1,
      blockedHrefs: ["/contact"],
    });
    pages.push(
      add(`location:${slug}`, locationPublicPath(slug), [
        ...editorial.topical.map((link) => ({ anchor: link.phrase, href: link.href })),
        ...(editorial.cycle ? [{ anchor: editorial.cycle.phrase, href: editorial.cycle.href }] : []),
        { anchor: "Contact us", href: "/contact" },
      ])
    );
    continue;
  }
  const secondary = getSecondaryCity(slug);
  if (secondary) {
    const faqs = buildSecondaryCityFaqs(secondary);
    const text = [
      `${secondaryCityIntro(secondary.slug, secondary.name, secondary.state)} Families in India, the UK, Canada, and worldwide order online.`,
      "Shop Diwali gift combos, Bhai Dooj gifts, sweet boxes, chocolate assortments, and dry fruit hampers.",
      ...faqs.map((faq) => faq.a),
    ].join("\n");
    const editorial = locationEditorialLinks(slug, text, {
      nearby: {
        phrase: `${secondary.nearbyMetroLabel} gifts delivery`,
        href: locationPublicPath(secondary.nearbyMetroSlug),
      },
    });
    pages.push(
      add(`location:${slug}`, locationPublicPath(slug), [
        ...editorial.topical.map((link) => ({ anchor: link.phrase, href: link.href })),
        ...(editorial.nearby ? [{ anchor: editorial.nearby.phrase, href: editorial.nearby.href }] : []),
        ...(editorial.cycle ? [{ anchor: editorial.cycle.phrase, href: editorial.cycle.href }] : []),
      ])
    );
    continue;
  }
  const content = buildLocationContent(location);
  const text = [...content.intro, ...content.delivery.paragraphs, ...content.faqs.map((faq) => faq.a)].join("\n");
  const editorial = locationEditorialLinks(slug, text);
  pages.push(
    add(`location:${slug}`, locationPublicPath(slug), [
      ...editorial.topical.map((link) => ({ anchor: link.phrase, href: link.href })),
      ...(editorial.cycle ? [{ anchor: editorial.cycle.phrase, href: editorial.cycle.href }] : []),
    ])
  );
}

const visibleBlogs = listAllBlogPosts().filter((post) => {
  if (!isRakhiContentHidden()) return true;
  return !textMentionsRakhi(`${post.slug} ${post.title} ${post.excerpt} ${post.description}`);
});

for (const post of visibleBlogs) {
  const text = [
    post.excerpt,
    ...post.sections.flatMap((section) => section.paragraphs),
    ...(post.closing?.paragraphs ?? []),
    ...(post.faqs ?? []).map((faq) => faq.a),
  ].join("\n");
  const links = blogInlineLinks(post.slug, text);
  pages.push(
    add(
      `blog:${post.slug}`,
      `/blog/${post.slug}`,
      links.map((link) => ({ anchor: link.phrase, href: link.href }))
    )
  );
}

const REDIRECTS = [/^\/shop$/, /^\/categories\//, /^\/cities\//, /^\/send-rakhi-to/, /^\/rakhi-from-uk$/, /^\/rakhi-from-canada$/, /^\/product\//];

for (const page of pages) {
  if (page.links.length === 0) problems.push(`${page.id} has no contextual links`);
  if (page.links.length > 3) problems.push(`${page.id} has ${page.links.length} contextual links`);
  const anchors = new Set<string>();
  const hrefs = new Set<string>();
  for (const link of page.links) {
    const anchor = link.anchor.trim().toLowerCase().replace(/\s+/g, " ");
    const href = normalizeHref(link.href);
    if (!anchor) problems.push(`${page.id} has an empty anchor`);
    if (anchors.has(anchor)) problems.push(`${page.id} repeats anchor "${link.anchor}"`);
    if (hrefs.has(href)) problems.push(`${page.id} repeats destination ${href}`);
    if (href === normalizeHref(page.self)) problems.push(`${page.id} links to itself`);
    if (!href.startsWith("/")) problems.push(`${page.id} has a non-path href ${href}`);
    if (REDIRECTS.some((pattern) => pattern.test(href))) problems.push(`${page.id} uses redirecting href ${href}`);
    if (isRakhiContentHidden() && textMentionsRakhi(href.replace(/[-/]/g, " "))) {
      problems.push(`${page.id} links to a Rakhi URL while that content is hidden: ${href}`);
    }
    anchors.add(anchor);
    hrefs.add(href);
  }
}

const sampleProducts = [
  ["diwali-hamper", "diwali"],
  ["bhai-box", "bhai-dooj"],
  ["sweet-box", "sweet-combos"],
  ["nut-box", "dry-fruit-combos"],
  ["choco-box", "chocolate-combos"],
  ["pooja-box", "pooja-sets"],
  ["other-box", null],
] as const;
for (const [slug, category] of sampleProducts) {
  const links = productExploreLinks(slug, category);
  pages.push(
    add(
      `product:${slug}`,
      `/products/${slug}`,
      links.map((link) => ({ anchor: link.phrase, href: link.href }))
    )
  );
  if (links.length !== 3) problems.push(`product ${slug} explore links = ${links.length}`);
}

const inbound = new Map<string, number>();
for (const page of pages) {
  if (page.id.startsWith("product:")) continue;
  for (const link of page.links) {
    const href = normalizeHref(link.href);
    inbound.set(href, (inbound.get(href) ?? 0) + 1);
  }
}
for (const post of visibleBlogs) {
  const href = `/blog/${post.slug}`;
  inbound.set(href, (inbound.get(href) ?? 0) + 1);
}

const required = [
  "/",
  "/products",
  "/about",
  "/shipping",
  "/faq",
  "/contact",
  "/returns",
  "/reviews",
  "/press",
  "/privacy",
  "/terms",
  "/blog",
  "/gifts-from-uk",
  "/gifts-from-canada",
  ...homeCategoryOrder.map((slug) => categoryHref(slug)),
  ...allSeoLocationSlugs().map((slug) => locationPublicPath(slug)),
  ...visibleBlogs.map((post) => `/blog/${post.slug}`),
];

for (const href of required) {
  if (!inbound.get(normalizeHref(href))) problems.push(`no inbound contextual link to ${href}`);
}

const expressWithoutContent = allSeoLocationSlugs().filter((slug) => isExpressMetro(slug) && !getCityContent(slug));
if (expressWithoutContent.length) problems.push(`express metros missing city copy: ${expressWithoutContent.join(", ")}`);

const secondaryMissing = allSecondaryCitySlugs().filter((slug) => !getSeoLocation(slug));
if (secondaryMissing.length) problems.push(`secondary cities missing from SEO locations: ${secondaryMissing.join(", ")}`);

if (problems.length) {
  console.error(`Internal link audit failed (${problems.length}):`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Internal link audit passed for ${pages.length} page plans, ${visibleBlogs.length} visible articles, and ${allSeoLocationSlugs().length} location pages.`
);
