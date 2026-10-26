/** Standard FAQs shown on every product page (shipping, ordering, payments). */
export const productPageFaqs = [
  {
    q: "How long does delivery take in the USA?",
    a: "UsaRakhi delivers Diwali and Bhai Dooj gifts to all 50 US states in 5–7 business days after dispatch. Orders placed before our daily cut-off ship the same day.",
  },
  {
    q: "Can I order from India, the UK, or Canada?",
    a: "Yes. Enter the recipient's US delivery address at checkout. We fulfill domestically inside America, so your family avoids international customs.",
  },
  {
    q: "What festive gifts can I send?",
    a: "Choose Diwali gift combos, Bhai Dooj gifts, traditional sweets, chocolate boxes, dry fruit hampers, and pooja sets. Each product page lists what is included.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Stripe (USD) and Razorpay (INR). All payments are encrypted, and we never store card details.",
  },
  {
    q: "What if my gift arrives damaged?",
    a: "Contact us within 48 hours of delivery with photos. We offer replacements or refunds for damaged or incorrect items. See our Returns and Guarantee policy.",
  },
] as const;

/** Extra questions that match what that category actually sells. */
const categoryFaqs: Record<string, readonly { q: string; a: string }[]> = {
  "bhai-dooj": [
    {
      q: "Does this Bhai Dooj box include kumkum?",
      a: "Only if the product name or included list says so. A pistachio, nut, or chocolate box does not add a tilak set on its own.",
    },
  ],
  diwali: [
    {
      q: "Is this a pooja set or a food hamper?",
      a: "Read the product name. A thali, metal pooja set, toran, rangoli, or Shubh Labh is a puja or decor gift. If the name is only sweets or dry fruits, that is what is packed.",
    },
  ],
  "sweet-combos": [
    {
      q: "Can I change the mithai in this box?",
      a: "No. The sweet combo is packed as listed. Kaju katli and besan laddoo are different products.",
    },
  ],
  "dry-fruit-combos": [
    {
      q: "Is a weight shown for every dry fruit box?",
      a: "No. Only the listings that state a weight, such as the 266 g and 131 g mixed boxes, include that figure. Check the product title.",
    },
  ],
  "chocolate-combos": [
    {
      q: "Which chocolate is in this hamper?",
      a: "The brand named on the product: Ferrero Rocher, M&M’s, or Skittles. The box does not include every chocolate brand.",
    },
  ],
  "pooja-sets": [
    {
      q: "Does this pooja set include a metal thali?",
      a: "Only when the product name says thali or metal pooja set. Other listings are kumkum, a toran, rangoli, or Shubh Labh.",
    },
  ],
};

export function faqsForProduct(categorySlug: string) {
  return [...productPageFaqs, ...(categoryFaqs[categorySlug] ?? [])];
}
