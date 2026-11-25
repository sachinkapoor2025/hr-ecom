import type { Metadata } from "next";
import { SeasonalOccasionLanding, type SeasonalPageCopy } from "@/components/SeasonalOccasionLanding";
import { categoryHref } from "@/lib/category-urls";
import { resolveImageUrl } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";
import {
  isNewYearChocolateGift,
  isNewYearFestiveGift,
  isNewYearGift,
  isNewYearPantryGift,
  loadSeasonalCatalog,
} from "@/lib/seasonal-gifts";

const copy: SeasonalPageCopy = {
  path: "/new-year",
  breadcrumb: "New Year",
  eyebrow: "New Year 2027",
  h1: "New Year Gifts to USA",
  lead:
    "Send New Year gifts to USA from anywhere and welcome 2027 with chocolates, dry fruits, sweets, and gift hampers. Every product on this page is in stock and ships from within the United States.",
  dateLabel: "New Year’s Day",
  dateValue: "Friday, January 1, 2027",
  dateNote: "Order in December — standard delivery is 5 business days",
  tone: "new-year",
  intro: [
    "Welcome the New Year 2027 by sharing happiness, love, and warm wishes with the people who matter most. Even if your family and friends are miles away, you can make their celebrations special. With UsaRakhi, you can send New Year gifts to USA from anywhere.",
    "Explore chocolate combos, dry fruit combos, sweet combos, Diwali hampers, and Bhai Dooj sets that are still in stock. Product names stay as they are in the shop, and each page lists what is packed inside.",
    "New Year’s Day is Friday, January 1, 2027. Add to cart and Buy now use the same cart, currency switcher, and checkout as the rest of UsaRakhi. If you need a box before the year turns, the Christmas page is the food-gift edit of this catalog.",
  ],
  introLinks: [
    { phrase: "chocolate combos", href: categoryHref("chocolate-combos") },
    { phrase: "dry fruit combos", href: categoryHref("dry-fruit-combos") },
    { phrase: "sweet combos", href: categoryHref("sweet-combos") },
    { phrase: "Diwali hampers", href: categoryHref("diwali") },
    { phrase: "Christmas page", href: "/christmas" },
  ],
  sections: [
    {
      id: "chocolates",
      heading: "New Year chocolates",
      intro:
        "Chocolates are a timeless way to spread happiness. In-stock boxes include Ferrero Rocher, M&M’s, and Skittles, ready as a host gift or a parcel for someone you cannot toast in person.",
      match: isNewYearChocolateGift,
    },
    {
      id: "dry-fruits",
      heading: "Dry fruits and sweets for a fresh start",
      intro:
        "Almonds, pistachios, mixed nuts, and sweet boxes from the current catalog. A dry fruit box is a familiar way to wish someone a prosperous 2027.",
      match: isNewYearPantryGift,
    },
    {
      id: "festive-hampers",
      heading: "New Year gift hampers",
      intro:
        "Thoughtfully arranged hampers that are still available to order. Diwali hampers and pooja sets stay labeled with their real product names, including Bhai Dooj and Diwali sets, because that is what we ship.",
      match: isNewYearFestiveGift,
    },
  ],
  bannerHeading: "Send a box before the year turns",
  bannerText:
    "The featured New Year gift is in stock now. Buy now opens the standard checkout, with Razorpay for USD and INR and Stripe for USD cards.",
  stories: [
    {
      id: "send-online",
      heading: "Send Beautiful New Year Gifts to USA Online",
      paragraphs: [
        "Distance should never stop you from celebrating special moments with your family and friends. With online gifting, you can surprise your loved ones in the United States without travelling.",
        "Choose chocolates, dry fruits, sweets, or a festive hamper. When you send New Year gifts to USA, the parcel goes to the address you enter at checkout. Standard delivery is 5 business days with free shipping.",
      ],
    },
    {
      id: "gift-ideas",
      heading: "Best New Year Gift Ideas for Your Loved Ones in USA",
      paragraphs: [
        "Finding the right present is a way to express your feelings. These are the New Year gifts UsaRakhi can ship to a United States address. The product title tells you exactly which set it is.",
      ],
      points: [
        {
          title: "New Year chocolates",
          text: "Surprise your loved ones with chocolate boxes and sweet treats. They suit friends, siblings, partners, and family. The chocolate section lists what is in stock today.",
        },
        {
          title: "New Year gift hampers",
          text: "Make your wishes extra special with a hamper. Festive hampers, sweet boxes, and dry fruit combos put several treats in one carton. We ship the contents named on that product.",
        },
        {
          title: "Dry fruits and sweets",
          text: "Nuts and mithai are a familiar way to wish someone a prosperous year. Almonds, pistachios, mixed nuts, and sweet boxes are pulled from the live catalog.",
        },
      ],
    },
    {
      id: "for-family",
      heading: "New Year Gifts for Everyone in Your Family",
      paragraphs: [
        "Every relationship deserves a special surprise. Choose a chocolate, dry fruit, sweet, hamper, or pooja set according to the person you want to celebrate with.",
      ],
      points: [
        {
          title: "New Year gifts for parents in USA",
          text: "Show your appreciation with a festive hamper, a dry fruit box, or a chocolate assortment so your parents can open something from you on January 1.",
        },
        {
          title: "New Year gifts for husband",
          text: "A chocolate box or a nut hamper is a direct New Year gift for a husband in the United States. The price on the card follows the site currency.",
        },
        {
          title: "New Year gifts for wife",
          text: "Chocolates, a sweet box, or a festive hamper can start her year when you cannot be there at midnight. Read the included list before you add it to the cart.",
        },
        {
          title: "New Year gifts for boyfriend and girlfriend",
          text: "Celebrate your relationship with a chocolate box. Buy now opens checkout with that gift, or add a second box if you want the household to share it.",
        },
        {
          title: "New Year gifts for friends",
          text: "Friendship makes the celebration brighter. Send a chocolate box, a small dry-fruit box, or a hamper to welcome 2027. Shipping stays domestic.",
        },
        {
          title: "New Year gifts for brother and sister",
          text: "Chocolates, sweets, and festive hampers are a lovely way to celebrate your bond, including Bhai Dooj sets that are still in stock.",
        },
      ],
    },
    {
      id: "from-anywhere",
      heading: "Send New Year Gifts to USA from Anywhere with UsaRakhi",
      paragraphs: [
        "Living far away from your loved ones does not mean missing their celebration. Whether you are in India or another part of the world, you can share New Year wishes with family and friends in the United States.",
        "UsaRakhi checkout is the usual flow: Razorpay for USD and INR, including UPI, and Stripe for USD cards. The hamper ships from within the United States.",
        "Celebrate the arrival of 2027 with a gift that is in stock now. Order in December so the parcel is not squeezed against Christmas and New Year carrier holidays.",
      ],
    },
    {
      id: "why-usarakhi",
      heading: "Why Choose UsaRakhi for New Year Gift Delivery in USA?",
      paragraphs: [],
      points: [
        {
          title: "Thoughtful gift collection",
          text: "Chocolates, dry fruits, sweets, festive hampers, and pooja sets that currently have inventory for New Year delivery.",
        },
        {
          title: "Convenient online ordering",
          text: "Select your preferred gift and place your order online. Add to cart keeps browsing. Buy now opens checkout with that gift.",
        },
        {
          title: "Surprise your loved ones",
          text: "Send a meaningful present to family and friends living across the United States while you order from anywhere.",
        },
        {
          title: "Gifts for parents, siblings, friends, and partners",
          text: "The same catalog covers a hamper for parents, chocolates for a partner, and a sweet or nut box for a sibling or friend.",
        },
        {
          title: "Celebrate from anywhere",
          text: "Share your love and New Year wishes even when you cannot celebrate together. Standard USA delivery is 5 business days with free shipping.",
        },
      ],
    },
  ],
  faqHeading: "Frequently Asked Questions About New Year Gifts to USA",
  faqs: [
    {
      q: "Can I send New Year gifts to USA from anywhere?",
      a: "Yes. Order on this page from India or abroad, pay in INR with Razorpay (including UPI) or in USD, and enter a United States address. The gift ships from within the United States.",
    },
    {
      q: "What are the best New Year gifts to send to the USA?",
      a: "Chocolate gift boxes, dry fruit and nut boxes, sweet boxes, and festive hampers or pooja sets that are in stock on this page. Read the included list, then choose the box the recipient will open.",
    },
    {
      q: "Can I send New Year chocolates to USA online?",
      a: "Yes. The chocolate section lists in-stock boxes, including Ferrero Rocher, M&M’s, and Skittles. Delivery is domestic USA shipping for the address you enter.",
    },
    {
      q: "What New Year gift hampers can I order?",
      a: "Festive hampers, sweet boxes, and dry fruit boxes that currently have inventory. Diwali and Bhai Dooj sets stay labeled with their real names, because that is what we ship. Sold-out items are left off this page.",
    },
    {
      q: "What are some affordable New Year gift ideas?",
      a: "Smaller chocolate boxes and the smaller dry-fruit boxes on this page. The price on each card is the current price in the currency you have selected.",
    },
    {
      q: "How can I surprise my family in USA on New Year?",
      a: "Order an in-stock chocolate, dry fruit, sweet box, or hamper and use Buy now to open checkout. New Year’s Day is Friday, January 1, 2027. Order in mid-December so the parcel is not left against Christmas and New Year carrier holidays. We do not guarantee a specific arrival date.",
    },
    {
      q: "Can I send New Year gifts to different cities in the USA?",
      a: "Yes. Gift boxes ship domestically to US addresses, including California, New York, Texas, Florida, and New Jersey. Use a separate order for each delivery address.",
    },
  ],
  otherOccasion: {
    href: "/christmas",
    label: "Shop Christmas gifts",
    text: "Chocolates, dry fruits, sweets, and gift hampers for Christmas Day on Friday, December 25, 2026.",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const products = (await loadSeasonalCatalog()).filter(isNewYearGift);
  const ogImage = products[0]?.images?.[0] ? resolveImageUrl(products[0].images[0]) : undefined;
  return pageMetadata({
    title: "New Year Gifts to USA - Celebrate New Beginnings",
    description:
      "Send New Year gifts to USA from anywhere. Explore chocolates, dry fruits, sweets, and gift hampers with UsaRakhi for 2027.",
    path: "/new-year",
    keywords:
      "New Year gifts to USA, send New Year gifts to USA, New Year gift delivery in USA, New Year gifts online USA, New Year chocolates, New Year gift hampers, New Year gifts for family, New Year gifts for friends, New Year 2027, UsaRakhi",
    ...(ogImage ? { ogImage } : {}),
  });
}

export default async function NewYearPage() {
  const products = (await loadSeasonalCatalog()).filter(isNewYearGift);
  return <SeasonalOccasionLanding copy={copy} products={products} />;
}
