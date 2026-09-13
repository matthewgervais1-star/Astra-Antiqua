import { test } from "node:test";
import assert from "node:assert/strict";
import { DEITY_CHARGES } from "@/data/deityCharges";
import { CULTURES, PLANETS } from "@/data/cultures";

test("every charge is a bare noun phrase a frame can join with 'and'", () => {
  for (const culture of CULTURES) {
    for (const planet of PLANETS) {
      const charge = DEITY_CHARGES[culture][planet];
      assert.ok(charge.length > 0, `${culture}.${planet} is empty`);
      assert.doesNotMatch(charge, /[,;:]/, `${culture}.${planet} "${charge}" carries punctuation that breaks a frame`);
      assert.equal(charge, charge.toLowerCase().charAt(0) + charge.slice(1), `${culture}.${planet} must be lowercase-initial; the frame capitalises`);
      assert.doesNotMatch(charge, /[.!?]$/, `${culture}.${planet} must not end a sentence on its own`);
    }
  }
});

test("no charge is shared between two cultures", () => {
  const seen = new Map<string, string>();
  for (const culture of CULTURES) {
    for (const planet of PLANETS) {
      const charge = DEITY_CHARGES[culture][planet];
      const prior = seen.get(charge);
      assert.equal(prior, undefined, `"${charge}" is used by both ${prior} and ${culture}`);
      seen.set(charge, culture);
    }
  }
});
