import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCREEN_BUILDERS, buildPlacementModel, type ScreenName, type SlotMap } from "@/lib/screens";
import { CHART_ONLY, CONDITIONAL, NO_CHART_ONLY, SCREEN_SLOTS } from "@/lib/screens/slots";
import { GOLDEN_CASES, caseId, smokeNatal, type GoldenCase } from "@/lib/screens/cases";
import type { ScreenInput } from "@/lib/screens/types";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TABLE = path.resolve(HERE, "../../../../docs/design/shared-strings-table-2026-11.md");

/** The table's section heading for each screen. */
const SECTIONS: Readonly<Record<ScreenName, string>> = {
  day: "Day",
  week: "Week",
  season: "Season",
  year: "Year",
  transits: "Transits",
  chart: "Chart",
  placement: "Placement",
  transit: "Transit detail",
};

/**
 * The slot keys of one screen's section of the ruled table: the first cell of
 * each row, a space read as a dot, leaving out rows whose DEFAULT drops the
 * slot ("Swift drops it", "none (").
 */
function tableSlots(screen: ScreenName): string[] {
  const doc = fs.readFileSync(TABLE, "utf8").replaceAll("\r\n", "\n");
  const start = doc.indexOf(`\n## ${SECTIONS[screen]} (`);
  assert.ok(start >= 0, `table section for ${screen}`);
  const end = doc.indexOf("\n## ", start + 1);
  const header: string[] = [];
  const keys: string[] = [];
  for (const line of doc.slice(start, end === -1 ? undefined : end).split("\n")) {
    if (!line.startsWith("| ")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells[0] === "Slot key") {
      header.push(...cells);
      continue;
    }
    if (/^-+$/.test(cells[0] ?? "")) continue;
    const def = cells[header.indexOf("DEFAULT")] ?? "";
    if (def.startsWith("Swift drops it") || def.startsWith("none (")) continue;
    keys.push((cells[0] ?? "").replace(/\s+/g, "."));
  }
  return keys;
}

function inputOf(c: GoldenCase): ScreenInput {
  process.env.TZ = c.zone;
  return { culture: c.culture, instant: new Date(c.instant), zone: c.zone, birth: c.birth ? smokeNatal() : null };
}

const SCREENS = Object.keys(SCREEN_BUILDERS) as ScreenName[];

/** Every fixed case's model, per screen, built once for all the tests below. */
const MODELS: Record<ScreenName, Array<{ id: string; c: GoldenCase; slots: SlotMap }>> = Object.fromEntries(
  SCREENS.map((s) => [s, [] as Array<{ id: string; c: GoldenCase; slots: SlotMap }>]),
) as Record<ScreenName, Array<{ id: string; c: GoldenCase; slots: SlotMap }>>;
for (const c of GOLDEN_CASES) {
  const input = inputOf(c);
  for (const s of SCREENS) MODELS[s].push({ id: caseId(s, c), c, slots: SCREEN_BUILDERS[s](input) });
}

test("each screen's slot list is the table's slot list for that screen", () => {
  for (const s of SCREENS) assert.deepEqual([...SCREEN_SLOTS[s]], tableSlots(s), s);
});

test("each model's slot set equals the table's slot list for that screen", () => {
  // A received body is the one state the fixed cases leave out.
  const uranus = buildPlacementModel({ ...inputOf(GOLDEN_CASES[0]!), body: "uranus" });
  for (const s of SCREENS) {
    const table = new Set(SCREEN_SLOTS[s]);
    const seen = new Set<string>();
    for (const m of MODELS[s]) {
      for (const k of Object.keys(m.slots)) {
        assert.ok(table.has(k), `${m.id} prints ${k}, which the table does not list`);
        seen.add(k);
      }
    }
    if (s === "placement") for (const k of Object.keys(uranus)) seen.add(k);
    const missing = [...table].filter((k) => !seen.has(k) && !(k in CONDITIONAL));
    assert.deepEqual(missing, [], `${s}: table slots no case prints`);
  }
});

