import { resolveProductImageUrl } from "@hr-ecom/shared";

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

/** Homepage photo strip — one tile per festive hamper. */
export const CATEGORY_SHOP_ICONS: CategoryShopIcon[] = [
  {
    id: "bhai-dooj-kaju-katli-and-kumkum-gift-box",
    label: "Kaju Katli & Kumkum Gift Box",
    href: "/products/bhai-dooj-kaju-katli-and-kumkum-gift-box",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2601/TFUSBD2601_1.jpg"),
    imageAlt: "Bhai Dooj Kaju Katli & Kumkum Gift Box",
  },
  {
    id: "bhai-dooj-almonds-and-pistachios-gift-box",
    label: "Almonds & Pistachios Gift Box",
    href: "/products/bhai-dooj-almonds-and-pistachios-gift-box",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2602/TFUSBD2602_1.jpg"),
    imageAlt: "Bhai Dooj Almonds & Pistachios Gift Box",
  },
  {
    id: "bhai-dooj-kaju-katli-and-ferrero-rocher-box",
    label: "Kaju Katli & Ferrero Rocher Box",
    href: "/products/bhai-dooj-kaju-katli-and-ferrero-rocher-box",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2603/TFUSBD2603_1.jpg"),
    imageAlt: "Bhai Dooj Kaju Katli & Ferrero Rocher Box",
  },
  {
    id: "bhai-dooj-kaju-katli-almonds-and-kumkum-hamper",
    label: "Kaju Katli, Almonds & Kumkum Hamper",
    href: "/products/bhai-dooj-kaju-katli-almonds-and-kumkum-hamper",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2604/TFUSBD2604_1.jpg"),
    imageAlt: "Bhai Dooj Kaju Katli, Almonds & Kumkum Hamper",
  },
  {
    id: "bhai-dooj-kaju-katli-and-cashew-gift-box",
    label: "Kaju Katli & Cashew Gift Box",
    href: "/products/bhai-dooj-kaju-katli-and-cashew-gift-box",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2605/TFUSBD2605_1.jpg"),
    imageAlt: "Bhai Dooj Kaju Katli & Cashew Gift Box",
  },
  {
    id: "bhai-dooj-mixed-dry-fruits-gift-box-266-g",
    label: "Mixed Dry Fruits Gift Box (266 g)",
    href: "/products/bhai-dooj-mixed-dry-fruits-gift-box-266-g",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2606/TFUSBD2606_1.jpg"),
    imageAlt: "Bhai Dooj Mixed Dry Fruits Gift Box (266 g)",
  },
  {
    id: "bhai-dooj-mixed-dry-fruits-gift-box-131-g",
    label: "Mixed Dry Fruits Gift Box (131 g)",
    href: "/products/bhai-dooj-mixed-dry-fruits-gift-box-131-g",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2607/TFUSBD2607_1.jpg"),
    imageAlt: "Bhai Dooj Mixed Dry Fruits Gift Box (131 g)",
  },
  {
    id: "bhai-dooj-ferrero-almonds-and-kumkum-box",
    label: "Ferrero, Almonds & Kumkum Box",
    href: "/products/bhai-dooj-ferrero-almonds-and-kumkum-box",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2608/TFUSBD2608_1.jpg"),
    imageAlt: "Bhai Dooj Ferrero, Almonds & Kumkum Box",
  },
  {
    id: "bhai-dooj-pistachio-gift-box",
    label: "Pistachio Gift Box",
    href: "/products/bhai-dooj-pistachio-gift-box",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2609/TFUSBD2609_1.jpg"),
    imageAlt: "Bhai Dooj Pistachio Gift Box",
  },
  {
    id: "bhai-dooj-puja-thali-and-pistachio-set",
    label: "Puja Thali & Pistachio Set",
    href: "/products/bhai-dooj-puja-thali-and-pistachio-set",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2610/TFUSBD2610_1.jpg"),
    imageAlt: "Bhai Dooj Puja Thali & Pistachio Set",
  },
  {
    id: "bhai-dooj-skittles-chocolate-gift",
    label: "Skittles Chocolate Gift",
    href: "/products/bhai-dooj-skittles-chocolate-gift",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2611/TFUSBD2611_1.jpg"),
    imageAlt: "Bhai Dooj Skittles Chocolate Gift",
  },
  {
    id: "bhai-dooj-skittles-and-mixed-nuts-box",
    label: "Skittles & Mixed Nuts Box",
    href: "/products/bhai-dooj-skittles-and-mixed-nuts-box",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2612/TFUSBD2612.jpg"),
    imageAlt: "Bhai Dooj Skittles & Mixed Nuts Box",
  },
  {
    id: "bhai-dooj-m-and-ms-and-ferrero-rocher-box",
    label: "M&M's & Ferrero Rocher Box",
    href: "/products/bhai-dooj-m-and-ms-and-ferrero-rocher-box",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2613/TFUSBD2613_1.jpg"),
    imageAlt: "Bhai Dooj M&M's & Ferrero Rocher Box",
  },
  {
    id: "bhai-dooj-m-and-ms-chocolate-gift",
    label: "M&M's Chocolate Gift",
    href: "/products/bhai-dooj-m-and-ms-chocolate-gift",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2614/TFUSBD2614_1.jpg"),
    imageAlt: "Bhai Dooj M&M's Chocolate Gift",
  },
  {
    id: "bhai-dooj-pooja-set-with-kaju-katli-and-cashews",
    label: "Pooja Set with Kaju Katli & Cashews",
    href: "/products/bhai-dooj-pooja-set-with-kaju-katli-and-cashews",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2615/TFUSBD2615_1.jpg"),
    imageAlt: "Bhai Dooj Pooja Set with Kaju Katli & Cashews",
  },
  {
    id: "bhai-dooj-pooja-set-with-besan-laddoo",
    label: "Pooja Set with Besan Laddoo",
    href: "/products/bhai-dooj-pooja-set-with-besan-laddoo",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2616/TFUSBD2616_1.jpg"),
    imageAlt: "Bhai Dooj Pooja Set with Besan Laddoo",
  },
  {
    id: "bhai-dooj-m-and-ms-and-markers-kids-gift",
    label: "M&M's & Markers Kids Gift",
    href: "/products/bhai-dooj-m-and-ms-and-markers-kids-gift",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2617/TFUSBD2617_1.jpg"),
    imageAlt: "Bhai Dooj M&M's & Markers Kids Gift",
  },
  {
    id: "bhai-dooj-mixed-nuts-gift-box",
    label: "Mixed Nuts Gift Box",
    href: "/products/bhai-dooj-mixed-nuts-gift-box",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2618/TFUSBD2618_1.jpg"),
    imageAlt: "Bhai Dooj Mixed Nuts Gift Box",
  },
  {
    id: "bhai-dooj-m-and-ms-and-skittles-gift-box",
    label: "M&M's & Skittles Gift Box",
    href: "/products/bhai-dooj-m-and-ms-and-skittles-gift-box",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2619/TFUSBD2619_1.jpg"),
    imageAlt: "Bhai Dooj M&M's & Skittles Gift Box",
  },
  {
    id: "diwali-toran-rangoli-and-besan-laddoo-hamper",
    label: "Toran, Rangoli & Besan Laddoo Hamper",
    href: "/products/diwali-toran-rangoli-and-besan-laddoo-hamper",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSDW2620/TFUSDW2620_1.jpg"),
    imageAlt: "Diwali Toran, Rangoli & Besan Laddoo Hamper",
  },
  {
    id: "diwali-metal-pooja-set-and-besan-laddoo-hamper",
    label: "Metal Pooja Set & Besan Laddoo Hamper",
    href: "/products/diwali-metal-pooja-set-and-besan-laddoo-hamper",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSDW2621/TFUSDW2621_1.jpg"),
    imageAlt: "Diwali Metal Pooja Set & Besan Laddoo Hamper",
  },
  {
    id: "diwali-metal-pooja-set-with-kaju-katli",
    label: "Metal Pooja Set with Kaju Katli",
    href: "/products/diwali-metal-pooja-set-with-kaju-katli",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSDW2622/TFUSDW2622_1.jpg"),
    imageAlt: "Diwali Metal Pooja Set with Kaju Katli",
  },
  {
    id: "diwali-shubh-labh-rangoli-and-dry-fruit-set",
    label: "Shubh Labh, Rangoli & Dry Fruit Set",
    href: "/products/diwali-shubh-labh-rangoli-and-dry-fruit-set",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSDW2623/TFUSDW2623_1.jpg"),
    imageAlt: "Diwali Shubh Labh, Rangoli & Dry Fruit Set",
  },
  {
    id: "diwali-pooja-set-with-ferrero-and-almonds",
    label: "Pooja Set with Ferrero & Almonds",
    href: "/products/diwali-pooja-set-with-ferrero-and-almonds",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSDW2624/TFUSDW2624_1.jpg"),
    imageAlt: "Diwali Pooja Set with Ferrero & Almonds",
  },
  {
    id: "diwali-metal-pooja-set-with-kaju-katli-and-pistachios",
    label: "Metal Pooja Set with Kaju Katli & Pistachios",
    href: "/products/diwali-metal-pooja-set-with-kaju-katli-and-pistachios",
    imageSrc: iconSrc("https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSDW2625/TFUSDW2625_1.jpg"),
    imageAlt: "Diwali Metal Pooja Set with Kaju Katli & Pistachios",
  },
];
