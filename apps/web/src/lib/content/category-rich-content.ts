/** Rich SEO layout content for category pages (mirrors city page structure). */

import { categoryHref } from "@/lib/category-urls";
import { extractProductStyleLabels, productKeywordsForCategory } from "@/lib/content/seo-data";

export interface CategoryRichContent {
  slug: string;
  headline: string;
  intro: string[];
  delivery: { heading: string; paragraphs: string[] };
  highlights: { heading: string; items: string[] };
  tradition?: { heading: string; paragraphs: string[] };
  whyUs: { heading: string; bullets: string[] };
  howTo: { heading: string; steps: string[] };
  faqs: { q: string; a: string }[];
  relatedCategories: { label: string; href: string; text: string }[];
}

const relatedAll = [
  { slug: "single-rakhi", label: "Single Rakhi", text: "Traditional and designer rakhis with roli chawal." },
  { slug: "rakhi-combo", label: "Rakhi Combo", text: "Rakhi with Ferrero Rocher, Lindt, Hershey's." },
  { slug: "bhaiya-bhabhi-rakhi", label: "Bhaiya Bhabhi Rakhi", text: "Matching sets for brother and Bhabhi." },
  { slug: "kids-rakhi", label: "Kids Rakhi", text: "Cartoon and colorful rakhis for little brothers." },
  { slug: "lumba-rakhi", label: "Lumba Rakhi", text: "Bracelet-style rakhis for sister-in-law." },
].map((c) => ({ ...c, href: categoryHref(c.slug) }));

function relatedExcept(slug: string) {
  return relatedAll.filter((c) => c.slug !== slug);
}

