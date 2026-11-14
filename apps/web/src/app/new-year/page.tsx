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
  eyebrow: "New Year gifts",
  h1: "New Year Gift Boxes Delivered Across the USA",
  lead:
    "Start the year with chocolate, dry fruits, or a festive hamper delivered inside the United States. Every product on this page is in stock and already sold on UsaRakhi.",
  dateLabel: "New Year’s Day",
  dateValue: "Friday, January 1, 2027",
  dateNote: "Order in December — standard delivery is 5 business days",
  tone: "new-year",
  intro: [
    "New Year’s Day is Friday, January 1, 2027. A chocolate box or a dry fruit box is a simple way to greet family in the USA when you will not be in the same house at midnight. Delivery is domestic USA shipping.",
    "These are live catalog gifts: chocolate assortments, nut and sweet boxes, plus Diwali hampers and Bhai Dooj sets that are still in stock. Product names stay as they are in the shop, and each page lists what is packed inside.",
    "Add to cart and Buy now use the same cart, currency switcher, and checkout as the rest of UsaRakhi. If you still need a box for the November table, the Thanksgiving Day page is the food-gift edit of this catalog.",
  ],
  introLinks: [
    { phrase: "Diwali hampers", href: categoryHref("diwali") },
    { phrase: "Bhai Dooj sets", href: categoryHref("bhai-dooj") },
    { phrase: "domestic USA shipping", href: "/shipping" },
    { phrase: "Thanksgiving Day page", href: "/thanksgiving-day" },
  ],
  sections: [
    {
      id: "chocolates",
      heading: "Chocolate boxes for New Year",
      intro:
        "In-stock chocolate gifts, including Ferrero Rocher, M&M’s, and Skittles boxes. They work as a host gift or a parcel for someone you cannot toast in person.",
      match: isNewYearChocolateGift,
    },
    {
      id: "dry-fruits",
      heading: "Dry fruits and sweets for a fresh start",
      intro:
        "Almonds, pistachios, mixed nuts, and sweet boxes from the current catalog. Dry fruit boxes are a familiar way to wish someone a prosperous year.",
      match: isNewYearPantryGift,
    },
    {
      id: "festive-hampers",
      heading: "Festive hampers and pooja sets",
      intro:
        "Diwali hampers and pooja sets that are still available to order. They are labeled with their real product names, including Bhai Dooj and Diwali sets, because that is what we ship.",
      match: isNewYearFestiveGift,
    },
  ],
  bannerHeading: "Send a box before the year turns",
  bannerText:
    "The featured gift is in stock now. Buy now opens the standard checkout, with Razorpay for USD and INR and Stripe for USD cards.",
  faqs: [
    {
      q: "When should I order New Year gifts for USA delivery?",
      a: "New Year’s Day is Friday, January 1, 2027. Standard USA delivery is 5 business days with free shipping. Order in mid-December so the parcel is not squeezed against Christmas and New Year carrier holidays. We do not guarantee a specific arrival date.",
    },
    {
      q: "What New Year gifts does UsaRakhi have in stock?",
      a: "Chocolate gift boxes, dry fruit and nut boxes, sweet boxes, and festive hampers or pooja sets that currently have inventory. This page only shows products that can be purchased. Sold-out items are left off.",
    },
    {
      q: "Are the festive hampers New Year themed?",
      a: "They are the Diwali hampers, Bhai Dooj sets, and pooja sets already in the UsaRakhi catalog. We list them here because a festive food or pooja box is what many families send to mark the new year, and the product title tells you exactly which set it is.",
    },
    {
      q: "Can I add a New Year gift and check out immediately?",
      a: "Yes. Buy now adds the selected gift to your cart and opens the same checkout used on every product page. Add to cart keeps the gift in the cart if you want to choose another box first. Prices follow the site currency switcher.",
    },
    {
      q: "Which payment methods work on these gifts?",
      a: "The existing UsaRakhi checkout: Razorpay for USD and INR, including UPI, and Stripe for USD cards. Nothing on this page uses a separate payment flow.",
    },
    {
      q: "Do you deliver New Year gifts to every US state?",
      a: "Yes. Gift boxes ship domestically to US addresses, including California, New York, Texas, Florida, and New Jersey. Shipping from within the United States means the recipient’s package does not clear international customs.",
    },
  ],
  otherOccasion: {
    href: "/thanksgiving-day",
    label: "Shop Thanksgiving gifts",
    text: "Dry fruits, nuts, sweets, and chocolate boxes for Thanksgiving Day on Thursday, November 26, 2026.",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const products = (await loadSeasonalCatalog()).filter(isNewYearGift);
  const ogImage = products[0]?.images?.[0] ? resolveImageUrl(products[0].images[0]) : undefined;
  return pageMetadata({
    title: "New Year Gifts to USA",
    description:
      "Order New Year gift boxes for USA delivery. In-stock chocolates, dry fruits, sweets, and festive hampers ship domestically in 5 business days with free shipping.",
    path: "/new-year",
    keywords:
      "New Year gifts USA, New Year gift boxes, send New Year gifts to USA, chocolate gift box New Year, dry fruit hamper USA, UsaRakhi",
    ...(ogImage ? { ogImage } : {}),
  });
}

export default async function NewYearPage() {
  const products = (await loadSeasonalCatalog()).filter(isNewYearGift);
  return <SeasonalOccasionLanding copy={copy} products={products} />;
}
