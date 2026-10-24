import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { collectQueryPages, collectScanPages, interleaveByKey } from "./collect-scan-pages";

describe("collectScanPages", () => {
  it("keeps scanning when the first filtered page has no product rows", async () => {
    const pages = [
      { items: [] as string[], lastKey: { PK: "PRODUCT#review-heavy" } },
      { items: ["bhai-dooj-kaju-katli-and-kumkum-gift-box"], lastKey: undefined },
    ];
    let calls = 0;
    const items = await collectScanPages(async (startKey) => {
      const page = pages[calls];
      calls += 1;
      if (calls === 1) assert.equal(startKey, undefined);
      if (calls === 2) assert.deepEqual(startKey, { PK: "PRODUCT#review-heavy" });
      return page;
    });
    assert.deepEqual(items, ["bhai-dooj-kaju-katli-and-kumkum-gift-box"]);
    assert.equal(calls, 2);
  });
});

describe("collectQueryPages", () => {
  it("includes rows that sit on the second page", async () => {
    const pages = [
      { items: ["older"], lastKey: { SK: "1" } as Record<string, unknown> | undefined },
      { items: ["newer"], lastKey: undefined as Record<string, unknown> | undefined },
    ];
    let calls = 0;
    const items = await collectQueryPages(async (startKey) => {
      const page = pages[calls];
      calls += 1;
      if (calls === 2) assert.deepEqual(startKey, { SK: "1" });
      return page!;
    });
    assert.deepEqual(items, ["older", "newer"]);
  });
});

describe("interleaveByKey", () => {
  it("keeps a newly added group in a short sample", () => {
    const items = [
      ...Array.from({ length: 20 }, (_, i) => ({ campaignId: "old", email: `a${i}@x.com` })),
      { campaignId: "new", email: "fresh@x.com" },
    ];
    const sample = interleaveByKey(items, (item) => item.campaignId, 4);
    assert.equal(sample.filter((item) => item.campaignId === "new").length, 1);
    assert.equal(sample.filter((item) => item.campaignId === "old").length, 3);
  });
});
