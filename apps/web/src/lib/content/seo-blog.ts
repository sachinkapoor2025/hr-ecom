import type { BlogPost } from "./blog-posts";
import { categoryHref } from "@/lib/category-urls";
import { getSeoBlogEntry, locationPublicPath, seoBlogEntries, type SeoBlogEntry } from "./seo-data";

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

function shopLine(): string {
  return `When you are ready, start at UsaRakhi.com, then browse Single Rakhi (${categoryHref("single-rakhi")}), Rakhi Combos (${categoryHref("rakhi-combo")}), Kids Rakhi (${categoryHref("kids-rakhi")}), Bhaiya Bhabhi sets (${categoryHref("bhaiya-bhabhi-rakhi")}), Lumba Rakhi (${categoryHref("lumba-rakhi")}), and Hampers (${categoryHref("rakhi-hampers")}).`;
}

function deliveryFacts(): string[] {
  return [
    "UsaRakhi fulfills from within the United States, so your brother receives a domestic package — not an international parcel that can stall in customs.",
    "Most orders reach all 50 states in 5–7 business days. Major metros such as New York, Los Angeles, Chicago, Houston, San Francisco, and New Jersey often arrive faster, including 2–3 day express where available.",
    "Same-day dispatch is typical for orders placed before the daily cut-off. Pay in INR with Razorpay (UPI, cards, netbanking) or in USD with Stripe.",
    "Most rakhis include complimentary roli and chawal so the tilak can still happen on a video call — even if you cannot be in the same room.",
  ];
}

function ctaClose(topic: string): string {
  return `If this guide on ${topic.toLowerCase()} gave you even a little more courage to order, take the next step while the calendar is still kind. Raksha Bandhan 2026 falls on Friday, August 28. Order in the stress-free window (late July to August 1) or by August 5–6 for express to major metros. UsaRakhi is here so the thread arrives while the love is still on time. ${shopLine()}`;
}

function traditionSections(entry: SeoBlogEntry, topic: string): BlogPost["sections"] {
  return [
    {
      heading: "Why this ritual still has power",
      paragraphs: [
        `A rakhi looks small. That is the miracle of it. A few threads, a bead, a blessing — and suddenly childhood walks back into the room. ${topic} is really about that return: the unbreakable habit of showing up for each other, even when the showing-up has to travel.`,
        "Families in the USA often celebrate with a mix of temple visits, living-room thalis, and a laptop perched on a stack of books. The form changes. The feeling should not. The sacred thread is still a vow: I see you. I pray for you. I am still your person.",
      ],
    },
    {
      heading: "How to keep the ceremony tender from far away",
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
      heading: "Choose a gift that sounds like him",
      paragraphs: [
        `The fastest way to make ${topic.toLowerCase()} feel hollow is to buy the flashiest box. The fastest way to make it unforgettable is to match his life. A quiet engineer in Seattle may want a slim designer rakhi. A little brother in New Jersey may want color, cartoon joy, and chocolate he can share.`,
        "Think in layers: the sacred thread, something sweet to open on camera, and one line in your own words. That combination — ritual, delight, and a voice he recognizes — is what turns a shipment into a memory.",
      ],
    },
    {
      heading: "Combos, hampers, and the art of not overdoing it",
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
      heading: "The deadline is the festival — plan like it",
      paragraphs: [
        `${topic} is really a timing problem wrapped in love. International post from India can take weeks and can sit in customs while Purnima comes and goes. Domestic USA fulfillment removes that fear. Your brother gets a normal American delivery. You get your festival back.`,
        "Write the address as if a stranger will read it: full name, street, apartment or suite, city, state, ZIP. University halls need the building and room. Offices need the company name. A missing Apt number is how precious boxes bounce.",
      ],
    },
    {
      heading: "A calm 2026 timeline",
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
      heading: "When the family is larger than two people",
      paragraphs: [
        `Raksha Bandhan used to be a sister and a brother in one room. Then life added a Bhabhi, a child, a cousin, a friend who became family. ${topic} is how the festival keeps up with the people you actually love.`,
        "A matching Bhaiya Bhabhi set looks intentional. A Kids Rakhi in the same box keeps a little one from feeling left out. A short note that uses names — not just “bhaiya” — makes the gift land as tenderness, not logistics.",
      ],
    },
    {
      heading: "If someone is new to the tradition",
      paragraphs: [
        "Not every Bhabhi grew up with Lumba. Not every roommate knows why a thread is sacred. A single sentence in the box — “this bracelet is my Raksha Bandhan blessing for you both” — prevents awkwardness and invites belonging. Inclusion is a powerful kind of love.",
      ],
    },
  ];
}

