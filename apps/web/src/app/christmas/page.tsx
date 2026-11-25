import type { Metadata } from "next";
import { SeasonalOccasionLanding, type SeasonalPageCopy } from "@/components/SeasonalOccasionLanding";
import { categoryHref } from "@/lib/category-urls";
import { resolveImageUrl } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";
import { isChocolateGift, isChristmasGift, isPantryGift, loadSeasonalCatalog } from "@/lib/seasonal-gifts";

const copy: SeasonalPageCopy = {
  path: "/christmas",
  breadcrumb: "Christmas",
  eyebrow: "Christmas 2026",
  h1: "Christmas Gifts to USA",
  lead:
    "Send Christmas gifts to USA from India or anywhere in the world. UsaRakhi delivers in-stock chocolates, dry fruits, sweets, and gift hampers from within the United States.",
  dateLabel: "Christmas Day 2026",
  dateValue: "Friday, December 25",
  dateNote: "Order by mid-December — standard delivery is 5 business days",
  tone: "christmas",
  intro: [
    "Christmas is a wonderful time to celebrate love, togetherness, and happiness with family and friends. Even when your loved ones are miles away, you can make them feel special with a thoughtful surprise. With UsaRakhi, you can send Christmas gifts to USA from India or anywhere in the world.",
    "Explore chocolates, dry fruit combos, sweet combos, and gift hampers for parents, siblings, partners, and friends across the United States. Every box on this page is in stock and already packed for domestic USA delivery. Names, photos, and prices match the product pages.",
    "Christmas Day 2026 is Friday, December 25. Use Add to cart if you want more than one box, or Buy now to open the same checkout as the rest of the site. You can pay in USD or INR. Planning ahead for January, the New Year page lists celebration boxes from this same catalog.",
  ],
  introLinks: [
    { phrase: "dry fruit combos", href: categoryHref("dry-fruit-combos") },
    { phrase: "sweet combos", href: categoryHref("sweet-combos") },
    { phrase: "gift hampers", href: categoryHref("diwali") },
    { phrase: "domestic USA delivery", href: "/shipping" },
    { phrase: "New Year page", href: "/new-year" },
  ],
  sections: [
    {
      id: "chocolates",
      heading: "Christmas chocolates",
      intro:
        "Spread sweetness this Christmas with chocolate boxes that are in stock now, including Ferrero Rocher, M&M’s, and Skittles. A chocolate box is a welcome present for children, friends, siblings, and partners.",
      match: isChocolateGift,
    },
    {
      id: "hampers",
      heading: "Dry fruits, sweets, and gift hampers",
      intro:
        "Almonds, pistachios, mixed nuts, sweet boxes, and festive hampers from the current catalog. Gift hampers are the choice when you want more than one treat in the box. Each card links to the product page, where the included items are listed.",
      match: isPantryGift,
    },
  ],
  bannerHeading: "A real box, ready to ship",
  bannerText:
    "This Christmas gift is in the catalog today. Add it to your cart or buy it now — checkout, currency, and payment stay the same as every other UsaRakhi order.",
  stories: [
    {
      id: "send-online",
      heading: "Send Christmas Gifts to USA Online",
      paragraphs: [
        "Christmas is all about sharing happiness and making beautiful memories. If your family and friends are celebrating Christmas in the United States while you are in another country, you can still be part of their day with a thoughtful gift.",
        "At UsaRakhi, choose an in-stock chocolate box, dry fruit box, sweet box, or festive hamper. When you send Christmas gifts to USA, the order is packed in the United States and shipped to the address you enter. Standard delivery is 5 business days with free shipping.",
      ],
    },
    {
      id: "gift-ideas",
      heading: "Best Christmas Gift Ideas for Your Loved Ones in USA",
      paragraphs: [
        "Looking for the right Christmas surprise? These are the gifts UsaRakhi can ship to a United States address. Open a product to see the photo and the exact contents.",
      ],
      points: [
        {
          title: "Christmas chocolates",
          text: "Chocolate boxes and assorted treats make wonderful presents for children, friends, siblings, and partners. The chocolate section above lists what is available to order today.",
        },
        {
          title: "Christmas gift hampers",
          text: "Gift hampers are perfect when you want to surprise someone with more than one treat. Dry fruit combos, sweet boxes, and festive hampers combine nuts, mithai, or chocolates. The product title is what we pack.",
        },
        {
          title: "Dry fruits and sweets",
          text: "Almonds, pistachios, mixed nuts, and sweet boxes are easy to share around a Christmas table. Weights and piece counts are only what that listing states.",
        },
      ],
    },
    {
      id: "for-family",
      heading: "Christmas Gifts for Everyone in Your Family",
      paragraphs: [
        "Christmas is a celebration for everyone. Whether you are shopping for parents, a partner, siblings, or friends, choose a chocolate, dry fruit, sweet, or hamper that fits that person.",
      ],
      points: [
        {
          title: "Christmas gifts for parents in USA",
          text: "Make your parents feel loved with a festive hamper, a dry fruit box, or a chocolate assortment. It is a clear way to say thank you when you cannot sit at their table.",
        },
        {
          title: "Christmas gifts for husband",
          text: "Surprise your husband with a chocolate box or a mixed-nut hamper. The card shows the current price in USD or INR.",
        },
        {
          title: "Christmas gifts for wife",
          text: "Chocolates, a sweet box, or a dry fruit hamper can mark the day when you are not in the same house. Choose the listing whose included list matches what she likes.",
        },
        {
          title: "Christmas gifts for boyfriend and girlfriend",
          text: "A chocolate gift is an easy Christmas gesture for a partner. Buy now opens checkout with that one box, or add more than one box to the cart first.",
        },
        {
          title: "Christmas gifts for friends",
          text: "Send a chocolate box, a small dry-fruit box, or a sweet hamper to a friend in another state. The same catalog ships across the United States.",
        },
        {
          title: "Christmas gifts for brother and sister",
          text: "Chocolates, sweets, and festive hampers are a familiar way to celebrate your bond, including Bhai Dooj gift boxes that are still in stock and ready for a US address.",
        },
      ],
    },
    {
      id: "from-anywhere",
      heading: "Send Christmas Gifts to USA from Anywhere with UsaRakhi",
      paragraphs: [
        "Being away from your loved ones during Christmas can feel difficult, especially when everyone is celebrating together. You can still be part of the day by sending a box across the miles.",
        "Whether you are in India or another part of the world, checkout accepts Razorpay in USD and INR, including UPI, and Stripe for USD cards. The recipient address is a United States address, and the package ships from within the United States.",
        "Celebrate Christmas 2026 by sharing a gift that is in stock now, with domestic USA delivery.",
      ],
    },
    {
      id: "why-usarakhi",
      heading: "Why Choose UsaRakhi for Christmas Gift Delivery in USA?",
      paragraphs: [],
      points: [
        {
          title: "Thoughtful gift collection",
          text: "Chocolates, dry fruits, sweets, and festive hampers that are in stock for Christmas delivery inside the United States.",
        },
        {
          title: "Convenient online ordering",
          text: "Select your preferred gift on this page and place the order online. Add to cart keeps browsing. Buy now opens checkout.",
        },
        {
          title: "Surprise your loved ones",
          text: "Send a meaningful present to family and friends living across the United States while you order from India or abroad.",
        },
        {
          title: "Gifts for the people you miss",
          text: "Find Christmas gifts for parents, siblings, friends, and partners from this same catalog.",
        },
        {
          title: "Celebrate from anywhere",
          text: "Share your Christmas wishes even when you cannot celebrate together. Standard delivery is 5 business days with free shipping. Order by mid-December for a clearer window before December 25.",
        },
      ],
    },
  ],
  faqHeading: "Frequently Asked Questions About Christmas Gifts to USA",
  faqs: [
    {
      q: "Can I send Christmas gifts to USA from India?",
      a: "Yes. Order on this page, pay in INR with Razorpay (including UPI) or in USD, and enter a United States address. The gift ships from within the United States. Standard delivery is 5 business days with free shipping.",
    },
    {
      q: "What are the best Christmas gifts to send to USA?",
      a: "Chocolate boxes, dry fruit and nut boxes, sweet boxes, and festive hampers that are in stock on this page. Open a product to see the photo and the exact contents. Sold-out items are left off.",
    },
    {
      q: "Can I send Christmas chocolates to USA online?",
      a: "Yes. The chocolate section lists in-stock boxes, including Ferrero Rocher, M&M’s, and Skittles. Delivery is domestic USA shipping.",
    },
    {
      q: "What Christmas gift hampers can I order?",
      a: "Dry fruit boxes, mixed nuts, sweet boxes, and festive hampers currently in stock. Each product page lists what is packed inside. A box does not include extra sweets or chocolates unless that listing says so.",
    },
    {
      q: "What are some affordable Christmas gift ideas?",
      a: "Smaller chocolate boxes and the smaller dry-fruit boxes on this page. The price on each card is the current price, and it follows the USD or INR currency switcher.",
    },
    {
      q: "Can I send Christmas gifts to my family in different US cities?",
      a: "Yes. Orders ship domestically to US addresses, including California, New York, Texas, Florida, and New Jersey. Place a separate order for each address.",
    },
    {
      q: "How can I surprise someone in USA on Christmas?",
      a: "Choose an in-stock chocolate, dry fruit, or sweet box and use Buy now to open checkout. Add to cart if you want more than one box. Christmas Day 2026 is Friday, December 25. Ordering by mid-December leaves a clearer window. Carrier schedules around the holiday can still add a day, and we do not promise a guaranteed arrival date.",
    },
  ],
  otherOccasion: {
    href: "/new-year",
    label: "Shop New Year gifts",
    text: "Chocolate boxes, dry fruits, and festive hampers from the same catalog, chosen for New Year’s Day on January 1, 2027.",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const products = (await loadSeasonalCatalog()).filter(isChristmasGift);
  const ogImage = products[0]?.images?.[0] ? resolveImageUrl(products[0].images[0]) : undefined;
  return pageMetadata({
    title: "Christmas Gifts to USA - Chocolates & Gift Hampers",
    description:
      "Send Christmas gifts to USA from India or anywhere in the world. Explore chocolates, dry fruits, sweets, and gift hampers with UsaRakhi.",
    path: "/christmas",
    keywords:
      "Christmas gifts to USA, send Christmas gifts to USA, Christmas gift delivery in USA, Christmas gifts online USA, send Christmas gifts from India to USA, Christmas chocolates, Christmas gift hampers, Christmas gifts for family, Christmas gifts for friends, UsaRakhi",
    ...(ogImage ? { ogImage } : {}),
  });
}

export default async function ChristmasPage() {
  const products = (await loadSeasonalCatalog()).filter(isChristmasGift);
  return <SeasonalOccasionLanding copy={copy} products={products} />;
}
