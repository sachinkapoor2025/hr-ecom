import { resolveProductImageUrl } from "@hr-ecom/shared";
import { categoryHref } from "@/lib/category-urls";

export type CategoryShopIcon = {
  id: string;
  label: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

function iconSrc(pathOrCdn: string): string {
  return resolveProductImageUrl(pathOrCdn) || pathOrCdn;
}

const CDN = "https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county";

/** Homepage shop-by-category tiles for the festive catalog. */
export const CATEGORY_SHOP_ICONS: CategoryShopIcon[] = [
  {
    id: "bhai-dooj",
    label: "Bhai Dooj",
    href: categoryHref("bhai-dooj"),
    imageSrc: iconSrc(`${CDN}/TFUSBD2601/TFUSBD2601_1.jpg`),
    imageAlt: "Bhai Dooj gift hamper",
  },
  {
    id: "diwali",
    label: "Diwali",
    href: categoryHref("diwali"),
    imageSrc: iconSrc(`${CDN}/TFUSDW2620/TFUSDW2620_1.jpg`),
    imageAlt: "Diwali gift hamper",
  },
  {
    id: "sweets",
    label: "With Sweets",
    href: "/products?search=kaju",
    imageSrc: iconSrc(`${CDN}/TFUSBD2603/TFUSBD2603_1.jpg`),
    imageAlt: "Festive gift with kaju katli",
  },
  {
    id: "dry-fruits",
    label: "Dry Fruits",
    href: "/products?search=pistachio",
    imageSrc: iconSrc(`${CDN}/TFUSBD2606/TFUSBD2606_1.jpg`),
    imageAlt: "Dry fruit gift box",
  },
  {
    id: "chocolates",
    label: "Chocolates",
    href: "/products?search=ferrero",
    imageSrc: iconSrc(`${CDN}/TFUSBD2613/TFUSBD2613_1.jpg`),
    imageAlt: "Chocolate gift box",
  },
  {
    id: "pooja",
    label: "Pooja Sets",
    href: "/products?search=pooja",
    imageSrc: iconSrc(`${CDN}/TFUSDW2621/TFUSDW2621_1.jpg`),
    imageAlt: "Diwali pooja gift set",
  },
];
