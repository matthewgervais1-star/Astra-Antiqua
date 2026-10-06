import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ASPECT_ANGLE,
  CYCLE_DAYS,
  WINDOW_STEP_HOURS,
  buildTimeline,
  composeRecurrence,
  natalWindow,
  numberWords,
  recurrenceDays,
  recurrenceInterval,
  skyWindow,
} from "@/lib/recurrence";
import { computeGeocentricLongitude } from "@/lib/ephemeris";
import { orbFor } from "@/data/sampleChart";
import { CULTURES } from "@/data/cultures";

test("the cycles are the plan's: sidereal Moon, the year, synodic Mercury and Venus, sidereal Mars and beyond", () => {
  assert.equal(CYCLE_DAYS.moon, 27.32);
  assert.equal(CYCLE_DAYS.sun, 365.25);
  assert.equal(CYCLE_DAYS.mercury, 115.9);
  assert.equal(CYCLE_DAYS.venus, 583.9);
  assert.equal(CYCLE_DAYS.mars, 687);
  assert.equal(Math.round(CYCLE_DAYS.pluto / 365.25), 248);
});

test("conjunction and opposition come once a cycle, the others twice", () => {
  assert.equal(recurrenceDays("moon", "conjunction"), 27.32);
  assert.equal(recurrenceDays("moon", "opposition"), 27.32);
  for (const kind of ["sextile", "square", "trine"] as const) assert.equal(recurrenceDays("moon", kind), 13.66);
});

test("the interval is said in each calendar's own words, and never as a seven-day week", () => {
  const moonHalf = recurrenceDays("moon", "square");
  const moonWhole = recurrenceDays("moon", "conjunction");
  assert.equal(recurrenceInterval("egypt", moonHalf), "about every decan and a half");
  assert.equal(recurrenceInterval("egypt", moonWhole), "about every three decans");
  assert.equal(recurrenceInterval("greece", moonHalf), "about twice a month");
  assert.equal(recurrenceInterval("canaan", moonWhole), "about once a month");
  assert.equal(recurrenceInterval("rome", moonHalf), "about every fourteen days");
  assert.equal(recurrenceInterval("rome", moonWhole), "about once a month");
  assert.equal(recurrenceInterval("egypt", recurrenceDays("mercury", "conjunction")), "about once a season");
  assert.equal(recurrenceInterval("greece", recurrenceDays("mercury", "conjunction")), "about every four months");
  assert.equal(recurrenceInterval("rome", recurrenceDays("mercury", "trine")), "about every two months");
  assert.equal(recurrenceInterval("carthage", recurrenceDays("sun", "square")), "about every six months");
  assert.equal(recurrenceInterval("rome", recurrenceDays("venus", "sextile")), "about every ten months");
  assert.equal(recurrenceInterval("rome", recurrenceDays("mars", "square")), "about once a year");
  assert.equal(recurrenceInterval("rome", recurrenceDays("venus", "conjunction")), "about every nineteen months");
  assert.equal(recurrenceInterval("rome", recurrenceDays("mars", "opposition")), "about every two years");
  assert.equal(recurrenceInterval("rome", recurrenceDays("jupiter", "trine")), "about every six years");
  assert.equal(recurrenceInterval("rome", recurrenceDays("pluto", "conjunction")), "about every two hundred and forty-eight years");
  for (const culture of CULTURES) {
    for (const days of [13.66, 27.32, 57.95, 115.9, 365.25, 687]) {
      assert.doesNotMatch(recurrenceInterval(culture, days), /week/, `${culture} ${days}`);
    }
  }
});

test("the recurrence sentence differs in every culture", () => {
  const lines = CULTURES.map((c) => composeRecurrence(c, "mars", "opposition"));
  assert.equal(new Set(lines).size, 5);
  assert.equal(lines[4], "The augurs record this figure again about every two years.");
});

test("numbers are written out", () => {
  assert.equal(numberWords(14), "fourteen");
  assert.equal(numberWords(29), "twenty-nine");
  assert.equal(numberWords(100), "one hundred");
  assert.equal(numberWords(165), "one hundred and sixty-five");
});

const separation = (x: number, y: number) => {
  const raw = Math.abs(x - y) % 360;
  return raw > 180 ? 360 - raw : raw;
};

test("a sky window holds the figure inside its orb at both edges and lets it go one step beyond", () => {
  const instant = new Date(Date.UTC(2026, 9, 3));
  const w = skyWindow("mars", "neptune", "trine", instant);
  const off = (t: Date) =>
    Math.abs(separation(computeGeocentricLongitude("mars", t), computeGeocentricLongitude("neptune", t)) - ASPECT_ANGLE.trine);
  const step = WINDOW_STEP_HOURS * 3_600_000;
  assert.ok(w.start <= instant && w.end >= instant);
  assert.ok(off(w.start) <= orbFor("trine") && off(w.end) <= orbFor("trine"));
  assert.ok(off(new Date(w.start.getTime() - step)) > orbFor("trine"));
  assert.ok(off(new Date(w.end.getTime() + step)) > orbFor("trine"));
});

test("a natal window does the same against a fixed longitude", () => {
  const instant = new Date(Date.UTC(2026, 9, 3));
  const target = (computeGeocentricLongitude("moon", instant) + 90) % 360;
  const w = natalWindow("moon", target, "square", instant);
  const hours = (w.end.getTime() - w.start.getTime()) / 3_600_000;
  // Fourteen degrees of orb at the Moon's twelve to fifteen degrees a day,
  // sampled every six hours: the edges are the last samples inside the orb.
  assert.ok(hours >= 12 && hours <= 30 && hours % WINDOW_STEP_HOURS === 0, `${hours} hours`);
});

test("the timeline has four ticks labelled at the window's scale, and marks the present inside it", () => {
  const start = new Date(Date.UTC(2026, 8, 30, 12));
  const end = new Date(Date.UTC(2026, 9, 1, 6));
  const short = buildTimeline({ start, end }, new Date(Date.UTC(2026, 8, 30, 18)), start);
  assert.deepEqual(short.ticks.map((t) => `${t.label} ${t.sub}`), ["SEP 30 12:00", "SEP 30 18:00", "OCT 1 00:00", "OCT 1 06:00"]);
  assert.ok(short.presentInside);
  assert.equal(Math.round(short.presentPct), 33);

  const long = buildTimeline(
    { start: new Date(Date.UTC(2026, 8, 3)), end: new Date(Date.UTC(2026, 11, 20)) },
    new Date(Date.UTC(2030, 0, 1)),
    new Date(Date.UTC(2026, 9, 1)),
  );
  assert.deepEqual(long.ticks.map((t) => t.label), ["EARLY SEP", "EARLY OCT", "MID NOV", "MID DEC"]);
  assert.equal(long.presentInside, false, "a present outside the window falls back to the reading's own instant");
  assert.ok(long.presentPct > 20 && long.presentPct < 30);
});