test("a slot is never blank, and a list is never empty", () => {
  for (const s of SCREENS) {
    for (const m of MODELS[s]) {
      for (const [k, v] of Object.entries(m.slots)) {
        if (typeof v === "string") assert.notEqual(v.trim(), "", `${m.id} ${k}`);
        else assert.ok(v.length > 0, `${m.id} ${k} is an empty list`);
      }
    }
  }
});

test("no birth: chart slots are absent and the cast lines print; a birth: the reverse", () => {
  for (const s of SCREENS) {
    for (const m of MODELS[s]) {
      const keys = Object.keys(m.slots);
      if (m.c.birth === null) {
        assert.deepEqual(keys.filter((k) => CHART_ONLY.has(k)), [], `${m.id} prints chart slots`);
        for (const k of SCREEN_SLOTS[s]) if (NO_CHART_ONLY.has(k)) assert.ok(keys.includes(k), `${m.id} lacks ${k}`);
      } else {
        assert.deepEqual(keys.filter((k) => NO_CHART_ONLY.has(k)), [], `${m.id} prints a cast line`);
      }
    }
  }
});

test("row slots stay aligned with their screen's rows", () => {
  const groups: Readonly<Record<string, readonly string[]>> = {
    week: [
      "week.row.weekday",
      "week.row.today",
      "week.row.headline",
      "week.row.line",
      "week.row.shorthand.aspect",
      "week.row.shorthand.ingress",
      "week.row.shorthand.quiet",
    ],
    year: ["year.monthLabel", "year.row.head", "year.row.prose"],
    transits: ["transits.row.title", "transits.row.data"],
    day: ["day.chart.row.sentence", "day.chart.row.data"],
  };
  for (const [s, keys] of Object.entries(groups)) {
    for (const m of MODELS[s as ScreenName]) {
      const lengths = keys.filter((k) => k in m.slots).map((k) => (m.slots[k] as string[]).length);
      assert.ok(lengths.every((n) => n === lengths[0]), `${m.id}: ${keys.join(", ")} differ in length`);
    }
  }
  for (const m of MODELS.week) {
    assert.equal((m.slots["week.row.weekday"] as string[]).length, 7, m.id);
    assert.equal((m.slots["week.row.today"] as string[]).filter((t) => t !== "").length, 1, `${m.id}: one row is today`);
  }
});

test("the sample case prints the board's forms", () => {
  const day = MODELS.day[0]!.slots;
  assert.equal(day["day.kicker"], "WED 21 OCT 2026 · THE HALL OF MA’AT");
  assert.equal(day["day.sky.season"], "SEASON\nSUN IN LIBRA · DAY 29 OF 31");
  const season = MODELS.season[0]!.slots;
  assert.equal(season["season.kicker"], "23 SEP → 23 OCT 2026 · THE HALL OF MA’AT");
  assert.equal(season["season.dayLine"], "DAY 29 OF 31 · 2 TO GO");
  assert.equal(MODELS.week[0]!.slots["week.kicker"], "19 → 25 OCT 2026 · THE HALL OF MA’AT");
  assert.equal(MODELS.chart[0]!.slots["chart.birthLine"], "ROME · 15 JAN 1990 · 05:30");
  assert.equal(MODELS.placement[0]!.slots["placement.section.house"], "IN THE SECOND HOUSE\nThe Storehouse");
});

test("the week across a month end and the season across a year end print one range rule", () => {
  const week = MODELS.week.find((m) => m.c.instant.startsWith("2026-09-29"))!.slots;
  assert.equal(week["week.kicker"], "28 SEP → 4 OCT 2026 · THE HALL OF MA’AT");
  const season = MODELS.season.find((m) => m.c.instant.startsWith("2026-12-30"))!.slots;
  assert.match(season["season.kicker"] as string, /^\d+ DEC 2026 → \d+ JAN 2027 · /);
});
