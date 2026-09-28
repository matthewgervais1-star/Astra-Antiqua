import type { Culture, Planet } from "@/data/cultures";
import { PLANETS } from "@/data/cultures";
import { computeAspects, longitudeToSign, type AspectKind, type ZodiacSign } from "@/data/sampleChart";
import { computeChart } from "@/lib/ephemeris";
import { findYearIngresses } from "@/lib/yearForecast";
import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { ASPECT_FRAMES, INGRESS_FRAMES } from "@/data/aspectFrames";
import { DEITY_CHARGES } from "@/data/deityCharges";
import { SIGN_PHRASES } from "@/components/horizons/signPhrase";
import { noonUTCFor, properCase, sameLocalDay, weekdayAbbr } from "@/components/horizons/format";
import type { SavedNatal } from "@/lib/savedNatal";

export type WeekTone = "harmony" | "tension" | "quiet";
export type RomeDayFlag = "F" | "N" | "C";

/**
 * The day's shorthand as data. WeekNave renders it: the renderer draws each
 * body as a DeityGlyph in the active culture and prints ASPECT_GLYPH,
 * SIGN_ABBR, the arrow and EXACT around the glyphs.
 */
export type WeekShorthand =
  | { kind: "aspect"; a: Planet; aspect: AspectKind; b: Planet; exact: boolean }
  | { kind: "ingress"; planet: Planet; sign: ZodiacSign }
  | { kind: "quiet" };

export interface WeekDay {
  date: Date;
  /** "MON 11" */
  label: string;
  isToday: boolean;
  line: string;
  shorthand: WeekShorthand;
  tone: WeekTone;
  /** Rome only: fastus / nefastus / comitialis. */
  flag?: RomeDayFlag;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** The day's tightest-orb threshold and the exact-degree threshold within it. */
const EVENT_ORB = 1.2;
const EXACT_ORB = 0.35;

/**
 * Only aspects touching a fast mover count as a DAY's event. Slow-slow
 * pairs (Jupiter through Pluto against each other) hold their orb for
 * months or years; treating one as daily weather prints the same line
 * seven times over. They belong to the season, the year, and the long
 * transits, not to the week's ledger.
 */
const FAST_BODIES: ReadonlySet<Planet> = new Set(["sun", "moon", "mercury", "venus", "mars"]);

export const ASPECT_GLYPH: Readonly<Record<AspectKind, string>> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

export const SIGN_ABBR: Readonly<Record<ZodiacSign, string>> = {
  Aries: "ARI",
  Taurus: "TAU",
  Gemini: "GEM",
  Cancer: "CAN",
  Leo: "LEO",
  Virgo: "VIR",
  Libra: "LIB",
  Scorpio: "SCO",
  Sagittarius: "SAG",
  Capricorn: "CAP",
  Aquarius: "AQU",
  Pisces: "PIS",
};

function toneForKind(kind: AspectKind): "harmony" | "tension" {
  return kind === "square" || kind === "opposition" ? "tension" : "harmony";
}

/** The verb an ingress line uses: "{deity} {verb} the {sign}." */
const INGRESS_VERB: Readonly<Record<Culture, string>> = {
  egypt: "is ferried into",
  greece: "goes on to the shrine of",
  canaan: "comes before",
  carthage: "makes port in",
  rome: "enters the augur's boundary of",
};

/** One honest quiet-day line per culture (5 variants, one per culture, not per
 *  day). These are the corpus's plain days and they stay plain: no aspect is
 *  invented and no reassurance is offered. Each opens on a different shape so
 *  the five do not read as one line with the institution swapped, and none
 *  repeats its culture's QUIET_HEADLINE in lib/decree.ts. */
export const QUIET_LINE: Readonly<Record<Culture, string>> = {
  egypt: "Nothing on the river runs close enough to weigh. A day of ordinary work, and Ma'at counts it no lower than a feast.",
  greece: "No shrine answers today. The oracle keeps its own counsel, and so should you.",
  canaan: "Not one matter is brought forward today. An ordinary day still stands under El's tent.",
  carthage: "The day's page takes no entry. The books hold steady, which is its own kind of profit.",
  rome: "Nothing is reported that the augurs would call a sign. The citadel was manned at dawn all the same.",
};

/**
 * How each culture marks a degree-exact contact. One adverb in one slot ("X
 * exactly {verb}s Y") made all five voices rhyme: same word, same position,
 * five pantheons. So each institution now marks exactness with its own
 * instrument AND in its own part of the sentence: Egypt opens on the reading,
 * Greece on an adverbial, Canaan closes on a coordinate clause, Carthage on a
 * bare absolute, Rome breaks the subject with an appositive.
 *
 * Each culture carries two instruments because a decree can run two exact
 * figures, and the same marker twice on one page is the seam this whole
 * arrangement exists to avoid. The position stays fixed per culture (that is
 * what keeps the five from rhyming); only the instrument varies.
 */
const EXACT_FORMS: Readonly<
  Record<Culture, ReadonlyArray<(subject: string, predicate: string) => string>>
> = {
  egypt: [
    (subject, predicate) => `The plumb hangs true: ${subject} ${predicate}.`,
    (subject, predicate) => `The cord is drawn tight: ${subject} ${predicate}.`,
  ],
  greece: [
    (subject, predicate) => `To the very degree, ${subject} ${predicate}.`,
    (subject, predicate) => `Within the hair, ${subject} ${predicate}.`,
  ],
  canaan: [
    (subject, predicate) => `${subject} ${predicate}, and the gate is full to the wall.`,
    (subject, predicate) => `${subject} ${predicate}, and every god has come at the summons.`,
  ],
  carthage: [
    (subject, predicate) => `${subject} ${predicate}, the entry posted to the hour.`,
    (subject, predicate) => `${subject} ${predicate}, the weight matched to its mark.`,
  ],
  rome: [
    (subject, predicate) => `${subject}, at the line the augur drew, ${predicate}.`,
    (subject, predicate) => `${subject}, inside the templum, ${predicate}.`,
  ],
};

export function composeAspectSentence(
  culture: Culture,
  a: Planet,
  b: Planet,
  kind: AspectKind,
  exact: boolean,
  chart: Readonly<Record<Planet, number>>,
  /** Which exactness instrument to use, so two exact figures in one decree
   *  do not carry the same marker. Wraps. */
  variant = 0,
): string {
  const deityA = DEITY_MATRIX[culture][a].name;
  const deityB = DEITY_MATRIX[culture][b].name;
  const verb = ASPECT_VERBS[culture][kind];
  const signClause =
    kind === "conjunction" ? ` in the ${properCase(SIGN_PHRASES[longitudeToSign(chart[a]).sign])}` : "";
  const predicate = `${verb} ${deityB}${signClause}`;
  if (exact) {
    const forms = EXACT_FORMS[culture];
    const form = forms[variant % forms.length] ?? forms[0];
    if (form) return form(deityA, predicate);
  }
  return `${deityA} ${predicate}.`;
}

/**
 * Compose the seven days of the week starting `weekStart` (assumed to be a
 * local midnight Monday) in the given culture's voice. Each day's headline
 * event is sky-only, ranked tightest sky aspect (orb < 1.2°, "EXACT" under
 * 0.35°) over an ingress that day over an honest quiet line, per the spec in
 * docs/superpowers/plans/2026-08-11-web-rebrand-phase2.md Task 7. `natal` is
 * accepted for signature parity with the season/year builders and reserved
 * for a future personal layer; the week's event selection is sky-only by
 * design, so it is intentionally not read here.
 */
export function buildWeekDays(culture: Culture, weekStart: Date, natal: SavedNatal | null): WeekDay[] {
  void natal;

  const today = new Date();
  const isRome = culture === "rome";

  // One ingress scan for the whole week (buffered a couple of days past the
  // end) rather than seven separate scans; findYearIngresses's per-planet
  // sampling cadence needs at least one full step inside the window to find
  // sun/mercury/venus ingresses (step 2 days) reliably.
  const weekIngresses = findYearIngresses(weekStart, 9, PLANETS);

  const days: WeekDay[] = [];
  const usedPairs = new Set<string>();
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
    const chart = computeChart(noonUTCFor(date));
    const aspects = computeAspects(chart);

    // Tightest fast-mover aspect wins, but a pair that already headlined an
    // earlier day this week only repeats when it is exact today; otherwise
    // the next distinct candidate speaks. Moon aspects change daily, so the
    // dedupe mostly guards Sun and inner-planet contacts to slow bodies.
    const candidates = aspects
      .filter((a) => a.orb < EVENT_ORB && (FAST_BODIES.has(a.a) || FAST_BODIES.has(a.b)))
      .sort((a, b) => a.orb - b.orb);
    let tightest: (typeof aspects)[number] | null = null;
    for (const aspect of candidates) {
      const pair = `${aspect.a}|${aspect.b}`;
      if (usedPairs.has(pair) && aspect.orb >= EXACT_ORB) continue;
      tightest = aspect;
      usedPairs.add(pair);
      break;
    }

    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + DAY_MS);
    const dayIngress = weekIngresses.find((e) => e.date >= dayStart && e.date < dayEnd) ?? null;

