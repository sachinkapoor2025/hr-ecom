import { categoryHref } from "@/lib/category-urls";

export const homepageInlineLinks = [
  { phrase: "send rakhi to USA", href: categoryHref("kids-rakhi") },
  { phrase: "buy rakhi online USA from India", href: categoryHref("bhaiya-bhabhi-rakhi") },
] as const;

export const categoryPageInlineLinks: Record<string, readonly { phrase: string; href: string }[]> = {
  "single-rakhi": [{ phrase: "buy designer rakhi online usa", href: categoryHref("lumba-rakhi") }],
  "bhaiya-bhabhi-rakhi": [{ phrase: "send rakhi to USA", href: "/" }],
  "kids-rakhi": [{ phrase: "sending rakhi to USA from India", href: categoryHref("rakhi-combo") }],
  "lumba-rakhi": [{ phrase: "buy rakhi online USA", href: categoryHref("single-rakhi") }],
};

export const rakshaBandhanInlineLinks = [
  { phrase: "sending a Rakhi to USA", href: "/shop" },
] as const;
