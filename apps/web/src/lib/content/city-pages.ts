/** SEO copy for USA city and state Diwali and Bhai Dooj gift landing pages. */

import { categoryHref } from "@/lib/category-urls";

export interface CityPageContent {
  slug: string;
  label: string;
  region: "state" | "city";
  state?: string;
  headline: string;
  metaExtra: string;
  intro: string[];
  delivery: { heading: string; paragraphs: string[] };
  areas: { heading: string; items: string[] };
  whyUs: { heading: string; bullets: string[] };
  howTo: { heading: string; steps: string[] };
  faqs: { q: string; a: string }[];
  relatedCategories: { label: string; href: string; text: string }[];
}

const sharedCategories = [
  {
    label: "Diwali Gift Combos",
    href: categoryHref("diwali"),
    text: "Festive hampers with sweets, dry fruits, and Diwali treats.",
  },
  {
    label: "Bhai Dooj Gifts",
    href: categoryHref("bhai-dooj"),
    text: "Sweets, chocolates, and gift boxes chosen for your brother.",
  },
  {
    label: "Sweet Combos",
    href: categoryHref("sweet-combos"),
    text: "Traditional mithai boxes to share with family and friends.",
  },
  {
    label: "Chocolate Combos",
    href: categoryHref("chocolate-combos"),
    text: "Festive chocolate boxes for Diwali and Bhai Dooj.",
  },
  {
    label: "Dry Fruit Hampers",
    href: categoryHref("dry-fruit-combos"),
    text: "Almonds, cashews, pistachios, and mixed-nut gift boxes.",
  },
  {
    label: "Pooja Sets",
    href: categoryHref("pooja-sets"),
    text: "Thali sets and festive essentials for the Diwali puja.",
  },
] as const;

function stateContent(
  slug: string,
  label: string,
  areas: string[],
  extraIntro?: string
): CityPageContent {
  return {
    slug,
    label,
    region: "state",
    headline: `Send Diwali and Bhai Dooj Gifts to ${label}, USA`,
    metaExtra: `Diwali gift combos and Bhai Dooj gifts delivered across ${label} in 5–7 business days. Order sweets, chocolates, and dry fruit hampers from India, the UK, or Canada.`,
    intro: [
      `Celebrating Diwali or Bhai Dooj with family in ${label}? UsaRakhi delivers festive gift combos, sweets, chocolates, and dry fruit hampers across every city and town in ${label} — from major metros to suburban neighborhoods. Relatives in India, the UK, Canada, Australia, and worldwide can order online; we ship domestically within the United States so the gift arrives without international customs delays.`,
      `Choose a Diwali gift combo, a Bhai Dooj hamper for your brother, traditional sweet boxes, chocolate assortments, or a dry fruit hamper. ${extraIntro ?? ""}`.trim(),
    ],
    delivery: {
      heading: `Diwali and Bhai Dooj Gift Delivery Across ${label}`,
      paragraphs: [
        `UsaRakhi ships to homes, apartments, offices, and university addresses across ${label}. Standard delivery takes 5–7 business days after dispatch. Orders placed before our daily cut-off ship the same business day when inventory allows.`,
        `We use trusted US carriers with tracking. You receive an order confirmation by email, and our support team can help with address checks or delivery questions before Diwali (November 8, 2026) and Bhai Dooj (November 10, 2026).`,
      ],
    },
    areas: {
      heading: `Popular ${label} Areas We Serve`,
      items: areas,
    },
    whyUs: {
      heading: `Why Families Choose UsaRakhi for ${label} Delivery`,
      bullets: [
        "Domestic USA shipping, so gifts skip international customs",
        "Diwali gift combos, sweet boxes, and dry fruit hampers",
        "Bhai Dooj gifts with chocolates and festive treats",
        "Pay in USD or INR with Razorpay from anywhere",
        "WhatsApp and email support for order help",
        "Trusted by families sending festival gifts from India to the USA",
      ],
    },
    howTo: {
      heading: `How to Send Diwali and Bhai Dooj Gifts to ${label}`,
      steps: [
        "Browse the gifts above, or shop Diwali combos, Bhai Dooj gifts, sweets, chocolates, and dry fruit hampers.",
        "Add your choice to the cart and enter the full US address in " + label + " at checkout.",
        "Pay securely with Razorpay in USD or INR.",
        "We pack and ship within the USA. Delivery usually takes 5–7 business days.",
        "Your family opens a festive hamper in time for Diwali or Bhai Dooj.",
      ],
    },
    faqs: [
      {
        q: `How long does Diwali gift delivery take in ${label}?`,
        a: `Most orders reach ${label} addresses in 5–7 business days after dispatch. Diwali 2026 is November 8 and Bhai Dooj is November 10, so order early enough for standard delivery.`,
      },
      {
        q: `Can I send Bhai Dooj gifts to ${label} from India?`,
        a: `Yes. Enter the ${label} shipping address at checkout. We accept orders worldwide and deliver domestically within the United States.`,
      },
      {
        q: `Do you deliver festive gifts to all cities in ${label}?`,
        a: `Yes. We deliver Diwali and Bhai Dooj gifts to every city, town, and ZIP code in ${label} as part of our all-50-states USA coverage.`,
      },
      {
        q: `What can I send for Diwali and Bhai Dooj?`,
        a: "Popular choices include Diwali gift combos, traditional sweet boxes, chocolate assortments, dry fruit hampers, and pooja sets. Each product page lists exactly what is inside.",
      },
    ],
    relatedCategories: [...sharedCategories],
  };
}

