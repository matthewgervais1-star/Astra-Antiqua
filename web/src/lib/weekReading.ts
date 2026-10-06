import type { Culture, Planet } from "@/data/cultures";
import { PLANETS } from "@/data/cultures";
import { computeAspects, type AspectKind, type ZodiacSign } from "@/data/sampleChart";
import { computeChart } from "@/lib/ephemeris";
import { findYearIngresses } from "@/lib/yearForecast";
import { DEITY_MATRIX } from "@/data/deities";
import { INGRESS_FRAMES } from "@/data/ingressFrames";
import { DEITY_CHARGES } from "@/data/deityCharges";
import { DECREE_BANKS, QUIET_LINE } from "@/data/decreeBanks";
import {
  ASPECT_GLYPH,
  TIGHT_ORB,
  QUIET_HEADLINE,
  composeConsequence,
  composeHeadline,
  composeMeaning,
  utcDayNumber,
} from "@/lib/decree";
import { SIGN_PHRASES } from "@/components/horizons/signPhrase";
import { properCase, sameLocalDay, weekdayAbbr } from "@/components/horizons/format";
import type { SavedNatal } from "@/lib/savedNatal";

export type WeekTone = "harmony" | "tension" | "quiet";
export type RomeDayFlag = "F" | "N" | "C";

/**
 * The day's shorthand as data. WeekNave renders it: the renderer draws each
 * body as a DeityGlyph in the active culture and prints ASPECT_GLYPH,
 * SIGN_ABBR, the arrow and TIGHT around the glyphs.
 */
export type WeekShorthand =
  | { kind: "aspect"; a: Planet; aspect: AspectKind; b: Planet; tight: boolean }
  | { kind: "ingress"; planet: Planet; sign: ZodiacSign }
  | { kind: "quiet" };

export interface WeekDay {
  date: Date;
  /** "MON 11" */
  label: string;
  isToday: boolean;
  /** The decree's headline for the day's figure, the culture's holds line when
   *  the figure is the row above's, or null on an ingress day. */
  headline: string | null;
  line: string;
  shorthand: WeekShorthand;
  tone: WeekTone;
  /** Rome only: fastus / nefastus / comitialis. */
  flag?: RomeDayFlag;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** The orb inside which a figure can be a day's event. Tightness is decree.ts's TIGHT_ORB. */
const EVENT_ORB = 1.2;

/**
 * Only aspects touching a fast mover count as a DAY's event. Slow-slow
 * pairs (Jupiter through Pluto against each other) hold their orb for
 * months or years; treating one as daily weather prints the same line
 * seven times over. They belong to the season, the year, and the long
 * transits, not to the week's ledger.
 */
const FAST_BODIES: ReadonlySet<Planet> = new Set(["sun", "moon", "mercury", "venus", "mars"]);

export { ASPECT_GLYPH, QUIET_LINE };

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

/**
 * Compose the seven days of the week starting `weekStart` (assumed to be a
 * local midnight Monday) in the given culture's voice. Each day's headline
 * event is sky-only, ranked tightest sky aspect (orb < 1.2°, flagged TIGHT under
 * decree.ts's TIGHT_ORB) over an ingress that day over an honest quiet line, per the spec in
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
  let previous: string | null = null;
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
    // 00:00 UTC on the row's calendar date, the instant the day page reads,
    // so a date shows the same figure on both pages.
    const instant = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const chart = computeChart(instant);
    const aspects = computeAspects(chart);

    // The tightest fast-mover aspect inside the event orb is the day's figure,
    // always: the sky decides it. A figure that holds from one row to the
    // next says so in the culture's holds line instead of a second headline.
    const tightest =
      aspects
        .filter((a) => a.orb < EVENT_ORB && (FAST_BODIES.has(a.a) || FAST_BODIES.has(a.b)))
        .sort((a, b) => a.orb - b.orb)[0] ?? null;
    const figureKey = tightest ? `${tightest.a}|${tightest.b}|${tightest.kind}` : null;
    const holds = figureKey !== null && figureKey === previous;
    previous = figureKey;

    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + DAY_MS);
    const dayIngress = weekIngresses.find((e) => e.date >= dayStart && e.date < dayEnd) ?? null;

    let headline: string | null = null;
    let line: string;
    let shorthand: WeekShorthand;
    let tone: WeekTone;
    let tight = false;

    if (tightest) {
      tight = tightest.orb < TIGHT_ORB;
      tone = toneForKind(tightest.kind);
      // The headline speaks to the reader; beneath it the meaning and the
      // consequence. The week line itself gives no order; the headline often
      // does, and the day page carries the instruction.
      headline = holds ? DECREE_BANKS[culture].holds : composeHeadline(culture, tightest);
      line = `${composeMeaning(culture, tightest, utcDayNumber(instant))} ${composeConsequence(culture, tightest)}`;
      shorthand = { kind: "aspect", a: tightest.a, aspect: tightest.kind, b: tightest.b, tight };
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
      headline = QUIET_HEADLINE[culture];
      line = QUIET_LINE[culture];
      shorthand = { kind: "quiet" };
    }

    const flag: RomeDayFlag | undefined = isRome
      ? tone === "tension"
        ? tight
          ? "N"
          : "C"
        : "F"
      : undefined;

    days.push({
      date,
      label: `${weekdayAbbr(date)} ${date.getDate()}`,
      isToday: sameLocalDay(date, today),
      headline,
      line,
      shorthand,
      tone,
      flag,
    });
  }

  return days;
}
