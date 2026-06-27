export const site = {
  name: "UsaRakhi",
  domain: "usarakhi.com",
  tagline: "Send Rakhi to USA Online With Free Shipping",
  description:
    "Send Rakhi to USA with fast delivery, free shipping on selected orders, and premium Rakhi combos. Trusted by sisters worldwide for Raksha Bandhan.",
  supportEmail: "support@usarakhi.com",
  phone: "+91 96504 57697",
  /** WhatsApp support — digits only with country code (no +). */
  whatsapp: "919650457697",
  whatsappDisplay: "+91 96504 57697",
  logoSrc: "/logo.png",
  primaryColor: "#183a68",
  navBlue: "#4876e8",
  accentColor: "#e11d48",
} as const;

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Single Rakhi", href: "/categories/single-rakhi", category: "single-rakhi" },
  { label: "Bhaiya Bhabhi Rakhi", href: "/categories/bhaiya-bhabhi-rakhi", category: "bhaiya-bhabhi-rakhi" },
  { label: "Kids Rakhi", href: "/categories/kids-rakhi", category: "kids-rakhi" },
  { label: "Lumba Rakhi", href: "/categories/lumba-rakhi", category: "lumba-rakhi" },
  { label: "Rakhi Combo", href: "/categories/rakhi-combo", category: "rakhi-combo" },
  { label: "Raksha Bandhan", href: "/raksha-bandhan" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
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
    src: "https://usarakhi.com/wp-content/uploads/2026/06/review-picture-2.png",
    alt: "Customer reviews",
  },
  {
    src: "https://usarakhi.com/wp-content/uploads/2026/03/coustomer-3-768x1152-1.webp",
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
] as const;

export const categoryOrder = homeCategoryOrder;

/** Sort API categories to match site display order (home + shop). */
export function orderCategories<T extends { slug: string }>(categories: readonly T[]): T[] {
  const rank = new Map<string, number>(homeCategoryOrder.map((slug, index) => [slug, index]));
  return [...categories].sort((a, b) => (rank.get(a.slug) ?? 99) - (rank.get(b.slug) ?? 99));
}

export function whatsappChatUrl(message = "Hi UsaRakhi, I need help with my order."): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const testimonials = [
  {
    name: "Neha",
    rating: 5,
    timeAgo: "2 days ago",
    image: "https://usarakhi.com/wp-content/uploads/2026/06/Untitled-design-31-1.png",
    text: "My brother lives in California and I miss tying Rakhi on his wrist every year. I used UsaRakhi.com to send Rakhi to the USA and it arrived right on time. He was very surprised and happy when he received it.",
  },
  {
    name: "Anjali",
    rating: 5,
    timeAgo: "1 week ago",
    image: "https://usarakhi.com/wp-content/uploads/2026/06/review-picture-2.png",
    text: "Being away from my brother during Raksha Bandhan is never easy. Thanks to UsaRakhi.com, I could send Rakhi to the USA and make him feel loved. The Rakhi was beautiful and delivered on time.",
  },
  {
    name: "Pooja",
    rating: 5,
    timeAgo: "2 weeks ago",
    image: "https://usarakhi.com/wp-content/uploads/2026/06/puja3.png",
    text: "Even though my brother is living in the USA, I never want to miss Raksha Bandhan. UsaRakhi.com helped me send Rakhi to the USA quickly. The Rakhi looked beautiful and made the festival feel complete.",
  },
  {
    name: "Meera",
    rating: 5,
    timeAgo: "3 weeks ago",
    image: "https://usarakhi.com/wp-content/uploads/2026/03/coustomer-3-768x1152-1.webp",
    text: "Distance can never break the bond between siblings. UsaRakhi.com helped me send Rakhi to my brother in California easily. When he received it, he called me immediately and it felt like we were celebrating together.",
  },
] as const;

export const faqs = [
  {
    q: "How long does Rakhi delivery take in the USA?",
    a: "UsaRakhi delivers Rakhis to all 50 US states in 5–7 business days. Orders placed before the daily cut-off are dispatched the same day.",
  },
  {
    q: "Can I send Rakhi from India to the USA?",
    a: "Yes. We accept orders from India, UK, Canada, Australia, and anywhere worldwide. Enter the US delivery address at checkout and we ship domestically within America.",
  },
  {
    q: "Can I send Rakhi with chocolates to the USA?",
    a: "Yes. We offer Rakhi combos with Ferrero Rocher, Lindt, and Hershey's chocolates — beautifully packed and delivered together.",
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
    q: "When should I order for Raksha Bandhan 2026?",
    a: "Raksha Bandhan 2026 is on August 28, 2026. Order by early August to ensure your brother receives the Rakhi before the festival.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Razorpay (INR) and Stripe (USD) for secure online checkout.",
  },
] as const;
