import type { BlogPost } from "./blog-posts";

const img = (sku: string) =>
  `https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/${sku}/${sku}_1.jpg`;

/**
 * Handwritten Diwali and Bhai Dooj guides. Listed ahead of older Rakhi articles.
 * Images are real catalog photos already used on the shop.
 */
export const festivalBlogPosts: BlogPost[] = [
  {
    slug: "send-diwali-gifts-to-usa",
    title: "How to Send Diwali Gifts to Family in the USA",
    description:
      "Send Diwali gifts to a US address from India or abroad. See how UsaRakhi ships hampers domestically, what to put on the label, and which festive boxes to choose.",
    excerpt:
      "A practical guide for sending Diwali sweets, dry fruits, and pooja sets to relatives in the United States without an international customs stop.",
    image: img("TFUSDW2620"),
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-13",
    relatedCategory: "diwali",
    keywords:
      "send diwali gifts to usa, diwali gift delivery usa, diwali hamper usa, order diwali gifts online, diwali gifts from india to usa",
    sections: [
      {
        paragraphs: [
          "Diwali in an American apartment rarely looks like Diwali on the street you grew up on. The lamps still get lit, but the mithai has to come from a box that actually arrives. UsaRakhi is built for that gap: you order online, enter a United States address, and the hamper ships inside America instead of crossing a border as a parcel from overseas.",
          "That distinction matters more than the ribbon. A gift that waits in customs is a gift that misses the evening it was meant for. Domestic USA shipping is the reason families use this shop when the recipient lives in California, New Jersey, Texas, or anywhere else in the country.",
        ],
      },
      {
        heading: "What you actually need at checkout",
        paragraphs: [
          "The recipient’s full street address, apartment or unit number, city, state, and ZIP code. A phone number helps the carrier. Your own email is how order updates reach you. Prices can be paid in USD through Stripe or in INR through Razorpay, and card numbers are not stored on UsaRakhi.",
          "If you are ordering from India, the UK, or Canada, the checkout still uses a US delivery address. The parcel itself is fulfilled in the United States.",
        ],
      },
      {
        heading: "Which Diwali box fits a US household",
        paragraphs: [
          "The shop groups ready-to-gift Diwali combos separately from Bhai Dooj. A toran, rangoli, and besan laddoo hamper suits a home that still puts decorations up. A metal pooja set with kaju katli or Ferrero Rocher suits a smaller kitchen that wants the puja tray and something sweet in one carton.",
          "Dry fruit sets — almonds, cashews, pistachios — travel well and do not depend on anyone baking. Read the included list on the product page before you add it to the cart. Weights and piece counts are spelled out there.",
        ],
      },
      {
        heading: "How long USA delivery takes",
        paragraphs: [
          "UsaRakhi’s published window is typically 5–7 business days, depending on the address and carrier conditions. Standard delivery is also described on the site as 5 business days, with free shipping on a $15 minimum cart. Order before the festival week if the address is rural or if the building needs a door code.",
          "Questions about a specific ZIP code go to order@usarakhi.com or WhatsApp +91 9266467887. Support can check an order; they cannot change a festival date.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I send Diwali gifts to the USA from India?",
        a: "Yes. Place the order on UsaRakhi, pay in INR through Razorpay or in USD through Stripe, and enter the US shipping address. The hamper ships domestically inside the United States.",
      },
      {
        q: "Do Diwali hampers clear US customs?",
        a: "Orders fulfilled by UsaRakhi ship within America, so the recipient is not waiting on an international customs clearance for that parcel.",
      },
      {
        q: "What Diwali gifts does UsaRakhi sell?",
        a: "Diwali combos include pooja sets, toran and rangoli pieces, besan laddoo, kaju katli, almonds, cashews, pistachios, and Ferrero Rocher pairings. Each product page lists exactly what is in the box.",
      },
    ],
  },
  {
    slug: "diwali-gift-hampers-for-family-in-america",
    title: "Diwali Gift Hampers for Parents and Siblings Living in America",
    description:
      "Choose a Diwali hamper for parents or siblings in the USA. Compare pooja sets, sweet boxes, and dry fruit gifts that UsaRakhi delivers domestically.",
    excerpt:
      "Parents want the puja thali. Siblings want the sweets. Here is how to match a UsaRakhi Diwali hamper to the household receiving it.",
    image: img("TFUSDW2621"),
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-13",
    relatedCategory: "diwali",
    keywords:
      "diwali gift hamper usa, diwali gifts for parents in usa, diwali hamper for family america, pooja gift set usa",
    sections: [
      {
        paragraphs: [
          "A hamper only works if the person opening it recognizes the festival. For parents who still set a small altar in a US home, a metal pooja gift set in a velvet box — with a Shubh Labh hanging or charan paduka — reads as Diwali, not as a generic snack basket. Pairing that set with besan laddoo gives them something to offer and something to share.",
          "Siblings who are not arranging a full puja often prefer kaju katli with nuts, or a rangoli and toran set they can hang for the weekend. UsaRakhi lists those as separate Diwali combos so you are not guessing what the carton contains.",
        ],
      },
      {
        heading: "Match the box to the kitchen, not the catalog photo",
        paragraphs: [
          "A large decorative hamper is right when several people will open it together. A smaller dry-fruit set is easier for one person in a studio apartment. Almonds, cashews, and pistachios in the Shubh Labh and rangoli set are packed in stated gram weights, which helps if someone in the house tracks what they eat.",
          "Chocolate pairings such as Ferrero Rocher sit in specific Diwali and Bhai Dooj boxes. If the recipient does not eat mithai, choose the combo whose included list leads with nuts or chocolates rather than laddoo.",
        ],
      },
      {
        heading: "One order, one US address",
        paragraphs: [
          "Each order ships to the address you enter. If parents and a brother live in different cities, those are two checkouts. Write the apartment number; US carriers return parcels that stop at a lobby with no unit.",
          "You can switch the site between USD and INR while browsing. The amount due is confirmed at checkout through Stripe or Razorpay.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a useful Diwali gift for parents in the USA?",
        a: "A pooja set with sweets or dry fruits is the closest match on UsaRakhi: a metal puja gift, hanging decorations, and laddoo or kaju katli in one domestically shipped box.",
      },
      {
        q: "Can I send different hampers to two US addresses?",
        a: "Place a separate order for each address so each parcel has its own recipient and tracking path.",
      },
    ],
  },
  {
    slug: "diwali-pooja-gift-box-usa-delivery",
    title: "Diwali Pooja Gift Boxes You Can Send to a US Address",
    description:
      "Diwali pooja gift boxes with USA delivery: metal puja sets, Shubh Labh hangings, charan paduka, and sweets packed for domestic shipping.",
    excerpt:
      "What is inside UsaRakhi’s Diwali pooja boxes, who they suit, and how they ship to addresses across the United States.",
    image: img("TFUSDW2624"),
    publishedAt: "2026-10-09",
    updatedAt: "2026-10-13",
    relatedCategory: "pooja-sets",
    keywords:
      "diwali pooja set usa, diwali puja gift box usa, send pooja thali to usa, diwali decoration gift usa",
    sections: [
      {
        paragraphs: [
          "A Diwali pooja box is not a substitute for a temple visit. It is a way to put the tools of the evening in someone’s hands when you cannot carry them yourself. UsaRakhi’s pooja-leaning Diwali combos use a metal pooja gift set in a velvet box, and some add a Shubh Labh hanging and charan paduka.",
          "Those pieces are packed with food so the carton is a gift, not an empty ritual kit. One version adds Ferrero Rocher and almonds. Another adds besan laddoo. A third pairs the metal set with kaju katli and mixed nuts or pistachios. The product title and the included list are the source of truth.",
        ],
      },
      {
        heading: "Decorations versus the puja set",
        paragraphs: [
          "The toran, peacock rangoli, and Shubh Labh hamper is the one to choose when the home needs something visible on the door or the table. The velvet-box puja set is the one to choose when the evening is a small prayer at the kitchen counter. Sending both is reasonable if the cart is for a family that does both.",
          "Pooja sets are also a category on the shop, so the same boxes can be found under Diwali Combo or Pooja Sets when a product is filed in both.",
        ],
      },
      {
        heading: "Delivery inside the United States",
        paragraphs: [
          "These boxes ship domestically. The published estimate is typically 5–7 business days after the order is placed, with the site’s standard window also stated as 5 business days and free shipping once the cart reaches $15. Enter a complete US address so the carrier is not guessing the building.",
          "If a piece arrives damaged, the returns page asks you to write within 48 hours with the order number and photos. That policy is for damaged, defective, or incorrect items — not a general change-of-mind window after the festival.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does the Diwali pooja box include a thali and sweets?",
        a: "Several UsaRakhi Diwali combos include a metal pooja gift set plus a sweet or nut item such as besan laddoo, kaju katli, almonds, or Ferrero Rocher. Check the included list on the specific product.",
      },
      {
        q: "Are pooja sets shipped from outside the USA?",
        a: "UsaRakhi fulfills these orders with domestic US shipping, so the box is not sent as an international parcel to the recipient.",
      },
    ],
  },
  {
    slug: "diwali-sweets-and-dry-fruits-shipped-in-the-usa",
    title: "Diwali Sweets and Dry Fruits That Ship Inside the USA",
    description:
      "Besan laddoo, kaju katli, almonds, cashews, and pistachios in Diwali gift boxes with domestic USA delivery from UsaRakhi.",
    excerpt:
      "How UsaRakhi packs Diwali mithai and dry fruits for US addresses, and how to choose between laddoo, kaju katli, and nut boxes.",
    image: img("TFUSDW2623"),
    publishedAt: "2026-10-09",
    updatedAt: "2026-10-13",
    relatedCategory: "sweet-combos",
    keywords:
      "diwali sweets usa delivery, kaju katli gift box usa, besan laddoo usa, diwali dry fruits usa, send mithai to usa",
    sections: [
      {
        paragraphs: [
          "Sweets are the part of Diwali people argue about, and they are also the part that spoils a long international trip. UsaRakhi packs mithai and dry fruits in the United States so the box moves as a domestic parcel. The Diwali range includes besan laddoo at 200 g in the decoration and pooja hampers, and kaju katli at 200 g beside metal puja sets.",
          "Dry fruit packs are smaller and labeled by weight: almonds around 43 g, cashews around 45 g, pistachios around 45 g, and a mixed-nut pack at 45 g on the kaju katli pooja set. Those figures come from the product included lists, not from a generic “assorted nuts” claim.",
        ],
      },
      {
        heading: "When to pick laddoo, katli, or nuts",
        paragraphs: [
          "Besan laddoo belongs with a family that will open the box on Diwali night and pass it around. Kaju katli is the safer mithai when you know they like cashew sweets and you want a neat box beside a pooja set. Nuts alone — the Shubh Labh, rangoli, cashew, and almond set — suit households that would rather not receive a large sweet.",
          "Sweet combos and dry fruit combos are separate shop sections. A Diwali product can appear in more than one when it contains both a sweet and a nut pack.",
        ],
      },
      {
        heading: "What the listing will not promise",
        paragraphs: [
          "The site does not describe these sweets as homemade in your city, and it does not promise a specific bakery brand unless the product name says so. Ferrero Rocher is named only on the boxes that include it. If a listing says three pieces, that is the count.",
          "Store the box as you would any confection once it arrives. Delivery is to the address; it is not a climate-controlled ritual. Order with enough of the 5–7 business day window left before you need it on the table.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is kaju katli available for Diwali delivery in the USA?",
        a: "Yes. Diwali combos such as the metal pooja set with kaju katli include 200 g of kaju katli and ship domestically in the United States.",
      },
      {
        q: "How are the dry fruit portions sized?",
        a: "Each product page lists gram weights, for example almonds 43 g, cashews 45 g, or pistachios 45 g. Use that list rather than assuming a large tin.",
      },
    ],
  },
  {
    slug: "order-diwali-gifts-online-from-india-to-usa",
    title: "Ordering Diwali Gifts Online from India for a US Address",
    description:
      "Order Diwali gifts on UsaRakhi from India for delivery in the USA. Pay in INR with Razorpay, use a US address, and track a domestic shipment.",
    excerpt:
      "The checkout path for families in India sending Diwali hampers to the United States: payment, address format, and what support can help with.",
    image: img("TFUSDW2625"),
    publishedAt: "2026-10-10",
    updatedAt: "2026-10-13",
    relatedCategory: "diwali",
    keywords:
      "order diwali gifts from india to usa, diwali gifts online usa, razorpay diwali gifts, send diwali hamper from india",
    sections: [
      {
        paragraphs: [
          "Ordering from India does not mean the parcel starts in India. On UsaRakhi you browse the Diwali combos, pay in INR through Razorpay if that is the currency you choose, and type the American address where the hamper should arrive. Fulfillment stays inside the US, which is the same model the site uses so brothers and parents are not waiting on customs.",
          "USD checkout uses Stripe. You can look at prices in either currency on the site before you pay. The charge is the total shown at checkout, including shipping if the cart is under the $15 free-shipping minimum.",
        ],
      },
      {
        heading: "Address format that US carriers accept",
        paragraphs: [
          "Use the recipient’s name, street, apartment, city, two-letter state, and ZIP+4 if you have it. “Near the Indian store” is not an address line. If the building has a gate code, put it where the checkout notes allow, and keep the phone number current.",
          "Wrong ZIP codes are the usual reason a domestic box bounces. Double-check before you pay. Cancellation is possible before dispatch; after the parcel is with the US carrier, the returns page says cancellations may not be possible and asks you to contact support immediately.",
        ],
      },
      {
        heading: "Who to contact if the date is close",
        paragraphs: [
          "Email order@usarakhi.com or WhatsApp +91 9266467887. Those are the support channels published on the site. They can help with an order question. They are not a guarantee that a late order will beat a festival evening in every ZIP code.",
          "The shipping page is the place to read the current window. Plan on typically 5–7 business days and order while that still lands before Diwali night in the recipient’s city.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I pay in INR for a Diwali gift delivered in the USA?",
        a: "Yes. Razorpay handles INR payments, including UPI and cards, while the hamper ships to the US address you enter.",
      },
      {
        q: "Is there free shipping?",
        a: "Free shipping applies on a $15 minimum cart for standard USA delivery. The shipping page also notes that Orange County products ship free, and mixed carts are calculated separately.",
      },
    ],
  },
  {
    slug: "bhai-dooj-gifts-for-a-brother-in-the-usa",
    title: "Bhai Dooj Gifts to Send a Brother in the USA",
    description:
      "Send Bhai Dooj gifts to a brother in the United States: kaju katli, dry fruits, chocolates, kumkum, and a Bhai Dooj card, shipped domestically by UsaRakhi.",
    excerpt:
      "Bhai Dooj is the day for your brother. These UsaRakhi boxes are packed for a US address, with a card and the sweets or nuts listed on each product.",
    image: img("TFUSBD2601"),
    publishedAt: "2026-10-10",
    updatedAt: "2026-10-13",
    relatedCategory: "bhai-dooj",
    keywords:
      "bhai dooj gifts usa, send bhai dooj gift to brother in usa, bhai dooj hamper usa, bhai dooj gift box delivery",
    sections: [
      {
        paragraphs: [
          "Bhai Dooj is smaller than Diwali and more specific. The person you are thinking about is your brother, even if he now lives in a US suburb and the tilak happens over a video call. UsaRakhi’s Bhai Dooj combos are built as ready-to-gift boxes for that day: sweets or snacks, and on most of them a Bhai Dooj card with kalawa.",
          "The kaju katli and kumkum box is the most ceremonial of the set. It includes kaju katli 200 g, a kumkum brass dibbi, and the card. If he will not use kumkum, skip that one and choose nuts, chocolates, or a smaller dry-fruit box instead.",
        ],
      },
      {
        heading: "What “for your brother” means in this catalog",
        paragraphs: [
          "These are not rakhi threads. The Bhai Dooj range is food and, where listed, a tilak dibbi and a card. Chocolate options include Ferrero Rocher, M&M’s, and Skittles in named boxes. Dry fruit options include almonds with pistachios, mixed dry fruits at 266 g or 131 g, cashews beside kaju katli, and a pistachio box.",
          "Read the included list. A box called “kaju katli and Ferrero” contains 200 g of kaju katli and 3 Ferrero Rocher pieces plus the card. It does not also contain kumkum unless the title says so.",
        ],
      },
      {
        heading: "Getting it to his US address",
        paragraphs: [
          "Enter his address, not yours. Domestic shipping applies, with the site’s usual 5–7 business day expectation and free shipping on a $15 cart. If he lives in an apartment, the unit number belongs in the address or the parcel sits downstairs.",
          "You can order from India and pay in INR. He receives a US shipment. If you also want a Diwali hamper for the same home a couple of days earlier, that can be the same address on a separate Diwali combo — or the same cart if you want both occasions in one delivery and you are comfortable with the timing.",
        ],
      },
    ],
    faqs: [
      {
        q: "What do UsaRakhi Bhai Dooj boxes include?",
        a: "Each listing states the contents. Common pieces are kaju katli, dry fruits, chocolates, a Bhai Dooj card with kalawa, and on some boxes a kumkum dibbi.",
      },
      {
        q: "Can I send a Bhai Dooj gift to the USA from another country?",
        a: "Yes. Order on the site with his US address. The gift ships inside the United States.",
      },
    ],
  },
  {
    slug: "bhai-dooj-or-diwali-hamper-which-to-send",
    title: "Bhai Dooj or Diwali Hamper: Which Box to Send in the USA",
    description:
      "Choose between a Diwali hamper and a Bhai Dooj gift for USA delivery. See how the two UsaRakhi collections differ and when to send both.",
    excerpt:
      "Diwali boxes lean toward pooja and decorations. Bhai Dooj boxes lean toward a brother, a card, and a sweet. Here is how to decide.",
    image: img("TFUSBD2603"),
    publishedAt: "2026-10-11",
    updatedAt: "2026-10-13",
    relatedCategory: "bhai-dooj",
    keywords:
      "bhai dooj vs diwali gifts, diwali or bhai dooj hamper, bhai dooj gift ideas usa, diwali gift ideas usa",
    sections: [
      {
        paragraphs: [
          "The two festivals sit a couple of days apart, and the gifts should not be copies of each other. UsaRakhi keeps them in separate collections. Diwali combos are the pooja sets, toran, rangoli, Shubh Labh, laddoo, and the larger decorative hampers. Bhai Dooj combos are the brother-focused boxes: card with kalawa, kaju katli, nuts, chocolates, and kumkum where the title includes it.",
          "If you are sending to the whole household, start with Diwali. If you are sending to your brother and the rest of the house already has decorations, start with Bhai Dooj. If both are true and the budget allows, they are different products and can be ordered together.",
        ],
      },
      {
        heading: "Overlap you should notice before checkout",
        paragraphs: [
          "Kaju katli shows up in both collections. On Diwali it is paired with a metal pooja set. On Bhai Dooj it is paired with a card, and sometimes with kumkum, cashews, almonds, or Ferrero Rocher. You do not need two kaju katli boxes unless two people will each open one.",
          "Chocolates are more common on the Bhai Dooj side (Ferrero, M&M’s, Skittles) and appear on Diwali when the pooja set explicitly adds Ferrero. Dry fruits appear in both. The category filters — Sweet Combos, Dry Fruit Combos, Chocolate Combos, Pooja Sets — are there so you can shop by what is inside rather than only by festival name.",
        ],
      },
      {
        heading: "Timing for one US delivery",
        paragraphs: [
          "One parcel arrives once. If you need the Diwali items before Bhai Dooj, order early enough that the 5–7 business day window covers the first occasion. Support cannot split one shipment across two dates. Two orders are the way to ask for two arrivals, and even then carrier timing is an estimate, not a festival appointment.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should I send a Diwali hamper or a Bhai Dooj gift?",
        a: "Send a Diwali hamper for the household puja and decorations. Send a Bhai Dooj box when the gift is specifically for your brother, usually with a card and a sweet or snack.",
      },
      {
        q: "Can both go to the same US address?",
        a: "Yes. Add both products if one delivery is fine, or place two orders if you need separate shipments. Each order uses the address you enter.",
      },
    ],
  },
  {
    slug: "bhai-dooj-kaju-katli-kumkum-gifts-usa",
    title: "Bhai Dooj Kaju Katli and Kumkum Gifts for USA Delivery",
    description:
      "Bhai Dooj kaju katli and kumkum gift boxes for brothers in the USA, including the brass dibbi, card with kalawa, and domestic shipping.",
    excerpt:
      "A closer look at UsaRakhi’s tilak-and-mithai Bhai Dooj boxes: kumkum, kaju katli, almonds, and the card that goes in the parcel.",
    image: img("TFUSBD2604"),
    publishedAt: "2026-10-11",
    updatedAt: "2026-10-13",
    relatedCategory: "bhai-dooj",
    keywords:
      "bhai dooj kumkum gift usa, kaju katli bhai dooj usa, bhai dooj tilak gift box, send kumkum to usa",
    sections: [
      {
        paragraphs: [
          "The tilak is the part of Bhai Dooj that a snack box cannot fake. UsaRakhi puts a kumkum brass dibbi in the boxes that say so: the kaju katli and kumkum gift, and the kaju katli, almonds, and kumkum hamper. Both include a Bhai Dooj card with kalawa. The first has 200 g of kaju katli. The hamper adds almonds at 86 g.",
          "If he will do the tilak on camera, those are the two listings to open. If the dibbi would sit unused, the catalog has kaju katli without kumkum — with cashews, or with Ferrero Rocher — so you are not forced to buy the ritual item.",
        ],
      },
      {
        heading: "What the card is for",
        paragraphs: [
          "The card with kalawa is listed as part of the gift, not as a handwritten note from you. You can still tell him, in your own message, which box is on the way. The site does not offer custom printing on these festival combos unless a product page says it does. These pages do not.",
          "Kalawa in the box is a thread for the day. It is not a rakhi from the earlier season, and the shop is not presenting these SKUs as rakhi sets.",
        ],
      },
      {
        heading: "Shipping the dibbi and the sweets together",
        paragraphs: [
          "They are packed in one carton and shipped domestically in the USA. You do not assemble the kumkum and the katli yourself. Keep the address precise, pay by Stripe or Razorpay, and allow the published delivery window. Damaged tins or a missing listed item fall under the returns page: contact within 48 hours with photos and the order number.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which Bhai Dooj gift includes kumkum?",
        a: "The Kaju Katli & Kumkum Gift Box and the Kaju Katli, Almonds & Kumkum Hamper both include a kumkum brass dibbi and a Bhai Dooj card with kalawa.",
      },
      {
        q: "Is the note inside the box personalized?",
        a: "The listing includes a Bhai Dooj card with kalawa. It does not describe custom name printing. Say what you want to say in your own call or message.",
      },
    ],
  },
  {
    slug: "bhai-dooj-chocolate-and-dry-fruit-boxes-usa",
    title: "Bhai Dooj Chocolate and Dry Fruit Boxes for Brothers in the USA",
    description:
      "Bhai Dooj chocolate and dry fruit gift boxes with USA delivery: Ferrero Rocher, M&M’s, Skittles, almonds, pistachios, and mixed nuts.",
    excerpt:
      "When your brother would rather open chocolates or nuts than a pooja set, these are the Bhai Dooj boxes UsaRakhi ships in the US.",
    image: img("TFUSBD2602"),
    publishedAt: "2026-10-12",
    updatedAt: "2026-10-13",
    relatedCategory: "chocolate-combos",
    keywords:
      "bhai dooj chocolate gift usa, bhai dooj dry fruits usa, ferrero rocher bhai dooj, send nuts to brother in usa",
    sections: [
      {
        paragraphs: [
          "Not every brother wants kumkum. Some want the chocolate they already buy at a US grocery, packed with a card so the day is still marked. UsaRakhi’s Bhai Dooj chocolate boxes name the brand and the count: Ferrero Rocher as 3 pieces beside kaju katli, M&M’s boxes, and Skittles boxes, including a kids gift that adds markers. Those are different products. The photo on the card is the photo of that SKU.",
          "Dry fruit brothers are just as specific. Almonds and pistachios at 176 g, mixed dry fruits at 266 g or the smaller 131 g box, a pistachio gift box, and mixed nuts are separate listings. The gram weight is the difference between a snack and a table box.",
        ],
      },
      {
        heading: "How to avoid sending the wrong snack",
        paragraphs: [
          "Use the included list, not the category name. Chocolate Combos will also show Diwali boxes that contain Ferrero. Dry Fruit Combos will show both festivals. Filter or search by Bhai Dooj if the card and kalawa matter. If they do not, a Diwali nut set is still a valid gift a few days earlier — it just will not say Bhai Dooj on the card.",
          "A markers-and-M&M’s box is aimed at a younger brother. Do not send that one to an adult who wanted pistachios. The titles are literal.",
        ],
      },
      {
        heading: "Checkout and delivery",
        paragraphs: [
          "Same path as the rest of the shop: US address, Stripe or Razorpay, domestic shipping, typically 5–7 business days, free shipping on a $15 minimum. Keep the order confirmation. If the box arrives short a listed pack, write to support within 48 hours with a photo, as the returns page requires for incorrect items.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which chocolates are in the Bhai Dooj boxes?",
        a: "Named boxes include Ferrero Rocher, M&M’s, and Skittles. The piece count or pack size is on each product page.",
      },
      {
        q: "What is the difference between the two mixed dry fruit boxes?",
        a: "One is 266 g and one is 131 g. Both are Bhai Dooj gifts with a card and kalawa. Choose the size that matches how many people will share it.",
      },
    ],
  },
  {
    slug: "when-to-order-bhai-dooj-gifts-for-usa-delivery",
    title: "When to Order Bhai Dooj Gifts for USA Delivery",
    description:
      "When to place a Bhai Dooj gift order for USA delivery on UsaRakhi, using the site’s 5–7 business day shipping window and support contacts.",
    excerpt:
      "Bhai Dooj does not move if the courier is late. Use UsaRakhi’s published USA delivery window and order while the address can still be corrected.",
    image: img("TFUSBD2606"),
    publishedAt: "2026-10-12",
    updatedAt: "2026-10-13",
    relatedCategory: "bhai-dooj",
    keywords:
      "bhai dooj gift delivery time usa, when to order bhai dooj gifts, bhai dooj shipping usa, last minute bhai dooj gifts usa",
    sections: [
      {
        paragraphs: [
          "UsaRakhi does not publish a separate overnight promise for Bhai Dooj. The shipping information used across the site is standard USA delivery in about 5 business days, with the terms page describing a typical window of 5–7 business days depending on the location. Count backward from the day you want the box in his hands, and add a buffer if the ZIP code is outside a major metro.",
          "Ordering the week of the festival can still work for some addresses and can miss others. The honest use of the site is to place the order while a correction is still possible. Cancellations and address changes are handled before dispatch. After the parcel ships inside the US, changes may not be possible.",
        ],
      },
      {
        heading: "What to finish before you pay",
        paragraphs: [
          "Confirm the street, apartment, state, and ZIP with him if you have not sent a parcel there this year. Choose the Bhai Dooj box from the included list, not from memory of a similar Diwali hamper. Check whether the cart meets the $15 free-shipping minimum or whether you are paying the remaining shipping on a smaller order.",
          "Save the confirmation email. It is what support will ask for, along with the order number, if something needs tracing.",
        ],
      },
      {
        heading: "If the timing is already tight",
        paragraphs: [
          "Write to order@usarakhi.com or WhatsApp +91 9266467887 before you assume a late order will fail or succeed. Support can tell you the status of an order that exists. They cannot invent a faster service than the one the shipping page lists.",
          "If you are also sending a Diwali hamper, order that one first in your planning even if you check out on the same day. Diwali comes first. A single domestic shipment will not be in two places on two evenings.",
        ],
      },
    ],
    faqs: [
      {
        q: "How many days does Bhai Dooj gift delivery take in the USA?",
        a: "Plan for the site’s standard USA delivery: about 5 business days, typically described as 5–7 business days depending on the address.",
      },
      {
        q: "Can I change the address after I order?",
        a: "Contact support as soon as you can. Changes are possible before dispatch. After the order ships, the returns and terms pages say changes may not be possible.",
      },
      {
        q: "Who do I contact about a Bhai Dooj delivery?",
        a: "Email order@usarakhi.com or WhatsApp +91 9266467887 with your order number.",
      },
    ],
  },
];
