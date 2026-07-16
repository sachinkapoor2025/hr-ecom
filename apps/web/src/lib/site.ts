import { cdnUploadUrl } from "@hr-ecom/shared";
import { categoryHref } from "./category-urls";

export const site = {
  name: "UsaRakhi",
  domain: "usarakhi.com",
  tagline: "Send Rakhi to USA — Ships From Within America | 2–3 Day Express",
  description:
    "UsaRakhi.com — top-rated online Rakhi store for USA delivery. Ships domestically within the US (no customs delays). 2–3 day express to major cities, 5–7 days nationwide. Gift combos with chocolates, designer rakhis, Bhaiya Bhabhi sets. Order from India, UK, Canada worldwide.",
  supportEmail: "order@usarakhi.com",
  phone: "+91 96504 57697",
  /** WhatsApp support — digits only with country code (no +). Used when no group invite is set. */
  whatsapp: "919650457697",
  whatsappDisplay: "+91 96504 57697",
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

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Single Rakhi", href: categoryHref("single-rakhi"), category: "single-rakhi" },
  { label: "Bhaiya Bhabhi", href: categoryHref("bhaiya-bhabhi-rakhi"), category: "bhaiya-bhabhi-rakhi" },
  { label: "Kids Rakhi", href: categoryHref("kids-rakhi"), category: "kids-rakhi" },
  { label: "Lumba Rakhi", href: categoryHref("lumba-rakhi"), category: "lumba-rakhi" },
  { label: "Rakhi Combo", href: categoryHref("rakhi-combo"), category: "rakhi-combo" },
  { label: "Hampers", href: categoryHref("rakhi-hampers"), category: "rakhi-hampers" },
  { label: "Raksha Bandhan", href: "/raksha-bandhan" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

export const cityLinks = [
  { label: "California", slug: "california" },
  { label: "New York", slug: "new-york" },
  { label: "Texas", slug: "texas" },
  { label: "Florida", slug: "florida" },
  { label: "New Jersey", slug: "new-jersey" },
  { label: "Los Angeles", slug: "los-angeles" },
  { label: "Chicago", slug: "chicago" },
  { label: "Houston", slug: "houston" },
  { label: "San Francisco", slug: "san-francisco" },
] as const;

export const homeBanners = [
  {
    src: "/banners/banner-1-usa-rakhi-delivery.png",
    alt: "USA Rakhi Delivery — Send Beautiful Rakhis to Your Loved Ones in the USA",
    href: "/products?category=rakhi-combo",
    eyebrow: "RAKSHA BANDHAN · USA DELIVERY",
    title: "Send Beautiful Rakhis to Your Loved Ones in the",
    titleAccent: "USA",
    description:
      "Premium designer rakhis with express shipping across all 50 states. Same-day dispatch on most orders.",
    cta: "Shop Rakhi Combos",
    pill: "Premium Rakhis · Express Shipping · Celebrate Raksha Bandhan",
  },
  {
    src: "/banners/banner-2-connecting-hearts.png",
    alt: "UsaRakhi.com — Connecting hearts across miles",
    href: "/products",
    eyebrow: "EVERY SISTER · EVERY BROTHER",
    title: "Connecting Hearts",
    titleAccent: "Across Miles",
    description:
      "Distance may keep you apart, but the bond between siblings remains strong. Delivered with love to your brother.",
    cta: "Browse All Rakhis",
    pill: "Trusted by sisters worldwide · Free shipping on selected orders",
  },
  {
    src: "/banners/banner-3-india-usa.png",
    alt: "Send Rakhi from India to USA — Premium Rakhis with Express Shipping",
    href: "/products?category=single-rakhi",
    eyebrow: "INDIA → USA",
    title: "Bridge the Distance This",
    titleAccent: "Raksha Bandhan",
    description:
      "From India to America — send single rakhis, combos, and gifts with reliable USA delivery you can count on.",
    cta: "Shop Single Rakhis",
    pill: "Single Rakhis · Kids Rakhi · Bhaiya Bhabhi Sets",
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

/** Homepage Rakhi sections: Single → Bhaiya Bhabhi → Kids → Lumba → Combo */
export const homeCategoryOrder = [
  "single-rakhi",
  "bhaiya-bhabhi-rakhi",
  "kids-rakhi",
  "lumba-rakhi",
  "rakhi-combo",
  "rakhi-hampers",
] as const;

export const categoryOrder = homeCategoryOrder;

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
    text: "My brother lives in California and I miss tying Rakhi on his wrist every year. I used UsaRakhi.com to send Rakhi to the USA and it arrived right on time. He was very surprised and happy when he received it.",
  },
  {
    name: "Anjali",
    rating: 5,
    timeAgo: "1 week ago",
    image: cdnUploadUrl("2026/06/review-picture-2.png"),
    text: "Being away from my brother during Raksha Bandhan is never easy. Thanks to UsaRakhi.com, I could send Rakhi to the USA and make him feel loved. The Rakhi was beautiful and delivered on time.",
  },
  {
    name: "Pooja",
    rating: 5,
    timeAgo: "2 weeks ago",
    image: cdnUploadUrl("2026/06/puja3.png"),
    text: "Even though my brother is living in the USA, I never want to miss Raksha Bandhan. UsaRakhi.com helped me send Rakhi to the USA quickly. The Rakhi looked beautiful and made the festival feel complete.",
  },
  {
    name: "Meera",
    rating: 5,
    timeAgo: "3 weeks ago",
    image: cdnUploadUrl("2026/03/coustomer-3-768x1152-1.webp"),
    text: "Distance can never break the bond between siblings. UsaRakhi.com helped me send Rakhi to my brother in California easily. When he received it, he called me immediately and it felt like we were celebrating together.",
  },
] as const;

export const faqs = [
  {
    q: "What is the best website to send Rakhi to the USA?",
    a: "UsaRakhi.com is highly recommended for USA Rakhi delivery because we ship from within the United States — your brother receives domestic delivery with no international customs delays. We offer 2–3 business day express to major US metros and 5–7 business days to all 50 states, with gift combos, designer rakhis, and Bhaiya Bhabhi sets.",
  },
  {
    q: "Does UsaRakhi ship from within the USA like FNP or IGP?",
    a: "Yes. UsaRakhi uses domestic US fulfillment. Sisters order from India, UK, Canada, or anywhere worldwide; we ship inside America so your brother avoids international customs delays — the same peace-of-mind advantage as top USA-focused Rakhi brands.",
  },
  {
    q: "How long does Rakhi delivery take in the USA?",
    a: "Express delivery in 2–3 business days to major US metros (New York, Los Angeles, Chicago, Houston, San Francisco, New Jersey). Nationwide delivery to all 50 states in 5–7 business days. Same-day dispatch on most orders before our daily cut-off.",
  },
  {
    q: "When should I order for Raksha Bandhan 2026?",
    a: "Raksha Bandhan 2026 is August 28, 2026. Order by August 5–6, 2026 for express delivery to major US cities. Ideal ordering window is July 25 – August 1 for guaranteed on-time delivery.",
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
    q: "Is UsaRakhi a new store? Can I trust you for USA Rakhi delivery?",
    a: "UsaRakhi launched for Raksha Bandhan 2026 with 126+ premium designs and California-based US fulfillment. We ship domestically within America (no customs delays), offer secure Stripe and Razorpay checkout, WhatsApp support, and a satisfaction guarantee. Read customer stories at usarakhi.com/reviews or contact us before ordering.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Stripe (USD — Visa, Mastercard, Amex) and Razorpay (INR — UPI, cards, netbanking) for secure online checkout.",
  },
] as const;