    let line: string;
    let shorthand: WeekShorthand;
    let tone: WeekTone;
    let exact = false;

    if (tightest) {
      exact = tightest.orb < EXACT_ORB;
      tone = toneForKind(tightest.kind);
      const astro = composeAspectSentence(culture, tightest.a, tightest.b, tightest.kind, exact, chart);
      // The ruling takes both gods' charges, so the day's line changes with
      // the figure rather than with the aspect kind alone. No order: a week
      // line reports the figure, and the decree carries the one instruction.
      line = `${astro} ${ASPECT_FRAMES[culture][tightest.kind](
        DEITY_CHARGES[culture][tightest.a],
        DEITY_CHARGES[culture][tightest.b],
      )}`;
      shorthand = { kind: "aspect", a: tightest.a, aspect: tightest.kind, b: tightest.b, exact };
    } else if (dayIngress) {
      tone = "harmony";
      const deity = DEITY_MATRIX[culture][dayIngress.planet].name;
      const signWord = properCase(SIGN_PHRASES[dayIngress.toSign]);
      line = `${deity} ${INGRESS_VERB[culture]} the ${signWord}. ${INGRESS_FRAMES[culture](
        DEITY_CHARGES[culture][dayIngress.planet],
      )}`;
      shorthand = { kind: "ingress", planet: dayIngress.planet, sign: dayIngress.toSign };
    } else {
      tone = "quiet";
      line = QUIET_LINE[culture];
      shorthand = { kind: "quiet" };
    }

    const flag: RomeDayFlag | undefined = isRome
      ? tone === "tension"
        ? exact
          ? "N"
          : "C"
        : "F"
      : undefined;

    days.push({
      date,
      label: `${weekdayAbbr(date)} ${date.getDate()}`,
      isToday: sameLocalDay(date, today),
      line,
      shorthand,
      tone,
      flag,
    });
  }

  return days;
}
