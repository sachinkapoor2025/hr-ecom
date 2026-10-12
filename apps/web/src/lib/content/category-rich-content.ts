/** Rich SEO layout content for category pages (mirrors city page structure). */

import { categoryHref } from "@/lib/category-urls";

export interface CategoryRichSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  steps?: string[];
  /** Prose shown after the list or steps. */
  closing?: string[];
}

export interface CategoryRichContent {
  slug: string;
  headline: string;
  intro: string[];
  /**
   * Ordered article blocks. When set, these replace delivery / highlights /
   * tradition / whyUs / howTo so the page can follow a specific outline.
   */
  sections?: CategoryRichSection[];
  delivery?: { heading: string; paragraphs: string[] };
  highlights?: {
    heading: string;
    /** Checklist bullets (omit when using paragraphs instead). */
    items: string[];
    /** Prose alternative to keyword-stuffed style lists. */
    paragraphs?: string[];
  };
  tradition?: { heading: string; paragraphs: string[] };
  whyUs?: { heading: string; bullets: string[] };
  howTo?: { heading: string; steps: string[] };
  faqs: { q: string; a: string }[];
  /** Overrides the default FAQ heading. */
  faqHeading?: string;
  relatedCategories: { label: string; href: string; text: string }[];
  /** Overrides the default related-collections heading. */
  relatedHeading?: string;
  support?: { heading: string; body: string; whatsappText: string };
}

const relatedAll = [
  { slug: "single-rakhi", label: "Single Rakhi to USA", text: "Traditional and designer rakhis with roli chawal." },
  { slug: "2-set-rakhi", label: "Set of 2 Rakhis to USA", text: "Two-piece designer rakhi sets for brothers." },
  { slug: "3-set-rakhi", label: "Set of 3 Rakhis to USA", text: "Three-piece rakhi sets for multiple brothers." },
  { slug: "4-set-rakhi", label: "Set of 4 Rakhis to USA", text: "Four-piece rakhi sets for larger families." },
  { slug: "5-set-rakhi", label: "Set of 5 Rakhis to USA", text: "Five-piece designer rakhi mixes from popular singles." },
  { slug: "rakhi-combo", label: "Rakhi Combos to USA", text: "Rakhi with Ferrero Rocher, Lindt, Hershey's." },
  { slug: "rakhi-hampers", label: "Rakhi Hampers to USA", text: "Festive gift boxes with sweets and dry fruits." },
  { slug: "bhaiya-bhabhi-rakhi", label: "Bhaiya Bhabhi Rakhi to USA", text: "Matching sets for brother and Bhabhi." },
  { slug: "kids-rakhi", label: "Kids Rakhi to USA", text: "Cartoon and colorful rakhis for little brothers." },
  { slug: "lumba-rakhi", label: "Lumba Rakhi to USA", text: "Bracelet-style rakhis for sister-in-law." },
].map((c) => ({ ...c, href: categoryHref(c.slug) }));

function relatedExcept(slug: string) {
  return relatedAll.filter((c) => c.slug !== slug);
}

function relatedForSetPage(slug: string) {
  const preferred = [
    "single-rakhi",
    "2-set-rakhi",
    "3-set-rakhi",
    "4-set-rakhi",
    "5-set-rakhi",
    "rakhi-combo",
    "rakhi-hampers",
    "bhaiya-bhabhi-rakhi",
    "kids-rakhi",
  ];
  return preferred
    .filter((s) => s !== slug)
    .map((s) => relatedAll.find((c) => c.slug === s))
    .filter((c): c is (typeof relatedAll)[number] => Boolean(c));
}

