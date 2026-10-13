import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { collectScanPages } from "./collect-scan-pages";

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
