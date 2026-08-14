/** Dedicated country landing pages (UK / Canada) — separate from US city `/send-rakhi-to-*` pages. */

export type CountryRakhiPageId = "uk" | "canada";

export type CountryGuideSection = {
  heading: string;
  paragraphs: string[];
  /** Optional H3 blocks under this H2 */
  subSections?: { heading: string; paragraphs: string[] }[];
};

export type CountryRakhiPage = {
  id: CountryRakhiPageId;
  /** Public path without trailing slash (canonical). */
  path: string;
  menuLabel: string;
  /** H1 */
  heading: string;
  /** Browser / SERP title (absoluteTitle). */
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  eyebrow: string;
  intro: string[];
  highlights: string[];
  howToHeading: string;
  howToSteps: string[];
  productSectionHeading: string;
  productSectionIntro: string;
  faqs: { q: string; a: string }[];
  whatsappPrefill: string;
  localeHints: Record<string, string>;
  /**
   * Additional SEO guide blocks (appended on-page; does not replace existing intro/how-to/FAQs).
   */
  addedGuideSections: CountryGuideSection[];
  /** Primary shop CTA label for the country landing (e.g. Shop Rakhi for UK). */
  shopCtaLabel: string;
};

export const countryRakhiPages: Record<CountryRakhiPageId, CountryRakhiPage> = {
  uk: {
    id: "uk",
    path: "/rakhi-from-uk",
    menuLabel: "Rakhi from UK",
    heading: "Rakhi from UK — Send Rakhi Gifts to Loved Ones",
    metaTitle: "Rakhi from UK | Send Rakhi to UK | Rakhi Delivery to UK | UsaRakhi",
    metaDescription:
      "Shop Rakhi from UK on UsaRakhi. Send Rakhi to UK or arrange Rakhi Delivery to UK for Raksha Bandhan — premium rakhis, combos & hampers with secure checkout.",
    keywords:
      "Rakhi from UK, Rakhi Delivery to UK, Send Rakhi to UK, send rakhi from india to uk, rakhi gifts uk, raksha bandhan uk, Rakhi from India to UK, Rakhi delivery UK, Raksha Bandhan gifts UK, Indian Rakhi delivery UK, Rakhi gifts for brother in UK",
    eyebrow: "United Kingdom · Raksha Bandhan gifts",
    intro: [
      "Looking for Rakhi from UK options for Raksha Bandhan? UsaRakhi makes it simple to browse premium rakhis, combos, and hampers online — whether you are arranging a gift from India for someone you love, or you need a clear path to Send Rakhi to UK with thoughtful packaging.",
      "Celebrate the sibling bond across miles with curated Rakhi Delivery to UK–ready gift ideas: Single Rakhi, Bhaiya Bhabhi sets, Kids Rakhi, Lumba Rakhi, chocolate combos, and festive hampers. Choose a design, add a note, and shop with secure USD or INR checkout.",
    ],
    highlights: [
      "Dedicated Rakhi from UK landing with curated catalog picks",
      "Send Rakhi to UK gift ideas — threads, combos & hampers",
      "Rakhi Delivery to UK messaging with clear shop CTAs",
      "Pay securely in USD (Stripe) or INR / UPI (Razorpay)",
      "Roli & chawal included on most rakhis for the tilak ritual",
      "WhatsApp support if you need help choosing a gift",
    ],
    howToHeading: "How to send Rakhi gifts for the UK",
    howToSteps: [
      "Browse the Rakhi from UK collection below and pick a Single Rakhi, combo, or hamper.",
      "Add the gift to cart and enter the recipient’s full delivery details at checkout.",
      "Pay securely online — sisters ordering from India can use INR / UPI via Razorpay.",
      "Share a personal message and track your order until it reaches your loved one.",
    ],
    productSectionHeading: "Shop Rakhi gifts — curated for UK shoppers",
    productSectionIntro:
      "Explore live catalog products with images, prices, and View Product links. Sort by price or name — currency follows your site preference.",
    faqs: [
      {
        q: "What is the Rakhi from UK page?",
        a: "It is a dedicated UsaRakhi landing for customers searching Rakhi from UK, Send Rakhi to UK, and Rakhi Delivery to UK — with the full product catalog, sort controls, and secure checkout.",
      },
      {
        q: "Can I send Rakhi from India to someone in the UK?",
        a: "Yes — many sisters shop from India and arrange thoughtful Rakhi gifts for loved ones connected to the UK. Choose a design below, complete checkout, and use WhatsApp support if you need help with the order.",
      },
      {
        q: "What should I order for Send Rakhi to UK?",
        a: "A classic Single Rakhi works for a traditional ritual. For a fuller celebration, pick a Rakhi Combo (with chocolates) or a Rakhi Hamper with sweets and dry fruits.",
      },
      {
        q: "Do products show UK or India pricing?",
        a: "Product cards use the site currency toggle (USD / INR). At checkout you can pay with Stripe (USD) or Razorpay (INR / UPI).",
      },
    ],
    whatsappPrefill: "Hi UsaRakhi, I want help with Rakhi from UK / Send Rakhi to UK.",
    localeHints: {
      "en-GB": "/rakhi-from-uk",
      en: "/rakhi-from-uk",
      "x-default": "/",
    },
    shopCtaLabel: "Shop Rakhi for UK",
    addedGuideSections: [
      {
        heading: "Send Rakhi from India to the UK",
        paragraphs: [
          "Many families celebrate Raksha Bandhan across borders. If you are looking for Rakhi from India to UK, UsaRakhi helps you browse traditional and designer threads online, then complete a secure checkout — including INR / UPI when you are ordering from India.",
          "Whether you want to send Rakhi to UK for your brother, choose Raksha Bandhan gifts UK families love, or explore Indian Rakhi delivery UK options for a thoughtful festival surprise, this page brings the catalog and guidance together in one place.",
        ],
      },
      {
        heading: "Rakhi delivery UK — what to know",
        paragraphs: [
          "Rakhi delivery UK searches usually mean finding a gift that arrives ready for the tilak ritual — with roli and chawal on most single rakhis — and packaging that feels festive.",
          "Before you place an order, confirm the recipient’s full address and preferred gift style. During the busy Raksha Bandhan season, ordering earlier gives more time for packing and shipping. For current shipping details, review the information shown at checkout and on our shipping page.",
        ],
        subSections: [
          {
            heading: "Rakhi gifts for brother in UK",
            paragraphs: [
              "Looking for Rakhi gifts for brother in UK? Start with a classic Single Rakhi for a traditional ceremony, or choose a set if more than one sibling is celebrating together. Matching Bhaiya Bhabhi and Lumba styles work well when the celebration includes sister-in-law too.",
            ],
          },
        ],
      },
      {
        heading: "Available Rakhi collections",
        paragraphs: [
          "Browse the same UsaRakhi collections used across the store — each linked from the chips below the product grid:",
        ],
        subSections: [
          {
            heading: "Single, sets & family styles",
            paragraphs: [
              "Single Rakhi, Kids Rakhi, Bhaiya Bhabhi Rakhi, and Lumba Rakhi cover everyday festival needs — from a simple thread to coordinated family sets.",
            ],
          },
          {
            heading: "Rakhi combos and hampers",
            paragraphs: [
              "Rakhi Combos pair a thread with chocolates or small treats for a sweet Send Rakhi to UK moment. Rakhi Hampers add sweets, dry fruits, and a fuller gift presentation when you want Raksha Bandhan gifts UK relatives will share together.",
            ],
          },
        ],
      },
      {
        heading: "Easy online ordering",
        paragraphs: [
          "Shopping is straightforward: pick a design from the grid, add it to cart, enter delivery details, and pay with Stripe (USD) or Razorpay (INR / UPI). Product photos, names, and live prices appear on each card so you can compare options before you buy.",
          "Need help choosing Rakhi from India to UK? Message us on WhatsApp — we can point you to collections that match your brother’s style and your budget.",
        ],
      },
    ],
  },
  canada: {
    id: "canada",
    path: "/rakhi-from-canada",
    menuLabel: "Rakhi from Canada",
    heading: "Rakhi from Canada — Send Rakhi Gifts to Loved Ones",
    metaTitle: "Rakhi from Canada | Send Rakhi to Canada | Rakhi Delivery to Canada | UsaRakhi",
    metaDescription:
      "Shop Rakhi from Canada on UsaRakhi. Send Rakhi to Canada or arrange Rakhi Delivery to Canada for Raksha Bandhan — premium rakhis, combos & hampers with secure checkout.",
    keywords:
      "Rakhi from Canada, Rakhi Delivery to Canada, Send Rakhi to Canada, send rakhi from india to canada, rakhi gifts canada, raksha bandhan canada, Rakhi from India to Canada, Rakhi delivery Canada, Raksha Bandhan gifts Canada, Indian Rakhi delivery Canada, Rakhi gifts for brother in Canada",
    eyebrow: "Canada · Raksha Bandhan gifts",
    intro: [
      "Searching for Rakhi from Canada for Raksha Bandhan? UsaRakhi brings together designer threads, combos, and hampers so you can Send Rakhi to Canada with a gift that feels personal — including when you are arranging something special from India for family abroad.",
      "From a simple Single Rakhi to Bhaiya Bhabhi sets, Kids Rakhi, Lumba styles, and festive hampers, this page highlights Rakhi Delivery to Canada–focused gift ideas with live prices, product photos, and easy checkout in USD or INR.",
    ],
    highlights: [
      "Dedicated Rakhi from Canada landing with live catalog products",
      "Send Rakhi to Canada ideas — classic threads to premium hampers",
      "Clear Rakhi Delivery to Canada shopping experience",
      "Secure checkout with Stripe (USD) or Razorpay (INR / UPI)",
      "Most rakhis include roli & chawal for the ceremony",
      "Friendly WhatsApp support for gift selection help",
    ],
    howToHeading: "How to send Rakhi gifts for Canada",
    howToSteps: [
      "Browse the Rakhi from Canada products below and choose a design your brother will love.",
      "Add to cart and enter accurate recipient details at checkout.",
      "Pay securely — customers ordering from India can select INR / UPI.",
      "Confirm your order and keep the tracking details handy for festival day.",
    ],
    productSectionHeading: "Shop Rakhi gifts — curated for Canada shoppers",
    productSectionIntro:
      "All products load from the live UsaRakhi catalog. Use sort controls; prices follow your currency preference; each card links to the full product page.",
    faqs: [
      {
        q: "What is the Rakhi from Canada page?",
        a: "A country-specific UsaRakhi landing for Rakhi from Canada, Send Rakhi to Canada, and Rakhi Delivery to Canada searches — with product grid, sorting, and the same trusted checkout as the rest of the site.",
      },
      {
        q: "Can I send Rakhi from India to someone in Canada?",
        a: "Yes. Sisters often shop from India to arrange meaningful Rakhi gifts for loved ones in Canada. Pick a product below and complete secure checkout, or message us on WhatsApp for guidance.",
      },
      {
        q: "Which gifts work best to Send Rakhi to Canada?",
        a: "Single Rakhi for a classic ritual, Rakhi Combos when you want chocolates included, and Rakhi Hampers when you want sweets, dry fruits, and a fuller festival package.",
      },
      {
        q: "Is currency in CAD?",
        a: "The storefront shows USD or INR via the site currency toggle. Checkout supports Stripe (USD) and Razorpay (INR).",
      },
    ],
    whatsappPrefill: "Hi UsaRakhi, I want help with Rakhi from Canada / Send Rakhi to Canada.",
    localeHints: {
      "en-CA": "/rakhi-from-canada",
      en: "/rakhi-from-canada",
      "x-default": "/",
    },
    shopCtaLabel: "Shop Rakhi for Canada",
    addedGuideSections: [
      {
        heading: "Send Rakhi from India to Canada",
        paragraphs: [
          "Distance should not stop the Raksha Bandhan ritual. If you are arranging Rakhi from India to Canada, UsaRakhi lets you explore designer and traditional rakhis online, then check out securely — including INR / UPI for customers ordering from India.",
          "Use this page when you want to send Rakhi to Canada, find Raksha Bandhan gifts Canada families appreciate, or compare Indian Rakhi delivery Canada–friendly gift ideas before you order.",
        ],
      },
      {
        heading: "Rakhi delivery Canada — planning tips",
        paragraphs: [
          "Rakhi delivery Canada shoppers often look for a complete festival experience: a quality thread, roli and chawal on most single rakhis, and optional sweets or chocolates.",
          "Double-check the recipient’s address details at checkout, and order earlier during the peak Raksha Bandhan period so there is comfortable time for fulfilment. See the shipping page and checkout summary for the latest delivery information — we do not list fixed guarantees here that may change by season or destination.",
        ],
        subSections: [
          {
            heading: "Rakhi gifts for brother in Canada",
            paragraphs: [
              "For Rakhi gifts for brother in Canada, a Single Rakhi keeps the ritual classic. Multi-piece sets help when several brothers celebrate together, while Bhaiya Bhabhi and Lumba options include sister-in-law in the festival.",
            ],
          },
        ],
      },
      {
        heading: "Rakhi collections for Canada shoppers",
        paragraphs: [
          "All major UsaRakhi collections are available from this landing — use the category links under the product grid to jump straight into a style:",
        ],
        subSections: [
          {
            heading: "Threads and family sets",
            paragraphs: [
              "Single Rakhi, Kids Rakhi, Bhaiya Bhabhi Rakhi, and Lumba Rakhi cover traditional and modern looks for every sibling bond.",
            ],
          },
          {
            heading: "Combos and hampers",
            paragraphs: [
              "Rakhi Combos are ideal when you want chocolates with the thread. Rakhi Hampers package sweets, dry fruits, and festive presentation for richer Raksha Bandhan gifts Canada relatives can share.",
            ],
          },
        ],
      },
      {
        heading: "Easy online ordering",
        paragraphs: [
          "Choose a product, add it to cart, enter shipping details, and pay with Stripe (USD) or Razorpay (INR / UPI). Sorting and the currency toggle work the same as elsewhere on UsaRakhi so comparing gifts stays simple.",
          "Unsure what to pick for Send Rakhi to Canada? Reach out on WhatsApp — we are happy to help you narrow combos, hampers, or classic single threads.",
        ],
      },
    ],
  },
};

export function getCountryRakhiPage(id: CountryRakhiPageId): CountryRakhiPage {
  return countryRakhiPages[id];
}
