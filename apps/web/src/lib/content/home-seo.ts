import { locationPublicPath } from "@/lib/content/seo-data";

/** Homepage editorial copy for the Diwali and Bhai Dooj season. */
export const homeSeoContent = {
  sections: [
    {
      heading: "Bhai Dooj Gifts for Your Brother in the USA",
      paragraphs: [
        "Celebrate the beautiful bond between brothers and sisters with special Bhai Dooj gifts. Explore gift hampers featuring sweets, chocolates, dry fruits, and festive treats to express your love, even when you live miles apart. Send Bhai Dooj gifts to your brother in the USA and make the occasion memorable.",
      ],
    },
    {
      heading: "Diwali Gift Combos & Sweet Combos in the USA",
      paragraphs: [
        "Make Diwali celebrations sweeter with delightful Diwali gift combos and sweet combos. Discover traditional Indian mithai, chocolate treats, dry fruits, and festive gift combinations perfect for family and friends. Whether you're sending Diwali sweets to loved ones or choosing a festive hamper, UsaRakhi helps you share the joy of Diwali across America.",
      ],
    },
    {
      heading: "Send Diwali Gifts to Family & Friends Across America",
      paragraphs: [
        "Brighten your loved ones' celebrations with Diwali gift hampers filled with festive treats and thoughtful surprises. From traditional sweets to delicious sweet combos and dry fruit gifts, find options for sharing happiness with family and friends throughout the United States.",
      ],
    },
  ],
  whyChoose: {
    heading: "Why Choose UsaRakhi for Diwali & Bhai Dooj Gifts?",
    bullets: [
      { label: "Festive Gift Hampers:", text: "Explore gift options for Diwali and Bhai Dooj." },
      { label: "Sweet Combos:", text: "Discover delicious sweets and festive treats for your loved ones." },
      { label: "Convenient Online Ordering:", text: "Shop for festival gifts from anywhere." },
      { label: "US Delivery:", text: "Send festive surprises to family and friends across the United States." },
    ],
  },
  faqs: [
    {
      q: "What gifts can I send for Diwali in the USA?",
      a: "You can explore Diwali gift hampers, traditional Indian sweets, chocolates, dry fruits, pooja sets, and festive gift combos at UsaRakhi to celebrate with your loved ones across the USA.",
    },
    {
      q: "Can I send Bhai Dooj gifts to my brother in the USA?",
      a: "Yes, you can browse the Bhai Dooj gift collection at UsaRakhi and choose from available sweets, chocolates, dry fruits, and festive gift boxes for your brother in the United States.",
    },
    {
      q: "Does UsaRakhi offer Diwali sweet combos in the USA?",
      a: "UsaRakhi features festive gifting options, including sweet combos and gift hampers. Check the available products to find suitable Diwali sweets and treats for your family and friends.",
    },
    {
      q: "What are the best Bhai Dooj gifts for brothers?",
      a: "Popular Bhai Dooj gift ideas include Indian sweets, chocolate boxes, dry fruit hampers, and traditional pooja gift sets. Choose a gift based on your brother's preferences and the products available.",
    },
    {
      q: "Can I order Diwali gifts online for family in America?",
      a: "Yes, you can browse the available Diwali gifts on UsaRakhi, select your preferred products, and enter the recipient's US delivery address during checkout.",
    },
    {
      q: "Does UsaRakhi deliver Diwali and Bhai Dooj gifts across the USA?",
      a: "UsaRakhi offers festive gifts for customers sending presents within the United States. Check the shipping policy and delivery availability for your recipient's address before placing an order.",
    },
    {
      q: "What types of Diwali gift combos are available?",
      a: "Diwali gifting options may include traditional Indian sweets, chocolates, dry fruits, festive hampers, and pooja essentials. Browse the available collection to choose a suitable combo.",
    },
    {
      q: "How can I order Bhai Dooj gifts online?",
      a: "Visit the UsaRakhi Bhai Dooj collection, select your preferred gift, add it to your cart, and follow the checkout instructions to enter the recipient's delivery details.",
    },
  ],
  topCities: [
    { slug: "los-angeles", label: "Los Angeles" },
    { slug: "san-jose", label: "San Jose" },
    { slug: "san-francisco", label: "San Francisco" },
    { slug: "new-york", label: "New York" },
    { slug: "new-jersey", label: "New Jersey" },
    { slug: "texas", label: "Texas" },
    { slug: "chicago", label: "Chicago" },
    { slug: "houston", label: "Houston" },
  ],
} as const;

export const homeCityLinks = homeSeoContent.topCities.map((c) => ({
  ...c,
  href: locationPublicPath(c.slug),
}));
