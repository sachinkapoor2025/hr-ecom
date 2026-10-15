/** Festive copy for /gifts-from-uk and /gifts-from-canada while Rakhi pages are hidden. */

export type CountryGiftId = "uk" | "canada";

export type CountryGiftPage = {
  id: CountryGiftId;
  path: string;
  menuLabel: string;
  heading: string;
  intro: string;
  headline: string;
  sections: { heading: string; paragraphs: string[] }[];
  categories: { href: string; label: string; text: string }[];
  howTo: string[];
  faqs: { q: string; a: string }[];
  whatsappPrefill: string;
};

export const countryGiftPages: Record<CountryGiftId, CountryGiftPage> = {
  uk: {
    id: "uk",
    path: "/gifts-from-uk",
    menuLabel: "Gifts from UK",
    heading: "Send Gifts from the UK to the USA",
    intro:
      "Choose Indian sweets, chocolates, dry fruit combos, and festive hampers for family in the United States. You can order from the UK, and UsaRakhi delivers the gift from within the USA.",
    headline: "Festive gifts for family in the USA",
    sections: [
      {
        heading: "Ordering from the UK for a US address",
        paragraphs: [
          "Diwali and Bhai Dooj often split families between Britain and the United States. If you are in the UK and want mithai, chocolates, or a hamper on a relative’s table, you do not need to post a box yourself. Place the order here, enter the US delivery address, and the gift ships inside the United States.",
          "Standard delivery within the USA is 5 business days. Diwali 2026 falls on 8 November and Bhai Dooj on 10 November, so ordering a few days ahead leaves room for that delivery window. Shipping is confirmed at checkout: carts of $15 or more qualify for free shipping, Orange County products ship free, and a mixed cart calculates shipping separately.",
        ],
      },
      {
        heading: "What you can send",
        paragraphs: [
          "Indian sweet combos are the closest thing to sharing a thali from across the ocean. Boxes of kaju katli, laddoo, and other mithai suit Diwali visits and a Bhai Dooj plate for your brother.",
          "Chocolate combos work when the recipient prefers a familiar sweet alongside the festival. Dry fruit combos — almonds, cashews, pistachios, and mixed nuts — keep well and suit families who would rather graze than cut a mithai box. Festive hampers group those pieces when you want one gift that covers sweets, nuts, or a small puja set.",
          "Each card above is a live product from the UsaRakhi catalog, with its photo, name, and price. Open the product page for what is included, then add it to the cart.",
        ],
      },
    ],
    categories: [
      {
        href: "/sweet-combos-to-usa",
        label: "Indian sweet combos",
        text: "Mithai boxes for Diwali and Bhai Dooj.",
      },
      {
        href: "/chocolate-combos-to-usa",
        label: "Chocolate combos",
        text: "Chocolate assortments for a festive table.",
      },
      {
        href: "/dry-fruit-combos-to-usa",
        label: "Dry fruit combos",
        text: "Nuts and mixed dry-fruit hampers.",
      },
      {
        href: "/diwali-to-usa",
        label: "Diwali hampers",
        text: "Gift combos packed for Diwali.",
      },
      {
        href: "/bhai-dooj-to-usa",
        label: "Bhai Dooj gifts",
        text: "Sweets and hampers for your brother.",
      },
    ],
    howTo: [
      "Pick a sweet combo, chocolate box, dry fruit hamper, or festive gift from the products above.",
      "Add it to the cart and enter the recipient’s full United States address at checkout.",
      "Pay online. The gift ships from within the USA, with standard delivery in 5 business days.",
    ],
    faqs: [
      {
        q: "Can I send a gift from the UK to someone in the USA?",
        a: "Yes. Order on this page and use a United States delivery address. UsaRakhi ships the gift inside the USA, so you are not posting a parcel from Britain.",
      },
      {
        q: "Which gifts suit Diwali and Bhai Dooj?",
        a: "Indian sweet combos, chocolate assortments, dry fruit boxes, and festive hampers. Pooja sets are listed with the other gifts when you want something for the puja thali as well.",
      },
      {
        q: "How long does USA delivery take?",
        a: "Standard delivery inside the USA is 5 business days. The shipping charge, including free shipping on a cart of $15 or more, is shown at checkout.",
      },
    ],
    whatsappPrefill: "Hi UsaRakhi, I want to send a Diwali or Bhai Dooj gift from the UK to a US address.",
  },
  canada: {
    id: "canada",
    path: "/gifts-from-canada",
    menuLabel: "Gifts from Canada",
    heading: "Send Gifts from Canada to the USA",
    intro:
      "Shop Indian sweets, chocolates, dry fruit combos, and festive hampers for relatives in the United States. Order from Canada, and UsaRakhi delivers the gift from within the USA.",
    headline: "A festival box for relatives across the border",
    sections: [
      {
        heading: "Ordering from Canada for a US address",
        paragraphs: [
          "Plenty of families celebrate Diwali in Canada and Bhai Dooj with a brother or parents who live in the United States. This page is for that order: you shop from Canada, and the hamper is delivered to a US address from inside the United States rather than as an international parcel you pack yourself.",
          "Plan around a 5-business-day USA delivery. Diwali is 8 November 2026 and Bhai Dooj is 10 November 2026. At checkout, carts of $15 or more qualify for free shipping, Orange County products ship free, and a mixed cart calculates shipping separately.",
        ],
      },
      {
        heading: "Sweets, chocolates, dry fruits, and hampers",
        paragraphs: [
          "A sweet combo is the straightforward Diwali gift: mithai the household can open after puja or set out for guests. For Bhai Dooj, the same style of box gives your brother something to share on the day you cannot sit down together.",
          "Chocolate combos are an easy choice for households that keep a bowl of chocolates next to the sweets. Dry fruit combos travel well as a gift for parents or an older relative who would rather have nuts than a large mithai tray. Festive hampers combine those ideas when one parcel should cover more than a single box.",
          "The products at the top of this page come from the live catalog. Photos, names, and prices match the product pages, and each card can be added to the cart.",
        ],
      },
    ],
    categories: [
      {
        href: "/sweet-combos-to-usa",
        label: "Indian sweet combos",
        text: "Traditional mithai for a US celebration.",
      },
      {
        href: "/chocolate-combos-to-usa",
        label: "Chocolate combos",
        text: "Chocolate gifts to send across the border.",
      },
      {
        href: "/dry-fruit-combos-to-usa",
        label: "Dry fruit combos",
        text: "Assorted nuts and dry-fruit gift boxes.",
      },
      {
        href: "/diwali-to-usa",
        label: "Diwali hampers",
        text: "Hampers arranged for Diwali in the USA.",
      },
      {
        href: "/pooja-sets-to-usa",
        label: "Pooja sets",
        text: "Puja gifts to include with the sweets.",
      },
    ],
    howTo: [
      "Select a gift from the products on this page — sweets, chocolates, dry fruits, or a hamper.",
      "Add it to the cart and enter the recipient’s United States address.",
      "Pay online. Delivery is inside the USA and takes 5 business days on the standard service.",
    ],
    faqs: [
      {
        q: "Can I order from Canada for delivery in the USA?",
        a: "Yes. Use a United States shipping address at checkout. The gift is fulfilled inside the USA, so it is not a parcel you ship from Canada.",
      },
      {
        q: "What should I send for Diwali or Bhai Dooj?",
        a: "Indian sweet combos and festive hampers fit both days. Chocolate combos and dry fruit boxes are strong alternatives when you know the household’s preference.",
      },
      {
        q: "When should I order?",
        a: "Standard USA delivery is 5 business days. Ordering several days before 8 November (Diwali) or 10 November (Bhai Dooj) fits that window. The checkout page shows the shipping total before you pay.",
      },
    ],
    whatsappPrefill: "Hi UsaRakhi, I want to send a Diwali or Bhai Dooj gift from Canada to a US address.",
  },
};

export function getCountryGiftPage(id: CountryGiftId): CountryGiftPage {
  return countryGiftPages[id];
}
