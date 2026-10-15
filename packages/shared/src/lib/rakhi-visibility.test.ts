import assert from "node:assert/strict";
import test from "node:test";
import {
  isRakhiContentHidden,
  isRakhiPrimaryProduct,
  isRakhiPublicPath,
  pacificCalendarDate,
  textMentionsRakhi,
} from "./rakhi-visibility";

test("Rakhi content stays hidden through 10 November 2026 Pacific", () => {
  assert.equal(pacificCalendarDate(new Date("2026-11-11T07:59:00.000Z")), "2026-11-10");
  assert.equal(isRakhiContentHidden(new Date("2026-11-11T07:59:00.000Z")), true);
  assert.equal(pacificCalendarDate(new Date("2026-11-11T08:00:00.000Z")), "2026-11-11");
  assert.equal(isRakhiContentHidden(new Date("2026-11-11T08:00:00.000Z")), false);
  assert.equal(isRakhiContentHidden(new Date("2026-10-15T12:00:00.000Z")), true);
});

test("UsaRakhi brand is not treated as Rakhi festival copy", () => {
  assert.equal(textMentionsRakhi("UsaRakhi ships from California"), false);
  assert.equal(textMentionsRakhi("Send Rakhi to USA"), true);
  assert.equal(textMentionsRakhi("designer rakhis with roli"), true);
  assert.equal(textMentionsRakhi("Happy Raksha Bandhan"), true);
  assert.equal(textMentionsRakhi("Diwali and Bhai Dooj gifts"), false);
});

test("public Rakhi URLs are hidden only before 11 November", () => {
  const during = new Date("2026-10-15T12:00:00.000Z");
  const after = new Date("2026-11-11T08:00:00.000Z");
  assert.equal(isRakhiPublicPath("/raksha-bandhan", during), true);
  assert.equal(isRakhiPublicPath("/send-rakhi-from-india", during), true);
  assert.equal(isRakhiPublicPath("/products/designer-rakhi-set", during), true);
  assert.equal(isRakhiPublicPath("/diwali-to-usa", during), false);
  assert.equal(isRakhiPublicPath("/admin/products", during), false);
  assert.equal(isRakhiPublicPath("/raksha-bandhan", after), false);
});

test("festive hampers stay listed and Rakhi SKUs do not", () => {
  assert.equal(
    isRakhiPrimaryProduct({
      slug: "bhai-dooj-kaju-katli-and-kumkum-gift-box",
      name: "Bhai Dooj Kaju Katli & Kumkum Gift Box",
      categorySlug: "bhai-dooj",
    }),
    false
  );
  assert.equal(
    isRakhiPrimaryProduct({
      slug: "designer-rakhi-with-chocolates",
      name: "Designer Rakhi with chocolates",
      categorySlug: "rakhi-combo",
    }),
    true
  );
});
