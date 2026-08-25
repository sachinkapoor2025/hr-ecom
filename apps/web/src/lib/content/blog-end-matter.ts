export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogClosing {
  heading: string;
  paragraphs: string[];
}

/** Unique FAQ + optional closing for handwritten posts. Closing is used only when the article still has a generic “Final Thoughts” / “Conclusion”. */
export const handwrittenBlogEndMatter: Record<
  string,
  { faqs: BlogFaq[]; closing?: BlogClosing }
> = {
  "what-is-lumba-rakhi": {
    closing: {
      heading: "Tie a Lumba, and the whole house is in the festival",
      paragraphs: [
        "Lumba Rakhi is how a sister tells Bhabhi she belongs on Raksha Bandhan — not as a guest at someone else’s ritual, but as family. The bracelet on her bangle does not replace your brother’s thread; it completes the room.",
        "Choose a design that matches how she actually dresses, pack it with his rakhi when you can, and send it early enough that August 28 is about blessing them both — not refreshing a tracking page.",
      ],
    },
    faqs: [
      {
        q: "Is Lumba Rakhi only for Bhabhi?",
        a: "Yes. A Lumba is the bracelet-style rakhi traditionally tied to a sister-in-law’s bangle. Your brother still receives a regular rakhi on his wrist.",
      },
      {
        q: "How is a Lumba different from a regular rakhi?",
        a: "A regular rakhi is knotted on the brother’s wrist. A Lumba is made to sit with bangles — often with a hanging pendant — and is worn as festive jewellery, not tied the same way.",
      },
      {
        q: "Do I need a full Bhaiya Bhabhi set, or can I buy only a Lumba?",
        a: "Either works. Buy a matching set if you want one coordinated box. Buy a standalone Lumba if he already has a rakhi locally and you still want Bhabhi included.",
      },
      {
        q: "Can a Lumba Rakhi be sent to the USA?",
        a: "Yes. Order on UsaRakhi, enter the US address, and it ships domestically within America — typically 5–7 business days nationwide.",
      },
    ],
  },
  "what-is-bhaiya-bhabhi-rakhi": {
    closing: {
      heading: "One set, two blessings — that is the point",
      paragraphs: [
        "A Bhaiya Bhabhi Rakhi set is not extra decoration. It is how Raksha Bandhan keeps up with a married household: his thread, her Lumba, one unboxing.",
        "If they live in the USA, send the pair in one order, write both names on the note, and leave enough calendar so the box arrives before the call — not after the tilak.",
      ],
    },
    faqs: [
      {
        q: "What is inside a Bhaiya Bhabhi Rakhi set?",
        a: "Usually one traditional rakhi for your brother and one Lumba for Bhabhi, often in matching colours or finishes. Some sets also include roli, chawal, or a small sweet.",
      },
      {
        q: "Why send a set instead of only my brother’s rakhi?",
        a: "Because she is usually in the same room — or on the same video call. A set says the festival includes the couple, not only the sibling pair.",
      },
      {
        q: "Who ties the Lumba during the ceremony?",
        a: "Customs vary. You may gift it for her to wear with bangles, or a family member helps during the call. There is no single “correct” choreography; the intention is inclusion.",
      },
      {
        q: "Are Bhaiya Bhabhi sets available for USA delivery?",
        a: "Yes. UsaRakhi packs matching sets for domestic US shipping, so one address receives both pieces together.",
      },
    ],
  },
  "significance-of-rakhi-thread": {
    closing: {
      heading: "The thread is small. The promise is not",
      paragraphs: [
        "The rakhi thread was never valuable because of beads or gold tone. It is valuable because it is a visible vow: I see you, I pray for you, I am still your person — even when the wrist is in another country.",
        "If you cannot tie it in the same room, send the thread in time, keep roli and chawal in the box, and speak the blessing on the call. The material is modest. The meaning is not.",
      ],
    },
    faqs: [
      {
        q: "Why is a simple thread used instead of jewellery alone?",
        a: "In Indian tradition, a sacred thread marks a relationship and a blessing. Jewellery can decorate it, but the knot itself is the ritual — a reminder you can wear after the sweets are gone.",
      },
      {
        q: "Does the rakhi thread only mean the brother will protect the sister?",
        a: "That is the old wording. Today most families treat it as mutual care: showing up in hard weeks, staying reachable, and keeping the bond public once a year.",
      },
      {
        q: "Is a decorated designer rakhi less “authentic” than a plain thread?",
        a: "No. Motifs and beads are personal taste. The authenticity is in tying it with intention — and in the brother wearing it, not in how expensive the center looks.",
      },
      {
        q: "Can the significance survive if we only video-call?",
        a: "Yes, if the physical thread is already in his hands. The meaning lives in the knot and the words; the screen is just how you share the same hour.",
      },
    ],
  },
  "trending-rakhi-designs-usa-2026": {
    closing: {
      heading: "Choose the 2026 style that sounds like him — not the catalog",
      paragraphs: [
        "Minimal, Om, bracelet-style, pearl, handmade, kids’ motifs, family combos — 2026 has room for all of them. The trend that matters is the one he will still be wearing at dinner.",
        "If you are sending to the USA, lock the design early enough for domestic delivery before August 28, and skip the urge to pick whatever is loudest online. Style is taste. Arrival is love.",
      ],
    },
    faqs: [
      {
        q: "What rakhi designs are actually trending in the USA in 2026?",
        a: "Sisters are choosing slimmer minimal rakhis, traditional Om or Ganesha motifs, bracelet-style bands, pearl and bead work, eco-friendly handmade threads, and colorful kids’ designs — plus matching family combos.",
      },
      {
        q: "Will a bracelet-style rakhi still count as a “real” rakhi?",
        a: "Yes. It is still tied (or fastened) as the sacred thread. The bracelet look just sits more comfortably on brothers who wear modern accessories to work.",
      },
      {
        q: "Are eco-friendly or handmade rakhis sturdy enough to ship to America?",
        a: "When packed properly in a domestic US shipment, natural-material rakhis travel well. Avoid assuming an international parcel from India is kinder to dried flowers or seed rakhis.",
      },
      {
        q: "Should kids and adults in the same house get the same 2026 trend?",
        a: "Usually no. Kids want color and a motif they can name. Teens and adults often prefer quieter designs. Mix styles in one order rather than forcing a single look.",
      },
    ],
  },
  "video-call-raksha-bandhan-celebration-ideas": {
    closing: {
      heading: "Don’t hang up until the knot — and a date to meet",
      paragraphs: [
        "A video-call Raksha Bandhan is not a lesser festival if the rakhi is already in the room, the thali is visible, and you treat the hour as sacred instead of as a quick check-in.",
        "Send the thread days ahead, dress like it matters, share a sweet on both sides of the screen, and end with a real plan to be in the same city. The call is the bridge. The visit is the destination.",
      ],
    },
    faqs: [
      {
        q: "What time should we schedule a Rakhi video call between India and the USA?",
        a: "Start from his US time zone. Morning in California is evening in India; late morning on the East Coast often lines up with Indian night. Confirm August 28 on his calendar, not only yours.",
      },
      {
        q: "Should the rakhi arrive before the video call or can I show it on screen?",
        a: "It should already be in his hands. A picture of a rakhi is not a tying ceremony. Order early enough for USA delivery so he can open the box while you watch.",
      },
      {
        q: "Who ties the rakhi if I am only on the call?",
        a: "A spouse, roommate, child, or friend in the room can knot it while you speak the blessing. If he is alone, rest it on his wrist during the call and have someone finish the knot the same day.",
      },
      {
        q: "What should be on camera besides the rakhi?",
        a: "A small plate with roli and chawal if you have them, a sweet to share, and your faces. Skip a perfect background. Presence beats production.",
      },
    ],
  },
  "what-does-rakhi-symbolize": {
    closing: {
      heading: "What the rakhi is really saying when the knot is tied",
      paragraphs: [
        "Rakhi symbolizes more than protection in the old, one-way sense. It is love made visible: trust, care, and a yearly reminder that the sibling bond is still a living relationship, not a childhood souvenir.",
        "Whether you tie it in the same room or send it to a US address, the message is the same — I did not forget you. Wear this. Call me. We are still us.",
      ],
    },
    faqs: [
      {
        q: "What does a rakhi symbolize in simple words?",
        a: "It symbolizes love, trust, and a promise of care between siblings. The thread is a public reminder of a private bond.",
      },
      {
        q: "Why is rakhi tied on the wrist and not worn as a necklace?",
        a: "The wrist is traditional for a protective thread you can see during the day. It stays in sight — at work, at home — as a small, constant reminder after the ceremony ends.",
      },
      {
        q: "Does rakhi only symbolize a brother’s duty to protect his sister?",
        a: "That is one historic reading. Most families now treat it as mutual support: emotional backup, showing up, and staying connected through adult life.",
      },
      {
        q: "If we skip gifts, does the rakhi still carry the same meaning?",
        a: "Yes. Gifts are warmth. The symbol is the knot and the blessing. A thread with honest words outranks an expensive box with no ceremony.",
      },
    ],
  },
  "what-to-gift-bhabhi-on-raksha-bandhan": {
    closing: {
      heading: "Give Bhabhi a place in the festival — not a leftover gift",
      paragraphs: [
        "The best Raksha Bandhan gift for bhabhi is the one that says she is in the story: a Lumba or matching set, something she will actually use, and a note that uses her name.",
        "Jewellery, a small hamper, chocolates, or a practical accessory all work if they match her taste. Price is optional. Inclusion is not — especially when the box is traveling to the USA.",
      ],
    },
    faqs: [
      {
        q: "Is a Lumba Rakhi enough as a gift for Bhabhi, or should I add something else?",
        a: "A Lumba is the traditional piece and is enough on its own. Adding chocolates, a small keepsake, or pairing it in a Bhaiya Bhabhi set makes the unboxing feel complete if you want more than the bracelet.",
      },
      {
        q: "What if I don’t know her jewellery taste?",
        a: "Stay simple: a matching Bhaiya Bhabhi set, a neutral bracelet-style Lumba, or chocolates plus a handwritten note. Guessing a bold fashion jewellery style is how gifts get unused.",
      },
      {
        q: "Can I send Bhabhi’s gift in the same USA parcel as my brother’s rakhi?",
        a: "Yes — and you should when they share a home. One address, one tracking number, one family unboxing on the call.",
      },
      {
        q: "What should I write on a note for Bhabhi?",
        a: "Use her name and one clear line, such as: this Lumba is my Raksha Bandhan blessing for you both. That prevents confusion if she is new to the tradition.",
      },
    ],
  },
  "why-roli-chawal-is-used-in-rakhi": {
    closing: {
      heading: "Keep roli and chawal on the thali — even when the thali is on a laptop",
      paragraphs: [
        "Roli and chawal are not decoration. The red tilak is a blessing; the rice is a wish for plenty. Together they turn tying a thread into a short, complete puja.",
        "Most UsaRakhi rakhis include complimentary roli and chawal so a brother in the USA is not hunting for kumkum in a supermarket aisle. Send the kit with the rakhi, and the long-distance ceremony still has its traditional heart.",
      ],
    },
    faqs: [
      {
        q: "Why is roli applied on the brother’s forehead during Rakhi?",
        a: "Roli (kumkum) is used for an auspicious tilak — a blessing of strength, good fortune, and a formal start to the ritual before the thread is tied.",
      },
      {
        q: "Why are rice grains placed on the tilak?",
        a: "Uncooked rice (chawal) stands for prosperity, nourishment, and abundance. Placing a few grains on the tilak is a compact wish for a full life.",
      },
      {
        q: "Is the Rakhi ceremony incomplete without roli chawal?",
        a: "Families differ. The knot is still the core. Roli chawal is the traditional blessing layer — worth keeping if you can, not a reason to cancel the festival if you cannot.",
      },
      {
        q: "Will a UsaRakhi order include roli and chawal for a USA ceremony?",
        a: "Most rakhis include complimentary roli and chawal so you can do the tilak on a video call without a separate puja-shopping trip.",
      },
    ],
  },
  "send-rakhi-to-usa-best-rakhi-combos-gift-ideas": {
    closing: {
      heading: "Pack the thread with something he will share",
      paragraphs: [
        "Sending Rakhi to the USA works best when the box feels like a small celebration: the right rakhi for the people in that house, plus a combo or hamper if you want sweets on the table after the knot.",
        "Single, sets, Kids, Lumba, chocolates, dry fruits — choose for who will open the door, then order while August 28 is still weeks away. The gift ideas only matter if they arrive in time to be used.",
      ],
    },
    faqs: [
      {
        q: "What is the best rakhi combo to send to a brother in the USA?",
        a: "Match the household. One adult brother: a designer rakhi with Ferrero or Lindt. Kids: a playful rakhi with Hershey’s. Married couple: a Bhaiya Bhabhi set, optionally with chocolates in the same order.",
      },
      {
        q: "Can I send more than one rakhi in a single USA gift?",
        a: "Yes. Sets of 2, 3, or 4 rakhis, plus combos and hampers, keep several threads in one shipment so cousins or brothers in the same home open together.",
      },
      {
        q: "Is a hamper better than a chocolate combo for USA delivery?",
        a: "A hamper is better when you want Indian sweets and dry fruits as well as the rakhi. A chocolate combo is cleaner if you only want the thread plus a treat that travels well in summer.",
      },
      {
        q: "How do I order combos from India for a US address?",
        a: "Shop on UsaRakhi, add the full US address (apartment and ZIP), pay in INR or USD, and we fulfill inside America so he is not waiting on customs.",
      },
    ],
  },
  "send-rakhi-to-usa-from-india": {
    closing: {
      heading: "Send it like the day cannot wait — because it cannot",
      paragraphs: [
        "You are not “just ordering online.” You are refusing to let an ocean cancel a promise. Start with a single rakhi if this is your first USA order, or a combo if you want the unboxing to feel abundant.",
        "Enter the complete US address, pay from India in INR if you like, and give the box a head start on August 28. The ritual can still happen on time — on a call, with roli in the lid, with his wrist on the screen.",
      ],
    },
    faqs: [
      {
        q: "Can I pay in rupees if the rakhi is going to a US address?",
        a: "Yes. UsaRakhi checkout supports Razorpay in INR (UPI, cards, netbanking) and Stripe in USD. You order from India; delivery is to his American address.",
      },
      {
        q: "If I order from India, does the parcel fly from India?",
        a: "No. UsaRakhi fulfills from within the United States. That is how you avoid weeks of international transit and customs holds for your brother.",
      },
      {
        q: "What details does a US address need so the rakhi actually arrives?",
        a: "Full name, street, apartment or suite, city, state, and 5-digit ZIP. University halls need building and room; offices need the company name. A missing unit number is how boxes bounce.",
      },
      {
        q: "When should I order from India for Raksha Bandhan 2026?",
        a: "Aim for July 25–August 1 for a calm buffer. August 5–6 can still work for express to major metros. After mid-August, message WhatsApp before you assume it will make Friday, August 28.",
      },
    ],
  },
  "best-rakhi-combo-with-chocolates": {
    closing: {
      heading: "Let the chocolate be part of the ceremony, not a leftover",
      paragraphs: [
        "Tradition is the thread. Delight is the chocolate. Ask him to open the box on camera, share a piece, and read the line you wrote — that is the combo doing its real job.",
        "Pick Ferrero or Lindt for adult brothers, Hershey’s for kids and casual tastes, skip nuts if there is any allergy, and order ten days before Raksha Bandhan so the treat arrives with the rakhi, not after it.",
      ],
    },
    faqs: [
      {
        q: "Which chocolate rakhi combo is best for an adult brother in the USA?",
        a: "Ferrero Rocher or Lindt with a designer or traditional rakhi. They read as a grown-up gift and photograph well if Bhabhi or colleagues see the box.",
      },
      {
        q: "Is Hershey’s only for kids?",
        a: "It is the most natural fit for kids, teens, and campus life. Some adult brothers still prefer it. Match his snack habits, not a luxury ranking.",
      },
      {
        q: "Will chocolates melt on the way to Texas or Arizona?",
        a: "Domestic US shipping is far kinder than an international parcel on a tarmac, but summer porches are hot. Ask him to bring the box inside the day it lands.",
      },
      {
        q: "What if my brother has a nut allergy?",
        a: "Skip Ferrero-style hazelnut chocolates. Send a clearly labeled milk-chocolate option or a rakhi without chocolate plus a note. Guessing is not worth the risk.",
      },
    ],
  },
  "bhaiya-bhabhi-rakhi-guide": {
    closing: {
      heading: "Include her. Then enjoy the call",
      paragraphs: [
        "A Bhaiya Bhabhi set is how the festival keeps up with the family you actually have. Send the pair, write her name, and leave enough time for domestic USA delivery.",
        "On the day, ask them to show both wrists. Bless the couple. If she ties his rakhi because you cannot, the Lumba is how you thank her — not a side thought in the packing slip.",
      ],
    },
    faqs: [
      {
        q: "What if Bhabhi is not Indian and has never heard of Lumba?",
        a: "Send it anyway, with one sentence in the box explaining it is a Raksha Bandhan bracelet-blessing for her as family. Confusion disappears when the meaning is written down.",
      },
      {
        q: "Should the brother’s rakhi and the Lumba match?",
        a: "Matching sets look intentional in photos and on a video call. Mixing two unrelated products often looks like an afterthought.",
      },
      {
        q: "Can I add kids’ rakhis to a Bhaiya Bhabhi USA order?",
        a: "Yes. If children are in the home, add Kids Rakhi to the same checkout so nobody is left out of the morning unboxing.",
      },
      {
        q: "How fast do these sets arrive in the USA?",
        a: "Typically 5–7 business days nationwide. UsaRakhi 3-day delivery ($19) arrives August 29, because the shipment is domestic — not an import.",
      },
    ],
  },
  "raksha-bandhan-2026-usa": {
    closing: {
      heading: "Arrive before the muhurat, not during it",
      paragraphs: [
        "Friday, August 28, 2026 will not wait for a late scan. Match the household — single rakhi, combo, Bhaiya Bhabhi, or Kids — then treat the video call as the ceremony, not as a tracking update.",
        "Order in the July 25–August 1 window if you want peace. Use express around August 5–6 for big metros. That is how Raksha Bandhan stays a festival in the USA, not a shipping story.",
      ],
    },
    faqs: [
      {
        q: "When is Raksha Bandhan 2026 in the United States?",
        a: "Friday, August 28, 2026, on Bhadrapada Purnima. Confirm local muhurat with a temple or panchang; some US cities may note August 27 depending on lunar timing.",
      },
      {
        q: "Should we follow India muhurat or US muhurat on the call?",
        a: "Follow his local US date — he is wearing the rakhi. Pick a call time that is still August 28 where he lives, even if it is already night in India.",
      },
      {
        q: "What is the last sensible day to order UsaRakhi for 2026?",
        a: "August 5–6 for express to major metros. For nationwide 5–7 day shipping, do not treat mid-August as comfortable. After August 12–15, ask WhatsApp before you rely on it.",
      },
      {
        q: "Do you deliver to all 50 states for Raksha Bandhan?",
        a: "Yes — including California, New York, Texas, Florida, New Jersey, Illinois, and every other state.",
      },
    ],
  },
  "kids-rakhi-guide-usa": {
    closing: {
      heading: "Pick a rakhi he will still be wearing at dinner",
      paragraphs: [
        "Kids are honest. Soft thread, a motif he can name, and an age that matches the catalog photo — that is how a Kids Rakhi survives past lunch in an American school day.",
        "Order 10–14 days before August 28, skip heavy metal for toddlers, skip cartoon branding for teens, and put chocolates in the box only if you know they are allowed. The best kids’ rakhi is the one that stays on.",
      ],
    },
    faqs: [
      {
        q: "Are Kids Rakhis safe for toddlers in the USA?",
        a: "Choose soft-thread designs without sharp metal or tiny parts he could chew. When in doubt, pick a simple colorful rakhi and skip heavy pendants.",
      },
      {
        q: "Should a 15-year-old get a cartoon Kids Rakhi?",
        a: "Usually no. Teens often want a slim or designer single rakhi. Keep chocolate in the box if you still want a playful unboxing.",
      },
      {
        q: "Can I mix a Kids Rakhi and an adult rakhi in one USA order?",
        a: "Yes — and it is the cleanest option when several brothers share a home. One doorbell, two (or more) designs that actually fit the wearers.",
      },
      {
        q: "When should I order Kids Rakhi for Raksha Bandhan 2026?",
        a: "Ten to fourteen days before August 28, or by August 5–6 for express to major US cities.",
      },
    ],
  },
  "lumba-rakhi-meaning-usa": {
    closing: {
      heading: "Send a Lumba she can wear — not a second brother’s rakhi",
      paragraphs: [
        "Lumba Rakhi is a bracelet blessing for Bhabhi, meant to sit with bangles. If she lives in the USA, the meaning does not change; only the last mile does.",
        "Shop a standalone Lumba or a matching Bhaiya Bhabhi set, use her name on the note, and ship domestically so August 28 is about family, not customs.",
      ],
    },
    faqs: [
      {
        q: "What does “Lumba” actually mean?",
        a: "It refers to the hanging, bracelet-like style — often a pendant with beads — worn on the sister-in-law’s wrist with her bangles, as a blessing for the couple.",
      },
      {
        q: "Can I send only a Lumba to a US address if my brother already has a rakhi?",
        a: "Yes. Standalone Lumba rakhis are for exactly that situation. Sets are better when you want both pieces in one coordinated gift.",
      },
      {
        q: "How should Bhabhi wear a Lumba on Rakhi day in America?",
        a: "With her bangles, as jewellery, during the ceremony and often through the day. It is not knotted the same way as a brother’s thread.",
      },
      {
        q: "Do Lumba orders to the USA include roli chawal?",
        a: "Most UsaRakhi rakhis include complimentary roli and chawal. Check the product details on the Lumba or set you choose.",
      },
    ],
  },
  "rakhi-hamper-gift-box-usa": {
    closing: {
      heading: "Send a whole thali’s worth of festival — in one box",
      paragraphs: [
        "A hamper is for the year you want more than a thread: designer rakhi, mithai, dry fruits, roli chawal, one American doorbell.",
        "Read the what’s-included list, pick a duo hamper if more than one brother will celebrate, and order 10–14 days before August 28 so the sweetness is part of the ritual, not a sequel.",
      ],
    },
    faqs: [
      {
        q: "What is usually inside a UsaRakhi hamper for the USA?",
        a: "A designer rakhi or set, Indian sweets such as kaju katli or laddoo, measured dry fruits, sometimes chocolates, and often a roli chawal tikka set. Each product page lists quantities.",
      },
      {
        q: "Is a hamper better than a chocolate-only combo?",
        a: "Choose a hamper when you want Indian sweets and nuts as well. Choose a combo when you only want rakhi plus chocolates that travel cleanly in summer.",
      },
      {
        q: "Will sweets stay good in a 5–7 day US shipment?",
        a: "Packed mithai and dry fruits are chosen because they travel. Still order with a buffer, and ask him not to leave the box on a hot porch.",
      },
      {
        q: "Can one hamper cover two brothers in the same apartment?",
        a: "Pick a duo or multi-rakhi hamper so both wrists are covered. A single-rakhi hamper is for one brother even if the sweets are shared.",
      },
    ],
  },
  "best-website-send-rakhi-usa-2026": {
    closing: {
      heading: "Use the checklist, then order once — not twice in panic",
      paragraphs: [
        "The best website to send Rakhi to the USA in 2026 is the one that treats August 28 as a deadline: domestic fulfillment, published delivery windows, a catalog for real families, INR and USD checkout, and a human you can reach.",
        "If UsaRakhi is the fit, order while August still has weeks left. Switching sites on the 20th is how rakhis arrive in September.",
      ],
    },
    faqs: [
      {
        q: "What is the #1 thing a USA Rakhi website must have?",
        a: "Domestic US fulfillment. If the parcel is an international shipment from India, your brother can sit in customs while Purnima passes — pretty photos will not fix that.",
      },
      {
        q: "How is UsaRakhi different from shipping a rakhi myself from India?",
        a: "You still order online from anywhere. The pack-and-ship step happens inside America, so he receives a normal US delivery.",
      },
      {
        q: "Do I need USD to order if I live in India?",
        a: "No. Razorpay accepts INR (UPI, cards, netbanking). Stripe is there for USD cards. Use whichever is easier.",
      },
      {
        q: "What delivery window should a trustworthy site publish?",
        a: "Real numbers: about 2–3 business days express to major metros and 5–7 days nationwide, plus order-by dates for Raksha Bandhan — not just “fast worldwide.”",
      },
    ],
  },
  "rakhi-usa-domestic-shipping-no-customs": {
    closing: {
      heading: "The festival is the deadline. Ship like it",
      paragraphs: [
        "You cannot negotiate with Purnima. You can choose a last mile that does not add a border between your blessing and his wrist.",
        "Domestic USA Rakhi shipping is that choice: packed in California, handed to a US carrier, delivered like any other American package — so August 28 is still a ceremony, not a customs screenshot.",
      ],
    },
    faqs: [
      {
        q: "Does UsaRakhi ship from within the USA?",
        a: "Yes. Orders are fulfilled domestically. Sisters can order from India or anywhere; brothers receive a US delivery.",
      },
      {
        q: "Will my brother pay customs or duties on a UsaRakhi order?",
        a: "No. Because the shipment is domestic, there is no international customs process for the recipient.",
      },
      {
        q: "How fast is domestic Rakhi delivery compared with India Post?",
        a: "Typically 5–7 business days nationwide, versus 2–4 weeks (or longer) for many international parcels — with none of the customs stall.",
      },
      {
        q: "Is domestic shipping only useful if I live in India?",
        a: "No. It also helps sisters already in America sending to a brother in another state, and families ordering from the UK, Canada, or Australia to a US address.",
      },
    ],
  },
};

const FAQ_HEADING = /^(faqs?|frequently asked questions)$/i;
const GENERIC_CLOSING = /^(final thoughts|conclusion)$/i;
const NUMBERED_QUESTION = /^\d+\.\s+.+\?$/;

export function applyHandwrittenEndMatter<
  T extends {
    slug: string;
    sections: { heading?: string; paragraphs: string[] }[];
    faqs?: BlogFaq[];
    closing?: BlogClosing;
  },
>(post: T): T {
  const extra = handwrittenBlogEndMatter[post.slug];
  if (!extra) return post;

  const closingHeading = extra.closing?.heading.replace(/\.$/, "").trim().toLowerCase() ?? "";

  const sections = post.sections.filter((section) => {
    const heading = section.heading?.trim() ?? "";
    if (FAQ_HEADING.test(heading)) return false;
    if (NUMBERED_QUESTION.test(heading)) return false;
    if (GENERIC_CLOSING.test(heading)) return false;
    if (closingHeading && heading.replace(/\.$/, "").toLowerCase() === closingHeading) return false;
    return true;
  });

  return {
    ...post,
    sections,
    faqs: extra.faqs,
    closing: extra.closing,
  };
}
