import assert from "node:assert/strict";
import test from "node:test";
import {
  FESTIVAL_TRACKED_KEYWORDS,
  buildSeoDashboard,
  classifySeoOccasions,
  festiveFallbackKeywordMeta,
  metaKeywordsForTarget,
  normalizeSeoKeyword,
  resolvePageKeywords,
  summarizeSeoMetrics,
} from "./tracked-keywords";

test("festival queries classify without treating the UsaRakhi brand as Rakhi", () => {
  assert.deepEqual(classifySeoOccasions("send rakhi to usa"), ["rakhi"]);
  assert.deepEqual(classifySeoOccasions("UsaRakhi"), []);
  assert.deepEqual(classifySeoOccasions("bhai-dooj gifts"), ["bhai-dooj"]);
  assert.deepEqual(classifySeoOccasions("bhau beej gifts usa"), ["bhai-dooj"]);
  assert.deepEqual(classifySeoOccasions("diwali sweets usa"), ["diwali"]);
  assert.deepEqual(classifySeoOccasions("deepavali hamper"), ["diwali"]);
  assert.deepEqual(classifySeoOccasions("bhai dooj or diwali hamper"), ["bhai-dooj", "diwali"]);
});

test("Bhai Dooj and Diwali keywords are tracked and Rakhi sheet terms are not replaced", () => {
  const bhai = FESTIVAL_TRACKED_KEYWORDS.filter((row) => row.occasion === "bhai-dooj");
  const diwali = FESTIVAL_TRACKED_KEYWORDS.filter((row) => row.occasion === "diwali");
  assert.ok(bhai.length >= 25);
  assert.ok(diwali.length >= 25);
  assert.equal(
    FESTIVAL_TRACKED_KEYWORDS.some((row) => row.occasion === "rakhi"),
    false
  );
  assert.ok(bhai.some((row) => row.keyword === "bhai dooj gifts usa" && row.targetPath === "/bhai-dooj-to-usa"));
  assert.ok(diwali.some((row) => row.keyword === "diwali gifts usa" && row.targetPath === "/diwali-to-usa"));
  assert.match(festiveFallbackKeywordMeta(), /diwali gifts usa/);
  assert.match(festiveFallbackKeywordMeta(), /bhai dooj gifts usa/);
  assert.match(metaKeywordsForTarget("/bhai-dooj-to-usa"), /bhai dooj/);
  assert.match(metaKeywordsForTarget("/gifts-from-uk"), /diwali gifts from uk|bhai dooj gifts from uk/);
});

test("hidden Rakhi-only meta falls back to festive keywords and explicit festive keywords stay", () => {
  const festiveDefault = "diwali gifts usa, bhai dooj gifts usa";
  const rakhiDefault = "send rakhi to usa";
  assert.equal(
    resolvePageKeywords({
      explicit: "send rakhi to usa, rakhi delivery usa",
      rakhiHidden: true,
      rakhiDefault,
      festiveDefault,
    }),
    festiveDefault
  );
  assert.equal(
    resolvePageKeywords({
      explicit: "diwali gifts usa, send diwali hamper to usa",
      rakhiHidden: true,
      rakhiDefault,
      festiveDefault,
    }),
    "diwali gifts usa, send diwali hamper to usa"
  );
  assert.equal(
    resolvePageKeywords({
      explicit: "Designer Rakhi, diwali gifts usa",
      rakhiHidden: true,
      rakhiDefault,
      festiveDefault,
    }),
    "Designer Rakhi, diwali gifts usa"
  );
  assert.equal(
    resolvePageKeywords({
      rakhiHidden: false,
      rakhiDefault,
      festiveDefault,
    }),
    rakhiDefault
  );
});

test("Search Console rows join onto tracked keywords and discovered queries stay in their category", () => {
  const report = buildSeoDashboard(
    [
      {
        keyword: "Send Rakhi to USA",
        occasion: "rakhi",
        targetPath: "/",
        priority: "head",
      },
      {
        keyword: "bhai dooj gifts usa",
        occasion: "bhai-dooj",
        targetPath: "/bhai-dooj-to-usa",
        priority: "head",
      },
    ],
    [
      { query: "send rakhi to usa", clicks: 4, impressions: 40, ctr: 0.1, position: 8 },
      { query: "Bhai Dooj Gifts USA", clicks: 2, impressions: 20, ctr: 0.1, position: 5 },
      { query: "diwali hampers usa", clicks: 1, impressions: 10, ctr: 0.1, position: 11 },
    ],
    [
      {
        page: "https://www.usarakhi.com/bhai-dooj-to-usa/",
        clicks: 3,
        impressions: 30,
        ctr: 0.1,
        position: 6,
      },
      {
        page: "https://www.usarakhi.com/send-gifts-to-houston",
        clicks: 1,
        impressions: 4,
        ctr: 0.25,
        position: 9,
      },
    ],
    [
      { path: "/", label: "Home", occasions: ["rakhi", "bhai-dooj", "diwali"] },
      { path: "/bhai-dooj-to-usa", label: "Bhai Dooj gifts", occasions: ["bhai-dooj"] },
    ]
  );

  const rakhi = report.keywords.find((row) => row.keyword === "send rakhi to usa");
  const bhai = report.keywords.find((row) => row.keyword === "bhai dooj gifts usa");
  const discovered = report.keywords.find((row) => row.keyword === "diwali hampers usa");
  assert.equal(rakhi?.clicks, 4);
  assert.equal(rakhi?.impressions, 40);
  assert.equal(rakhi?.position, 8);
  assert.equal(bhai?.impressions, 20);
  assert.equal(bhai?.discovered, false);
  assert.equal(discovered?.occasion, "diwali");
  assert.equal(discovered?.discovered, true);
  assert.equal(discovered?.targetPath, "/diwali-to-usa");

  const bhaiPage = report.pages.find((row) => row.path === "/bhai-dooj-to-usa");
  assert.equal(bhaiPage?.impressions, 30);
  assert.equal(bhaiPage?.clicks, 3);
  const city = report.pages.find((row) => row.path === "/send-gifts-to-houston");
  assert.equal(city?.discovered, true);
  assert.ok(city?.occasions.includes("bhai-dooj"));
  assert.ok(city?.occasions.includes("diwali"));

  const summary = summarizeSeoMetrics(report.keywords.filter((row) => row.occasion === "rakhi"));
  assert.equal(summary.impressions, 40);
  assert.equal(summary.clicks, 4);
  assert.equal(summary.ctr, 0.1);
  assert.equal(summary.position, 8);
  assert.equal(normalizeSeoKeyword("Bhai-Dooj"), "bhai dooj");
});
