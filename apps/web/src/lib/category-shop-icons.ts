import { cdnUploadUrl, resolveProductImageUrl } from "@hr-ecom/shared";
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

/**
 * FNP-style “shop by category” icons on the homepage.
 * Each tile opens the matching category or collection of related products.
 */
export const CATEGORY_SHOP_ICONS: CategoryShopIcon[] = [
  {
    id: "set-of-2",
    label: "Set of 2 Rakhi",
    href: categoryHref("2-set-rakhi"),
    imageSrc: iconSrc("/uploads/orange-county/TFPRD00315-337/TFPRD00315-337-SETOF2.jpg"),
    imageAlt: "Set of 2 designer Rakhis",
  },
  {
    id: "with-sweets",
    label: "With Sweets",
    href: "/collections/rakhi-with-sweets",
    imageSrc: iconSrc("/uploads/orange-county/TFUSRH2026-38/TFUSRH2026-38a.jpg"),
    imageAlt: "Rakhi gift hamper with sweets",
  },
  {
    id: "with-chocolates",
    label: "With Chocolates",
    href: "/collections/rakhi-with-chocolates",
    imageSrc: cdnUploadUrl("2026/05/fercho.png"),
    imageAlt: "Rakhi with Ferrero Rocher chocolates",
  },
  {
    id: "with-dryfruits",
    label: "With Dryfruits",
    href: "/collections/rakhi-with-dryfruits",
    imageSrc: iconSrc("/uploads/orange-county/TFUSA003/TFUSA003A.jpg"),
    imageAlt: "Rakhi with dry fruits and nuts",
  },
  {
    id: "single-rakhi",
    label: "Single Rakhi",
    href: categoryHref("single-rakhi"),
    imageSrc: cdnUploadUrl("2026/03/Om-Single-Rakhi-1-e1779466859856.png"),
    imageAlt: "Single designer Om Rakhi",
  },
  {
    id: "bhaiya-bhabhi",
    label: "For Bhaiya Bhabhi",
    href: categoryHref("bhaiya-bhabhi-rakhi"),
    imageSrc: cdnUploadUrl("2026/04/Bhai-Bhabhi-Lumba-Rakhi-Set-e1776082926101.jpg"),
    imageAlt: "Bhaiya Bhabhi Rakhi set",
  },
  {
    id: "rakhi-combos",
    label: "Rakhi Combos",
    href: categoryHref("rakhi-combo"),
    imageSrc: cdnUploadUrl("2026/04/Chhota-Bheem-Kids-Rakhi-with-Assorted-Chocolates-e1775565435556.jpg"),
    imageAlt: "Rakhi combo gift pack",
  },
  {
    id: "rakhi-sets",
    label: "Rakhi Sets",
    href: "/collections/rakhi-sets",
    imageSrc: iconSrc("/uploads/orange-county/MD005SET5/MD005SET5.jpg"),
    imageAlt: "Multi-piece Rakhi sets",
  },
];
