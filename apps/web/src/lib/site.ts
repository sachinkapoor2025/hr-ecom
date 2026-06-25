export const site = {
  name: "UsaRakhi",
  domain: "usarakhi.com",
  tagline: "Send Rakhi to USA Online With Free Shipping",
  description:
    "Send Rakhi to USA with fast delivery, free shipping on selected orders, and premium Rakhi combos. Trusted by sisters worldwide for Raksha Bandhan.",
  supportEmail: "support@usarakhi.com",
  phone: "+1 (555) 123-4567",
  logoSrc: "https://usarakhi.com/wp-content/uploads/2026/02/transparent-logo-1.png",
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
    src: "/banners/banner-1-usa-rakhi-delivery.png",
    alt: "USA Rakhi Delivery — Send Beautiful Rakhis to Your Loved Ones in the USA",
    href: "/products?category=rakhi-combo",
  },
  {
    src: "/banners/banner-2-connecting-hearts.png",
    alt: "UsaRakhi.com — Connecting hearts across miles",
    href: "/products",
  },
  {
    src: "/banners/banner-3-india-usa.png",
    alt: "Send Rakhi from India to USA — Premium Rakhis with Express Shipping",
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
