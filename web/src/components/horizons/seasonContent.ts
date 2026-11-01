import type { Culture, Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { ZODIAC_SIGNS, longitudeToSign, type ZodiacSign } from "@/data/sampleChart";
import { computeGeocentricLongitude } from "@/lib/ephemeris";
import { SLOW_BODIES, type YearIngressEvent } from "@/lib/yearForecast";
import type { HouseMeaning } from "@/data/houses";
import type { SeasonSkyEvents, SeasonStandout, SeasonWindow } from "@/lib/season";
import { SIGN_PHRASES } from "@/components/horizons/signPhrase";
import { formatDayMonth, properCase } from "@/components/horizons/format";
import { houseGroupName } from "@/components/horizons/houseGroups";
import { fmt, moonPhaseKey, str } from "@/strings";
import { INGRESS_VERB } from "@/lib/weekReading";


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
  // The secondary standout is a separate event with its own headline voice.
  // Appending it raw reads as a collage, so it is introduced as the thing
  // standing behind the primary rather than dropped in as a new assertion.
  const behind =
    secondary && secondary.title !== primary.title
      ? ` Behind it: ${secondary.title.charAt(0).toLowerCase()}${secondary.title.slice(1)}`
      : "";
  return `${primary.title} ${primary.body}${behind}`;
}

export function seasonVotiveTone(standouts: readonly SeasonStandout[]): SeasonTone {
  const top = standouts[0];
  if (!top || !top.tone) return "quiet";
  return top.tone === "tension" ? "tension" : "harmony";
}

export function composeWhatItTouchesNatal(culture: Culture, house: HouseMeaning): string {
  return str("season.chart.prose", culture, {
    ordinal: fmt("ordinal.word", house.house),
    group: houseGroupName(culture, house.house).toLowerCase(),
    arena: house.arena.charAt(0).toLowerCase() + house.arena.slice(1),
  });
}

/** "The eleventh house · The Assembly" (season.chart.houseHeading, board P38). */
export function seasonHouseHeading(culture: Culture, house: HouseMeaning): string {
  return str("season.chart.houseHeading", culture, { ordinal: fmt("ordinal.word", house.house), title: house.title });
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
  /** Web's sentence under the row, where web has one (ingresses); null otherwise. */
  prose: string | null;
  tone: "conflict" | "harmony" | "dim";
}

/** Web's ingress sentence (lib/weekReading.ts verbs): "Horus the Red is ferried into the Lion." */
export function ingressSentence(culture: Culture, planet: Planet, toSign: ZodiacSign): string {
  return `${DEITY_MATRIX[culture][planet].name} ${INGRESS_VERB[culture]} the ${properCase(SIGN_PHRASES[toSign])}.`;
}

/**
 * The dated rows for the bordered "THE SEASON'S SKY" box, the board's event
 * set (table row season.sky.row): the Sun's ingress that opens the season and
 * the one that closes it, the Moon's quarters, the ingresses of Mercury,
 * Venus and Mars, the retrograde and direct stations, and the eclipses, all
 * inside the window, in date order. Ingress rows carry web's ingress
 * sentence; the other rows have no web sentence (the lunation sentence the
 * board draws has no web source, CANNOT CONFIRM), so their prose is null.
 */
export function buildSeasonSkyRows(culture: Culture, window: SeasonWindow, events: SeasonSkyEvents): SeasonSkyRow[] {
  const rows: SeasonSkyRow[] = [];
  const ingress = (key: string, date: Date, planet: Planet, toSign: ZodiacSign): SeasonSkyRow => ({
    key,
    date,
    label: str("season.sky.event.ingress", culture, { planet: fmt("planet.name", planet), sign: fmt("sign.full", toSign) }),
    prose: ingressSentence(culture, planet, toSign),
    tone: "dim",
  });

  rows.push(ingress("open", window.start, "sun", window.sign));

  for (const q of events.moonPhases) {
    rows.push({
      key: `phase-${q.date.toISOString()}`,
      date: q.date,
      label: str("season.sky.event.phase", culture, { phase: str(moonPhaseKey(q.name), culture), sign: fmt("sign.full", q.sign) }),
      prose: null,
      tone: "dim",
    });
  }

  for (const ing of events.ingresses) {
    rows.push(ingress(`ingress-${ing.planet}-${ing.date.toISOString()}`, ing.date, ing.planet, ing.toSign));
  }

  for (const r of events.retrogrades) {
    rows.push({
      key: `station-${r.planet}-${r.date.toISOString()}`,
      date: r.date,
      label: str(r.kind === "retrograde" ? "season.sky.event.retrograde" : "season.sky.event.direct", culture, {
        planet: fmt("planet.name", r.planet),
      }),
      prose: null,
      tone: r.kind === "retrograde" ? "conflict" : "harmony",
    });
  }

  for (const e of events.eclipses) {
    rows.push({
      key: `eclipse-${e.scope}-${e.date.toISOString()}`,
      date: e.date,
      label: str(e.scope === "lunar" ? "season.sky.event.eclipseLunar" : "season.sky.event.eclipseSolar", culture, {
        sign: fmt("sign.full", e.sign),
      }),
      prose: null,
      tone: "conflict",
    });
  }

  const closeIdx = (ZODIAC_SIGNS.indexOf(window.sign) + 1) % 12;
  const closeSign = ZODIAC_SIGNS[closeIdx] ?? window.sign;
  rows.push(ingress("close", window.end, "sun", closeSign));

  rows.sort((a, b) => a.date.getTime() - b.date.getTime());
  return rows;
}

/** Two-line season votive, keyed by the dominant tone of the window's beats (season.votive.*). */
export function seasonVotive(culture: Culture, tone: SeasonTone): string {
  return str(`season.votive.${tone}` as const, culture);
}
