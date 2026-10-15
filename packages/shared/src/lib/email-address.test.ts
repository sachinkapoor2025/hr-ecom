import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emailAddressSchema, isValidEmailAddress } from "./email-address";

describe("email address", () => {
  it("rejects addresses without a domain dot or letter TLD", () => {
    for (const value of ["test@gmailcom", "test@gmail", "test@gmail.c", "plain", "a@b", "test@.com"]) {
      assert.equal(isValidEmailAddress(value), false, value);
      assert.equal(emailAddressSchema.safeParse(value).success, false, value);
    }
  });

  it("accepts ordinary addresses and reports the shared message", () => {
    assert.equal(isValidEmailAddress("  neha@example.com "), true);
    const parsed = emailAddressSchema.safeParse("  neha@example.com ");
    assert.equal(parsed.success, true);
    if (parsed.success) assert.equal(parsed.data, "neha@example.com");

    const rejected = emailAddressSchema.safeParse("test@gmailcom");
    assert.equal(rejected.success, false);
    if (!rejected.success) {
      assert.equal(rejected.error.issues[0]?.message, "Please enter a valid email address.");
    }
  });
});
