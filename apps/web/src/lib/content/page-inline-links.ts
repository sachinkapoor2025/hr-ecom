import { categoryHref } from "@/lib/category-urls";

export const homepageInlineLinks = [
  { phrase: "send rakhi to USA", href: categoryHref("kids-rakhi") },
  { phrase: "buy rakhi online USA from India", href: categoryHref("bhaiya-bhabhi-rakhi") },
  { phrase: "rakhi gift hamper", href: categoryHref("rakhi-hampers") },
] as const;

export const categoryPageInlineLinks: Record<string, readonly { phrase: string; href: string }[]> = {
  "single-rakhi": [{ phrase: "buy designer rakhi online usa", href: categoryHref("lumba-rakhi") }],
  "bhaiya-bhabhi-rakhi": [{ phrase: "send rakhi to USA", href: "/" }],
  "kids-rakhi": [{ phrase: "sending rakhi to USA from India", href: categoryHref("rakhi-combo") }],
  "lumba-rakhi": [{ phrase: "buy rakhi online USA", href: categoryHref("single-rakhi") }],
  "rakhi-combo": [{ phrase: "rakhi gift hamper", href: categoryHref("rakhi-hampers") }],
  "rakhi-hampers": [
    { phrase: "Rakhi Combos", href: categoryHref("rakhi-combo") },
    { phrase: "Single Rakhi", href: categoryHref("single-rakhi") },
    { phrase: "Kids Rakhi", href: categoryHref("kids-rakhi") },
  ],
};

export const rakshaBandhanInlineLinks = [
  { phrase: "sending a Rakhi to USA", href: "/shop" },
] as const;
