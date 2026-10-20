import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ASPECT_ANGLE,
  MEAN_RATE,
  WINDOW_STEP_HOURS,
  buildTimeline,
  composeRecurrence,
  natalRecurrenceDays,
  natalWindow,
  numberWords,
  recurrenceInterval,
  skyRecurrenceDays,
  skyWindow,
} from "@/lib/recurrence";
import { computeGeocentricLongitude } from "@/lib/ephemeris";
import { orbFor } from "@/data/sampleChart";
import { CULTURES } from "@/data/cultures";
import { FIGURE_BANKS } from "@/data/figureBanks";

test("the rates are mean geocentric motions, Mercury and Venus keeping the Sun's pace", () => {
  assert.equal(MEAN_RATE.moon, 13.176);
  assert.equal(MEAN_RATE.sun, 0.9856);
  assert.equal(MEAN_RATE.mercury, MEAN_RATE.sun);
  assert.equal(MEAN_RATE.venus, MEAN_RATE.sun);
  assert.equal(MEAN_RATE.mars, 0.524);
});

test("a natal contact returns every 360 / rate days, halved for the two-per-cycle kinds", () => {
  // Mercury and Venus against a fixed point: about a year, not their loop with the Sun.
  assert.ok(Math.abs(natalRecurrenceDays("mercury", "conjunction") - 365.26) < 0.1);
  assert.equal(recurrenceInterval("greece", natalRecurrenceDays("mercury", "conjunction")), "about once a year");
  assert.equal(recurrenceInterval("rome", natalRecurrenceDays("venus", "opposition")), "about once a year");
  // The Moon's trine to a natal point: twice a month.
  assert.ok(Math.abs(natalRecurrenceDays("moon", "trine") - 13.66) < 0.01);
  assert.equal(recurrenceInterval("canaan", natalRecurrenceDays("moon", "trine")), "about twice a month");
  assert.equal(recurrenceInterval("rome", natalRecurrenceDays("moon", "trine")), "about every fourteen days");
  assert.equal(recurrenceInterval("egypt", natalRecurrenceDays("moon", "conjunction")), "about every three decans");
  assert.equal(recurrenceInterval("rome", natalRecurrenceDays("mars", "conjunction")), "about every twenty-three months");
  assert.equal(recurrenceInterval("rome", natalRecurrenceDays("mars", "square")), "about every eleven months");
  assert.equal(recurrenceInterval("rome", natalRecurrenceDays("jupiter", "trine")), "about every six years");
  assert.equal(recurrenceInterval("rome", natalRecurrenceDays("pluto", "conjunction")), "about every two hundred and forty-eight years");
});

test("a sky figure returns by the two bodies' relative motion, or by the measured interval when they keep pace", () => {
  // Sun conjunct Mars: the Martian synodic period, about 780 days.
  const sunMars = skyRecurrenceDays("sun", "mars", "conjunction")!;
  assert.ok(Math.abs(sunMars - 780) < 2);
  assert.equal(recurrenceInterval("rome", sunMars), "about every two years");
  // The Moon against anything: 27 to 30 days.
  for (const other of ["sun", "mars", "saturn", "pluto"] as const) {
    const days = skyRecurrenceDays("moon", other, "conjunction")!;
    assert.ok(days > 27 && days < 30, `${other}: ${days}`);
  }
  // The Sun meets an inner planet twice a synodic period, inferior and superior.
  assert.equal(skyRecurrenceDays("sun", "mercury", "conjunction"), 57.9);
  assert.equal(skyRecurrenceDays("venus", "sun", "conjunction"), 291.9);
  assert.equal(recurrenceInterval("greece", 57.9), "about every fifty-eight days");
  assert.equal(recurrenceInterval("rome", 291.9), "about every ten months");
  // Mercury and Venus keep no steady interval, and the page says so.
  assert.equal(skyRecurrenceDays("mercury", "venus", "square"), null);
  assert.equal(composeRecurrence("egypt", null), FIGURE_BANKS.egypt.recurrenceIrregular);
  assert.equal(new Set(CULTURES.map((c) => composeRecurrence(c, null))).size, 5);
});

test("no culture ever counts in seven-day weeks", () => {
  for (const culture of CULTURES) {
    for (const days of [13.66, 14.8, 27.32, 29.53, 50, 72.3, 365.26, 780]) {
      assert.doesNotMatch(recurrenceInterval(culture, days), /week/, `${culture} ${days}`);
    }
  }
});

test("the recurrence sentence differs in every culture", () => {
  const lines = CULTURES.map((c) => composeRecurrence(c, skyRecurrenceDays("sun", "mars", "opposition")!));
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
