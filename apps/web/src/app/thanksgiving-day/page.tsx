import type { Metadata } from "next";
import { SeasonalOccasionLanding, type SeasonalPageCopy } from "@/components/SeasonalOccasionLanding";
import { categoryHref } from "@/lib/category-urls";
import { resolveImageUrl } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";
import {
  isThanksgivingChocolateGift,
  isThanksgivingPantryGift,
  loadSeasonalCatalog,
} from "@/lib/seasonal-gifts";

const copy: SeasonalPageCopy = {
  path: "/thanksgiving-day",
  breadcrumb: "Thanksgiving Day",
  eyebrow: "Thanksgiving Day gifts",
  h1: "Thanksgiving Day Gifts Delivered Across the USA",
  lead:
    "Send dry fruits, nuts, sweets, and chocolate gift boxes to family in America. Every box on this page is in stock at UsaRakhi and ships from within the United States.",
  dateLabel: "Thanksgiving Day 2026",
  dateValue: "Thursday, November 26",
  dateNote: "Order this week — standard delivery is 5 business days",
  tone: "thanksgiving",
  intro: [
    "Thanksgiving Day 2026 is Thursday, November 26. When you cannot share the meal in person, a box of dry fruits, nuts, or chocolates still gives the household something to open and pass around the table.",
    "The gifts below are pulled from the live UsaRakhi catalog. They are Bhai Dooj gifts and other in-stock food boxes we already pack for domestic USA delivery. Names, photos, and prices match the product pages.",
    "Use Add to cart if you want more than one box, or Buy now to open the same checkout as the rest of the site. You can pay in USD or INR. Planning ahead for January, the New Year page lists celebration boxes from this same catalog.",
  ],
  introLinks: [
    { phrase: "Bhai Dooj gifts", href: categoryHref("bhai-dooj") },
    { phrase: "domestic USA delivery", href: "/shipping" },
    { phrase: "New Year page", href: "/new-year" },
    { phrase: "product pages", href: "/products" },
  ],
  sections: [
    {
      id: "dry-fruits",
      heading: "Dry fruits, nuts, and sweets for the table",
      intro:
        "Almonds, pistachios, mixed nuts, and sweet boxes from the current catalog. Each card links to the product page, where the included items are listed.",
      match: isThanksgivingPantryGift,
    },
    {
      id: "chocolates",
      heading: "Chocolate gift boxes",
      intro:
        "Chocolate assortments that are in stock now, including Ferrero Rocher, M&M’s, and Skittles boxes. A chocolate box is an easy host gift when you are not bringing a dish.",
      match: isThanksgivingChocolateGift,
    },
  ],
  bannerHeading: "A real box, ready to ship",
  bannerText:
    "This gift is in the catalog today. Add it to your cart or buy it now — checkout, currency, and payment stay the same as every other UsaRakhi order.",
  faqs: [
    {
      q: "When is Thanksgiving Day 2026?",
      a: "Thanksgiving Day 2026 is Thursday, November 26. UsaRakhi ships inside the United States. Standard delivery is 5 business days with free shipping, so ordering in the week of November 16 leaves a clearer window before the holiday. Carrier schedules can still add a day, and we do not promise a guaranteed arrival date.",
    },
    {
      q: "What Thanksgiving gifts can I order from UsaRakhi?",
      a: "Dry fruit boxes, mixed nuts, almonds, pistachios, sweet boxes, and chocolate gift boxes that are in stock on this page. Open a product to see the photo and the exact contents.",
    },
    {
      q: "Are these the same products as the rest of the website?",
      a: "Yes. The cards use the live catalog: current price, current photo, and current inventory. If a box sells out, it drops off this page. You can also browse Bhai Dooj gift boxes and Diwali hampers for the full festive range.",
    },
    {
      q: "How do Add to cart and Buy now work?",
      a: "Add to cart places the gift in your cart so you can keep shopping. Buy now adds that gift if it is not already in the cart and opens the standard UsaRakhi checkout. Payment is Razorpay for USD and INR, including UPI, or Stripe for USD cards.",
    },
    {
      q: "Can family in India pay in INR for a US delivery address?",
      a: "Yes. Checkout supports Razorpay in USD and INR, including UPI, and Stripe for USD cards. The price on the card follows the currency selected on the site. The recipient address is a United States address.",
    },
    {
      q: "Which states can receive a Thanksgiving gift box?",
      a: "Orders ship domestically to US addresses, including California, New York, Texas, Florida, and New Jersey. The package does not wait on international customs because it ships from within the United States.",
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
  const products = (await loadSeasonalCatalog()).filter(
    (product) => isThanksgivingPantryGift(product) || isThanksgivingChocolateGift(product)
  );
  const ogImage = products[0]?.images?.[0] ? resolveImageUrl(products[0].images[0]) : undefined;
  return pageMetadata({
    title: "Thanksgiving Day Gifts to USA",
    description:
      "Order Thanksgiving gift boxes for USA delivery. In-stock dry fruits, nuts, sweets, and chocolates ship domestically in 5 business days with free shipping.",
    path: "/thanksgiving-day",
    keywords:
      "Thanksgiving gifts USA, Thanksgiving gift boxes, send Thanksgiving gifts to USA, dry fruit gift box USA, chocolate gift box Thanksgiving, UsaRakhi",
    ...(ogImage ? { ogImage } : {}),
  });
}

export default async function ThanksgivingDayPage() {
  const products = (await loadSeasonalCatalog()).filter(
    (product) => isThanksgivingPantryGift(product) || isThanksgivingChocolateGift(product)
  );
  return <SeasonalOccasionLanding copy={copy} products={products} />;
}
