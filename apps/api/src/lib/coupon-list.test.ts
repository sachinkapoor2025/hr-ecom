import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeListedCoupons } from "./coupon-list";

describe("mergeListedCoupons", () => {
  it("keeps a newly generated coupon that the historical scan missed", () => {
    const scanned = [{ code: "RAKHI-OLD", source: "welcome", createdAt: "2026-01-01T00:00:00.000Z" }];
    const feed = [{ code: "RAKHI-NEW", source: "admin", createdAt: "2026-10-24T17:00:00.000Z" }];
    const merged = mergeListedCoupons([feed, scanned]);
    assert.deepEqual(
      merged.map((row) => row.code).sort(),
      ["RAKHI-NEW", "RAKHI-OLD"]
    );
  });

  it("lets the stored coupon overwrite the feed when both exist", () => {
    const feed = [{ code: "rakhi-new", source: "admin", usedAt: undefined }];
    const scanned = [{ code: "RAKHI-NEW", source: "admin", usedAt: "2026-10-24T18:00:00.000Z" }];
    const merged = mergeListedCoupons([feed, scanned]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.code, "RAKHI-NEW");
    assert.equal(merged[0]?.usedAt, "2026-10-24T18:00:00.000Z");
  });
});
