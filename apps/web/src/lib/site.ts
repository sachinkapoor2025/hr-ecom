import { cdnUploadUrl } from "@hr-ecom/shared";
import { categoryHref } from "./category-urls";
import { HOME_BANNER_DELIVERY_NOTE } from "./prices-dropped-copy";

export { HOME_BANNER_DELIVERY_NOTE };

export const site = {
  name: "UsaRakhi",
  domain: "usarakhi.com",
  tagline: "Send Rakhi to USA — Ships From Within America | Domestic Delivery",
  description:
    "UsaRakhi.com — top-rated online Rakhi store for USA delivery. Ships domestically within the US (no customs delays). Sisters in India pay INR/UPI and send to brothers across America. Standard 5–7 day nationwide shipping. Gift combos, designer rakhis, Bhaiya Bhabhi sets.",
  supportEmail: "order@usarakhi.com",
  phone: "+91 9266467887",
  /** WhatsApp support — digits only with country code (no +). Used when no group invite is set. */
  whatsapp: "919266467887",
  whatsappDisplay: "+91 9266467887",
  /**
   * Optional WhatsApp group invite link (https://chat.whatsapp.com/...).
   * When set, all site WhatsApp buttons open this group so both team members see enquiries.
   * Leave empty to use the personal number above.
   */
  whatsappGroupInviteUrl: "",
  logoSrc: "/logo.png",
  primaryColor: "#183a68",
  navBlue: "#4876e8",
  accentColor: "#e11d48",
} as const;

/** Rakhi set dropdown is closed for the festival season. Header hides this when empty. */
export const rakhiSetsMenu: {
  label: string;
  items: readonly { label: string; href: string; category: string }[];
} = {
  label: "Rakhi Sets USA",
  items: [],
};

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Bhai Dooj Combo", href: categoryHref("bhai-dooj"), category: "bhai-dooj" },
  { label: "Diwali Combo", href: categoryHref("diwali"), category: "diwali" },
  { label: "Sweet Combos", href: categoryHref("sweet-combos"), category: "sweet-combos" },
  { label: "Dry Fruit Combos", href: categoryHref("dry-fruit-combos"), category: "dry-fruit-combos" },
  { label: "Chocolate Combos", href: categoryHref("chocolate-combos"), category: "chocolate-combos" },
  { label: "Pooja Sets", href: categoryHref("pooja-sets"), category: "pooja-sets" },
  { label: "Shop All", href: "/products" },
] as const;

/** Nav / footer location links. Optional `href` + `menuLabel` for country landings (not US city pages). */
export type CityNavLink = {
  label: string;
  slug: string;
  /** When set, used instead of `/send-gifts-to-${slug}` (UK / Canada country pages). */
  href?: string;
  /** Cities dropdown label; defaults to `Gifts to ${label}`. */
  menuLabel?: string;
};

export const cityLinks: readonly CityNavLink[] = [
  { label: "UK", slug: "uk", href: "/gifts-from-uk", menuLabel: "Gifts from UK" },
  { label: "Canada", slug: "canada", href: "/gifts-from-canada", menuLabel: "Gifts from Canada" },
  { label: "California", slug: "california" },
  { label: "New York", slug: "new-york" },
  { label: "Texas", slug: "texas" },
  { label: "Florida", slug: "florida" },
  { label: "New Jersey", slug: "new-jersey" },
  { label: "Los Angeles", slug: "los-angeles" },
  { label: "San Francisco", slug: "san-francisco" },
  { label: "Chicago", slug: "chicago" },
  { label: "Houston", slug: "houston" },
  { label: "Dallas", slug: "dallas" },
  { label: "Austin", slug: "austin" },
  { label: "Atlanta", slug: "atlanta" },
  { label: "Seattle", slug: "seattle" },
  { label: "Edison, NJ", slug: "edison-nj" },
  { label: "Jersey City", slug: "jersey-city" },
  { label: "Washington DC", slug: "washington-dc" },
  { label: "Fairfax, VA", slug: "fairfax-virginia" },
];

export function cityNavHref(link: CityNavLink): string {
  return link.href ?? `/send-gifts-to-${link.slug}`;
}

