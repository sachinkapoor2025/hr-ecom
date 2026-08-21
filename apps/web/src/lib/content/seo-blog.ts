import type { BlogPost } from "./blog-posts";
import { categoryHref } from "@/lib/category-urls";
import { getSeoBlogEntry, seoBlogEntries, type SeoBlogEntry } from "./seo-data";

const PUBLISHED = "2026-06-15";
const UPDATED = "2026-08-19";

type Theme =
  | "delivery"
  | "gift"
  | "tradition"
  | "family"
  | "sister"
  | "kids"
  | "quotes"
  | "personal"
  | "general";

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(slug: string, items: T[], salt = 0): T {
  return items[(hashSlug(slug) + salt) % items.length];
}

function titleCaseKeyword(keyword: string): string {
  return keyword
    .split(/\s+/)
    .map((w) => {
      const lower = w.toLowerCase();
      if (lower === "usa") return "USA";
      if (lower === "nri" || lower === "nris") return lower.toUpperCase();
      if (lower === "vs") return "vs";
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

function detectTheme(keyword: string): Theme {
  const k = keyword.toLowerCase();
  if (
    /delivery|deadline|tracking|confirmation|how many days|how early|best time|order cancellation|exchange policy|first time buyer|shopping checklist|shopping tips/.test(
      k,
    )
  ) {
    return "delivery";
  }
  if (/quote|wish|caption|message/.test(k)) return "quotes";
  if (/history|puja|muhurat|roli|symbolize|thread|tradition|tie rakhi|store rakhi|recycl/.test(k)) {
    return "tradition";
  }
  if (/lumba|bhabhi|sister-in-law|brother in law|newly|adopted|step brother|cousin|friendship|friends|twin/.test(k)) {
    return "family";
  }
  if (/for sister|gift for sister|pregnant|expecting|working sister|studying abroad/.test(k)) return "sister";
  if (/kids|younger|college brother/.test(k)) return "kids";
  if (/custom|personalized|with name|with photo|wrapping|packaging/.test(k)) return "personal";
  if (/gift|combo|hamper|budget|price|under|affordable|luxury|eco|handmade|designer|modern/.test(k)) return "gift";
  return "general";
}

function humanTitle(entry: SeoBlogEntry): string {
  const topic = titleCaseKeyword(entry.keyword);
  const theme = detectTheme(entry.keyword);
  const titles: Record<Theme, string[]> = {
    delivery: [
      `${topic}: The Calm Way to Make Rakhi Morning Unforgettable`,
      `Don't Leave It to Chance — ${topic} That Actually Arrives`,
      `${topic} Without the Panic: A Sister's Honest Playbook`,
    ],
    gift: [
      `${topic} That Feel Heartfelt — Not Like an Afterthought`,
      `Cherished ${topic}: Gifts He Will Remember Long After the Thread`,
      `${topic} With Real Warmth, Not Just a Pretty Box`,
    ],
    tradition: [
      `${topic}: The Sacred Meaning Behind a Simple Thread`,
      `Why ${topic} Still Moves Families Across Oceans`,
      `${topic} — A Tender Guide for Modern Siblings`,
    ],
    family: [
      `${topic}: Celebrate the Whole Family, Not Just One Wrist`,
      `A Heartfelt Guide to ${topic} When Love Has Grown`,
      `${topic} That Honors Every Bond Under One Roof`,
    ],
    sister: [
      `${topic}: Thoughtful Gestures She Will Feel, Not Just See`,
      `${topic} — Warm, Personal, and Worthy of Her`,
      `Send Love Home: ${topic} That Crosses Every Mile`,
    ],
    kids: [
      `${topic} Little Brothers Will Actually Want to Wear`,
      `${topic}: Joyful, Safe, and Full of Festival Spark`,
      `Make His Face Light Up — ${topic} Done Right`,
    ],
    quotes: [
      `${topic} That Sound Like You, Not a Greeting Card`,
      `Heartfelt ${topic} When Words Have to Travel Far`,
      `${topic}: Tender Lines for a Bond That Never Fades`,
    ],
    personal: [
      `${topic}: Make the Gesture Unmistakably His`,
      `${topic} With a Personal Touch He Can't Ignore`,
      `From Your Hands to His Wrist — ${topic}`,
    ],
    general: [
      `${topic}: A Complete, Human Guide for Sisters Abroad`,
      `${topic} Without Losing the Emotion of Home`,
      `Everything You Need to Know About ${topic} — Written for Real Families`,
    ],
  };
  return pick(entry.slug, titles[theme]);
}

function humanExcerpt(entry: SeoBlogEntry): string {
  const topic = titleCaseKeyword(entry.keyword).toLowerCase();
  return pick(entry.slug, [
    `If ${topic} has been sitting on your mind, this is the honest, heartfelt guide — written for sisters who refuse to let distance steal Raksha Bandhan.`,
    `A warmer, more practical look at ${topic}: the feelings, the timing, and the small choices that make the festival feel close again.`,
    `Distance can make Rakhi bittersweet. This guide on ${topic} helps you send something precious — and on time — to the USA.`,
  ]);
}

function humanDescription(entry: SeoBlogEntry): string {
  const topic = titleCaseKeyword(entry.keyword);
  return `${topic} — a detailed, human UsaRakhi guide for sisters sending Rakhi to the USA. Heartfelt advice, real delivery timelines, and gifts that still feel like home.`;
}

function openingHook(slug: string, topic: string): string {
  return pick(slug, [
    `There is a particular ache that shows up in July. The calendar says Raksha Bandhan is coming, and your brother's life is happening in another country. The thali is ready in your mind. His wrist is not in the room. That is why ${topic.toLowerCase()} matters more than a product page will ever admit.`,
    `You can measure the miles on a map. On Rakhi morning you measure them in the empty chair, the video-call lag, the second you wait for him to smile. ${topic} is not a shopping task. It is how you keep a sacred promise across an ocean.`,
    `Some festivals forgive a late parcel. Raksha Bandhan does not. The thread has a day. The blessing has a moment. If you are thinking about ${topic.toLowerCase()}, you are already doing the loving thing: you are trying to arrive before the moment slips away.`,
    `Sisters who live far from their brothers become experts at two things: missing people, and making a plan. ${topic} sits right in the middle — equal parts devotion and logistics, equal parts heart and tracking number.`,
  ]);
}

function shopLineFor(theme: Theme): string {
  if (theme === "kids") {
    return `Browse Kids Rakhi for USA delivery at ${categoryHref("kids-rakhi")}.`;
  }
  if (theme === "family") {
    return `Shop Bhaiya Bhabhi sets (${categoryHref("bhaiya-bhabhi-rakhi")}) and Lumba Rakhi (${categoryHref("lumba-rakhi")}).`;
  }
  if (theme === "gift" || theme === "sister") {
    return `See Rakhi Combos (${categoryHref("rakhi-combo")}) and Hampers (${categoryHref("rakhi-hampers")}).`;
  }
  return `Start with Single Rakhi for USA delivery (${categoryHref("single-rakhi")}).`;
}

function uniqueFaqs(entry: SeoBlogEntry, topic: string, theme: Theme): { q: string; a: string }[] {
  const k = entry.keyword.toLowerCase();

  if (/how many days|delivery confirmation|tracking|deadline calculator/.test(k)) {
    return [
      {
        q: `How many days does ${topic.toLowerCase()} usually take?`,
        a: "UsaRakhi ships from within the USA. Most orders arrive nationwide in 5–7 business days; major metros often see 2–3 day express. That is calendar time after dispatch — not a guess about customs.",
      },
      {
        q: `Will I get confirmation or tracking for ${topic.toLowerCase()}?`,
        a: "Yes. After dispatch you receive tracking for a domestic US shipment. Share it with your brother so building desks and gated communities actually release the box.",
      },
      {
        q: "Does a later scan mean the rakhi missed Raksha Bandhan?",
        a: "Not if you ordered with a buffer. A scan on August 29 is what you avoid by ordering in late July or by August 5–6 for express metros.",
      },
      {
        q: "Can I still order if I am already inside the last two weeks?",
        a: "Message WhatsApp with the ZIP code before you assume. Express can still rescue some metros; remote addresses need honesty, not hope.",
      },
    ];
  }

  if (/how early|best time to order|first time buyer|shopping checklist|shopping tips/.test(k)) {
    return [
      {
        q: `When is the best time for ${topic.toLowerCase()}?`,
        a: "For Raksha Bandhan 2026 (August 28), the calm window is July 25–August 1. August 5–6 still works for express to New York, Los Angeles, Chicago, Houston, San Francisco, and New Jersey.",
      },
      {
        q: "What should a first-time USA Rakhi order include besides the thread?",
        a: "A complete address (apartment + ZIP), roli chawal if you want a proper tilak, and a short note. Combos are optional; the address is not.",
      },
      {
        q: "Do I order earlier for Alaska, Hawaii, or campus mailrooms?",
        a: "Yes. Add extra days for remote ZIPs and university housing, which often need a hall name and room number.",
      },
      {
        q: "Is same-day dispatch the same as same-day delivery?",
        a: "No. Same-day dispatch means the box leaves our side before cut-off. Transit is still 2–7 business days depending on the destination.",
      },
    ];
  }

  if (/exchange policy|cancellation|return gift/.test(k)) {
    return [
      {
        q: `Can I cancel or change ${topic.toLowerCase()} after paying?`,
        a: "Contact UsaRakhi as soon as possible on WhatsApp or email. If the order has not dispatched, changes are usually possible. After it is with a US carrier, options narrow.",
      },
      {
        q: "What if the address was wrong?",
        a: "Write to support with the order details immediately. A missing apartment number is the most common reason a festival box bounces.",
      },
      {
        q: "Do you offer returns on opened rakhis?",
        a: "Rakhis are festival, personal goods. If something arrives damaged, contact support with photos — we sort genuine issues; we cannot take back a used ceremonial thread.",
      },
      {
        q: "What makes a good return gift from a brother in the USA?",
        a: "Whatever he can actually send on time: a note, a transfer, a small Amazon gift. The rakhi’s meaning does not depend on an expensive return present.",
      },
    ];
  }

  if (/lumba|bhabhi|sister-in-law|brother in law/.test(k)) {
    return [
      {
        q: `Is ${topic.toLowerCase()} for my brother, Bhabhi, or both?`,
        a: "A Lumba is for Bhabhi. A Bhaiya Bhabhi set is both: his rakhi plus her bracelet-style piece. Do not send her a standard brother’s rakhi and hope it looks right on bangles.",
      },
      {
        q: "How is a Lumba worn on Rakhi day?",
        a: "On the wrist with bangles, as festive jewellery. It is not knotted the same way as a brother’s thread.",
      },
      {
        q: "What if Bhabhi is new to this tradition?",
        a: "Include one sentence in the box using her name: this bracelet is my Raksha Bandhan blessing for you both. That turns confusion into belonging.",
      },
      {
        q: `Can I send ${topic.toLowerCase()} to a US address from India?`,
        a: "Yes. Order on UsaRakhi with their US address. We ship domestically inside America so they are not waiting on customs.",
      },
    ];
  }

  if (/kids|younger|gift for kids/.test(k)) {
    return [
      {
        q: `What makes ${topic.toLowerCase()} different from an adult rakhi?`,
        a: "Softer threads, lighter centers, and a motif a child can name. Heavy kundan looks impressive in photos and uncomfortable by lunch.",
      },
      {
        q: "Is a cartoon rakhi right for a teenager?",
        a: "Usually no. Teens often want a slim, quieter rakhi. Keep chocolates if you still want a fun unboxing.",
      },
      {
        q: "Are small beads safe for toddlers?",
        a: "Skip tiny detachable parts and sharp metal. Choose rounded, soft-thread kids rakhis when he still puts things in his mouth.",
      },
      {
        q: "Can I add chocolates to a kids’ USA order?",
        a: "Yes, if you know there is no allergy and candy is allowed at home. Hershey’s-style combos are the usual fit.",
      },
    ];
  }

  if (/quote|wish|caption|message/.test(k)) {
    return [
      {
        q: `Should ${topic.toLowerCase()} be in English or Hindi?`,
        a: "Use the language you actually speak with him. A mixed line — one Hindi sentence plus a memory in English — often sounds the most like home.",
      },
      {
        q: "Is it okay to read the message on a video call instead of printing it?",
        a: "Yes — and it is often better. Then leave a short printed line in the box so he can keep the words after you hang up.",
      },
      {
        q: "What if I am not a poetic writer?",
        a: "Name one real memory. Generic couplets fade; “the night you waited at the station” does not.",
      },
      {
        q: "How long should a Rakhi message be?",
        a: "Four to eight honest lines beat a page of borrowed quotes. If he will read it on a phone, keep it short enough to finish.",
      },
    ];
  }

  if (/history|puja|muhurat|roli|symbolize|thread|tie rakhi|store rakhi|recycl|tradition/.test(k)) {
    return [
      {
        q: `Does ${topic.toLowerCase()} change if we live in the USA?`,
        a: "The meaning does not. The clock and the shipping do. Follow his local date for tying, and get the physical rakhi there before muhurat — not during it.",
      },
      {
        q: "Do we need a full puja kit for a correct Rakhi?",
        a: "A thali with roli, chawal, a rakhi, and a sweet is enough for most families. Most UsaRakhi rakhis include roli and chawal so the tilak can still happen on a call.",
      },
      {
        q: "Which wrist is rakhi tied on?",
        a: "Traditionally the right wrist, though families vary. What matters is that it is tied with the blessing, not a debate about left versus right on a laggy call.",
      },
      {
        q: "What should we do with last year’s rakhi?",
        a: "Many families keep it in the puja space or untie it respectfully before the new one. There is no single rule — skip throwing a sacred thread in the trash if that bothers you; a quiet drawer is fine.",
      },
    ];
  }

  if (/under \d+|affordable|price range|budget|luxury/.test(k)) {
    return [
      {
        q: `Does ${topic.toLowerCase()} look cheap compared with a designer rakhi?`,
        a: "Not if you pick for his taste. A well-made simple rakhi with roli chawal and a note outranks a flashy piece that does not suit him. Budget is a constraint, not a verdict on love.",
      },
      {
        q: "Can I still add chocolates on a tighter budget?",
        a: "Yes. A Hershey’s-style combo is often more practical than a luxury hamper. Spend on delivery buffer before you spend on extra SKUs.",
      },
      {
        q: `Is ${topic.toLowerCase()} enough for a married brother’s household?`,
        a: "If Bhabhi is there, add a Lumba or choose a Bhaiya Bhabhi set even if the rakhis themselves are simple. Inclusion matters more than price tier.",
      },
      {
        q: "Will a lower-priced rakhi still include roli chawal?",
        a: "Most UsaRakhi rakhis do. Check the product details so the tilak is not an extra errand in the USA.",
      },
    ];
  }

  if (/custom|personalized|with name|with photo|wrapping|packaging/.test(k)) {
    return [
      {
        q: `Can every UsaRakhi product do ${topic.toLowerCase()}?`,
        a: "Not every SKU is engraved. If the product is not custom-printed, add the personal layer yourself: a name on the note, a childhood photo, a line only the two of you know.",
      },
      {
        q: "Will a photo rakhi hold up in the mail?",
        a: "Domestic US packing is gentler than an international envelope. Still order with a buffer so it is not crushed in a last-minute rush.",
      },
      {
        q: "Is gift wrap worth it for USA delivery?",
        a: "A clean festival box plus your words beats fussy wrap that tears in transit. Presentation is the unboxing on camera, not extra paper.",
      },
      {
        q: "How do I make a standard rakhi feel personalized?",
        a: "Write. One specific sentence in the lid does more than a generic “custom” label with no memory attached.",
      },
    ];
  }

  if (/eco|handmade|designer|modern|combo|hamper|gift/.test(k)) {
    return [
      {
        q: `What should be inside ${topic.toLowerCase()} besides the rakhi?`,
        a: "Only what that brother will use: chocolates for a combo, mithai and dry fruits for a hamper, nothing extra for a minimalist. Padding a box with items he will throw away is not generosity.",
      },
      {
        q: "Will sweets or chocolates survive shipping to the USA?",
        a: "In a domestic US shipment, packed mithai, dry fruits, and boxed chocolates travel far better than an international parcel sitting in heat. Still ask him to bring the box inside in Texas or Arizona summers.",
      },
      {
        q: `Is ${topic.toLowerCase()} better than a single rakhi?`,
        a: "It is better when you want the unboxing to feel like a celebration. A single rakhi is complete as ritual. Add a combo or hamper when you want something to share after the knot.",
      },
      {
        q: "Can one box cover more than one brother?",
        a: "Choose a multi-rakhi set or hamper listed for two or more. Do not assume a single-rakhi gift box includes extra threads.",
      },
    ];
  }

  if (/for sister|pregnant|expecting|studying abroad|working sister/.test(k)) {
    return [
      {
        q: `Is ${topic.toLowerCase()} different from gifting my brother?`,
        a: "Yes. She may not need a wrist thread in the same way. Think comfort, a note, a hamper, or something useful in her US life — not a second copy of his rakhi.",
      },
      {
        q: "What should I avoid sending a pregnant sister?",
        a: "Skip heavy perfume sets you have not confirmed, and do not assume herbal products are automatically safe. When unsure, a simple rakhi-for-the-brother-in-her-home plus a gentle note to her is kinder than a medical guess.",
      },
      {
        q: "Can I send this to a campus or office in the USA?",
        a: "Yes, if the address includes hall/room or company and floor. Dorm desks are strict; incomplete labels bounce.",
      },
      {
        q: "Should the gift arrive before Rakhi day or on the day?",
        a: "Before. Build 5–7 business days, more for campuses that slow down in August.",
      },
    ];
  }

  const themed: Record<Theme, { q: string; a: string }[]> = {
    delivery: [
      {
        q: `How does ${topic} work if I am ordering from outside the USA?`,
        a: `You place the order online and enter his US address. UsaRakhi fulfills inside America, so ${topic.toLowerCase()} does not depend on an India-to-US customs line.`,
      },
      {
        q: `How long should I allow for ${topic.toLowerCase()} before August 28, 2026?`,
        a: "Plan 5–7 business days nationwide, or 2–3 days express to major metros. The stress-free order window is late July through August 1.",
      },
      {
        q: `Will ${topic.toLowerCase()} require my brother to deal with US customs?`,
        a: "Not with UsaRakhi’s domestic fulfillment. He receives a normal US package.",
      },
      {
        q: `What address details does ${topic.toLowerCase()} need?`,
        a: "Full name, street, apartment or suite, city, state, and ZIP. Missing unit numbers are the main reason festival boxes fail.",
      },
    ],
    gift: [
      {
        q: `Who is ${topic} really for?`,
        a: "Match the person in that US home: kids, an adult brother, or a couple. The keyword is a search; the wearer is the decision.",
      },
      {
        q: `Can ${topic.toLowerCase()} include chocolates or sweets?`,
        a: "Many UsaRakhi combos and hampers do. Check the product’s what’s-included list rather than assuming.",
      },
      {
        q: `Is ${topic.toLowerCase()} enough on its own, or do I still send a rakhi separately?`,
        a: "If the product is a combo or hamper, the rakhi is already in the box. Do not double-order a second thread unless you have a second brother.",
      },
      {
        q: `When should I order ${topic.toLowerCase()} for Raksha Bandhan 2026?`,
        a: "Ten to fourteen days ahead for a calm nationwide delivery; earlier for remote ZIP codes.",
      },
    ],
    tradition: [
      {
        q: `Does ${topic} still apply if we only meet on a video call?`,
        a: "Yes — if the rakhi is physically with him. The tradition needs a thread on a wrist, not only a feeling on a screen.",
      },
      {
        q: `What items do I need at home to honor ${topic.toLowerCase()}?`,
        a: "Rakhi, roli, chawal, and a sweet if you can. Most UsaRakhi orders include roli and chawal so a US apartment is not missing the tilak.",
      },
      {
        q: `Is ${topic.toLowerCase()} the same in every Indian family?`,
        a: "Details vary by region. The shared core is a blessing and a knot. Do not let a comment-section argument cancel your ceremony.",
      },
      {
        q: `Can I keep ${topic.toLowerCase()} alive from India while he lives in the USA?`,
        a: "Yes. Order early, ship domestically via UsaRakhi, and speak the blessing on the call when he opens the box.",
      },
    ],
    family: [
      {
        q: `Does ${topic} include people beyond my brother?`,
        a: "That is the point of this topic — cousins, Bhabhi, step-siblings, friends who became family. Buy the pieces that match who will actually be in the room.",
      },
      {
        q: "Should everyone get the identical rakhi?",
        a: "Kids and adults usually should not. Matching sets are for a couple; mixed designs are for mixed ages.",
      },
      {
        q: `Can ${topic.toLowerCase()} go to one US address?`,
        a: "Yes. One household, one checkout, one tracking number is kinder than three parcels arriving on three days.",
      },
      {
        q: "What do I write if someone is new to Rakhi?",
        a: "One plain sentence of meaning. Do not assume they know Lumba, tilak, or why a thread is sacred.",
      },
    ],
    sister: [
      {
        q: `How is ${topic} different from sending rakhi to my brother?`,
        a: "You are celebrating her. Focus on what she needs in her US life, plus words that sound like you — not a copy of his wrist thread unless that is truly the custom in your family.",
      },
      {
        q: "Will a hamper work better than jewellery I have not seen her wear?",
        a: "Often yes. Guessing a gold style from another continent is how gifts sit unused. A hamper and a note are safer when you are unsure.",
      },
      {
        q: `Can I send ${topic.toLowerCase()} to a shared apartment?`,
        a: "Yes, with a complete address and her name on the label so roommates do not return it.",
      },
      {
        q: "When should it arrive relative to Rakhi day?",
        a: "A few days before August 28, 2026, so she is not opening a festival box after the call ended.",
      },
    ],
    kids: [
      {
        q: `What should I check before ordering ${topic.toLowerCase()}?`,
        a: "Age, allergies, and whether a cartoon motif will embarrass a older child. Comfort beats sparkle.",
      },
      {
        q: "Can toddlers wear these rakhis all day?",
        a: "Only if the piece is soft and has no sharp or chewable parts. Plan for a parent to loosen or remove it if it bothers him.",
      },
      {
        q: `Does ${topic.toLowerCase()} ship to all US states?`,
        a: "Yes. UsaRakhi delivers Kids Rakhi nationwide with domestic shipping.",
      },
      {
        q: "Should I include chocolates for a school-age brother?",
        a: "If candy is allowed at home and there is no allergy, a small chocolate add-on makes the unboxing more fun on camera.",
      },
    ],
    quotes: [
      {
        q: `Where do I put ${topic.toLowerCase()} — in the box or on the call?`,
        a: "Both if you can: a short printed line in the lid, and the longer words spoken on the video call.",
      },
      {
        q: "Can I use a famous couplet?",
        a: "Only if it sounds like you. A borrowed verse plus zero memory feels like a search result, not a sister.",
      },
      {
        q: `Is ${topic.toLowerCase()} a substitute for sending a rakhi?`,
        a: "No. Words travel; the knot still needs a thread on his wrist in the USA.",
      },
      {
        q: "English or Hindi for a brother who left India as a child?",
        a: "Whichever he still hears as home. A single Hindi line in an English note is often the right mix.",
      },
    ],
    personal: [
      {
        q: `How personal does ${topic.toLowerCase()} need to be?`,
        a: "Personal enough that a stranger could not have written it. A name, a photo, or one private sentence is enough.",
      },
      {
        q: "What if the product is not custom-printed?",
        a: "Add a note. UsaRakhi can include a printed message on many orders — that is still ${topic.toLowerCase()} in spirit.",
      },
      {
        q: "Will personalization delay USA delivery?",
        a: "Order earlier than a plain rakhi if any custom step is involved. Do not leave it to the week of Purnima.",
      },
      {
        q: "Can the brother see the personalization on the video call?",
        a: "Ask him to open the lid toward the camera. That is the moment the extra effort pays off.",
      },
    ],
    general: [
      {
        q: `What is the first step for ${topic.toLowerCase()}?`,
        a: `Decide who will wear or receive it, then pick the matching UsaRakhi collection. ${topic} only works if the piece fits that person.`,
      },
      {
        q: `Can I handle ${topic.toLowerCase()} from India?`,
        a: "Yes. Pay in INR or USD, enter the US address, and UsaRakhi fulfills inside America.",
      },
      {
        q: `How early should I plan ${topic.toLowerCase()} for 2026?`,
        a: "Treat August 28 as a hard date. Order by early August; sooner for remote ZIP codes.",
      },
      {
        q: `Does ${topic.toLowerCase()} include roli and chawal?`,
        a: "Most rakhis do. Confirm on the product page if the tilak matters to your family (it usually should).",
      },
    ],
  };

  return themed[theme];
}

function uniqueClosing(entry: SeoBlogEntry, topic: string, theme: Theme): { heading: string; paragraphs: string[] } {
  const shop = shopLineFor(theme);
  const headings: Record<Theme, string[]> = {
    delivery: [
      `Lock in ${topic} before the calendar runs out`,
      `Treat ${topic} as a deadline, not a reminder`,
      `Finish ${topic} while August 28 is still a date you can meet`,
    ],
    gift: [
      `Send ${topic} he will actually open with a smile`,
      `Let ${topic} feel chosen — not copied from a catalog`,
      `Put ${topic} on a porch that is still waiting for Rakhi morning`,
    ],
    tradition: [
      `Keep ${topic} on the wrist, not only in memory`,
      `Practice ${topic} this year, even across a screen`,
      `Let ${topic} be the reason you order — not the footnote`,
    ],
    family: [
      `Make ${topic} include everyone who will be in the frame`,
      `Send ${topic} as one household story, not leftover gifts`,
      `Let ${topic} catch up with the family you actually have`,
    ],
    sister: [
      `Send ${topic} that treats her as the point, not the plus-one`,
      `Let ${topic} sound like you when she opens the lid`,
      `Make ${topic} arrive before her Rakhi-day call ends`,
    ],
    kids: [
      `Choose ${topic} he will still be wearing after lunch`,
      `Send ${topic} that fits his age, not your nostalgia`,
      `Let ${topic} make his face light up on the camera`,
    ],
    quotes: [
      `Write ${topic} only you could have written`,
      `Say ${topic} on the call, then leave the words in the box`,
      `Let ${topic} travel with the thread, not instead of it`,
    ],
    personal: [
      `Make ${topic} unmistakably his before you click pay`,
      `Finish ${topic} with a sentence a stranger could not fake`,
      `Send ${topic} that still feels handmade in spirit`,
    ],
    general: [
      `Turn ${topic} into a box that arrives on time`,
      `Let ${topic} be specific to this brother, this year`,
      `Close ${topic} with an order, not another tab of research`,
    ],
  };

  const heading = pick(entry.slug, headings[theme]);
  const p1 = pick(
    entry.slug,
    [
      `${topic} is not a generic shopping task. It is how this particular Raksha Bandhan still happens when the wrist you love is in the United States.`,
      `If you remember only one thing from this guide, let it be this: ${topic.toLowerCase()} only works if the piece fits the person and the box beats the date.`,
      `Distance will still be there on August 28. ${topic} is how you refuse to let that distance cancel the knot.`,
    ],
    3,
  );
  const p2 = pick(
    entry.slug,
    [
      `Order with a complete US address, give domestic delivery a real head start, and show up on the call. ${shop}`,
      `UsaRakhi fulfills inside America so you can stop managing customs and start planning the blessing. ${shop}`,
      `When the design is chosen and the ZIP is checked, click pay while the calendar is still kind. ${shop}`,
    ],
    5,
  );

  return { heading, paragraphs: [p1, p2] };
}

function templateSections(entry: SeoBlogEntry): BlogPost["sections"] {
  const topic = titleCaseKeyword(entry.keyword);
  const theme = detectTheme(entry.keyword);

  return [
    {
      paragraphs: [
        openingHook(entry.slug, topic),
        `This guide focuses on ${topic.toLowerCase()} — not a generic “send rakhi” lecture. If that is the search that brought you here, the steps below stay on that subject: who it is for, how to choose, and how a USA delivery still leaves time for the ritual.`,
      ],
    },
    {
      heading: `What ${topic} actually involves`,
      paragraphs: [
        pick(entry.slug, [
          `Under the phrase “${entry.keyword}” is a practical question: what do I send, to whom, and by when? Answer those three and the rest of the internet noise falls away.`,
          `${topic} only gets confusing when you mix it with every other Rakhi article. Stay with this topic: the people in that US home, the object that belongs on their wrist or table, and a date that will not move.`,
          `People look up ${entry.keyword} when they already care. This page exists to turn that care into one clear order instead of five abandoned carts.`,
        ]),
      ],
    },
    ...themeExtras(entry, topic, theme),
    {
      heading: `How to order ${topic} for a US address`,
      paragraphs: [
        `Pick the collection that matches this topic, add the full US address (apartment or suite, city, state, ZIP), and pay in INR or USD. UsaRakhi packs and ships from within America — that is the part that keeps ${topic.toLowerCase()} from becoming a customs story.`,
        `For Raksha Bandhan 2026 (Friday, August 28), use late July–August 1 for a calm buffer, or August 5–6 for express to major metros. ${shopLineFor(theme)}`,
      ],
    },
  ];
}

function traditionSections(entry: SeoBlogEntry, topic: string): BlogPost["sections"] {
  return [
    {
      heading: `Why ${topic} still has power`,
      paragraphs: [
        `A rakhi looks small. That is the miracle of it. A few threads, a bead, a blessing — and suddenly childhood walks back into the room. ${topic} is really about that return: the unbreakable habit of showing up for each other, even when the showing-up has to travel.`,
        "Families in the USA often celebrate with a mix of temple visits, living-room thalis, and a laptop perched on a stack of books. The form changes. The feeling should not. The sacred thread is still a vow: I see you. I pray for you. I am still your person.",
      ],
    },
    {
      heading: `How to keep ${topic} tender from far away`,
      paragraphs: [
        "Agree on a time in his US time zone first. Then dress like it matters — a kurta, a bindi, a real thali — because effort is a love language. Ask him to keep the unopened box nearby. When he lifts the lid, you should be on the call.",
        "If a roommate or Bhabhi can tie the thread while you watch, the ritual becomes complete instead of symbolic. If he is alone, rest the rakhi on his wrist, speak your blessing out loud, and let a friend finish the knot later the same day. The devotion is in the intention, not in a perfect camera angle.",
      ],
    },
  ];
}

function giftSections(entry: SeoBlogEntry, topic: string): BlogPost["sections"] {
  return [
    {
      heading: `Choose ${topic} that sounds like him`,
      paragraphs: [
        `The fastest way to make ${topic.toLowerCase()} feel hollow is to buy the flashiest box. The fastest way to make it unforgettable is to match his life. A quiet engineer in Seattle may want a slim designer rakhi. A little brother in New Jersey may want color, cartoon joy, and chocolate he can share.`,
        "Think in layers: the sacred thread, something sweet to open on camera, and one line in your own words. That combination — ritual, delight, and a voice he recognizes — is what turns a shipment into a memory.",
      ],
    },
    {
      heading: `How much is too much for ${topic}?`,
      paragraphs: [
        `Premium chocolates (Ferrero Rocher, Lindt, Hershey's) travel well in a domestic US box and photograph beautifully on a video call. A hamper with sweets and dry fruits feels abundant when you want the whole household included. ${topic} does not require three competing gifts. One complete, well-packed gesture beats a noisy pile.`,
        "If Bhabhi is in the home, do not let her become a spectator. A Bhaiya Bhabhi set or a Lumba beside his rakhi says, clearly: this family grew, and so did the festival.",
      ],
    },
  ];
}

function deliverySections(entry: SeoBlogEntry, topic: string): BlogPost["sections"] {
  return [
    {
      heading: `${topic} is a deadline — plan like it`,
      paragraphs: [
        `${topic} is really a timing problem wrapped in love. International post from India can take weeks and can sit in customs while Purnima comes and goes. Domestic USA fulfillment removes that fear. Your brother gets a normal American delivery. You get your festival back.`,
        "Write the address as if a stranger will read it: full name, street, apartment or suite, city, state, ZIP. University halls need the building and room. Offices need the company name. A missing Apt number is how precious boxes bounce.",
      ],
    },
    {
      heading: `A calm 2026 timeline for ${topic}`,
      paragraphs: [
        "Stress-free: order between July 25 and August 1. Recommended express to major metros: August 5–6. Last-chance metros: message WhatsApp around August 12–15 before you assume it will make August 28.",
        "Share tracking with him. Building desks, gated communities, and roommate chaos are the quiet villains of festival week. A text that says “it is coming Thursday” is an act of care.",
      ],
    },
  ];
}

function familySections(entry: SeoBlogEntry, topic: string): BlogPost["sections"] {
  return [
    {
      heading: `When ${topic} includes more than two people`,
      paragraphs: [
        `Raksha Bandhan used to be a sister and a brother in one room. Then life added a Bhabhi, a child, a cousin, a friend who became family. ${topic} is how the festival keeps up with the people you actually love.`,
        "A matching Bhaiya Bhabhi set looks intentional. A Kids Rakhi in the same box keeps a little one from feeling left out. A short note that uses names — not just “bhaiya” — makes the gift land as tenderness, not logistics.",
      ],
    },
    {
      heading: `If someone is new to ${topic}`,
      paragraphs: [
        "Not every Bhabhi grew up with Lumba. Not every roommate knows why a thread is sacred. A single sentence in the box — “this bracelet is my Raksha Bandhan blessing for you both” — prevents awkwardness and invites belonging. Inclusion is a powerful kind of love.",
      ],
    },
  ];
}

function sisterSections(entry: SeoBlogEntry, topic: string): BlogPost["sections"] {
  return [
    {
      heading: `${topic} is not an afterthought`,
      paragraphs: [
        `Brothers get the thread. Sisters often get the labor of remembering. ${topic} is a chance to reverse that, even a little: a hamper, a note, a video call where she is the one being celebrated.`,
        "If she is studying, working, pregnant, or newly married in the USA, choose something gentle and useful — not another obligation. Comfort, sweetness, and words that sound like home travel farther than an expensive object with no feeling.",
      ],
    },
  ];
}

function kidsSections(entry: SeoBlogEntry, topic: string): BlogPost["sections"] {
  return [
    {
      heading: `Pick ${topic} for his age, or he will take it off`,
      paragraphs: [
        `Kids are honest. If the rakhi feels heavy, itchy, or “babyish,” it will not survive lunch. ${topic} works when the design is colorful, the thread is soft, and the motif is something he can name with pride.`,
        "Toddlers need rounded, chew-safe pieces. School-age kids want play and chocolate. Teens often prefer a slim, almost-adult rakhi. Match the child in front of you, not the catalog photo that made you nostalgic.",
      ],
    },
  ];
}

function quotesSections(entry: SeoBlogEntry, topic: string): BlogPost["sections"] {
  return [
    {
      heading: `Write ${topic} like you talk, then send it anyway`,
      paragraphs: [
        `Generic lines fade. ${topic} that mention a real memory — the mango tree, the borrowed bike, the night he waited at the station — become keepsakes. You do not need poetry. You need truth.`,
        "Read it on the video call if you can. A voice, even delayed, still carries the warmth a printed card can only hint at. Then let him keep the words in the box. Distance makes paper precious.",
      ],
    },
  ];
}

function personalSections(entry: SeoBlogEntry, topic: string): BlogPost["sections"] {
  return [
    {
      heading: `Make ${topic} unmistakably his`,
      paragraphs: [
        `${topic} works because it refuses to be generic. A name, a photo, a wrapping that looks chosen — these are small proofs that you paused. In a country of Amazon boxes, a festival parcel that feels handmade in spirit is a quiet triumph.`,
        "If true custom engraving is not on the product, add the personal layer yourself: a printed note, a childhood photo, a line only the two of you would understand. The thread can be shared. The sentence should not be.",
      ],
    },
  ];
}

function themeExtras(entry: SeoBlogEntry, topic: string, theme: Theme): BlogPost["sections"] {
  switch (theme) {
    case "tradition":
      return traditionSections(entry, topic);
    case "gift":
      return giftSections(entry, topic);
    case "delivery":
      return deliverySections(entry, topic);
    case "family":
      return familySections(entry, topic);
    case "sister":
      return sisterSections(entry, topic);
    case "kids":
      return kidsSections(entry, topic);
    case "quotes":
      return quotesSections(entry, topic);
    case "personal":
      return personalSections(entry, topic);
    default:
      return giftSections(entry, topic);
  }
}

export function seoBlogPostToBlogPost(slug: string): BlogPost | undefined {
  const entry = getSeoBlogEntry(slug);
  if (!entry) return undefined;
  const theme = detectTheme(entry.keyword);
  const related: Record<Theme, string> = {
    delivery: "single-rakhi",
    gift: "rakhi-combo",
    tradition: "single-rakhi",
    family: "bhaiya-bhabhi-rakhi",
    sister: "rakhi-hampers",
    kids: "kids-rakhi",
    quotes: "single-rakhi",
    personal: "single-rakhi",
    general: "single-rakhi",
  };
  const topic = titleCaseKeyword(entry.keyword);
  return {
    slug: entry.slug,
    title: humanTitle(entry),
    description: humanDescription(entry),
    excerpt: humanExcerpt(entry),
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    sections: templateSections(entry),
    faqs: uniqueFaqs(entry, topic, theme),
    closing: uniqueClosing(entry, topic, theme),
    relatedCategory: related[theme],
  };
}

export function allSeoBlogSlugs(): string[] {
  return seoBlogEntries.map((b) => b.slug);
}

export function getAllBlogSlugs(handwritten: string[]): string[] {
  const set = new Set([...handwritten, ...allSeoBlogSlugs()]);
  return [...set];
}

export function resolveBlogPost(slug: string, handwritten?: BlogPost): BlogPost | undefined {
  if (handwritten) return handwritten;
  return seoBlogPostToBlogPost(slug);
}
