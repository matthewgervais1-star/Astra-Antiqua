import { test } from "node:test";
import assert from "node:assert/strict";
import { composeDiveDeeper, composeDiveDeeperForDay } from "@/lib/diveDeeper";
import { composeDayPage, dayFigures, utcDayNumber } from "@/lib/decree";
import { computeChart } from "@/lib/ephemeris";
import { DOMAIN_GROUP } from "@/lib/figureReading";
import { natalDayFigures, natalDayPermissions, dayPermissions } from "@/lib/permissions";
import { DIVE_DEEPER_BANKS } from "@/data/diveDeeperBanks";
import { FIGURE_BANKS } from "@/data/figureBanks";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { DEITY_MATRIX } from "@/data/deities";
import { PERMISSIONS_REGISTER } from "@/data/permissionsRegister";
import { CULTURES, PLANETS, type Culture, type Planet } from "@/data/cultures";
import { toneOf } from "@/lib/tone";
import { dayPressure, rankContacts, transitsByGroup } from "@/lib/dayPressure";
import type { SavedNatal } from "@/lib/savedNatal";

const DAY_MS = 86_400_000;
const FAST: ReadonlySet<Planet> = new Set(["sun", "moon", "mercury", "venus", "mars"]);
const START = Date.UTC(2026, 8, 29);

/** A fixed chart, in longitudes, of the kind a reader saves: every body in its own place. */
const NATAL = {
  chart: {
    sun: 84.2, moon: 301.7, mercury: 70.9, venus: 47.3, mars: 12.6,
    jupiter: 95.1, saturn: 294.4, uranus: 278.0, neptune: 283.9, pluto: 226.5,
  } as Record<Planet, number>,
  ascendant: 183.4,
};

const days = (n: number) => Array.from({ length: n }, (_, i) => new Date(START + i * DAY_MS));

/** The group (0 to 3) of a god's name, by DOMAIN_GROUP, for each body the culture names so. */
function groupsNamed(culture: Culture, evidence: string): Set<number> {
  const out = new Set<number>();
  for (const p of PLANETS) {
    const n = DEITY_MATRIX[culture][p].name.toUpperCase();
    if (evidence.startsWith(`${n} `) || evidence.includes(` ${n} ·`)) out.add(DOMAIN_GROUP[p]);
  }
  return out;
}

/** True when a group points to an earlier group that read its figure. */
function isPointer(culture: Culture, sentences: readonly string[]): boolean {
  const bank = DIVE_DEEPER_BANKS[culture];
  return sentences.length === 1 && bank.titles.some((t) => {
    const head = t.split(":")[0]!;
    return sentences[0] === bank.shared.replace("{group}", head.charAt(0).toLowerCase() + head.slice(1));
  });
}

test("the quiet line prints only when no figure in orb touches the group", () => {
  for (const culture of CULTURES) {
    for (const date of days(365)) {
      const sky = computeChart(date);
      const figures = dayFigures(sky);
      const plain = composeDiveDeeperForDay(culture, date, null);
      plain.groups.forEach((g, i) => {
        const touched = figures.some((f) => DOMAIN_GROUP[f.a] === i || DOMAIN_GROUP[f.b] === i);
        assert.equal(g.quiet, !touched, `${culture} ${date.toISOString().slice(0, 10)} sky ${g.title}: ${g.sentences.join(" ")}`);
        if (touched && isPointer(culture, g.sentences)) {
          // It names the group above that read the figure, and that group printed it.
          const named = plain.groups.findIndex((h, j) => j < i && !h.quiet && !isPointer(culture, h.sentences) && h.evidence === g.evidence);
          assert.ok(named >= 0, `${culture} ${g.title} points nowhere: ${g.evidence}`);
          const head = plain.groups[named]!.title.split(":")[0]!;
          assert.ok(g.sentences[0]!.includes(head.charAt(0).toLowerCase() + head.slice(1)), g.sentences[0]);
        }
      });
      if (culture !== "rome") continue;
      const read = composeDiveDeeperForDay(culture, date, NATAL);
      transitsByGroup(NATAL.chart, NATAL.ascendant, sky).forEach((hits, i) => {
        assert.equal(read.groups[i]!.quiet, hits.length === 0, `${date.toISOString().slice(0, 10)} natal ${read.groups[i]!.title}`);
      });
    }
  }
});

test("on 2026-10-22 the third group's only figures are read by the second, so it prints the shared line there and is not quiet", () => {
  // Android's DiveDeeperParityTest pins this day from the same fact, building the line from its bank.
  const date = new Date(Date.UTC(2026, 9, 22));
  for (const culture of CULTURES) {
    const bank = DIVE_DEEPER_BANKS[culture];
    const head = bank.titles[1].split(":")[0]!;
    const line = bank.shared.replace("{group}", head.charAt(0).toLowerCase() + head.slice(1));
    const third = composeDiveDeeperForDay(culture, date, null).groups[2]!;
    assert.deepEqual(third.sentences, [line], culture);
    assert.equal(third.quiet, false, culture);
  }
});

