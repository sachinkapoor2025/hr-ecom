import { USARAKHI_MIN_ORDER_USD } from "@hr-ecom/shared";
import { categoryHref } from "@/lib/category-urls";

const freeShippingMinimum = `$${USARAKHI_MIN_ORDER_USD}`;

/** Page-specific guide copy for `/collections/[slug]`. Shown below the product grid. */
export type CollectionGuide = {
  heading: string;
  paragraphs: string[];
  pointsHeading: string;
  points: string[];
  links: { href: string; label: string }[];
};

export const collectionGuides: Record<string, CollectionGuide> = {
  "rakhi-sets": {
    heading: "How to choose a Rakhi set for brothers in the USA",
    paragraphs: [
      "A Rakhi set is the practical choice when one thread is not enough. This page gathers multi-piece packs — sets of two, three, four, or five — plus combo listings that already bundle more than a single rakhi. Sisters use them when several brothers share one household, or when they want a spare design for the Raksha Bandhan video call.",
      `Each card on this page is a live catalog item with its own price and photos. UsaRakhi ships these orders inside the United States, so your brother receives a domestic package. Most rakhis include roli and chawal for the tilak. Standard delivery is 5–7 business days, with free shipping once the cart reaches the ${freeShippingMinimum} minimum.`,
    ],
    pointsHeading: "When a set is a better fit than a single rakhi",
    points: [
      "Two or more brothers at the same US address",
      "A matching pair for Bhaiya and a separate thread for a younger brother",
      "A designer mix when you are not sure which style he will prefer",
    ],
    links: [
      { href: categoryHref("2-set-rakhi"), label: "Set of 2 Rakhis" },
      { href: categoryHref("rakhi-combo"), label: "Rakhi with chocolates" },
      { href: "/shipping", label: "USA shipping details" },
    ],
  },
  "rakhi-with-sweets": {
    heading: "Rakhi with sweets for a fuller Raksha Bandhan box",
    paragraphs: [
      "This collection lists rakhis and hampers whose names or descriptions mention sweets, mithai, or kaju katli. It is meant for sisters who want the thread and a festive sweet in the same order, rather than sending only a bracelet-style rakhi.",
      "Read each product’s included list before you add it to the cart. Sweet boxes vary by listing — some are kaju katli hampers, others mention mithai more generally. We do not add sweets that are not shown on the product. Delivery stays domestic within the USA, typically 5–7 business days.",
    ],
    pointsHeading: "What to check on a sweets listing",
    points: [
      "The product title and description name the sweet that is actually packed",
      "The hamper page is the right place when you want a full gift box, not only a thread",
      "A brother’s US street address, city, state, and ZIP are required at checkout",
    ],
    links: [
      { href: categoryHref("rakhi-hampers"), label: "Rakhi hampers" },
      { href: "/blog/rakhi-hamper-gift-box-usa", label: "Hamper gift guide" },
    ],
  },
  "rakhi-with-chocolates": {
    heading: "Rakhi with chocolates brothers in America already know",
    paragraphs: [
      "Chocolate combos are the most common “send something extra” request we see for USA addresses. This page shows rakhi combos and any listing that mentions chocolate, including familiar names such as Ferrero Rocher, Lindt, and Hershey’s when those brands appear on the product itself.",
      "Treat the product card as the source of truth for which chocolate is packed. A combo is not a custom box you assemble at checkout unless the listing says so. Payment can be completed in USD or INR with Razorpay, including UPI for sisters ordering from India.",
    ],
    pointsHeading: "A simple way to compare chocolate rakhis",
    points: [
      "Match the chocolate brand on the card to what your brother actually likes",
      "Combo listings are built as gift sets; single rakhis on other pages are thread-only",
      "Order with enough time for 5–7 business day domestic shipping before Raksha Bandhan",
    ],
    links: [
      { href: categoryHref("rakhi-combo"), label: "Rakhi combo category" },
      { href: "/blog/best-rakhi-combo-with-chocolates", label: "Chocolate combo guide" },
    ],
  },
  "rakhi-with-dryfruits": {
    heading: "Rakhi with dry fruits for a practical festive gift",
    paragraphs: [
      "Dry-fruit rakhis and hampers suit brothers who would rather open almonds, cashews, pistachios, or a mixed-nut box than a large sweet hamper. This page only includes products whose name, description, or tags mention dry fruits or nuts.",
      "Portion and mix differ by product. If a listing does not name a specific nut, do not assume a particular blend is inside. Packaging is festival-oriented, and the parcel ships from within the United States to the address you enter.",
    ],
    pointsHeading: "Who this collection is for",
    points: [
      "Brothers who prefer nuts over chocolates or mithai",
      "A combined rakhi-and-snack gift for an office or apartment delivery",
      "Sisters comparing hamper-style boxes with a clear what’s-included list",
    ],
    links: [
      { href: categoryHref("rakhi-hampers"), label: "Browse hampers" },
      { href: "/products", label: "All rakhis" },
    ],
  },
  "personalized-rakhi": {
    heading: "Personalized and name-style rakhis in the catalog",
    paragraphs: [
      "This page filters the catalog for rakhis described as personal, custom, or name-style. It is a browsing aid, not a made-to-order engraving desk. If a design can carry a name or a keepsake detail, that detail is stated on the product itself.",
      "Before checkout, read the description so you know whether any personalization is already part of the design or simply a style name. Orders still ship domestically in the USA in the standard 5–7 business day window, with roli and chawal on most rakhis.",
    ],
    pointsHeading: "How to use this page",
    points: [
      "Open a product and confirm what “personal” or “name” means for that design",
      "If nothing listed matches, a classic single rakhi is the straightforward alternative",
      "Use the contact form if you need help reading a listing before you pay",
    ],
    links: [
      { href: categoryHref("single-rakhi"), label: "Single rakhi" },
      { href: "/contact", label: "Ask about a listing" },
    ],
  },
  "premium-rakhi": {
    heading: "Premium rakhis and higher-value gift sets",
    paragraphs: [
      "Premium on this page means a higher listed price, a hamper, or a product described as premium or luxury. The grid is sorted with higher prices first so you can compare elevated styles without scrolling the entire shop.",
      "A higher price does not change the shipping method. These orders still go out as domestic US parcels. Use the product description for materials and what is packed — pearls, stones, or a hamper — rather than assuming every premium card is the same kind of gift.",
    ],
    pointsHeading: "What “premium” covers here",
    points: [
      "Designer rakhis listed at $20 and above",
      "Rakhi hampers with sweets or dry fruits when those products are published",
      "Gift sets whose own description uses premium or luxury language",
    ],
    links: [
      { href: categoryHref("rakhi-hampers"), label: "Hampers" },
      { href: "/collections/designer-rakhis", label: "Designer rakhis" },
    ],
  },
  "rakhi-for-brother": {
    heading: "Rakhi for brother — singles, combos, and hampers",
    paragraphs: [
      "“Rakhi for brother” is the broadest gift search on UsaRakhi. This collection brings together single rakhis, chocolate combos, and hampers so you can choose a thread-only gift or a fuller box for the same brother in the United States.",
      "If he is the only recipient, a single rakhi with roli and chawal is usually enough for the ceremony. Add a combo or hamper when you want chocolates, sweets, or dry fruits in the same delivery. Enter his US address at checkout; we do not ship the parcel internationally to him.",
    ],
    pointsHeading: "A quick decision guide",
    points: [
      "Thread only — start with single rakhi",
      "Thread plus chocolate — use a combo listing",
      "A larger festive box — compare hampers and read the included items",
    ],
    links: [
      { href: categoryHref("single-rakhi"), label: "Single rakhi to USA" },
      { href: "/send-rakhi-from-india", label: "Ordering from India" },
    ],
  },
  "rakhi-for-bhaiya": {
    heading: "Rakhi for Bhaiya, including matching Bhabhi sets",
    paragraphs: [
      "Bhaiya is the everyday word many sisters use for an older brother. This page mixes single rakhis with Bhaiya Bhabhi sets, so you can send one thread for him or a paired set when Bhabhi should receive a rakhi too.",
      "A matching set is the clearer choice when both of them live at the same US address. If Bhabhi’s gift should be a bracelet-style Lumba on its own, use the Bhabhi collection instead of adding a second single rakhi and hoping it reads as a pair.",
    ],
    pointsHeading: "Bhaiya gift paths",
    points: [
      "One brother — designer or traditional single rakhi",
      "Brother and sister-in-law together — Bhaiya Bhabhi set",
      "Same domestic USA delivery window of 5–7 business days",
    ],
    links: [
      { href: categoryHref("bhaiya-bhabhi-rakhi"), label: "Bhaiya Bhabhi rakhi" },
      { href: "/blog/what-is-bhaiya-bhabhi-rakhi", label: "What a Bhaiya Bhabhi set is" },
    ],
  },
  "rakhi-for-bhabhi": {
    heading: "Rakhi for Bhabhi — Lumba and matching sets",
    paragraphs: [
      "Bhabhi is honored with a Lumba, the bracelet-style rakhi tied for a sister-in-law, or with a Bhaiya Bhabhi set that includes a rakhi for your brother and a Lumba for her. This page lists those two groups so you are not browsing kids or cousin styles by mistake.",
      "Check the product photos for a bracelet silhouette if you specifically want a Lumba. Matching sets are labeled as Bhaiya Bhabhi. Both ship domestically in the USA, and most rakhis include roli and chawal for the ceremony.",
    ],
    pointsHeading: "Choose the right Bhabhi gift",
    points: [
      "Lumba only, when your brother already has a rakhi from you",
      "A paired set when you are sending to both of them in one order",
      "Read the listing so you know whether one or two pieces are packed",
    ],
    links: [
      { href: categoryHref("lumba-rakhi"), label: "Lumba rakhi" },
      { href: "/blog/what-to-gift-bhabhi-on-raksha-bandhan", label: "Bhabhi gift guide" },
    ],
  },
  "rakhi-for-cousin-brother": {
    heading: "Rakhi ideas for a cousin brother in the USA",
    paragraphs: [
      "Cousin brothers are often the siblings you celebrate with even when you grew up in different houses. This collection leans on single rakhis, kids designs, and chocolate combos — the styles sisters usually pick when the relationship is close but the gift should stay light.",
      "A colorful kids rakhi fits a younger cousin. A designer single or a small chocolate combo fits an older cousin in college or at his first US job. The delivery address must be in the United States; you can place the order from India, the UK, Canada, or anywhere else.",
    ],
    pointsHeading: "Match the rakhi to his age",
    points: [
      "Younger cousins — kids rakhi with bright, simple designs",
      "Older cousins — single designer rakhi or a chocolate combo",
      "More than one cousin at one address — look at multi-piece sets",
    ],
    links: [
      { href: categoryHref("kids-rakhi"), label: "Kids rakhi" },
      { href: "/collections/rakhi-sets", label: "Rakhi sets" },
    ],
  },
  "rakhi-under-10": {
    heading: "Rakhis listed at $10 or less",
    paragraphs: [
      "This page shows published rakhis whose listed price is $10 or below, sorted from lower to higher. It is a budget filter, not a separate product line. Stock and designs change with the catalog, so the grid is the current list.",
      `A lower price still follows the same USA shipping rules. Carts under the ${freeShippingMinimum} free-shipping minimum pay the remaining amount as shipping. If you need several rakhis, compare the under-$20 and set pages so the total cart — not a single thread — is what you planned.`,
    ],
    pointsHeading: "Budget notes that matter at checkout",
    points: [
      "Prices on the cards are the listed product prices",
      `Free shipping applies when the cart reaches ${freeShippingMinimum}`,
      "Roli and chawal are included on most rakhis, including lower-priced ones",
    ],
    links: [
      { href: "/collections/rakhi-under-20", label: "Rakhi under $20" },
      { href: "/shipping", label: "Shipping minimum" },
    ],
  },
  "rakhi-under-20": {
    heading: "Rakhis listed at $20 or less",
    paragraphs: [
      "Under $20 is where many single designer rakhis and kids styles sit. The filter includes every published product priced at $20 or below, so you may see simple threads and small gift combos on the same grid.",
      "Use sort in your own comparison by opening a few cards: photo, what is included, and whether the design is for a brother, a child, or a set. Shipping remains domestic US delivery in 5–7 business days.",
    ],
    pointsHeading: "How sisters use this price band",
    points: [
      "One thoughtful rakhi without moving into hamper prices",
      "A kids design plus a simple adult rakhi in one cart",
      "A starting point before you open premium or hamper collections",
    ],
    links: [
      { href: categoryHref("single-rakhi"), label: "Single rakhi" },
      { href: "/collections/rakhi-under-30", label: "Rakhi under $30" },
    ],
  },
  "rakhi-under-30": {
    heading: "Rakhis and gift sets listed at $30 or less",
    paragraphs: [
      "The under-$30 page is the mid-range view of the catalog. It includes products up to $30, which is often enough for a chocolate combo or a small multi-piece set as well as designer singles.",
      "If a product you expected is missing, its listed price is above $30 — check premium rakhis or the hamper category. Nothing on this page changes payment options: Razorpay for USD and INR.",
    ],
    pointsHeading: "What usually appears in this range",
    points: [
      "Designer single rakhis and kids styles",
      "Smaller combos and sets whose price is still at or under $30",
      "The same domestic packaging and 5–7 business day USA delivery",
    ],
    links: [
      { href: categoryHref("rakhi-combo"), label: "Combos" },
      { href: "/collections/premium-rakhi", label: "Premium rakhis" },
    ],
  },
  "best-selling-rakhis": {
    heading: "Best-selling rakhis, ordered by units sold",
    paragraphs: [
      "This list is ranked by how many units each product has sold, then limited to the current top group. It is a popularity view of the live catalog, not a hand-picked editorial award. Newer designs with fewer sales will not lead the grid even if they are in stock.",
      "Popularity is a useful starting point when you do not have a style in mind. Still open the product page for photos, price, and what is packed before you order for a US address.",
    ],
    pointsHeading: "How to read this ranking",
    points: [
      "Higher on the page means more units sold, not a higher price",
      "Combos and singles can both appear if sisters have ordered them",
      "Pair this page with a category when you already know the recipient",
    ],
    links: [
      { href: "/collections/trending-rakhis", label: "Trending rakhis" },
      { href: "/reviews", label: "Customer reviews" },
    ],
  },
  "new-arrivals": {
    heading: "New rakhi arrivals in the UsaRakhi catalog",
    paragraphs: [
      "New arrivals are the most recently updated published products, not a separate warehouse. When the team adds photos, copy, or a new design, that product can move up this list. The page shows a current slice of those updates so you can see what was touched lately.",
      "A recent update is not a promise that a design is exclusive or limited. Confirm price and inclusions on the product page, then checkout with your brother’s US delivery address.",
    ],
    pointsHeading: "A sensible way to shop new designs",
    points: [
      "Scan photos first — new listings are easiest to judge visually",
      "Cross-check the category if you need kids, Lumba, or a hamper specifically",
      "Allow 5–7 business days for domestic delivery",
    ],
    links: [
      { href: "/products", label: "Full shop" },
      { href: "/blog/trending-rakhi-designs-usa-2026", label: "2026 design notes" },
    ],
  },
  "trending-rakhis": {
    heading: "Trending rakhis sisters are ordering now",
    paragraphs: [
      "Trending rakhis are products flagged as fast-selling, or products that already have recorded sales, ordered by units sold. If that group is empty, the page falls back to the wider catalog so the grid is never a blank trend label.",
      "Use it when you want a current snapshot rather than a category. For a specific person — Bhabhi, a child, or a cousin — the dedicated collection or category page will narrow the choice faster than a trend list.",
    ],
    pointsHeading: "Trend list versus category list",
    points: [
      "Trending mixes styles that are moving, across categories",
      "Category pages keep one type of rakhi together",
      "Both use the same USA domestic shipping and secure checkout",
    ],
    links: [
      { href: "/collections/best-selling-rakhis", label: "Best sellers" },
      { href: "/raksha-bandhan", label: "Raksha Bandhan 2026" },
    ],
  },
  "designer-rakhis": {
    heading: "Designer rakhis with pearls, stones, and festive detail",
    paragraphs: [
      "Designer rakhis on this page match words such as designer, pearl, stone, kundan, zardosi, or meenakari in the product name, description, or tags. That keeps plain kids cartoons and basic sweet hampers out of the grid unless the listing itself uses that language.",
      "Ornament styles still follow the same ceremony basics: most rakhis include roli and chawal, and the parcel is shipped inside the United States. Compare a few photos side by side — pearl and stone listings look different in hand even when prices are close.",
    ],
    pointsHeading: "Details worth comparing",
    points: [
      "Pearl or stone work versus a simpler thread",
      "Whether the listing is a single rakhi or part of a set",
      "The recipient: brother, Bhaiya, or a set that also includes Bhabhi",
    ],
    links: [
      { href: categoryHref("single-rakhi"), label: "Single rakhi category" },
      { href: "/collections/premium-rakhi", label: "Premium collection" },
    ],
  },
  "festival-special-rakhis": {
    heading: "Festival-special rakhis for Raksha Bandhan",
    paragraphs: [
      "Festival specials are combos, hampers, and products described as festive gift sets. The page is for sisters who want the Raksha Bandhan box to feel like a celebration, not only a single thread in an envelope.",
      "Raksha Bandhan 2026 falls on August 28. Standard delivery is 5–7 business days inside the USA, so the shipping page is the place to confirm the current order window. Product contents stay exactly as each listing describes them.",
    ],
    pointsHeading: "Festival orders, kept specific",
    points: [
      "Combos when chocolate should travel with the rakhi",
      "Hampers when sweets or dry fruits are part of the gift",
      "Single rakhi pages when you only need the thread and roli chawal",
    ],
    links: [
      { href: "/raksha-bandhan", label: "Raksha Bandhan page" },
      { href: "/shipping", label: "Delivery windows" },
      { href: categoryHref("rakhi-hampers"), label: "Hampers" },
    ],
  },
};

export function getCollectionGuide(slug: string): CollectionGuide | undefined {
  return collectionGuides[slug];
}
