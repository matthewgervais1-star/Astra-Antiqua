import { test } from "node:test";
import assert from "node:assert/strict";
import { CULTURES } from "@/data/cultures";
import { CATALOG, COMPOSED, SCREENS, isPerCulture, slotNames, str, strParts, type StringKey } from "@/strings";
import { SLOTS } from "@/strings/common";
import { fmt } from "@/strings/formats";
import { CULTURE_VOICES } from "@/data/cultureVoice";

const entries = Object.entries(CATALOG) as Array<[StringKey, (typeof CATALOG)[StringKey]]>;

function texts(value: (typeof CATALOG)[StringKey]): string[] {
  return isPerCulture(value) ? Object.values(value) : [value];
}

test("every per-culture key carries the five cultures and nothing else", () => {
  for (const [key, value] of entries) {
    if (!isPerCulture(value)) continue;
    assert.deepEqual(Object.keys(value).sort(), [...CULTURES].sort(), key);
    for (const c of CULTURES) assert.ok(value[c].length > 0, `${key}.${c} is empty`);
  }
});

test("every {slot} in a value is a declared slot", () => {
  for (const [key, value] of entries) {
    for (const t of texts(value)) {
      for (const name of slotNames(t)) {
        assert.ok(name in SLOTS, `${key} names undeclared slot {${name}}`);
      }
    }
  }
});

test("every key is <screen>.<slot> and sits in the file for its screen", () => {
  const owner: Record<string, string> = { chrome: "nav", nav: "nav" };
  for (const [screen, table] of Object.entries(SCREENS)) {
    for (const key of Object.keys(table)) {
      assert.match(key, /^[a-z]+(\.[A-Za-z0-9]+)+$/, key);
      const prefix = key.split(".")[0] ?? "";
      assert.equal(owner[prefix] ?? prefix, screen, `${key} is filed under ${screen}`);
    }
  }
});

test("no key is both a catalog string and a composed row", () => {
  for (const key of Object.keys(COMPOSED)) assert.ok(!(key in CATALOG), key);
});

test("catalog values keep the characters the table fixes (F10, F13)", () => {
  for (const [key, value] of entries) {
    for (const t of texts(value)) {
      assert.doesNotMatch(t, /'/, `${key}: ASCII apostrophe`);
      assert.doesNotMatch(t, /[–—]/, `${key}: en or em dash`);
      assert.doesNotMatch(t, /\d\s*-\s*\d|\s-\s/, `${key}: hyphen used as a range`);
      assert.doesNotMatch(t, /℞/, `${key}: ℞ in chrome (F11)`);
      assert.equal(t, t.normalize("NFC"), `${key}: not NFC`);
      for (const m of t.matchAll(/·/g)) {
        const at = m.index ?? 0;
        assert.equal(t[at - 1], " ", `${key}: · needs a space before`);
        assert.equal(t[at + 1], " ", `${key}: · needs a space after`);
      }
    }
  }
});

test("str fills the ruled season kicker", () => {
  const range = fmt("range.days", [new Date("2026-09-23T06:00:00Z"), new Date("2026-10-23T06:00:00Z")], "Europe/Rome");
  assert.equal(
    str("season.kicker", "egypt", { range, institution: str("common.institution", "egypt") }),
    "23 SEP → 23 OCT 2026 · THE HALL OF MA’AT",
  );
});

test("str fills the ruled day kicker from the UTC day", () => {
  const date = fmt("date.day", new Date("2026-10-21T06:00:00Z"), "UTC");
  assert.equal(
    str("day.kicker", "greece", { date, institution: str("common.institution", "greece") }),
    "WED 21 OCT 2026 · THE DAY’S ORACLE",
  );
});

test("str fills the week count line with NONE for zero (F7)", () => {
  assert.equal(
    str("week.countLine", "egypt", {
      days: fmt("count.word", 7),
      weighed: fmt("count.word", 7),
      quiet: fmt("count.word", 0),
    }),
    "SEVEN DAYS · SEVEN WEIGHED · NONE QUIET",
  );
});

test("str prints per-culture forms and throws on a missing slot", () => {
  assert.equal(str("week.title", "carthage"), "THE WEEK’S LEDGER");
  assert.equal(str("year.title", "egypt", { roman: fmt("year.roman", 2026) }), "MMXXVI · THE YEAR OF THE RIVER");
  assert.throws(() => str("season.kicker", "egypt", { range: "x" }), /institution/);
});

test("strParts splits a template into text and slots", () => {
  assert.deepEqual(strParts("day.kicker", "egypt"), [{ slot: "date" }, " · ", { slot: "institution" }]);
});

test("the culture voice reads its institution and titles from the catalog", () => {
  for (const c of CULTURES) {
    assert.equal(CULTURE_VOICES[c].institution, str("common.institution", c));
    assert.equal(CULTURE_VOICES[c].weekTitle, str("week.title", c));
  }
});

test("the script-reveal institution heading prints the catalog's institution", async () => {
  const { INSTITUTION_FORMS } = await import("@/data/scriptForms");
  for (const c of CULTURES) assert.equal(INSTITUTION_FORMS[c].en, str("common.institution", c));
});
