export const site = {
  name: "UsaRakhi",
  domain: "usarakhi.com",
  tagline: "Send Rakhi to USA Online With Free Shipping",
  description:
    "Send Rakhi to USA with fast delivery, free shipping on selected orders, and premium Rakhi combos. Trusted by sisters worldwide for Raksha Bandhan.",
  supportEmail: "support@usarakhi.com",
  phone: "+1 (555) 123-4567",
  logoSrc: "/logo.png",
  primaryColor: "#183a68",
  navBlue: "#4876e8",
  accentColor: "#e11d48",
} as const;

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Single Rakhi", href: "/products?category=single-rakhi", category: "single-rakhi" },
  { label: "Rakhi Combo", href: "/products?category=rakhi-combo", category: "rakhi-combo" },
  { label: "Kids Rakhi", href: "/products?category=kids-rakhi", category: "kids-rakhi" },
  { label: "Bhaiya Bhabhi Rakhi", href: "/products?category=bhaiya-bhabhi-rakhi", category: "bhaiya-bhabhi-rakhi" },
  { label: "Lumba Rakhi", href: "/products?category=lumba-rakhi", category: "lumba-rakhi" },
  { label: "Blogs", href: "/blog" },
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
    src: "https://usarakhi.com/wp-content/uploads/2026/03/border-banner-2-1.webp",
    alt: "Send Rakhi to USA — Raksha Bandhan",
    href: "/products?category=rakhi-combo",
  },
  {
    src: "https://usarakhi.com/wp-content/uploads/2026/06/Untitled-design-31-1.png",
    alt: "Premium Rakhi collection",
    href: "/products",
  },
  {
    src: "https://usarakhi.com/wp-content/uploads/2026/06/puja3.png",
    alt: "Rakhi with Roli Chawal",
    href: "/products?category=single-rakhi",
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

export const categoryOrder = [
  "rakhi-combo",
  "single-rakhi",
  "bhaiya-bhabhi-rakhi",
  "kids-rakhi",
  "lumba-rakhi",
] as const;

export const testimonials = [
  {
    name: "Neha",
    rating: 4,
    text: "My brother lives in California and I miss tying Rakhi on his wrist every year. UsaRakhi helped me send Rakhi to the USA and it arrived right on time.",
  },
  {
    name: "Anjali",
    rating: 4,
    text: "Being away from my brother during Raksha Bandhan is never easy. The Rakhi was beautiful and delivered on time.",
  },
  {
    name: "Pooja",
    rating: 3,
    text: "UsaRakhi.com helped me send Rakhi to the USA quickly. The Rakhi looked beautiful and made the festival feel complete.",
  },
  {
    name: "Meera",
    rating: 4,
    text: "When my brother in California received it, he called me immediately — it felt like we were celebrating together.",
  },
] as const;

export const faqs = [
  {
    q: "How long does Rakhi delivery take in the USA?",
    a: "UsaRakhi delivers Rakhis to all 50 US states in 5–7 business days. Orders placed before the daily cut-off are dispatched the same day.",
  },
  {
    q: "Can I send Rakhi from India to the USA?",
    a: "Yes. We accept orders from India, UK, Canada, Australia, and anywhere worldwide. Enter the US delivery address at checkout.",
  },
  {
    q: "Can I send Rakhi with chocolates to the USA?",
    a: "Yes. We offer Rakhi combos with Ferrero Rocher, Lindt, and Hershey's chocolates — beautifully packed and delivered together.",
  },
  {
    q: "Do you offer Bhaiya Bhabhi Rakhi sets?",
    a: "Yes. Our Bhaiya Bhabhi collection features elegant matching sets for brothers and sisters-in-law.",
  },
] as const;
