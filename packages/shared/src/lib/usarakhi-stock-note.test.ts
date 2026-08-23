import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VENDOR_ORANGE_COUNTY } from "../constants";
import {
  USARAKHI_STOCK_SHORTAGE_NOTE,
  withUsarakhiStockShortageNote,
} from "./usarakhi-stock-note";

describe("withUsarakhiStockShortageNote", () => {
  it("appends note to UsaRakhi products", () => {
    const result = withUsarakhiStockShortageNote({
      description: "A designer rakhi for brother.",
      vendorSlug: "usarakhi",
    });
    assert.match(result.description ?? "", /Rakhi stock about to end/);
    assert.match(result.description ?? "", /Ferrero Rocher \/ Lindor chocolates/);
    assert.ok(result.description?.includes(USARAKHI_STOCK_SHORTAGE_NOTE));
  });

  it("is idempotent", () => {
    const once = withUsarakhiStockShortageNote({
      description: "Hello",
    });
    const twice = withUsarakhiStockShortageNote(once);
    assert.equal(once.description, twice.description);
  });

  it("skips Orange County products", () => {
    const result = withUsarakhiStockShortageNote({
      description: "Hamper box",
      vendorSlug: VENDOR_ORANGE_COUNTY,
    });
    assert.equal(result.description, "Hamper box");
  });
});