export const categoryRichContent: Record<string, CategoryRichContent> = {
  "single-rakhi": {
    slug: "single-rakhi",
    headline: "Single Rakhi for USA Delivery — Traditional & Designer Rakhis",
    intro: [
      "Our Single Rakhi collection is curated for sisters who want one beautiful rakhi for their brother — whether he lives in California, New York, Texas, or any US state. Each design reflects the purity and love of Raksha Bandhan, crafted with premium threads, beads, and motifs.",
      "Every single rakhi includes complimentary roli (kumkum) and chawal (rice) so your brother can perform the traditional tilak ceremony on festival day — even when you are celebrating from India, the UK, Canada, or across the world.",
      "Whether you want to buy designer rakhi online usa or a classic Om thread, browse pearl, evil eye, and stone styles above — each ships domestically across America in 5–7 business days.",
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
      items: [],
      paragraphs: [
        "Beyond the styles above, our single rakhi collection also includes auspicious and handmade designs favored for their simplicity, bracelet-style rakhis that double as everyday jewelry after the festival, kundan and premium finishes for a more formal look, and floral and printed patterns popular with younger brothers. Every style ships domestically across all 50 states in 5–7 business days, whether you're ordering from India, the UK, Canada, or elsewhere.",
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
      items: [],
      paragraphs: [
        "Beyond the cartoon designs above, our kids rakhi collection also includes superhero and character-themed threads, rakhis paired with small toys or chocolates for younger brothers, and simple colorful designs sized comfortably for smaller wrists. Every design ships domestically across all 50 states in 5–7 business days, whether you're ordering from India, the UK, Canada, or elsewhere.",
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
      items: [],
      paragraphs: [
        "Beyond the styles above, our Lumba rakhi collection also includes beaded and floral bracelet-style designs, pieces paired with chocolates for a complete bhabhi gift, and simpler pearl or thread variations for everyday wear after the festival. Every design ships domestically across all 50 states in 5–7 business days, whether you're ordering from India, the UK, Canada, or elsewhere.",
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
      "When your brother and Bhabhi live in the United States, one order from UsaRakhi lets you send rakhi to USA — both rakhis delivered domestically in 5–7 business days with no international customs delays.",
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
      items: [],
      paragraphs: [
        "Beyond the sets above, our Bhaiya Bhabhi collection also includes matching thread and lumba pairs in traditional and contemporary colors, sets with coordinating bangles or bracelets for bhabhi, and simpler duo designs for couples who prefer understated jewelry. Every set ships domestically across all 50 states in 5–7 business days, whether you're ordering from India, the UK, Canada, or elsewhere.",
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
        a: "Raksha Bandhan 2026 is August 28, 2026. Order today for standard USA delivery to avoid the last-minute rush and ensure your Rakhi reaches the USA on time.",
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
      items: [],
      paragraphs: [
        "Beyond the combos above, our Rakhi Combo collection also includes sets paired with Ferrero Rocher, Lindt, or Hershey's chocolates, designer thread and stone rakhis bundled with sweets, and multi-rakhi packs for brothers with more than one sibling to celebrate with. Every combo ships domestically across all 50 states in 5–7 business days, whether you're ordering from India, the UK, Canada, or elsewhere.",
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
  "2-set-rakhi": {
    slug: "2-set-rakhi",
    headline: "Set of 2 Rakhis for USA Delivery — Designer Twin Rakhi Sets",
    intro: [
      "A Set of 2 Rakhis is the perfect choice when you want to send two coordinated designer rakhis in one order — ideal for sisters with two brothers, cousins celebrating together, or anyone who prefers a matching pair rather than a single thread.",
      "Each two-piece set is curated for Raksha Bandhan with premium threads, beads, and motifs so both rakhis feel special. Most listings include complimentary roli and chawal so the tilak ceremony can happen at your brother's US home even when you order from India, the UK, Canada, or elsewhere.",
      "Browse the Set of 2 Rakhis collection above, choose a design your brothers will love, and we deliver domestically across America in 5–7 business days — no international customs delays at the doorstep. Need rakhis for more brothers? Explore our Set of 3 Rakhis and Set of 4 Rakhis packs as well.",
    ],
    delivery: {
      heading: "Set of 2 Rakhis Delivery Across the USA",
      paragraphs: [
        "UsaRakhi ships two-piece rakhi sets to all 50 US states — homes, apartments, offices, and university campuses — with reliable domestic carriers and tracking.",
        "Popular destinations include California, New York, New Jersey, Texas, Florida, Illinois, and Washington. Order in July or early August for Raksha Bandhan 2026 (August 28) so both rakhis arrive before festival day.",
      ],
    },
    highlights: {
      heading: "Why Choose a Set of 2 Rakhis",
      items: [],
      paragraphs: [
        "Two-piece sets save you from placing separate orders when you have two brothers or want a spare matching rakhi. Designs often pair traditional and contemporary styles in one pack — pearl with stone, Om with floral, or coordinated colorways — so both recipients feel equally celebrated. Every Set of 2 Rakhis ships domestically across all 50 states in 5–7 business days.",
      ],
    },
    tradition: {
      heading: "When a Twin Rakhi Set Makes Sense",
      paragraphs: [
        "Families with two brothers often share one Raksha Bandhan video call from India. Sending a Set of 2 Rakhis means both wrists are ready for the ceremony on the same day — one gift box, one delivery, one shared celebration across miles.",
      ],
    },
    whyUs: {
      heading: "Why Order Set of 2 Rakhis from UsaRakhi",
      bullets: [
        "Two coordinated rakhis in one festival-ready pack",
        "Roli and chawal included on most set listings",
        "Domestic USA shipping — order from India worldwide",
        "5–7 business day delivery to all 50 states",
        "Secure checkout in USD or INR",
        "WhatsApp and email order support",
      ],
    },
    howTo: {
      heading: "How to Send a Set of 2 Rakhis to the USA",
      steps: [
        "Choose a two-piece set from the collection above.",
        "Add to cart and enter your brother's full US shipping address.",
        "Pay with Stripe (USD) or Razorpay (INR).",
        "We gift-pack both rakhis and ship within America.",
        "Your brothers receive the set in 5–7 business days.",
      ],
    },
    faqs: [
      {
        q: "What is included in a Set of 2 Rakhis?",
        a: "Each listing includes two designer rakhis in one pack. Most also include complimentary roli and chawal — check the product page for exact contents.",
      },
      {
        q: "Can I send a Set of 2 Rakhis from India to the USA?",
        a: "Yes. Order on UsaRakhi.com from India, enter the US delivery address, and pay in INR via Razorpay. We ship domestically within America.",
      },
      {
        q: "Who should buy a Set of 2 Rakhis?",
        a: "Sisters with two brothers, families sending matching rakhis to cousins, or anyone who wants a coordinated pair instead of ordering singles separately.",
      },
      {
        q: "How long does Set of 2 Rakhis delivery take?",
        a: "Typically 5–7 business days after dispatch to any US state.",
      },
    ],
    relatedCategories: relatedForSetPage("2-set-rakhi"),
  },
  "3-set-rakhi": {
    slug: "3-set-rakhi",
    headline: "Set of 3 Rakhis for USA Delivery — Multi-Brother Rakhi Packs",
    intro: [
      "A Set of 3 Rakhis is designed for sisters who celebrate Raksha Bandhan with three brothers — or who want a generous multi-piece pack that covers brothers of different ages in one beautifully coordinated gift.",
      "Three-piece sets mix traditional, designer, and festive styles so each brother gets a rakhi that feels personal while still belonging to the same collection. Many packs include roli and chawal for the full tilak ritual at the US address.",
      "Order a Set of 3 Rakhis online from India, the UK, Canada, or anywhere worldwide. Enter one US shipping address at checkout and UsaRakhi delivers domestically across America in 5–7 business days. Prefer a smaller or larger pack? See our Set of 2 Rakhis and Set of 4 Rakhis collections.",
    ],
    delivery: {
      heading: "Set of 3 Rakhis Delivery to All 50 US States",
      paragraphs: [
        "Whether your brothers live together in one household or you are shipping to a primary US address for family gathering day, we fulfill three-piece sets with the same reliable domestic shipping used for our full catalog.",
        "Sisters in India order Set of 3 Rakhis most often in July and August ahead of Raksha Bandhan 2026 (August 28). Order early to avoid the last-minute rush.",
      ],
    },
    highlights: {
      heading: "What's Special About a Set of 3 Rakhis",
      items: [],
      paragraphs: [
        "Three-piece packs are a practical middle ground between a twin set and a large family pack — enough variety for older and younger brothers without ordering four or more separately. Look for assortments that balance classic thread designs with pearl, stone, or Om motifs. Every Set of 3 Rakhis ships domestically across all 50 states in 5–7 business days.",
      ],
    },
    tradition: {
      heading: "Celebrating Multiple Brothers from Afar",
      paragraphs: [
        "When three brothers share one home in America, a Set of 3 Rakhis turns a single delivery into a complete family ceremony. Sisters joining on video from India can see each brother tie his rakhi — one order that keeps the whole sibling bond intact across continents.",
      ],
    },
    whyUs: {
      heading: "Why Order Set of 3 Rakhis from UsaRakhi",
      bullets: [
        "Three designer rakhis in one coordinated pack",
        "Ideal for multi-brother households in the USA",
        "Domestic fulfillment — no customs for your brothers",
        "Festival-ready packaging",
        "Pay securely in USD or INR",
        "5–7 business day delivery nationwide",
      ],
    },
    howTo: {
      heading: "How to Send a Set of 3 Rakhis to the USA",
      steps: [
        "Pick a three-piece set from the product grid above.",
        "Confirm all three rakhis in the photos and description.",
        "Enter the US delivery address at checkout.",
        "Pay with Stripe (USD) or Razorpay (INR).",
        "We pack and ship within America for 5–7 day delivery.",
      ],
    },
    faqs: [
      {
        q: "Is a Set of 3 Rakhis good for brothers of different ages?",
        a: "Yes. Many three-piece sets mix classic and contemporary designs so older and younger brothers each get a style they'll enjoy wearing.",
      },
      {
        q: "Can I send a Set of 3 Rakhis from India?",
        a: "Yes. Enter the US address at checkout and pay in INR. We ship domestically within the USA.",
      },
      {
        q: "Do Set of 3 Rakhis include roli and chawal?",
        a: "Most multi-rakhi set listings include complimentary roli and chawal. Check each product page for details.",
      },
      {
        q: "When should I order for Raksha Bandhan 2026?",
        a: "Raksha Bandhan 2026 is August 28, 2026. Order in July or early August for stress-free delivery to any US state.",
      },
    ],
    relatedCategories: relatedForSetPage("3-set-rakhi"),
  },
  "4-set-rakhi": {
    slug: "4-set-rakhi",
    headline: "Set of 4 Rakhis for USA Delivery — Family-Size Rakhi Packs",
    intro: [
      "A Set of 4 Rakhis is built for larger sibling groups and joint-family celebrations — four designer rakhis in one pack so you can honor every brother (or close cousin) without juggling multiple checkouts.",
      "Four-piece sets typically offer the widest style mix in our Rakhi Sets USA collection: traditional threads, pearl accents, spiritual motifs, and festive colorways packed together for gift-ready presentation.",
      "Send a Set of 4 Rakhis to any US address from India or worldwide. UsaRakhi fulfills domestically inside America with 5–7 business day delivery — reliable for Raksha Bandhan when the whole family is waiting for the ceremony. For smaller packs, browse our Set of 2 Rakhis and Set of 3 Rakhis pages.",
    ],
    delivery: {
      heading: "Set of 4 Rakhis Delivery Across America",
      paragraphs: [
        "UsaRakhi ships family-size four-piece sets to all 50 US states with domestic carriers and tracking. One shipping address covers the entire pack.",
        "Plan ahead for Raksha Bandhan 2026 (August 28): larger families often order Set of 4 Rakhis in July so every brother has his rakhi before festival day.",
      ],
    },
    highlights: {
      heading: "Who a Set of 4 Rakhis Is Perfect For",
      items: [],
      paragraphs: [
        "Choose a four-piece set when you have four brothers, when cousins celebrate together under one roof, or when you want extras for guests joining the tilak ceremony. Assorted packs make it easy to match preferences without buying singles à la carte. Every Set of 4 Rakhis ships domestically across all 50 states in 5–7 business days.",
      ],
    },
    tradition: {
      heading: "Keeping Large Sibling Bonds Strong Across Miles",
      paragraphs: [
        "For sisters abroad or in India with a big brother group in the USA, a Set of 4 Rakhis is a single act of love that reaches everyone at once. The shared unboxing and ceremony — even on a video call — become the highlight of Raksha Bandhan for the whole family.",
      ],
    },
    whyUs: {
      heading: "Why Order Set of 4 Rakhis from UsaRakhi",
      bullets: [
        "Four designer rakhis in one family-size pack",
        "Best value for multi-brother celebrations",
        "Domestic USA shipping from sisters worldwide",
        "Premium festive packaging",
        "Secure Stripe and Razorpay checkout",
        "WhatsApp and email support",
      ],
    },
    howTo: {
      heading: "How to Send a Set of 4 Rakhis to the USA",
      steps: [
        "Select a four-piece set from the collection above.",
        "Review the product photos so you know all four designs.",
        "Add to cart and enter the full US shipping address.",
        "Pay securely in USD or INR.",
        "We pack the full set and deliver in 5–7 business days.",
      ],
    },
    faqs: [
      {
        q: "What is included in a Set of 4 Rakhis?",
        a: "Four designer rakhis in one pack. Many listings also include roli and chawal — see each product page for the exact contents.",
      },
      {
        q: "Can I send a Set of 4 Rakhis from India to the USA?",
        a: "Yes. Order on UsaRakhi.com, enter the US delivery address, and pay in INR via Razorpay. We fulfill domestically in America.",
      },
      {
        q: "Is a Set of 4 Rakhis better value than four single rakhis?",
        a: "Usually yes — multi-piece packs are curated as one gift with coordinated packaging and often better per-rakhi value than buying four singles separately.",
      },
      {
        q: "How long does Set of 4 Rakhis delivery take?",
        a: "Typically 5–7 business days after dispatch to any US state.",
      },
    ],
    relatedCategories: relatedForSetPage("4-set-rakhi"),
  },
  "5-set-rakhi": {
    slug: "5-set-rakhi",
    headline: "Set of 5 Rakhis for USA Delivery — Mix-and-Match Mini Collections",
    intro: [
      "A Set of 5 Rakhis is our largest mix from eight popular designer singles — five coordinated rakhis in one pack at a bundle price, while each design still sells on its own page at the regular price.",
      "These five-piece sets are built for larger sibling groups and for sisters who want a ready-made mix instead of picking extras one by one. Complimentary roli and chawal are included so the tilak ceremony can happen at the US address.",
      "Order a Set of 5 Rakhis from India or worldwide. UsaRakhi ships domestically across America in 5–7 business days. Prefer a smaller pack? Browse Set of 2, Set of 3, and Set of 4 Rakhis.",
    ],
    delivery: {
      heading: "Set of 5 Rakhis Delivery Across the USA",
      paragraphs: [
        "UsaRakhi ships five-piece designer mixes to all 50 US states with domestic carriers and tracking.",
        "Plan ahead for Raksha Bandhan so every brother has his rakhi before festival day.",
      ],
    },
    highlights: {
      heading: "Why Choose a Set of 5 Rakhis",
      items: [],
      paragraphs: [
        "Five-piece mixes give you the lowest per-rakhi bundle from our popular singles — $10 for five, versus buying each design on its own product page. Every Set of 5 Rakhis ships domestically across all 50 states in about 6 business days.",
      ],
    },
    whyUs: {
      heading: "Why Order Set of 5 Rakhis from UsaRakhi",
      bullets: [
        "Five designer rakhis mixed from popular singles",
        "Bundle price while standalone pages keep regular prices",
        "Roli and chawal included",
        "Domestic USA shipping",
        "Secure Stripe and Razorpay checkout",
        "WhatsApp and email support",
      ],
    },
    howTo: {
      heading: "How to Send a Set of 5 Rakhis to the USA",
      steps: [
        "Choose a five-piece mix from the collection above.",
        "Review the five designs on the product photos.",
        "Add to cart and enter the full US shipping address.",
        "Pay securely in USD or INR.",
        "We pack the set and deliver in 5–7 business days.",
      ],
    },
    faqs: [
      {
        q: "What is included in a Set of 5 Rakhis?",
        a: "Five designer rakhis mixed from our popular singles, plus complimentary roli and chawal.",
      },
      {
        q: "Can I still buy each rakhi separately?",
        a: "Yes. Each design stays on its own product page at the regular price. The set is the five-piece bundle price.",
      },
      {
        q: "How long does Set of 5 Rakhis delivery take?",
        a: "Typically 5–7 business days after dispatch to any US state.",
      },
    ],
    relatedCategories: relatedForSetPage("5-set-rakhi"),
  },
  "rakhi-hampers": {
    slug: "rakhi-hampers",
    headline: "Rakhi Hamper Gift Boxes — Premium USA Delivery",
    intro: [
      "Our Rakhi Hamper collection brings complete festive gift boxes to brothers across America — designer rakhis paired with kaju katli, besan laddoo, soan papdi, dry fruits, and chocolates. Search “send rakhi gift hamper to USA” or “rakhi with dry fruits” and you will find ready-to-gift boxes with transparent what’s-included lists.",
      "These hampers are curated for sisters who want one beautifully packed gift instead of shopping separately for rakhi and sweets. Ideal for Raksha Bandhan 2026 when you are ordering from India, the UK, Canada, or anywhere worldwide.",
      "Every hamper ships domestically within the USA for reliable 5–7 business day delivery — no international customs delays at your brother's doorstep. Prefer chocolates only? Browse Rakhi Combos; want a simple thread? Start with Single Rakhi or Kids Rakhi.",
    ],
    delivery: {
      heading: "Rakhi Hamper Delivery Across the USA",
      paragraphs: [
        "UsaRakhi fulfills Rakhi hamper gift boxes to all 50 US states with domestic carriers and tracking.",
        "Order early in July–August for Raksha Bandhan so your brother receives his gift box before festival day.",
      ],
    },
    highlights: {
      heading: "What's Inside a Popular Rakhi Hamper",
      items: [],
      paragraphs: [
        "Beyond the boxes above, our Rakhi Hamper collection also includes gift sets with kaju katli, dry fruits, and festive sweets alongside a designer rakhi, larger multi-item boxes for bigger celebrations, and smaller hampers suited for a simpler gift. Every hamper ships domestically across all 50 states in 5–7 business days, whether you're ordering from India, the UK, Canada, or elsewhere.",
      ],
    },
    tradition: {
      heading: "Why a Hamper Makes Raksha Bandhan Special",
      paragraphs: [
        "A rakhi hamper turns the sacred thread into a full celebration — sweets and dry fruits for the family, chocolates for joy, and roli chawal for the tilak ritual, all in one gift.",
      ],
    },
    whyUs: {
      heading: "Why Order a Rakhi Hamper from UsaRakhi",
      bullets: [
        "Complete gift boxes with transparent what's-included lists",
        "Sale pricing with clear compare-at savings",
        "Domestic USA shipping — order from anywhere in the world",
        "Premium festive packaging",
        "Secure checkout in USD or INR",
        "WhatsApp and email support",
      ],
    },
    howTo: {
      heading: "How to Send a Rakhi Hamper to the USA",
      steps: [
        "Choose a hamper from the grid above and review what's included.",
        "Add to cart and enter your brother's full US address.",
        "Pay securely with Stripe (USD) or Razorpay (INR).",
        "We pack the rakhi, sweets, and dry fruits together.",
        "Delivery typically in 5–7 business days across America.",
      ],
    },
    faqs: [
      {
        q: "What is included in a Rakhi hamper?",
        a: "Each product page lists exact contents — typically designer rakhi(s), Indian sweets, dry fruits, and often roli chawal or chocolates.",
      },
      {
        q: "Can I send a Rakhi gift box from India to USA?",
        a: "Yes. Order on UsaRakhi.com with the US delivery address. We ship domestically within America.",
      },
      {
        q: "Are these hampers on sale?",
        a: "Yes. Each Rakhi hamper shows a higher list price and a sale price so you see the savings while we keep premium packaging and USA delivery.",
      },
      {
        q: "Where can I learn more about choosing a Rakhi hamper?",
        a: "Read our guide: Rakhi Hamper Gift Box USA — sweets, dry fruits, and designer rakhi tips at /blog/rakhi-hamper-gift-box-usa.",
      },
    ],
    relatedCategories: relatedExcept("rakhi-hampers"),
  },
  "bhai-dooj": {
    slug: "bhai-dooj",
    headline: "Send Bhai Dooj Gifts to the USA",
    intro: [
      "Celebrate the beautiful bond between brothers and sisters with thoughtful **Bhai Dooj gifts to the USA**. With UsaRakhi, you can **send Bhai Dooj gifts to your brother in the USA**, including traditional Indian sweets, dry fruits, chocolates, and festive pooja gift hampers. Explore our collection of **Bhai Dooj gift boxes delivered across the USA** and choose a special gift to make the occasion memorable.",
    ],
    sections: [
      {
        heading: "How to Send Bhai Dooj Gifts to the USA",
        paragraphs: [
          "Sending **Bhai Dooj gifts to the USA** is simple. Browse our collection of **Bhai Dooj gift hampers**, select your preferred gift box, and enter the recipient's US delivery address at checkout. Standard domestic delivery takes approximately 5 business days. Eligible products shipped to Orange County include free shipping.",
          "Choose from **kaju katli gift boxes, dry fruit hampers, chocolate gift boxes, and Bhai Dooj pooja sets**. Check each product description to confirm the items included in your selected hamper.",
        ],
      },
      {
        heading: "Best Bhai Dooj Gifts for Brothers in the USA",
        paragraphs: [
          "Looking for the perfect **Bhai Dooj gift for your brother in the USA**? Explore traditional Indian sweets, premium dry fruits, chocolates, and festive gift combinations. Our **Bhai Dooj gifts delivered in the USA** help you celebrate this special Indian festival with family, even when you live far apart.",
        ],
      },
    ],
    faqs: [],
    support: {
      heading: "Need help choosing a Bhai Dooj gift?",
      body: "Contact our team for help choosing a Bhai Dooj gift box and confirming US delivery information.",
      whatsappText: "Hi, I need help with Bhai Dooj gifts.",
    },
    relatedCategories: [
      { label: "Diwali Combos", href: categoryHref("diwali"), text: "Festive Diwali gift hampers with sweets, dry fruits, and pooja essentials." },
      { label: "Sweet Combos", href: categoryHref("sweet-combos"), text: "Indian sweet gift hampers featuring kaju katli and besan laddoo." },
      { label: "Dry Fruit Combos", href: categoryHref("dry-fruit-combos"), text: "Almond, pistachio, cashew, and mixed dry fruit gift boxes." },
    ],
  },
  diwali: {
    slug: "diwali",
    headline: "Send Diwali Gifts to the USA",
    intro: [
      "Celebrate the festival of lights with beautiful **Diwali gifts to the USA** from UsaRakhi. Explore festive **Diwali gift hampers** featuring traditional Indian sweets, dry fruits, pooja sets, torans, rangoli, and decorative items. Whether you want to **send Diwali gifts to your family in the USA** or surprise loved ones with a thoughtful festive hamper, choose from a collection of gifts for the special occasion.",
    ],
    sections: [
      {
        heading: "How to Send Diwali Gifts to the USA",
        paragraphs: [
          "Sending **Diwali gifts to the USA** is simple with UsaRakhi. Browse our collection of **Diwali gift hampers**, select your preferred combination of pooja essentials, sweets, or dry fruits, and enter the recipient's US delivery address at checkout. Standard domestic delivery takes approximately 5 business days. Eligible products shipped to Orange County include free shipping.",
        ],
      },
      {
        heading: "Explore Diwali Gift Hampers for Every Celebration",
        paragraphs: [
          "Choose from **Diwali pooja gift sets**, **Indian sweet gift boxes**, and **dry fruit gift hampers** to celebrate Diwali with your loved ones. Each hamper contains the items specified on its product page, so check the included-items list before placing your order.",
        ],
      },
    ],
    faqs: [],
    support: {
      heading: "Need help choosing a Diwali gift?",
      body: "Contact our team for help choosing a Diwali gift hamper and confirming US delivery information.",
      whatsappText: "Hi, I need help with Diwali gifts.",
    },
    relatedCategories: [
      { label: "Bhai Dooj Combos", href: categoryHref("bhai-dooj"), text: "Bhai Dooj gift boxes with sweets, dry fruits, chocolates, and pooja sets." },
      { label: "Sweet Combos", href: categoryHref("sweet-combos"), text: "Indian sweet gift hampers featuring kaju katli and besan laddoo." },
      { label: "Dry Fruit Combos", href: categoryHref("dry-fruit-combos"), text: "Dry fruit gift hampers delivered across the USA." },
    ],
  },
  "sweet-combos": {
    slug: "sweet-combos",
    headline: "Send Sweet Hampers and Gifts to the USA",
    intro: [
      "Celebrate special occasions with traditional Indian sweets from UsaRakhi. Explore our collection of **sweet gift hampers to the USA** featuring kaju katli, besan laddoo, and festive gift combinations. Whether you want to **send sweet hampers to family in the USA** for Diwali or Bhai Dooj, discover thoughtful Indian sweet gifts for your loved ones.",
    ],
    sections: [
      {
        heading: "Send Indian Sweet Hampers to the USA",
        paragraphs: [
          "Looking to **send gifts to the USA** for a special occasion? Choose from our selection of Indian sweet gift boxes featuring traditional mithai paired with festive decorations, pooja essentials, or dry fruits. Our collection includes selected **kaju katli gift hampers** and **besan laddoo gift boxes** for Diwali and Bhai Dooj celebrations.",
          "Each hamper contains the items listed on its product page. Check the complete included-items list before placing your order to ensure you select the right **sweet gift hamper**.",
        ],
      },
      {
        heading: "Sweet Hampers for Diwali and Bhai Dooj",
        paragraphs: [
          "Explore festive **Indian sweet hampers delivered across the USA** and choose a combination that suits your family and friends.",
        ],
        items: [
          "**Kaju Katli Gift Hampers:** Selected boxes featuring kaju katli with kumkum, cashews, or Ferrero Rocher.",
          "**Besan Laddoo Gift Boxes:** Festive combinations featuring besan laddoo with a Diwali toran, rangoli, or metal pooja set.",
          "**Bhai Dooj Sweet Hampers:** Selected gift boxes featuring traditional Indian sweets and festive essentials.",
        ],
      },
      {
        heading: "Domestic Delivery for Sweet Gift Hampers",
        paragraphs: [
          "When you **send sweet hampers to the USA** through UsaRakhi, your order is fulfilled domestically within the United States. Standard delivery takes approximately 5 business days. Eligible products shipped to Orange County include free shipping. Check the applicable shipping policy for other destinations and mixed-vendor orders.",
        ],
      },
      {
        heading: "How to Send Sweet Gifts to the USA",
        steps: [
          "Browse our collection of **Indian sweet gift hampers**.",
          "Select a hamper featuring kaju katli or besan laddoo.",
          "Review the product details and included items.",
          "Enter the recipient's US delivery address at checkout.",
          "Complete your order and check the applicable delivery details.",
        ],
      },
    ],
    faqs: [],
    support: {
      heading: "Need Help Choosing a Sweet Gift Hamper?",
      body: "Find thoughtful **Indian sweet gifts to send to the USA** for Diwali, Bhai Dooj, and other special occasions. Contact our team on WhatsApp for help selecting a hamper and confirming delivery information.",
      whatsappText: "Hi, I need help choosing a sweet gift hamper.",
    },
    relatedCategories: [
      { label: "Dry Fruit Combos", href: categoryHref("dry-fruit-combos"), text: "Dry fruit gift hampers with almonds, pistachios, cashews, and mixed nuts." },
      { label: "Diwali Combos", href: categoryHref("diwali"), text: "Diwali gift hampers with pooja essentials, sweets, and dry fruits." },
      { label: "Bhai Dooj Combos", href: categoryHref("bhai-dooj"), text: "Bhai Dooj gifts delivered across the USA for brothers and sisters." },
    ],
  },
  "dry-fruit-combos": {
    slug: "dry-fruit-combos",
    headline: "Send Dry Fruit Gifts to the USA",
    intro: [
      "Looking to **send dry fruit gifts to the USA** for Diwali, Bhai Dooj, or another special occasion? Explore UsaRakhi's collection of **dry fruit gift hampers** featuring almonds, pistachios, cashews, mixed nuts, and assorted dry fruits. Choose from individual nut boxes and festive gift combinations that pair dry fruits with traditional Indian sweets, chocolates, or pooja essentials.",
      "Whether you want to **send gifts to the USA** for family or friends, our **dry fruit gift boxes** offer thoughtful options for festive celebrations and special moments.",
    ],
    sections: [
      {
        heading: "Explore Dry Fruit Gift Combos",
        paragraphs: [
          "Our **dry fruit combos for USA delivery** include a variety of nut selections and festive combinations. Some hampers contain only nuts, such as pistachio gift boxes and mixed nut boxes. Others combine dry fruits with sweets, chocolates, or pooja items, including kaju katli with cashews and a Diwali metal pooja set with kaju katli and pistachios.",
          "Selected Bhai Dooj mixed dry fruit gift boxes are available in **266 g and 131 g** options, as stated in their product names. Other dry fruit listings may not specify a weight in the title, so check the product details before ordering.",
        ],
      },
      {
        heading: "Dry Fruit Gift Delivery in the USA",
        paragraphs: [
          "When you **send dry fruit hampers to the USA** through UsaRakhi, your order is fulfilled domestically within the United States. Standard delivery takes approximately **5 business days**, and eligible products shipped to Orange County include free shipping. Check the applicable shipping policy for other destinations and mixed-vendor orders.",
        ],
      },
      {
        heading: "Dry Fruit Gift Boxes Available in Our Collection",
        paragraphs: ["Discover different **dry fruit gift boxes delivered across the USA**, including:"],
        items: [
          "**Almonds and Pistachios:** Festive nut combinations featuring almonds and pistachios.",
          "**Pistachio Gift Boxes:** Gift boxes featuring pistachios as the main product.",
          "**Mixed Nut Gift Hampers:** Combinations of mixed nuts and dry fruits.",
          "**Sweet and Dry Fruit Combos:** Selected hampers featuring kaju katli with cashews.",
          "**Chocolate and Dry Fruit Gifts:** Selected combinations featuring Ferrero Rocher with almonds.",
          "**Bhai Dooj Dry Fruit Hampers:** Mixed dry fruit boxes available in the listed 266 g and 131 g options.",
        ],
        closing: [
          "Each product contains the items specified on its product page. Review the included-items list to confirm whether your selected hamper also contains sweets, chocolates, or pooja essentials.",
        ],
      },
      {
        heading: "How to Choose the Right Dry Fruit Gift Hamper",
        paragraphs: [
          "Looking for the right **dry fruit gift hamper for family in the USA**? Follow these simple tips:",
        ],
        items: [
          "Choose the nut variety named in the product title.",
          "Select the 266 g or 131 g mixed dry fruit box if you prefer one of those listed sizes.",
          "Check whether the hamper includes additional sweets, chocolates, or pooja items.",
          "Review the product details and shipping charges before checkout.",
        ],
      },
      {
        heading: "How to Send Dry Fruit Gifts to the USA",
        paragraphs: ["Ordering **dry fruit gift hampers online** is simple with UsaRakhi."],
        steps: [
          "Browse the dry fruit gift collection.",
          "Select your preferred nut variety or mixed dry fruit hamper.",
          "Check the product description and included items.",
          "Enter the recipient's US delivery address at checkout.",
          "Complete your payment and review the delivery details.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are all dry fruit gift boxes the same?",
        a: "No. The collection includes different listings featuring almonds, pistachios, cashews, mixed nuts, and assorted dry fruits. Check the product name and included-items list to confirm the exact combination.",
      },
      {
        q: "Do all dry fruit gift boxes include a stated weight?",
        a: "No. The two mixed dry fruit boxes with weights specified in their names are 266 g and 131 g. Other listings may not state a weight in the product title.",
      },
      {
        q: "Can I send dry fruit gifts to family in the USA?",
        a: "Yes. Select a dry fruit gift hamper, enter a valid US delivery address at checkout, and complete your order online.",
      },
    ],
    faqHeading: "Frequently Asked Questions About Dry Fruit Gift Hampers",
    relatedHeading: "Explore More Gift Collections",
    support: {
      heading: "Need Help Choosing Dry Fruit Combos?",
      body: "Looking to **send dry fruit hampers to the USA** for a festive occasion? Contact our team for help choosing a suitable gift box and confirming delivery information.",
      whatsappText: "Hi, I need help with dry fruit combos.",
    },
    relatedCategories: [
      {
        label: "Sweet Combos",
        href: categoryHref("sweet-combos"),
        text: "Explore Indian sweet gift hampers featuring kaju katli, besan laddoo, and selected festive combinations.",
      },
      {
        label: "Chocolate Combos",
        href: categoryHref("chocolate-combos"),
        text: "Discover selected chocolate gift hampers featuring named chocolate brands and festive combinations.",
      },
      {
        label: "Bhai Dooj Combos",
        href: categoryHref("bhai-dooj"),
        text: "Browse the full collection of Bhai Dooj gifts delivered across the USA, including dry fruit boxes, sweets, chocolates, and pooja gift sets.",
      },
    ],
  },
  "chocolate-combos": {
    slug: "chocolate-combos",
    headline: "Festive boxes that name a chocolate",
    intro: [
      "Chocolate combos are Diwali and Bhai Dooj hampers whose included list names a chocolate. In this catalog those names are Ferrero Rocher, M&M’s, and Skittles. A box is here because of that chocolate, not because every hamper on the site contains one.",
      "Read the rest of the name before you assume the box is only chocolate. Examples include kaju katli with Ferrero Rocher, Ferrero with almonds and kumkum, M&M’s with Ferrero Rocher, Skittles with mixed nuts, a Diwali pooja set with Ferrero and almonds, and an M&M’s and markers gift for a child.",
    ],
    delivery: {
      heading: "Shipping for chocolate hampers",
      paragraphs: [
        "These boxes ship inside the United States. Orange County products include free shipping, and standard delivery is 5 business days. The brand on the product title is the chocolate that is packed.",
      ],
    },
    highlights: {
      heading: "Chocolate pairings in the catalog",
      items: [
        "Ferrero Rocher with kaju katli, with almonds, or with a Diwali pooja set",
        "M&M’s alone, with Ferrero Rocher, or with markers",
        "Skittles alone, with mixed nuts, or with M&M’s",
      ],
    },
    whyUs: {
      heading: "Compare chocolates by the title",
      bullets: [
        "Ferrero Rocher when you want a wrapped chocolate beside an Indian sweet or nuts",
        "M&M’s or Skittles when the listing says so, including the kids markers gift",
        "Another page if the hamper does not name a chocolate at all",
      ],
    },
    howTo: {
      heading: "How to shop chocolate combos",
      steps: [
        "Choose the brand written on the card.",
        "Open the product to see whether nuts, sweets, kumkum, or a pooja item are included.",
        "Place the order for a US address.",
      ],
    },
    faqs: [
      {
        q: "Do you pack Ferrero Rocher, M&M’s, and Skittles in every combo?",
        a: "No. Each box includes only the chocolate named on that product.",
      },
      {
        q: "Is the M&M’s and markers box a chocolate hamper?",
        a: "It is listed here because it includes M&M’s. The markers are part of that same product, as the name says.",
      },
    ],
    relatedCategories: [
      { label: "Sweet combos", href: categoryHref("sweet-combos"), text: "Kaju katli and besan laddoo hampers." },
      { label: "Dry fruit combos", href: categoryHref("dry-fruit-combos"), text: "Almond, pistachio, cashew, and mixed nut boxes." },
      { label: "Bhai Dooj combos", href: categoryHref("bhai-dooj"), text: "Brother gift boxes, including the chocolate ones." },
    ],
  },
  "pooja-sets": {
    slug: "pooja-sets",
    headline: "Pooja hampers for Diwali and Bhai Dooj",
    intro: [
      "Pooja sets are hampers that include a puja or decor piece: kumkum, a puja thali, a metal pooja set, a toran, rangoli, or Shubh Labh. The page is a filter across both festivals. A Bhai Dooj kumkum box and a Diwali metal pooja set can both appear here.",
      "The puja item is packed with whatever else that product names — kaju katli, besan laddoo, pistachios, cashews, almonds, or Ferrero Rocher. A nut box with no kumkum and no thali is not a pooja set.",
    ],
    delivery: {
      heading: "Delivery for pooja hampers",
      paragraphs: [
        "Ship to a United States address. The parcel is sent domestically. Orange County products include free shipping, and standard delivery is 5 business days.",
      ],
    },
    highlights: {
      heading: "Pooja pieces named on the products",
      items: [
        "Kumkum with kaju katli, almonds, or Ferrero Rocher on Bhai Dooj boxes",
        "A puja thali with pistachios, and pooja sets with kaju katli and cashews or with besan laddoo",
        "Diwali metal pooja sets, plus toran, rangoli, and Shubh Labh hampers",
      ],
    },
    whyUs: {
      heading: "Pick the puja item first",
      bullets: [
        "Kumkum when the Bhai Dooj tilak is the point of the gift",
        "A metal pooja set or thali when the box should hold a puja piece",
        "Toran, rangoli, or Shubh Labh when the gift is for decorating at Diwali",
      ],
    },
    howTo: {
      heading: "How to order a pooja hamper",
      steps: [
        "Choose the listing whose name includes the puja item you want.",
        "Read what is packed with it — sweet, nuts, or chocolate.",
        "Check out for a US address. Orange County items ship free.",
      ],
    },
    faqs: [
      {
        q: "Does every pooja set include a metal thali?",
        a: "No. Some listings are kumkum boxes. Metal pooja sets and a puja thali are separate products, named that way.",
      },
      {
        q: "Are toran and rangoli on this page?",
        a: "Yes, when they are part of a Diwali hamper. Those hampers are also on the Diwali page.",
      },
    ],
    relatedCategories: [
      { label: "Diwali combos", href: categoryHref("diwali"), text: "The Diwali pooja and decor hampers." },
      { label: "Bhai Dooj combos", href: categoryHref("bhai-dooj"), text: "Bhai Dooj boxes, including kumkum gifts." },
      { label: "Sweet combos", href: categoryHref("sweet-combos"), text: "Hampers that include kaju katli or laddoo." },
    ],
  },
};

/**
 * Formerly appended keyword-stuffed highlight lines
 * ("{style} rakhi — buy online with USA domestic delivery"). Removed — category
 * copy is maintained explicitly in categoryRichContent / styles paragraphs.
 */
export function getCategoryRichContent(slug: string): CategoryRichContent | undefined {
  return categoryRichContent[slug];
}