test("four groups in the culture's order, each a quiet line or two to three sentences ending on a concrete thing", () => {
  for (const culture of CULTURES) {
    const bank = DIVE_DEEPER_BANKS[culture];
    for (const date of days(14)) {
      for (const natal of [null, NATAL]) {
        const dd = composeDiveDeeperForDay(culture, date, natal);
        assert.equal(dd.groups.length, 4);
        dd.groups.forEach((g, i) => {
          assert.equal(g.title, bank.titles[i]);
          if (g.quiet) {
            assert.deepEqual(g.sentences, [bank.quiet[i]]);
            assert.equal(g.evidence, "");
            return;
          }
          if (isPointer(culture, g.sentences)) return;
          // The Moon on the natal Moon keys no relation and no consequence.
          const moonOnMoon = g.evidence.startsWith(`${DEITY_MATRIX[culture].moon.name.toUpperCase()} `) &&
            g.evidence.includes(`YOUR ${DEITY_MATRIX[culture].moon.name.toUpperCase()} ·`);
          const least = moonOnMoon ? 1 : 2;
          assert.ok(g.sentences.length >= least && g.sentences.length <= 3, `${culture} ${g.title}: ${g.sentences.join(" ")}`);
          const last = g.sentences.at(-1)!;
          const things = [...FIGURE_BANKS[culture].manifestations[i]!.harmony, ...FIGURE_BANKS[culture].manifestations[i]!.tension];
          assert.ok(
            things.some((t) => last === bank.concrete.replace("{thing}", t)),
            `${culture} ${g.title} ends on "${last}"`,
          );
        });
      }
    }
  }
});

test("every group title opens on the culture's own name for the group", () => {
  for (const culture of CULTURES) {
    DIVE_DEEPER_BANKS[culture].titles.forEach((title, i) => {
      const name = CULTURE_VOICES[culture].houseGroups[i]!.name.replace(/^THE /, "");
      assert.match(title.toUpperCase(), new RegExp(`^(THE )?${name}: `), `${culture} title ${i}: ${title}`);
    });
  }
});

