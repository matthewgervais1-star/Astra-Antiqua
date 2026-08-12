import type { Culture, Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { ZODIAC_SIGNS, longitudeToSign } from "@/data/sampleChart";
import { computeGeocentricLongitude } from "@/lib/ephemeris";
import { SLOW_BODIES, type YearIngressEvent } from "@/lib/yearForecast";
import type { HouseMeaning } from "@/data/houses";
import type { SeasonSkyEvents, SeasonStandout, SeasonWindow } from "@/lib/season";
import { SIGN_PHRASES } from "@/components/horizons/signPhrase";
import { formatDayMonth, properCase } from "@/components/horizons/format";
import { houseGroupName } from "@/components/horizons/houseGroups";

const DAY_MS = 86_400_000;

export type SeasonStatus = "OPENING" | "MIDPOINT PASSED" | "CLOSING";
export type SeasonTone = "harmony" | "tension" | "quiet";

/** Coarse tripartite read of where in the window `date` falls: OPENING (first
 *  ~15%), CLOSING (last ~15%), otherwise the broad running middle. */
export function seasonStatus(window: SeasonWindow): SeasonStatus {
  const edge = Math.max(3, Math.round(window.totalDays * 0.15));
  if (window.dayOfSeason <= edge) return "OPENING";
  if (window.daysRemaining <= edge) return "CLOSING";
  return "MIDPOINT PASSED";
}

const STATUS_SENTENCE: Readonly<Record<SeasonStatus, string>> = {
  OPENING: "It has only just begun.",
  "MIDPOINT PASSED": "Its middle is now, past the crossing point.",
  CLOSING: "It closes soon.",
};

/** A slow body currently sitting in the season's sign, if any: the "named
 *  companion planet" the spine's WHERE IT BEGINS section calls out. */
export function companionInSign(window: SeasonWindow, now: Date): Planet | null {
  for (const body of SLOW_BODIES) {
    const lon = computeGeocentricLongitude(body, now);
    if (longitudeToSign(lon).sign === window.sign) return body;
  }
  return null;
}

export function composeWhereItBegins(
  culture: Culture,
  window: SeasonWindow,
  companion: Planet | null,
): string {
  const sunDeity = DEITY_MATRIX[culture].sun.name;
  const signWord = properCase(SIGN_PHRASES[window.sign]);
  const opened = `It opened when the ${signWord} received ${sunDeity}, ${window.dayOfSeason} day${
    window.dayOfSeason === 1 ? "" : "s"
  } past.`;
  const status = STATUS_SENTENCE[seasonStatus(window)];
  const companionLine = companion ? ` ${DEITY_MATRIX[culture][companion].name} stands with it this month.` : "";
  return `${opened} ${status}${companionLine}`;
}

/** Fallback for WHAT IS CHANGING when the window has no standout beat at all. */
const QUIET_SKY_LINE: Readonly<Record<Culture, string>> = {
  egypt: "No beat stands out this month. Ma'at reads the stillness as its own report.",
  greece: "No oracle raises its voice this month. Silence is also counsel.",
  canaan: "No matter comes to the council's floor this month. The tent stands regardless.",
  carthage: "No entry posts to the ledger this month. A quiet month still closes clean.",
  rome: "No omen stands out this month. The auspices are taken all the same.",
};

export function composeWhatIsChanging(culture: Culture, standouts: readonly SeasonStandout[]): string {
  const primary = standouts[0];
  if (!primary) return QUIET_SKY_LINE[culture];
  const secondary = standouts[1];
  const parts = [primary.title, primary.body];
  if (secondary && secondary.title !== primary.title) parts.push(secondary.title);
  return parts.join(" ");
}

export function seasonVotiveTone(standouts: readonly SeasonStandout[]): SeasonTone {
  const top = standouts[0];
  if (!top || !top.tone) return "quiet";
  return top.tone === "tension" ? "tension" : "harmony";
}

export function composeWhatItTouchesNatal(culture: Culture, house: HouseMeaning): string {
  const group = houseGroupName(culture, house.house);
  return `The season falls in your ${house.ordinal} House, ${house.title}: what this culture counts among ${group}. It touches ${house.arena}.`;
}

export function composeWhatItTouchesSky(culture: Culture, ingresses: readonly YearIngressEvent[]): string {
  if (ingresses.length === 0) {
    return "No fast planet changes sign this month; the season holds its shape.";
  }
  const sentences = ingresses.slice(0, 3).map((ing) => {
    const deity = DEITY_MATRIX[culture][ing.planet].name;
    const signWord = properCase(SIGN_PHRASES[ing.toSign]);
    return `${deity} enters the ${signWord} on ${formatDayMonth(ing.date)}.`;
  });
  return sentences.join(" ");
}

const LEAVES_BEHIND: Readonly<Record<Culture, (outSign: string, inSign: string) => string>> = {
  egypt: (outSign, inSign) => `The scale does not carry ${outSign}'s excuses into ${inSign}.`,
  greece: (outSign, inSign) => `The oracle does not carry ${outSign}'s unanswered question into ${inSign}.`,
  canaan: (outSign, inSign) => `What the council did not seal in ${outSign}, it does not reopen in ${inSign}.`,
  carthage: (outSign, inSign) => `The ledger does not carry ${outSign}'s promises unwitnessed into ${inSign}.`,
  rome: () => "The censor does not re-hear what this month already judged.",
};

export function composeWhatItLeavesBehind(culture: Culture, window: SeasonWindow): string {
  const outSign = properCase(SIGN_PHRASES[window.sign]);
  const nextIdx = (ZODIAC_SIGNS.indexOf(window.sign) + 1) % 12;
  const nextSign = ZODIAC_SIGNS[nextIdx] ?? window.sign;
  const inSign = properCase(SIGN_PHRASES[nextSign]);
  return LEAVES_BEHIND[culture](outSign, inSign);
}

export interface SeasonSkyRow {
  key: string;
  date: Date;
  label: string;
  tone: "conflict" | "harmony" | "dim";
}

/** The dated rows for the bordered "THE SEASON'S SKY" box: the sign's open
 *  and close, any retrograde stations inside the window, and the closest
 *  approach of any slow body sharing the season's sign with the Sun. */
export function buildSeasonSkyRows(culture: Culture, window: SeasonWindow, events: SeasonSkyEvents): SeasonSkyRow[] {
  const rows: SeasonSkyRow[] = [];
  const sunDeity = DEITY_MATRIX[culture].sun.name;

  rows.push({
    key: "open",
    date: window.start,
    label: `${sunDeity.toUpperCase()} → THE ${SIGN_PHRASES[window.sign]} · SEASON OPENS`,
    tone: "dim",
  });

  for (const r of events.retrogrades) {
    if (r.kind !== "retrograde") continue;
    const deity = DEITY_MATRIX[culture][r.planet].name;
    rows.push({
      key: `station-${r.planet}-${r.date.toISOString()}`,
      date: r.date,
      label: `${deity.toUpperCase()} STATIONED ℞`,
      tone: "conflict",
    });
  }

  const windowDays = Math.min(60, Math.round((window.end.getTime() - window.start.getTime()) / DAY_MS) + 1);
  for (const body of SLOW_BODIES) {
    const startSign = longitudeToSign(computeGeocentricLongitude(body, window.start)).sign;
    if (startSign !== window.sign) continue;
    let best: { date: Date; sep: number } | null = null;
    for (let d = 0; d <= windowDays; d += 1) {
      const date = new Date(window.start.getTime() + d * DAY_MS);
      if (date > window.end) break;
      const sunLon = computeGeocentricLongitude("sun", date);
      const bodyLon = computeGeocentricLongitude(body, date);
      const raw = Math.abs(sunLon - bodyLon) % 360;
      const sep = raw > 180 ? 360 - raw : raw;
      if (!best || sep < best.sep) best = { date, sep };
    }
    if (best && best.sep <= 3) {
      const deity = DEITY_MATRIX[culture][body].name;
      rows.push({
        key: `conj-${body}`,
        date: best.date,
        label: `${sunDeity.toUpperCase()} ☌ ${deity.toUpperCase()}${best.sep < 1 ? " EXACT" : ""}`,
        tone: "harmony",
      });
    }
  }

  const closeIdx = (ZODIAC_SIGNS.indexOf(window.sign) + 1) % 12;
  const closeSign = ZODIAC_SIGNS[closeIdx] ?? window.sign;
  rows.push({
    key: "close",
    date: window.end,
    label: `${sunDeity.toUpperCase()} → THE ${SIGN_PHRASES[closeSign]} · SEASON CLOSES`,
    tone: "dim",
  });

  rows.sort((a, b) => a.date.getTime() - b.date.getTime());
  return rows;
}

/** Two-line season votive, keyed by the dominant tone of the window's beats. */
export const SEASON_VOTIVE: Readonly<Record<Culture, Readonly<Record<SeasonTone, string>>>> = {
  egypt: {
    tension: "BRING WHAT IS HEAVY\nTO THE SCALE NOW",
    harmony: "LET THE RIVER CARRY IT;\nDO NOT ROW AGAINST THE MONTH",
    quiet: "THE ORDINARY MONTH\nSTILL FEEDS THE GRANARY",
  },
  greece: {
    tension: "ASK THE SEASON'S HARD QUESTION\nBEFORE IT ASKS YOU FIRST",
    harmony: "TAKE WHAT THE MONTH\nOFFERS FREELY",
    quiet: "A QUIET MONTH\nIS STILL AN ANSWER",
  },
  canaan: {
    tension: "BRING THE CONTESTED MATTER\nBEFORE THE COUNCIL NOW",
    harmony: "WORK THE FIELD WHILE\nTHE RAINS STILL FAVOR YOU",
    quiet: "THE TENT STANDS\nTHROUGH ORDINARY MONTHS TOO",
  },
  carthage: {
    tension: "SETTLE THE ACCOUNT\nBEFORE THE MONTH CLOSES IT FOR YOU",
    harmony: "SAIL WHILE THE SEASON\nKEEPS THE LANE OPEN",
    quiet: "A STEADY MONTH IS\nSTILL A PROFITABLE ONE",
  },
  rome: {
    tension: "TAKE THE AUSPICES AGAIN\nBEFORE YOU ACT ON THIS MONTH",
    harmony: "PROCEED; THE MONTH HOLDS\nTHE RIGHT HAND OUT",
    quiet: "AN ORDINARY MONTH\nIS STILL GOVERNED BY LAW",
  },
};