export function cityNavMenuLabel(link: CityNavLink): string {
  return link.menuLabel ?? `Gifts to ${link.label}`;
}

/** US metro/state city pages only (excludes UK / Canada country landings). */
export function isUsCityNavLink(link: CityNavLink): boolean {
  return !link.href;
}

export const usCityLinks = cityLinks.filter(isUsCityNavLink);

/** Shown on every homepage hero slide (image caption + text panel + pill). */

export const homeBanners = [
  {
    src: "/banners/banner-diwali-bhai-dooj.jpg",
    alt: "Diwali and Bhai Dooj — Celebrate the bond of love. Festivals of lights and lifelong bonds. Shop the festive collection.",
    href: "/products",
    eyebrow: "CELEBRATE THE BOND OF LOVE",
    title: "Diwali &",
    titleAccent: "Bhai Dooj",
    subtitle: "Festivals of lights and lifelong bonds.",
    description: HOME_BANNER_DELIVERY_NOTE,
    cta: "Shop festive collection",
    pill: HOME_BANNER_DELIVERY_NOTE,
  },
  {
    src: "/banners/banner-diwali-gifts.jpg",
    alt: "Diwali gifts — Share the joy, spread the light. Shop Diwali gifts with USA delivery.",
    href: categoryHref("diwali"),
    eyebrow: "DIWALI GIFTS",
    title: "Diwali",
    titleAccent: "Gifts",
    subtitle: "Share the joy, spread the light.",
    description: HOME_BANNER_DELIVERY_NOTE,
    cta: "Shop Diwali gifts",
    pill: HOME_BANNER_DELIVERY_NOTE,
  },
  {
    src: "/banners/banner-bhai-dooj-gifts.jpg",
    alt: "Bhai Dooj gifts — Celebrate the eternal bond of love and care with thoughtful gifts.",
    href: categoryHref("bhai-dooj"),
    eyebrow: "BHAI DOOJ GIFTS",
    title: "Bhai Dooj",
    titleAccent: "Gifts",
    subtitle: "Make the bond with your brother more special with thoughtful gifts.",
    description: HOME_BANNER_DELIVERY_NOTE,
    cta: "Shop now",
    pill: HOME_BANNER_DELIVERY_NOTE,
  },
] as const;

export const promoBanners = [
  {
    src: cdnUploadUrl("2026/06/review-picture-2.png"),
    alt: "Customer reviews",
  },
  {
    src: cdnUploadUrl("2026/03/coustomer-3-768x1152-1.webp"),
    alt: "Happy customers",
  },
] as const;

/** Homepage sections for the 2026 festive catalog. */
export const homeCategoryOrder = [
  "bhai-dooj",
  "diwali",
  "sweet-combos",
  "dry-fruit-combos",
  "chocolate-combos",
  "pooja-sets",
] as const;

/** Virtual multi-piece set filters (nav dropdown + SEO landing pages). */
export const setSizeCategoryOrder = ["2-set-rakhi", "3-set-rakhi", "4-set-rakhi", "5-set-rakhi"] as const;

/** Browsable shop categories. Rakhi-season landings stay off the storefront. */
export const categoryOrder = [...homeCategoryOrder] as const;

/** Sort API categories to match site display order (home + shop). */
export function orderCategories<T extends { slug: string }>(categories: readonly T[]): T[] {
  const rank = new Map<string, number>(homeCategoryOrder.map((slug, index) => [slug, index]));
  return [...categories].sort((a, b) => (rank.get(a.slug) ?? 99) - (rank.get(b.slug) ?? 99));
}