test("the concrete frame shares no word with the things it carries", () => {
  for (const culture of CULTURES) {
    const frameWords = DIVE_DEEPER_BANKS[culture].concrete
      .replace("{thing}", "")
      .toLowerCase()
      .match(/[a-z']{4,}/g) ?? [];
    for (const group of FIGURE_BANKS[culture].manifestations) {
      for (const thing of [...group.harmony, ...group.tension]) {
        const words = new Set(thing.toLowerCase().match(/[a-z']+/g) ?? []);
        for (const w of frameWords) {
          assert.ok(!words.has(w) && !words.has(w.replace(/'s$/, "")), `${culture}: "${w}" in "${thing}"`);
        }
      }
    }
  }
});

test("no dive deeper line repeats a line on its page, whole or inside a longer sentence", () => {
  // Over the window the two known repeats fell in (2026-11-26 Egypt, 2027-03-11 Rome).
  const window = Array.from({ length: 200 }, (_, i) => new Date(START + i * DAY_MS));
  const saved = { chart: NATAL.chart, angles: { ascendant: NATAL.ascendant } } as unknown as SavedNatal;
  for (const culture of CULTURES) {
    for (const date of window) {
      const day = utcDayNumber(date);
      const sky = computeChart(new Date(day * DAY_MS));
      const decree = composeDayPage(culture, date);
      for (const natal of [null, NATAL]) {
        const pressure = natal ? dayPressure(saved, sky, culture).map((g) => g.sentence) : [];
        const dd = composeDiveDeeper(culture, decree, sky, day, natal, pressure);
        const own = dd.groups.filter((g) => !g.quiet).flatMap((g) => g.sentences);
        const page = [decree.headline, ...decree.sentences, ...pressure, ...own];
        for (const line of own) {
          const needle = line.replace(/\.$/, "").toLowerCase();
          const holders = page.filter((s) => s.toLowerCase().includes(needle));
          assert.equal(holders.length, 1, `${culture} ${date.toISOString().slice(0, 10)} ${natal ? "natal" : "sky"}: "${line}" also in ${JSON.stringify(holders.filter((h) => h !== line))}`);
        }
      }
    }
  }
});

test("without a chart, no two groups read one sky figure", () => {
  for (const culture of CULTURES) {
    for (const date of days(200)) {
      const read = composeDiveDeeperForDay(culture, date, null)
        .groups.filter((g) => !g.quiet && !isPointer(culture, g.sentences))
        .map((g) => g.evidence);
      assert.equal(new Set(read).size, read.length, `${culture} ${date.toISOString().slice(0, 10)}: ${read.join(" / ")}`);
    }
  }
});

test("the day pressure module and the dive deeper name one contact per group", () => {
  const saved = { chart: NATAL.chart, angles: { ascendant: NATAL.ascendant } } as unknown as SavedNatal;
  for (const date of days(120)) {
    const sky = computeChart(date);
    const buckets = transitsByGroup(NATAL.chart, NATAL.ascendant, sky);
    const pressure = dayPressure(saved, sky, "rome");
    const dd = composeDiveDeeperForDay("rome", date, NATAL);
    buckets.forEach((hits, i) => {
      const top = rankContacts(hits)[0];
      if (!top) return;
      const t = DEITY_MATRIX.rome[top.transit].name;
      const n = DEITY_MATRIX.rome[top.natal].name;
      assert.ok(pressure[i]!.sentence.startsWith(`${t} `) && pressure[i]!.sentence.includes(`your ${n} in`), pressure[i]!.sentence);
      if (!(top.transit === "moon" && top.natal === "moon")) {
        assert.ok(dd.groups[i]!.evidence.startsWith(`${t.toUpperCase()} `) && dd.groups[i]!.evidence.includes(`YOUR ${n.toUpperCase()} ·`), dd.groups[i]!.evidence);
      }
    });
  }
});

test("without a chart, a group reads a sky figure with a body the group keeps", () => {
  for (const culture of CULTURES) {
    for (const date of days(30)) {
      const dd = composeDiveDeeperForDay(culture, date, null);
      dd.groups.forEach((g, i) => {
        if (g.quiet) return;
        // Carthage gives Jupiter and Saturn one name; both keep group 0.
        assert.ok(groupsNamed(culture, g.evidence).has(i), `${culture} ${g.title}: ${g.evidence}`);
      });
    }
  }
});

test("with a chart, a group reads a contact to a natal point in its houses", () => {
  const houseGroup = (lon: number) => {
    const house = ((Math.floor(lon / 30) - Math.floor(NATAL.ascendant / 30) + 12) % 12) + 1;
    if ([2, 6, 10].includes(house)) return 0;
    if ([4, 8].includes(house)) return 1;
    if ([3, 7, 11].includes(house)) return 2;
    return 3;
  };
  for (const culture of CULTURES) {
    for (const date of days(14)) {
      const dd = composeDiveDeeperForDay(culture, date, NATAL);
      assert.equal(dd.natal, true);
      dd.groups.forEach((g, i) => {
        if (g.quiet) return;
        const point = PLANETS.find((p) => g.evidence.includes(`YOUR ${DEITY_MATRIX[culture][p].name.toUpperCase()} ·`) && houseGroup(NATAL.chart[p]) === i);
        assert.ok(point, `${culture} ${g.title}: ${g.evidence}`);
        // A body that moves daily speaks for the group whenever one touches it.
        const bucket = transitsByGroup(NATAL.chart, NATAL.ascendant, computeChart(date))[i]!;
        const transiting = PLANETS.filter((p) => g.evidence.startsWith(`${DEITY_MATRIX[culture][p].name.toUpperCase()} `));
        if (bucket.some((h) => FAST.has(h.transit) && !(h.transit === "moon" && h.natal === "moon"))) {
          assert.ok(transiting.some((p) => FAST.has(p)), `${culture} ${g.title}: ${g.evidence}`);
        }
      });
    }
  }
});

test("a group with no natal point in its houses prints the culture's quiet line", () => {
  // Every natal body in the second house (Taurus, from a rising in Aries): only the first group has a point.
  const crowded = { chart: Object.fromEntries(PLANETS.map((p, i) => [p, 31 + i * 2.5])) as Record<Planet, number>, ascendant: 5 };
  for (const culture of CULTURES) {
    const date = new Date(START);
    const dd = composeDiveDeeper(culture, composeDayPage(culture, date), computeChart(date), utcDayNumber(date), crowded);
    assert.deepEqual(
      dd.groups.slice(1).map((g) => g.sentences),
      DIVE_DEEPER_BANKS[culture].quiet.slice(1).map((q) => [q]),
    );
  }
});

test("a reader with a chart gets lists from the day's transits to it, by the sky lists' rule", () => {
  for (const culture of CULTURES) {
    const reg = PERMISSIONS_REGISTER[culture];
    let differs = 0;
    for (const date of days(10)) {
      const sky = computeChart(date);
      const day = utcDayNumber(date);
      const figures = natalDayFigures(sky, NATAL.chart);
      const top = figures[0]!;
      assert.ok(figures.every((f) => f.a !== f.b), "a body against itself is left out");
      assert.ok(figures.every((f) => FAST.has(f.a)), "the bodies that move daily speak while one touches the chart");
      assert.ok(figures.slice(2).every((f, i, rest) => i === 0 || f.orb >= rest[i - 1]!.orb), "the rest by orb");
      assert.ok(!figures[1] || figures[1].kind !== top.kind, "the second figure is of another kind");
      const lists = natalDayPermissions(culture, sky, NATAL.chart, day)!;
      assert.deepEqual(lists, dayPermissions(culture, figures, day));
      const column = toneOf(top.kind) === "tension" ? "refrain" : "proceed";
      const lead = ((day % 3) + 3) % 3;
      assert.deepEqual(lists[column].slice(0, 2), [reg[top.a][column][lead], reg[top.b][column][lead]]);
      if (JSON.stringify(lists) !== JSON.stringify(dayPermissions(culture, composeDayPage(culture, date).figures, day))) differs += 1;
    }
    assert.ok(differs >= 8, `${culture}: the chart changes the lists on ${differs} of 10 days`);
  }
});
