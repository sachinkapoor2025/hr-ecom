export const site = {
  name: "UsaRakhi",
  domain: "usarakhi.com",
  tagline: "Send Rakhi to USA Online With Free Shipping",
  description:
    "Send Rakhi to USA with fast delivery, free shipping on selected orders, and premium Rakhi combos. Trusted by sisters worldwide for Raksha Bandhan.",
  supportEmail: "support@usarakhi.com",
  whatsapp: "+14155552671",
  whatsappUrl: "https://wa.me/14155552671",
  logoSrc: "/logo.png",
  primaryColor: "#183a68",
  accentColor: "#e11d48",
} as const;

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

export const collectionHighlights = [
  { title: "Rakhi Combo", desc: "Premium Rakhis paired with chocolates & gifts", slug: "rakhi-combo" },
  { title: "Single Rakhi", desc: "Beautiful traditional & designer Rakhis", slug: "single-rakhi" },
  { title: "Bhaiya Bhabhi Rakhi", desc: "Elegant sets for brother & sister-in-law", slug: "bhaiya-bhabhi-rakhi" },
  { title: "Kids Rakhi", desc: "Fun cartoon & colorful designs for little brothers", slug: "kids-rakhi" },
  { title: "Lumba Rakhi", desc: "Designer Lumba Rakhis for Bhabhi", slug: "lumba-rakhi" },
] as const;
