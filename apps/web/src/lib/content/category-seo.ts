/** Title, meta description, and H1 for public category landing pages (`/*-to-usa`). */
export const categoryPageSeo: Record<
  string,
  { title: string; description: string; h1: string }
> = {
  "lumba-rakhi": {
    title: "Send Lumba Rakhi to USA | Free Shipping | USA Rakhi",
    description:
      "Send Lumba Rakhi to USA with premium designer Lumba Rakhis for your bhabhi. Fast USA delivery, secure payment, and complimentary roli chawal included.",
    h1: "Send Lumba Rakhi to USA",
  },
  "bhaiya-bhabhi-rakhi": {
    title: "Send Bhaiya Bhabhi Rakhi to USA | Free Shipping | USA Rakhi",
    description:
      "Shop Bhaiya Bhabhi Rakhi to USA with elegant Rakhi pairs and premium designs. Fast delivery across the USA with secure online ordering.",
    h1: "Send Bhaiya Bhabhi Rakhi to USA",
  },
  "single-rakhi": {
    title: "Send Single Rakhi to USA | Free Shipping | USA Rakhi",
    description:
      "Buy Single Rakhi to USA from our exclusive collection of traditional and designer Rakhis. Fast USA delivery with festive packaging and roli chawal.",
    h1: "Send Single Rakhi to USA",
  },
  "2-set-rakhi": {
    title: "Send Set of 2 Rakhis to USA | Free Shipping | USA Rakhi",
    description:
      "Shop Set of 2 Rakhis to USA — two-piece designer rakhi sets for brothers. Fast USA delivery with festive packaging and roli chawal.",
    h1: "Send Set of 2 Rakhis to USA",
  },
  "3-set-rakhi": {
    title: "Send Set of 3 Rakhis to USA | Free Shipping | USA Rakhi",
    description:
      "Shop Set of 3 Rakhis to USA — three-piece designer rakhi sets for multiple brothers. Fast USA delivery with festive packaging.",
    h1: "Send Set of 3 Rakhis to USA",
  },
  "4-set-rakhi": {
    title: "Send Set of 4 Rakhis to USA | Free Shipping | USA Rakhi",
    description:
      "Shop Set of 4 Rakhis to USA — four-piece designer rakhi sets for larger families. Fast USA delivery with festive packaging.",
    h1: "Send Set of 4 Rakhis to USA",
  },
  "5-set-rakhi": {
    title: "Send Set of 5 Rakhis to USA | Free Shipping | USA Rakhi",
    description:
      "Shop Set of 5 Rakhis to USA — five-piece designer rakhi sets mixed from our popular singles. Fast USA delivery with festive packaging.",
    h1: "Send Set of 5 Rakhis to USA",
  },
  "kids-rakhi": {
    title: "Send Kids Rakhi to USA | Free Shipping | USA Rakhi",
    description:
      "Send Kids Rakhi to USA featuring cartoon, superhero, and colorful Rakhi designs. Fast delivery across the USA with premium quality.",
    h1: "Send Kids Rakhi to USA",
  },
  "rakhi-combo": {
    title: "Send Rakhi Combo to USA | Free Shipping | USA Rakhi",
    description:
      "Order Rakhi with chocolates to USA with chocolates, sweets, dry fruits, and premium Rakhi sets. Fast USA delivery and secure online shopping.",
    h1: "Send Rakhi with Chocolates to USA",
  },
  "rakhi-hampers": {
    title: "Send Rakhi Hamper to USA | Free Shipping | USA Rakhi",
    description:
      "Order Rakhi hamper gift boxes to USA with designer rakhis, kaju katli, dry fruits, and festive sweets. Fast domestic USA delivery, clear what's-included lists, and secure online shopping.",
    h1: "Send Rakhi Hamper to USA",
  },
  "bhai-dooj": {
    title: "Send Bhai Dooj Gifts to the USA | USA Rakhi",
    description:
      "Send Bhai Dooj gifts to your brother in the USA — Indian sweets, dry fruits, chocolates, and pooja hampers. Domestic delivery in about 5 business days.",
    h1: "Send Bhai Dooj Gifts to the USA",
  },
  diwali: {
    title: "Send Diwali Gifts to the USA | USA Rakhi",
    description:
      "Send Diwali gifts to the USA. Festive hampers with Indian sweets, dry fruits, pooja sets, torans, and rangoli. Domestic delivery in about 5 business days.",
    h1: "Send Diwali Gifts to the USA",
  },
  "sweet-combos": {
    title: "Send Sweet Hampers and Gifts to the USA | USA Rakhi",
    description:
      "Send sweet hampers to the USA. Indian gift boxes with kaju katli, besan laddoo, and festive combinations for Diwali and Bhai Dooj.",
    h1: "Send Sweet Hampers and Gifts to the USA",
  },
  "dry-fruit-combos": {
    title: "Dry Fruit Gift Hampers Delivered Across the USA | USA Rakhi",
    description:
      "Send dry fruit gift hampers to the USA. Almonds, pistachios, cashews, and mixed nuts for Diwali, Bhai Dooj, and other special occasions.",
    h1: "Dry Fruit Gift Hampers Delivered Across the USA",
  },
  "chocolate-combos": {
    title: "Chocolate Combos USA | Festive Chocolate Gift Boxes",
    description:
      "Browse Diwali and Bhai Dooj boxes that include Ferrero Rocher, M&M's, or Skittles. The chocolate in the box is the one named on the product.",
    h1: "Chocolate Combos for USA Delivery",
  },
  "pooja-sets": {
    title: "Pooja Sets USA | Diwali & Bhai Dooj Puja Hampers",
    description:
      "Shop pooja hampers for USA delivery — thali sets, kumkum, toran, rangoli, and Shubh Labh, packed with the sweets or nuts named on each product.",
    h1: "Pooja Sets for USA Delivery",
  },
};

export function getCategoryPageSeo(slug: string) {
  return categoryPageSeo[slug];
}