export const categoryRichContent: Record<string, CategoryRichContent> = {
  "single-rakhi": {
    slug: "single-rakhi",
    headline: "Single Rakhi for USA Delivery — Traditional & Designer Rakhis",
    intro: [
      "Our Single Rakhi collection is curated for sisters who want one beautiful rakhi for their brother — whether he lives in California, New York, Texas, or any US state. Each design reflects the purity and love of Raksha Bandhan, crafted with premium threads, beads, and motifs.",
      "Every single rakhi includes complimentary roli (kumkum) and chawal (rice) so your brother can perform the traditional tilak ceremony on festival day — even when you are celebrating from India, the UK, Canada, or across the world.",
      "Order online, enter your brother's US address at checkout, and we deliver domestically within America in 5–7 business days. No international customs delays for your brother's doorstep delivery.",
    ],
    delivery: {
      heading: "Single Rakhi Delivery Across the USA",
      paragraphs: [
        "UsaRakhi ships single rakhis to all 50 US states — home addresses, apartments, offices, and university campuses. Standard delivery is 5–7 business days after dispatch.",
        "Popular destinations include California, New York, New Jersey, Texas, Florida, Illinois, and Washington. Sisters in India order most frequently during July and August ahead of Raksha Bandhan 2026 (August 28).",
      ],
    },
    highlights: {
      heading: "Popular Single Rakhi Styles",
      items: [
        "Om and spiritual rakhis — divine symbols for blessings and protection",
        "Pearl and designer rakhis — elegant choices for adult brothers",
        "Evil eye (Nazar) rakhis — trendy designs with protective symbolism",
        "Traditional multicolor thread rakhis — classic festival favorites",
        "Stone and bead rakhis — premium finishes for a special Raksha Bandhan",
        "Minimalist silk thread rakhis — perfect for brothers who prefer subtle designs",
      ],
    },
    tradition: {
      heading: "Why Single Rakhi Remains a Raksha Bandhan Favorite",
      paragraphs: [
        "The single rakhi is the heart of Raksha Bandhan — one sacred thread tied on your brother's wrist as a promise of love and protection. Whether simple or designer, it carries the same emotional weight as being there in person.",
      ],
    },
    whyUs: {
      heading: "Why Order Single Rakhi from UsaRakhi",
      bullets: [
        "Roli and chawal included on most single rakhis",
        "Domestic USA shipping — order from India worldwide",
        "5–7 business day delivery to all 50 states",
        "Premium packaging ready for the festival",
        "Secure payment in USD or INR",
        "WhatsApp and email order support",
      ],
    },
    howTo: {
      heading: "How to Send a Single Rakhi to Your Brother in the USA",
      steps: [
        "Choose a single rakhi from the collection above.",
        "Add to cart and enter your brother's full US shipping address.",
        "Pay with Stripe (USD) or Razorpay (INR).",
        "We pack with roli chawal and ship within the USA.",
        "Your brother receives his rakhi in 5–7 business days.",
      ],
    },
    faqs: [
      {
        q: "Does every single rakhi include roli and chawal?",
        a: "Most single rakhis in our collection include complimentary roli and chawal for the tilak ceremony. Check the product description for details.",
      },
      {
        q: "Can I send a single rakhi from India to the USA?",
        a: "Yes. Order on UsaRakhi.com from India, enter the US delivery address, and pay in INR via Razorpay. We ship domestically within America.",
      },
      {
        q: "How long does single rakhi delivery take?",
        a: "Typically 5–7 business days after dispatch to any US state.",
      },
      {
        q: "Which single rakhi is best for an adult brother?",
        a: "Pearl, designer, and Om spiritual rakhis are popular for adult brothers. Browse the collection above for current styles.",
      },
    ],
    relatedCategories: relatedExcept("single-rakhi"),
  },
  "kids-rakhi": {
    slug: "kids-rakhi",
    headline: "Kids Rakhi for USA — Fun Designs Your Little Brother Will Love",
    intro: [
      "Kids Rakhi makes Raksha Bandhan extra special for little brothers. Our collection features cartoon characters, bright colors, and soft threads that children love to wear all day — from Chhota Bheem and Mickey Mouse to Doraemon and playful BRO-themed designs.",
      "Each kids rakhi is crafted with child-friendly materials — lightweight threads and safe embellishments suitable for toddlers, school-age boys, and teens who still enjoy festive fun.",
      "Many kids rakhis come with chocolate add-ons (Hershey's, assorted minis) for a sweet surprise. Order from anywhere in the world; we deliver to your brother's US address in 5–7 business days.",
    ],
    delivery: {
      heading: "Kids Rakhi Delivery to All 50 US States",
      paragraphs: [
        "Whether your little brother lives in California, Texas, New York, or any American city, UsaRakhi delivers kids rakhis with the same reliable 5–7 business day domestic shipping.",
        "Parents and sisters in India often order kids rakhis for brothers studying or living with relatives in the USA. Enter the US address at checkout — we handle fulfillment inside America.",
      ],
    },
    highlights: {
      heading: "Best Kids Rakhi for Brothers in the USA",
      items: [
        "Cartoon rakhis — Chhota Bheem, Mickey Mouse, Doraemon, and more",
        "Soft silk and thread rakhis — comfortable for toddlers and young boys",
        "Kids rakhi with chocolates — Hershey's and assorted minis",
        "BRO charm and superhero-style rakhis — trendy for school-age brothers",
        "Bright multicolor rakhis — eye-catching festival favorites",
        "Combo sets — multiple kids rakhis for families with more than one brother",
      ],
    },
    tradition: {
      heading: "Making Raksha Bandhan Memorable for Kids",
      paragraphs: [
        "For young brothers, Raksha Bandhan is about color, excitement, and feeling loved from afar. A fun kids rakhi paired with a video call on festival day helps sisters in India stay connected with little brothers in America.",
      ],
    },
    whyUs: {
      heading: "Why Parents & Sisters Choose UsaRakhi for Kids Rakhi",
      bullets: [
        "Child-safe materials and lightweight designs",
        "Cartoon and character rakhis kids actually want to wear",
        "Optional chocolate add-ons for extra joy",
        "Fast USA delivery in 5–7 business days",
        "Order from India with INR payment",
        "Gift-ready packaging for Raksha Bandhan",
      ],
    },
    howTo: {
      heading: "Tips for Ordering Kids Rakhi to the USA",
      steps: [
        "Pick an age-appropriate design — bold cartoons for toddlers, subtler styles for teens.",
        "Order 10–14 days before Raksha Bandhan 2026 (August 28) for stress-free delivery.",
        "Enter the correct US address including apartment or unit number.",
        "Consider a kids rakhi with chocolates for an extra surprise.",
        "Schedule a video call on festival day so your little brother can show off his rakhi.",
      ],
    },
    faqs: [
      {
        q: "Are kids rakhis safe for toddlers?",
        a: "Our kids rakhis use child-friendly materials and lightweight threads. Always supervise very young children during the tying ceremony.",
      },
      {
        q: "Can I send kids rakhi with chocolates to the USA?",
        a: "Yes. Browse our Kids Rakhi collection for designs bundled with Hershey's or assorted chocolates.",
      },
      {
        q: "How early should I order kids rakhi for Raksha Bandhan?",
        a: "We recommend ordering 10–14 days before August 28, 2026 for on-time delivery across all US states.",
      },
      {
        q: "Do you deliver kids rakhi from India to America?",
        a: "Yes. Sisters in India order on UsaRakhi.com, enter the US address, and we ship domestically within the USA.",
      },
    ],
    relatedCategories: relatedExcept("kids-rakhi"),
  },
  "lumba-rakhi": {
    slug: "lumba-rakhi",
    headline: "Premium Lumba Rakhi for Bhabhi — USA Delivery",
    intro: [
      "Lumba Rakhi is tied on your Bhabhi's bangle during Raksha Bandhan — a beautiful extension of the festival bond. Our Lumba Rakhi collection features designer pearl, floral, peach, and gold styles crafted for sisters-in-law across America.",
      "Each Lumba Rakhi ships with complimentary roli and chawal when included in the product listing, so your Bhabhi can join the tilak ceremony even when you order from India, the UK, or Canada.",
      "Enter your Bhabhi's US address at checkout and we deliver domestically within 5–7 business days to California, New York, Texas, New Jersey, and all 50 states.",
    ],
    delivery: {
      heading: "Lumba Rakhi Delivery Across the USA",
      paragraphs: [
        "UsaRakhi ships Lumba Rakhis to home addresses, apartments, and offices in every US state with reliable domestic carriers.",
        "Sisters in India order most frequently in July and August ahead of Raksha Bandhan 2026 (August 28). Order early for stress-free delivery.",
      ],
    },
    highlights: {
      heading: "Popular Lumba Rakhi Styles",
      items: [
        "Pink pearl and floral Lumba rakhis",
        "Peach designer Lumba rakhis with gold accents",
        "Lumba rakhis with Lindor or Hershey's chocolates",
        "Premium stone and bead Lumba designs",
        "Matching Bhaiya Bhabhi sets with coordinated Lumba",
      ],
    },
    whyUs: {
      heading: "Why Order Lumba Rakhi from UsaRakhi",
      bullets: [
        "Domestic USA shipping from sisters worldwide",
        "Designer Lumba styles updated every season",
        "Roli chawal on eligible listings",
        "Secure Stripe and Razorpay checkout",
        "WhatsApp and email order support",
      ],
    },
    howTo: {
      heading: "How to Send Lumba Rakhi to Your Bhabhi in the USA",
      steps: [
        "Pick a Lumba Rakhi from the collection above.",
        "Add to cart and enter the US shipping address.",
        "Pay in USD or INR.",
        "We gift-pack and ship within America.",
        "Your Bhabhi receives her Lumba in 5–7 business days.",
      ],
    },
    faqs: [
      {
        q: "What is a Lumba Rakhi?",
        a: "A Lumba Rakhi is a decorative bracelet-style rakhi tied on the sister-in-law's bangle during Raksha Bandhan.",
      },
      {
        q: "Can I send Lumba Rakhi from India to the USA?",
        a: "Yes. Order on UsaRakhi.com, enter the US address, and pay in INR via Razorpay. We fulfill domestically in America.",
      },
      {
        q: "Do Lumba rakhis include roli and chawal?",
        a: "Most listings include complimentary roli and chawal. Check each product page for details.",
      },
    ],
    relatedCategories: relatedExcept("lumba-rakhi"),
  },
  "bhaiya-bhabhi-rakhi": {
    slug: "bhaiya-bhabhi-rakhi",
    headline: "Bhaiya Bhabhi Rakhi Sets — Brother & Sister-in-Law USA Delivery",
    intro: [
      "Bhaiya Bhabhi Rakhi sets include a traditional rakhi for your brother and a matching Lumba for your Bhabhi — coordinated colors, premium threads, and festival-ready packaging.",
      "When your brother and Bhabhi live in the United States, one order from UsaRakhi delivers both rakhis domestically in 5–7 business days — no international customs delays.",
      "Many sets include chocolates (Ferrero Rocher, Lindt, Hershey's) and roli chawal for the complete Raksha Bandhan ceremony.",
    ],
    delivery: {
      heading: "Bhaiya Bhabhi Rakhi Delivery to All 50 States",
      paragraphs: [
        "We deliver matching Bhaiya Bhabhi sets to California, New York, Texas, Florida, Illinois, and every other US state.",
        "Sisters in India, the UK, and Canada order online and enter the American delivery address at checkout.",
      ],
    },
    highlights: {
      heading: "What's in Our Bhaiya Bhabhi Sets",
      items: [
        "Coordinated brother + Bhabhi rakhi pairs",
        "Peach, pink, and gold designer matching sets",
        "Sets with premium chocolates",
        "Complete sets with roli chawal",
        "Premium pearl and stone designs",
      ],
    },
    whyUs: {
      heading: "Why Sisters Choose UsaRakhi for Bhaiya Bhabhi Sets",
      bullets: [
        "One order covers both Bhaiya and Bhabhi",
        "Domestic USA fulfillment",
        "Gift-ready Raksha Bandhan packaging",
        "Pay in USD or INR from anywhere",
        "Fast 5–7 business day delivery",
      ],
    },
    howTo: {
      heading: "How to Order Bhaiya Bhabhi Rakhi to the USA",
      steps: [
        "Choose a matching set from the products above.",
        "Confirm both rakhis in the product photos and description.",
        "Enter the US delivery address at checkout.",
        "Pay securely and track your order by email.",
        "Your brother and Bhabhi receive the set before Raksha Bandhan.",
      ],
    },
    faqs: [
      {
        q: "What is included in a Bhaiya Bhabhi Rakhi set?",
        a: "Typically one rakhi for your brother and one Lumba-style rakhi for your Bhabhi, often in matching designs.",
      },
      {
        q: "Can I send Bhaiya Bhabhi Rakhi from India?",
        a: "Yes. Enter the US address at checkout and pay in INR. We ship domestically within the USA.",
      },
      {
        q: "When should I order for Raksha Bandhan 2026?",
        a: "Order by early August 2026 for delivery before August 28.",
      },
    ],
    relatedCategories: relatedExcept("bhaiya-bhabhi-rakhi"),
  },
  "rakhi-combo": {
    slug: "rakhi-combo",
    headline: "Rakhi with Chocolates & Gift Combos — USA Delivery",
    intro: [
      "Rakhi Combo sets pair beautiful rakhis with Ferrero Rocher, Lindt Lindor, Hershey's, or assorted sweets — perfect when you want one complete Raksha Bandhan gift.",
      "Combos are ideal for sisters sending from India to brothers in America: one package, one delivery, festival-ready presentation.",
      "Browse multi-rakhi sets, chocolate pairings, and premium gift boxes — all delivered domestically across the USA in 5–7 business days.",
    ],
    delivery: {
      heading: "Rakhi Combo Delivery Across America",
      paragraphs: [
        "UsaRakhi ships combo sets to all 50 US states with domestic carriers and tracking.",
        "Order from anywhere worldwide; enter your brother's US address and we handle fulfillment inside America.",
      ],
    },
    highlights: {
      heading: "Popular Rakhi Combo Types",
      items: [
        "Rakhi with Ferrero Rocher gold chocolates",
        "Rakhi with Lindt Lindor truffles",
        "Rakhi with Hershey's minis",
        "Multi-rakhi family combo sets",
        "Rakhi with roli chawal and sweets",
      ],
    },
    whyUs: {
      heading: "Why Order Rakhi Combos from UsaRakhi",
      bullets: [
        "Complete gift in one box",
        "Better value than separate rakhi + chocolate orders",
        "Domestic USA shipping — no customs for your brother",
        "Premium festival packaging",
        "Secure online checkout",
      ],
    },
    howTo: {
      heading: "How to Send a Rakhi Combo to the USA",
      steps: [
        "Select a combo from the product grid above.",
        "Add to cart and enter the US shipping address.",
        "Pay with Stripe (USD) or Razorpay (INR).",
        "We pack the rakhi and chocolates together.",
        "Delivery in 5–7 business days to any US state.",
      ],
    },
    faqs: [
      {
        q: "What chocolates come with Rakhi combos?",
        a: "We offer Ferrero Rocher, Lindt Lindor, Hershey's, and assorted minis depending on the product.",
      },
      {
        q: "Can I send Rakhi with chocolates from India to USA?",
        a: "Yes. Order on UsaRakhi.com with the US delivery address. We ship domestically within America.",
      },
      {
        q: "Are combo sets good for multiple brothers?",
        a: "Yes. Browse multi-rakhi combo sets designed for families with more than one brother.",
      },
    ],
    relatedCategories: relatedExcept("rakhi-combo"),
  },
};

