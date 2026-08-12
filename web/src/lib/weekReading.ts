import type { Culture, Planet } from "@/data/cultures";
import { PLANETS, PLANET_SYMBOLS } from "@/data/cultures";
import { computeAspects, longitudeToSign, type AspectKind, type ZodiacSign } from "@/data/sampleChart";
import { computeChart } from "@/lib/ephemeris";
import { findYearIngresses } from "@/lib/yearForecast";
import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { SIGN_PHRASES } from "@/components/horizons/signPhrase";
import { noonUTCFor, properCase, sameLocalDay, weekdayAbbr } from "@/components/horizons/format";
import type { SavedNatal } from "@/lib/savedNatal";

export type WeekTone = "harmony" | "tension" | "quiet";
export type RomeDayFlag = "F" | "N" | "C";

export interface WeekDay {
  date: Date;
  /** "MON 11" */
  label: string;
  isToday: boolean;
  line: string;
  shorthand: string;
  tone: WeekTone;
  /** Rome only: fastus / nefastus / comitialis. */
  flag?: RomeDayFlag;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** The day's tightest-orb threshold and the exact-degree threshold within it. */
const EVENT_ORB = 1.2;
const EXACT_ORB = 0.35;

const ASPECT_GLYPH: Readonly<Record<AspectKind, string>> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

const SIGN_ABBR: Readonly<Record<ZodiacSign, string>> = {
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

/**
 * One short imperative per (culture, aspect kind): the second half of an
 * aspect day's line, in the culture's institutional register. Egypt weighs,
 * Greece questions, Canaan convenes, Carthage audits, Rome rules.
 */
const ASPECT_IMPERATIVES: Readonly<Record<Culture, Readonly<Record<AspectKind, string>>>> = {
  egypt: {
    conjunction: "Declare the union. Let the scribes enter it in one line.",
    sextile: "Take the offered hand. The current does the rest.",
    square: "Weigh it before you speak. Isfet enters where the scale is left untended.",
    trine: "Row with it while the current holds. The work will not cost you twice.",
    opposition: "Hold the two pans level. Do not force a verdict the river has not given.",
  },
  greece: {
    conjunction: "Ask the one question, not three. The god answers a single voice.",
    sextile: "Knock while the door is open. Ask plainly, and pay what is asked.",
    square: "Name the price before you agree to it. The answer costs; know what.",
    trine: "Take the answer offered. Nothing is owed for what comes this easily.",
    opposition: "Change the question. Two shrines will not agree until you do.",
  },
  canaan: {
    conjunction: "Bring it to the council as one matter, not two.",
    sextile: "Make the vow today. It will be heard.",
    square: "Let the witness speak. Do not silence the objection to save time.",
    trine: "Work the field while the rains hold. Do not wait for a vow first.",
    opposition: "Wait for one season to yield. Nothing moves while both hold their ground.",
  },
  carthage: {
    conjunction: "Enter it under one name. Do not split what the sky has joined.",
    sextile: "Load the cargo. The wind will not stay fair forever.",
    square: "Leave the books open until the discrepancy is explained. Do not close early.",
    trine: "Set out. Nothing is called in first.",
    opposition: "Withdraw one claim before you ship. The quay will not release cargo to two.",
  },
  rome: {
    conjunction: "Act as one power, not two. Divided command loses the field.",
    sextile: "Petition for it plainly. The omen favors the one who asks.",
    square: "Proceed, but expect the objection. Prepare the defense first.",
    trine: "Proceed without a second reading. The right hand is already offered.",
    opposition: "Wait for one magistrate to yield the chair. Nothing is settled while both hold it.",
  },
};

/** The verb an ingress line uses: "{deity} {verb} the {sign}." */
const INGRESS_VERB: Readonly<Record<Culture, string>> = {
  egypt: "crosses into",
  greece: "steps into",
  canaan: "comes before",
  carthage: "makes port in",
  rome: "enters the augur's boundary of",
};

const INGRESS_IMPERATIVE: Readonly<Record<Culture, string>> = {
  egypt: "Cross into it deliberately. The river does not reverse for anyone.",
  greece: "Meet the new ground with an open question, not an old answer.",
  canaan: "Bring the matter before the new seat; the council changes with it.",
  carthage: "Log the new heading. The old bearing no longer holds.",
  rome: "Take the auspices again; the ground under the standard has changed.",
};

/** One honest quiet-day line per culture (5 variants, one per culture, not per day). */
const QUIET_LINE: Readonly<Record<Culture, string>> = {
  egypt: "No exact aspect. A day of ordinary work. Ma'at counts it no lower than a feast.",
  greece: "No shrine answers today. The oracle keeps its own counsel, and so should you.",
  canaan: "No matter reaches the council today. An ordinary day still stands under El's tent.",
  carthage: "No entry posts today. The ledger holds steady, which is its own kind of profit.",
  rome: "No omen stands out today. An ordinary day is still taken under auspices.",
};

function composeAspectSentence(
  culture: Culture,
  a: Planet,
  b: Planet,
  kind: AspectKind,
  exact: boolean,
  chart: Readonly<Record<Planet, number>>,
): string {
  const deityA = DEITY_MATRIX[culture][a].name;
  const deityB = DEITY_MATRIX[culture][b].name;
  const verb = ASPECT_VERBS[culture][kind];
  const signClause =
    kind === "conjunction" ? ` in the ${properCase(SIGN_PHRASES[longitudeToSign(chart[a]).sign])}` : "";
  const exactClause = exact ? "exactly " : "";
  return `${deityA} ${exactClause}${verb} ${deityB}${signClause}.`;
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
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
    const chart = computeChart(noonUTCFor(date));
    const aspects = computeAspects(chart);

    let tightest: (typeof aspects)[number] | null = null;
    for (const aspect of aspects) {
      if (aspect.orb >= EVENT_ORB) continue;
      if (!tightest || aspect.orb < tightest.orb) tightest = aspect;
    }

    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + DAY_MS);
    const dayIngress = weekIngresses.find((e) => e.date >= dayStart && e.date < dayEnd) ?? null;

    let line: string;
    let shorthand: string;
    let tone: WeekTone;
    let exact = false;

    if (tightest) {
      exact = tightest.orb < EXACT_ORB;
      tone = toneForKind(tightest.kind);
      const astro = composeAspectSentence(culture, tightest.a, tightest.b, tightest.kind, exact, chart);
      line = `${astro} ${ASPECT_IMPERATIVES[culture][tightest.kind]}`;
      shorthand = `${PLANET_SYMBOLS[tightest.a]} ${ASPECT_GLYPH[tightest.kind]} ${PLANET_SYMBOLS[tightest.b]}${
        exact ? " EXACT" : ""
      }`;
    } else if (dayIngress) {
      tone = "harmony";
      const deity = DEITY_MATRIX[culture][dayIngress.planet].name;
      const signWord = properCase(SIGN_PHRASES[dayIngress.toSign]);
      line = `${deity} ${INGRESS_VERB[culture]} the ${signWord}. ${INGRESS_IMPERATIVE[culture]}`;
      shorthand = `${PLANET_SYMBOLS[dayIngress.planet]} → ${SIGN_ABBR[dayIngress.toSign]}`;
    } else {
      tone = "quiet";
      line = QUIET_LINE[culture];
      shorthand = "QUIET";
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