function sisterSections(entry: SeoBlogEntry, topic: string): BlogPost["sections"] {
  return [
    {
      heading: "She is not an afterthought",
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
      heading: "Pick for his age, or he will take it off",
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
      heading: "Write like you talk, then send it anyway",
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
      heading: "Make it unmistakably his",
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

function templateSections(entry: SeoBlogEntry): BlogPost["sections"] {
  const topic = titleCaseKeyword(entry.keyword);
  const theme = detectTheme(entry.keyword);
  const cityHint = pick(entry.slug, [
    locationPublicPath("new-york"),
    locationPublicPath("new-jersey"),
    locationPublicPath("los-angeles"),
    locationPublicPath("texas"),
    locationPublicPath("california"),
  ]);

  return [
    {
      paragraphs: [
        openingHook(entry.slug, topic),
        `This guide is written for the sister who is googling ${entry.keyword} at midnight, comparing sites, worrying about ZIP codes, and still wanting the gift to feel like home. UsaRakhi exists for that exact mix of love and logistics: you order from India, the UK, Canada, Australia, or anywhere; we pack and ship from within America.`,
        `You will find practical steps here, but also the emotional truth: a rakhi that arrives on time can turn a bittersweet Friday into an unforgettable one. ${shopLine()}`,
      ],
    },
    {
      heading: `What “${topic}” really asks of you`,
      paragraphs: [
        pick(entry.slug, [
          `Under the search words is a simpler wish: let him feel remembered. ${topic} is the plan you make so that wish has a body — a box, a thread, a piece of roli, a sentence in your handwriting.`,
          `People search ${entry.keyword} when they are done hoping “someone traveling next month” will carry a rakhi. Hope is not a courier. A real order is.`,
          `If ${topic.toLowerCase()} feels overwhelming, shrink it: one rakhi that suits him, one complete US address, one date on the calendar. Courage is often just a smaller next step.`,
        ]),
        "Do not wait for the perfect design. Wait too long and even a perfect design becomes a story about what almost arrived. The powerful choice is the timely one.",
      ],
    },
    ...themeExtras(entry, topic, theme),
    {
      heading: "How UsaRakhi actually helps (no fairy tales)",
      paragraphs: deliveryFacts(),
    },
    {
      heading: "A sister's simple order ritual",
      paragraphs: [
        "1. Choose for the person: Single Rakhi for one brother, a combo if you want sweetness in the same box, Kids Rakhi for a child, Bhaiya Bhabhi or Lumba if the household includes her.",
        "2. Add the full US address. Recheck the ZIP. If you are unsure, WhatsApp a photo of an old label and we will help you format it.",
        "3. Pay the way that feels easy — INR or USD — and keep the confirmation.",
        "4. Tell him a window, not a mystery. Anticipation is part of the gift.",
        "5. On Rakhi day, show up on the call like you would show up at the door. That is the unforgettable part.",
      ],
    },
    {
      heading: "Little truths most product pages skip",
      paragraphs: [
        pick(entry.slug, [
          "A handwritten line beats a expensive box with no voice. If you can only do one extra thing, write.",
          "Hot states in August are unkind to forgetful porches. Ask him to bring the package inside. Care continues after delivery.",
          "If you have two brothers, do not send identical rakhis unless they are little. People compare photos. Let each gift feel chosen.",
          "Customs anxiety is rational. Domestic shipping is how you retire that anxiety without becoming a logistics expert.",
        ]),
        `Popular delivery pages such as ${cityHint} exist because so many families are living this same long-distance love. You are not the only one building a festival out of a tracking link — and that should feel comforting, not small.`,
      ],
    },
    {
      heading: "Frequently asked questions",
      paragraphs: [
        `Can I really handle ${topic.toLowerCase()} from India? Yes. You shop and pay from home. UsaRakhi fulfills inside the USA, so your brother is not waiting on an international customs line.`,
        "What if I order late? Message support before you guess. Express to major metros can still rescue a tight calendar; remote ZIP codes need more honesty and more buffer.",
        "Will it feel personal enough? The rakhi is the tradition. Your note, your call, and your timing are the heartbeat. Together they are enough.",
        "Where do I start? Open the collection that matches your family, add the US address, and give yourself the gift of not rushing August 27.",
      ],
    },
    {
      heading: "A last word, from one festival heart to another",
      paragraphs: [
        `Distance is loud. Love can be quieter and still win — a thread on a wrist, a chocolate shared with a roommate, a blessing spoken through a screen. That is the whole point of ${topic.toLowerCase()}.`,
        ctaClose(topic),
      ],
    },
  ];
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
  return {
    slug: entry.slug,
    title: humanTitle(entry),
    description: humanDescription(entry),
    excerpt: humanExcerpt(entry),
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    sections: templateSections(entry),
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