function enrichWithProductKeywords(base: CategoryRichContent, slug: string): CategoryRichContent {
  const keywords = productKeywordsForCategory(slug);
  if (keywords.length === 0) return base;

  const styles = extractProductStyleLabels(keywords);
  if (styles.length === 0) return base;

  const styleList = styles.slice(0, 8).join(", ").toLowerCase();
  const sampleKw = keywords.find((k) => /designer|silver|kundan|combo|cartoon|lumba/i.test(k)) ?? keywords[0];

  return {
    ...base,
    intro: [
      ...base.intro,
      `Looking to buy rakhi online USA or order specialty styles? This collection covers ${styleList} — popular searches include "${sampleKw}" and similar phrases sisters use when sending rakhi to USA from India.`,
    ],
    highlights: {
      ...base.highlights,
      items: [
        ...base.highlights.items,
        ...styles.slice(0, 10).map((s) => `${s} rakhi — buy online with USA domestic delivery`),
      ],
    },
    faqs: [
      ...base.faqs,
      {
        q: `Can I order ${styles[0]?.toLowerCase() ?? "designer"} rakhis for USA delivery?`,
        a: `Yes. UsaRakhi ships ${styleList} and more domestically across all 50 states. Order from India or worldwide — enter your brother's US address at checkout for reliable rakhi delivery USA.`,
      },
    ],
  };
}

export function getCategoryRichContent(slug: string): CategoryRichContent | undefined {
  const base = categoryRichContent[slug];
  if (!base) return undefined;
  return enrichWithProductKeywords(base, slug);
}