const cityPages: CityPageContent[] = [
  stateContent("california", "California", [
    "Los Angeles",
    "San Francisco Bay Area",
    "San Diego",
    "San Jose",
    "Sacramento",
    "Fresno",
    "Irvine",
    "Oakland",
    "Long Beach",
    "Silicon Valley",
  ], "California has one of the largest Indian-American communities in the USA — perfect for sending gifts to brothers in LA, the Bay Area, or San Diego."),
  stateContent("new-york", "New York", [
    "New York City (Manhattan, Brooklyn, Queens)",
    "Buffalo",
    "Rochester",
    "Albany",
    "Syracuse",
    "Yonkers",
    "Long Island",
    "Westchester",
  ], "From NYC boroughs to upstate communities, we deliver gifts across New York State."),
  stateContent("texas", "Texas", [
    "Houston",
    "Dallas",
    "Austin",
    "San Antonio",
    "Fort Worth",
    "Plano",
    "Irving",
    "Arlington",
  ], "Families across Texas celebrate Diwali and Bhai Dooj with gift delivery to Houston, Dallas, Austin, and beyond."),
  stateContent("florida", "Florida", [
    "Miami",
    "Orlando",
    "Tampa",
    "Jacksonville",
    "Fort Lauderdale",
    "West Palm Beach",
    "Tallahassee",
  ]),
  stateContent("new-jersey", "New Jersey", [
    "Newark",
    "Jersey City",
    "Edison",
    "Princeton",
    "Hoboken",
    "Woodbridge",
    "Iselin",
    "Fort Lee",
  ], "Many sisters in India send gifts to brothers in New Jersey's vibrant Indian-American communities — Edison, Iselin, and Jersey City are popular delivery areas."),
  {
    slug: "los-angeles",
    label: "Los Angeles",
    region: "city",
    state: "California",
    headline: "Send Diwali and Bhai Dooj Gifts to Los Angeles, California",
    metaExtra: "Send Diwali gift combos and Bhai Dooj gifts to LA, Hollywood, Pasadena, Irvine, and Los Angeles County. 5–7 day USA delivery.",
    intro: [
      "Los Angeles is home to one of America's largest Indian diaspora communities. If your family lives in LA — Downtown, the San Fernando Valley, West LA, or nearby Orange County — a Diwali hamper or Bhai Dooj gift from UsaRakhi keeps the celebration close.",
      "Order from India, the UK, Canada, or anywhere in the world. We ship domestically within the USA, delivering sweets, chocolates, and dry fruit hampers to Los Angeles addresses in 5–7 business days with tracking and careful packaging.",
    ],
    delivery: {
      heading: "Diwali and Bhai Dooj Delivery in Los Angeles",
      paragraphs: [
        "We deliver to all Los Angeles neighborhoods, LA County cities, and nearby Southern California areas. Standard shipping is 5–7 business days. Same-day dispatch applies to orders placed before our daily cut-off.",
        "Whether your brother is in an apartment near UCLA, a home in Pasadena, or an office in Downtown LA, enter the complete US address at checkout for reliable delivery.",
      ],
    },
    areas: {
      heading: "LA Areas We Frequently Deliver To",
      items: [
        "Downtown LA & Hollywood",
        "Santa Monica & West LA",
        "Pasadena & San Gabriel Valley",
        "Torrance & South Bay",
        "Woodland Hills & San Fernando Valley",
        "Irvine & Orange County (nearby)",
      ],
    },
    whyUs: {
      heading: "Why Los Angeles Families Trust UsaRakhi",
      bullets: [
        "Domestic USA shipping to Los Angeles",
        "Diwali gift combos and chocolate boxes",
        "Bhai Dooj gifts with sweets and dry fruits",
        "Order from India with INR payment via Razorpay",
        "Dedicated WhatsApp support",
      ],
    },
    howTo: {
      heading: "Send Diwali Gifts to Los Angeles in 5 Easy Steps",
      steps: [
        "Pick a Diwali combo, Bhai Dooj gift, sweet box, or dry fruit hamper above.",
        "Add it to the cart and enter the Los Angeles delivery address.",
        "Choose USD or INR payment at checkout.",
        "We ship within the USA, so the parcel skips international customs.",
        "The gift arrives in 5–7 business days.",
      ],
    },
    faqs: [
      {
        q: "Do you deliver Diwali gifts to Los Angeles from India?",
        a: "Yes. Order on UsaRakhi.com from India, enter the LA delivery address, and pay in INR. We ship domestically within America.",
      },
      {
        q: "How fast is Bhai Dooj gift delivery to LA?",
        a: "Typically 5–7 business days after dispatch to Los Angeles and most Southern California addresses.",
      },
      {
        q: "Can I send chocolates and sweets to Los Angeles for Diwali?",
        a: "Yes. Browse Diwali gift combos, sweet boxes, and chocolate combos for Ferrero Rocher, traditional mithai, and festive hampers.",
      },
    ],
    relatedCategories: [...sharedCategories],
  },
  {
    slug: "san-francisco",
    label: "San Francisco",
    region: "city",
    state: "California",
    headline: "Send Diwali and Bhai Dooj Gifts to San Francisco and the Bay Area",
    metaExtra: "Diwali and Bhai Dooj gift delivery to San Francisco, Oakland, San Jose, and the Bay Area. Order sweets, chocolates, and dry fruit hampers from India.",
    intro: [
      "The San Francisco Bay Area — including San Francisco, Oakland, San Jose, and Silicon Valley — has a thriving Indian-American community. UsaRakhi helps families send Diwali gift combos and Bhai Dooj gifts across the Bay Area with dependable US delivery.",
      "Order from anywhere worldwide. We fulfill and ship within the United States, so a Bay Area hamper avoids international shipping uncertainty.",
    ],
    delivery: {
      heading: "Diwali and Bhai Dooj Delivery in the Bay Area",
      paragraphs: [
        "We deliver to San Francisco city, the Peninsula, East Bay (Oakland, Fremont), and South Bay (San Jose, Sunnyvale). Delivery takes 5–7 business days after dispatch.",
        "Families, students, and professionals in the Bay Area often receive Diwali sweets and Bhai Dooj hampers from relatives abroad. We pack each order for a festival-ready unboxing.",
      ],
    },
    areas: {
      heading: "Bay Area Locations We Serve",
      items: ["San Francisco", "Oakland", "San Jose", "Fremont", "Sunnyvale", "Palo Alto", "Berkeley", "Mountain View"],
    },
    whyUs: {
      heading: "Why Choose UsaRakhi for San Francisco Delivery",
      bullets: [
        "Bay Area delivery in 5–7 business days",
        "Diwali gift combos and pooja hampers",
        "Bhai Dooj gifts with chocolates and dry fruits",
        "INR and USD checkout",
        "Email and WhatsApp order support",
      ],
    },
    howTo: {
      heading: "How to Send Diwali Gifts to San Francisco",
      steps: [
        "Choose a Diwali combo, Bhai Dooj gift, sweet box, or dry fruit hamper.",
        "Enter the Bay Area US address at checkout.",
        "Pay with Razorpay in USD or INR.",
        "We ship domestically within the USA.",
        "Delivery takes 5–7 business days.",
      ],
    },
    faqs: [
      {
        q: "Do you deliver Diwali gifts to Silicon Valley?",
        a: "Yes. We deliver to San Jose, Sunnyvale, Mountain View, Palo Alto, and all Bay Area cities.",
      },
      {
        q: "Can I send Bhai Dooj gifts to my brother in San Francisco from Delhi?",
        a: "Yes. UsaRakhi accepts orders from India and worldwide for delivery to San Francisco addresses.",
      },
    ],
    relatedCategories: [...sharedCategories],
  },
  {
    slug: "chicago",
    label: "Chicago",
    region: "city",
    state: "Illinois",
    headline: "Send Diwali and Bhai Dooj Gifts to Chicago, Illinois",
    metaExtra: "Send Diwali gift combos and Bhai Dooj gifts to Chicago, Naperville, Schaumburg, and Chicagoland. Domestic USA delivery from UsaRakhi.",
    intro: [
      "Chicago and the greater Chicagoland area — including Naperville, Schaumburg, and Evanston — have strong Indian-American communities. Send Diwali sweets, chocolate boxes, and Bhai Dooj hampers to Chicago with UsaRakhi's domestic US shipping.",
      "Families across India and the diaspora order here for Diwali and Bhai Dooj. We deliver to Illinois addresses in 5–7 business days.",
    ],
    delivery: {
      heading: "Diwali and Bhai Dooj Delivery in Chicago",
      paragraphs: [
        "We ship to Chicago proper, suburban Cook County, DuPage County, and greater Illinois. Orders dispatch quickly and arrive in 5–7 business days.",
        "Each hamper is packed for the celebration, whether you are sending mithai for Diwali or a chocolate and dry fruit box for Bhai Dooj.",
      ],
    },
    areas: {
      heading: "Chicagoland Areas We Serve",
      items: ["Downtown Chicago", "Naperville", "Schaumburg", "Evanston", "Skokie", "Aurora", "Oak Brook"],
    },
    whyUs: {
      heading: "Why Chicago Families Choose UsaRakhi",
      bullets: [
        "Illinois delivery in 5–7 business days",
        "Diwali combos, sweet boxes, and dry fruit hampers",
        "Order from India with ease",
        "Secure online payment",
        "Festival-ready packaging",
      ],
    },
    howTo: {
      heading: "Send Diwali Gifts to Chicago",
      steps: [
        "Browse Diwali combos, Bhai Dooj gifts, sweets, and dry fruit hampers, then add your choice to the cart.",
        "Enter the Chicago-area US address.",
        "Check out with USD or INR.",
        "We ship inside the USA and share tracking after dispatch.",
        "The gift arrives in time for Diwali or Bhai Dooj when you order early.",
      ],
    },
    faqs: [
      {
        q: "How long to deliver gifts to Chicago?",
        a: "Typically 5–7 business days after dispatch to Chicago and most Illinois addresses.",
      },
      {
        q: "Do you deliver to Chicago suburbs?",
        a: "Yes. Naperville, Schaumburg, Evanston, and all Chicagoland suburbs are covered.",
      },
    ],
    relatedCategories: [...sharedCategories],
  },
  {
    slug: "houston",
    label: "Houston",
    region: "city",
    state: "Texas",
    headline: "Send Diwali and Bhai Dooj Gifts to Houston, Texas",
    metaExtra: "Diwali and Bhai Dooj gift delivery to Houston, Sugar Land, Katy, and Greater Houston. Order sweets and dry fruit hampers from India to the USA.",
    intro: [
      "Houston is one of the fastest-growing Indian-American hubs in Texas. Whether your family lives in Sugar Land, Katy, the Energy Corridor, or central Houston, UsaRakhi delivers Diwali gift combos and Bhai Dooj hampers with dependable US shipping.",
      "Order from India, the UK, Canada, or anywhere. We ship domestically within America to Houston addresses in 5–7 business days.",
    ],
    delivery: {
      heading: "Diwali and Bhai Dooj Delivery in Houston",
      paragraphs: [
        "We deliver throughout Houston, Harris County, and nearby Texas communities. Standard delivery is 5–7 business days with email confirmation.",
        "A popular choice for families in India sending Diwali sweets and Bhai Dooj hampers to relatives in Houston's tech, medical, and energy sectors.",
      ],
    },
    areas: {
      heading: "Houston Areas We Serve",
      items: ["Downtown Houston", "Sugar Land", "Katy", "Pearland", "The Woodlands", "Cypress", "Memorial"],
    },
    whyUs: {
      heading: "Why Houston Families Choose UsaRakhi",
      bullets: [
        "Texas delivery in 5–7 business days",
        "Bhai Dooj gifts, chocolate boxes, and sweet combos",
        "Dry fruit hampers for Diwali sharing",
        "INR payment for India-based sisters",
        "Responsive customer support",
      ],
    },
    howTo: {
      heading: "How to Send Diwali Gifts to Houston",
      steps: [
        "Choose a Diwali combo, Bhai Dooj gift, sweet box, or dry fruit hamper.",
        "Enter the Houston US address at checkout.",
        "Pay securely online.",
        "We ship within the USA.",
        "Delivery takes 5–7 business days.",
      ],
    },
    faqs: [
      {
        q: "Do you deliver to Sugar Land and Katy?",
        a: "Yes. We deliver to all Houston suburbs including Sugar Land, Katy, Pearland, and The Woodlands.",
      },
      {
        q: "Can I send gifts from Mumbai to Houston?",
        a: "Yes. Order on UsaRakhi.com, enter the Houston address, and pay in INR via Razorpay.",
      },
    ],
    relatedCategories: [...sharedCategories],
  },
];

const cityMap = new Map(cityPages.map((c) => [c.slug, c]));

export function getCityContent(slug: string): CityPageContent | undefined {
  return cityMap.get(slug);
}

export function allCityContent(): CityPageContent[] {
  return cityPages;
}