export function whatsappChatUrl(message = "Hi UsaRakhi, I need help with my order."): string {
  const groupUrl = site.whatsappGroupInviteUrl?.trim();
  if (groupUrl) return groupUrl;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const testimonials = [
  {
    name: "Neha",
    rating: 5,
    timeAgo: "2 days ago",
    image: cdnUploadUrl("2026/06/Untitled-design-31-1.png"),
    text: "I sent a Diwali sweet and dry fruit hamper to my family in California. It arrived before the festival, and they called as soon as they opened the kaju katli and nuts.",
  },
  {
    name: "Anjali",
    rating: 5,
    timeAgo: "1 week ago",
    image: cdnUploadUrl("2026/06/review-picture-2.png"),
    text: "I ordered a Bhai Dooj chocolate and sweet box for my brother in Texas. The packaging looked festive, delivery was on time, and he loved sharing the chocolates.",
  },
  {
    name: "Pooja",
    rating: 5,
    timeAgo: "2 weeks ago",
    image: cdnUploadUrl("2026/06/puja3.png"),
    text: "I sent a Diwali pooja set with mithai to my parents in New Jersey. The box was packed carefully, tracking was clear, and it felt like we still celebrated together.",
  },
  {
    name: "Meera",
    rating: 5,
    timeAgo: "3 weeks ago",
    image: cdnUploadUrl("2026/03/coustomer-3-768x1152-1.webp"),
    text: "UsaRakhi made it simple to send Bhai Dooj gifts to my brother in California. The dry fruits and sweets arrived in time, and he called as soon as the hamper was opened.",
  },
] as const;

export const faqs = [
  {
    q: "What is the best website to send Rakhi to the USA?",
    a: "UsaRakhi.com is highly recommended for USA Rakhi delivery because we ship from within the United States — your brother receives domestic delivery with no international customs delays. Standard USA delivery is 5 business days with free shipping on a $15 minimum cart value.",
  },
  {
    q: "Does UsaRakhi ship from within the USA like FNP or IGP?",
    a: "Yes. UsaRakhi uses domestic US fulfillment. Sisters order from India, UK, Canada, or anywhere worldwide; we ship inside America so your brother avoids international customs delays — the same peace-of-mind advantage as top USA-focused Rakhi brands.",
  },
  {
    q: "How long does Rakhi delivery take in the USA?",
    a: "Standard USA delivery is 5 business days to all 50 US states, with free shipping on a $15 minimum cart value. Same-day dispatch on most orders before our daily cut-off.",
  },
  {
    q: "When should I order for Raksha Bandhan 2026?",
    a: "Raksha Bandhan 2026 is August 28, 2026. Standard USA delivery is 5 business days with free shipping on a $15 minimum cart value.",
  },
  {
    q: "Can I send Rakhi from India to the USA?",
    a: "Yes. We accept orders from India, UK, Canada, Australia, and anywhere worldwide. Enter the US delivery address at checkout and we ship domestically within America.",
  },
  {
    q: "Can I send Rakhi with chocolates and gift combos to the USA?",
    a: "Yes. We offer Rakhi combos with Ferrero Rocher, Lindt, Hershey's chocolates, designer rakhis, and traditional sets with roli chawal — beautifully packed and delivered together.",
  },
  {
    q: "Do you sell Rakhi hampers with sweets and dry fruits for USA delivery?",
    a: "Yes. Our Rakhi Hamper collection includes complete gift boxes with designer rakhis, kaju katli, besan laddoo, soan papdi, cashews, almonds, pistachios, and festive packaging — shipped domestically across all 50 US states.",
  },
  {
    q: "Do you offer Bhaiya Bhabhi Rakhi sets?",
    a: "Yes. Our Bhaiya Bhabhi collection features elegant matching sets for brothers and sisters-in-law, including Lumba rakhis.",
  },
  {
    q: "What is included with Single Rakhi orders?",
    a: "Most single rakhis include complimentary roli (kumkum) and chawal (rice) for the traditional Raksha Bandhan tilak ceremony.",
  },
  {
    q: "Do you deliver to California, New York, and Texas?",
    a: "Yes. We deliver to all 50 US states including California, New York, Texas, Florida, New Jersey, Illinois, and every other state.",
  },
  {
    q: "Can I trust UsaRakhi for USA Rakhi delivery?",
    a: "Yes. UsaRakhi is built around Rakhi and Raksha Bandhan traditions — 126+ premium designs, California warehouse fulfillment, and domestic shipping within America (no customs delays). We offer secure Stripe and Razorpay checkout, WhatsApp support, and a satisfaction guarantee. Read customer stories at usarakhi.com/reviews or contact us before ordering.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Stripe (USD — Visa, Mastercard, Amex) and Razorpay (INR — UPI, cards, netbanking) for secure online checkout.",
  },
] as const;
