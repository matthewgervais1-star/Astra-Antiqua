import {
  PLANETS,
  isReceived,
  type Culture,
  type Planet,
} from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { ASPECT_RULINGS } from "@/data/aspectRulings";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { computeChart } from "@/lib/ephemeris";
import {
  computeAspects,
  ASPECT_RULES,
  orbFor,
  type AspectKind,
  type Longitude,
  type ZodiacSign,
} from "@/data/sampleChart";
import { findRetrogradeStations, findYearIngresses, SLOW_BODIES } from "@/lib/yearForecast";
import { computeTransitSpans, type TransitSpan } from "@/lib/transitSpans";
import { composeDayPage, utcDayNumber, type DayDecree } from "@/lib/decree";
import { DECREE_BANKS } from "@/data/decreeBanks";
import { toneOf, type Tone } from "@/lib/tone";
import { dayPermissions, natalDayPermissions, composeDayVotive, type DayPermissions } from "@/lib/permissions";
import { composeDiveDeeper, type DiveDeeper } from "@/lib/diveDeeper";
import { dayPressure, type PressureGroup } from "@/lib/dayPressure";
import type { SavedNatal } from "@/lib/savedNatal";
import type { OrbTone } from "@/components/chrome/OrbBar";
import {
  formatLongitude,
  formatOrbDegMin,
  dateDayUpper,
  natalPointLabel,
  shortRulingClause,
} from "@/components/home/format";
import { fmt, str } from "@/strings";
import { SPAN_TONE_WORDS } from "@/strings/formats";
import { spanTone } from "@/components/transits/spanDisplay";
import { computeMoonPhase, type MoonPhase } from "@/lib/moonPhase";
import { getCurrentSeason, type SeasonWindow } from "@/lib/season";

const DAY_MS = 86_400_000;
const CARDINAL_SIGNS: ReadonlySet<ZodiacSign> = new Set(["Aries", "Cancer", "Libra", "Capricorn"]);
const ASPECT_GLYPH: Readonly<Record<AspectKind, string>> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

export interface EphemerisRow {
  planet: Planet;
  name: string;
  deg: string;
  min: string;
  sign3: string;
  retrograde: boolean;
  received: boolean;
}

export interface StationOrIngressRow {
  key: string;
  date: Date;
  dateLabel: string;
  text: string;
  conflict: boolean;
}

export interface AspectRow {
  key: string;
  a: Planet;
  b: Planet;
  kind: AspectKind;
  kindGlyph: string;
  nameA: string;
  nameB: string;
  orb: number;
  maxOrb: number;
  orbLabel: string;
  tone: OrbTone;
  rulingLabel: string;
}

export interface LongTransitData {
  status: "active" | "upcoming" | "none" | "cta";
  span?: TransitSpan;
  title1?: string;
  title2?: string;
  rangeLabel?: string;
  /** "3 EXACT · 2 AHEAD · EASE" (day.longTransit.footer). */
  footerLabel?: string;
  progressPct?: number;
  href?: string;
}

export interface HomeBundle {
  now: Date;
  culture: Culture;
  institution: string;
  /** "WED 21 OCT 2026" (F1, the UTC day) for the day kicker. */
  dateLabel: string;
  /** The Moon and the season for the sky box (P11). */
  moon: MoonPhase;
  season: SeasonWindow;
  todayChart: Readonly<Record<Planet, Longitude>>;
  natal: SavedNatal | null;
  reading: DayDecree;
  ephemerisRows: readonly EphemerisRow[];
  compactSkyRows: readonly EphemerisRow[];
  stationsAndIngresses: readonly StationOrIngressRow[];
  aspectRows: readonly AspectRow[];
  longTransit: LongTransitData;
  votive: string;
  /** The culture's come-back line, closing the day page. */
  comeBack: string;
  /** The tone of the decree's headline figure. */
  dayTone: Tone;
  /** Every reader gets the day's lists: from the day's transits to the chart when there is one, from the decree's figures otherwise. */
  permissions: DayPermissions;
  /** Where the lists came from. */
  permissionsSource: "sky" | "natal";
  /** Four paragraphs, one per house group (spec A.6). */
  diveDeeper: DiveDeeper;
  pressureGroups: readonly PressureGroup[] | null;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function wrapDelta(from: number, to: number): number {
  let d = to - from;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function separation(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360;
  return raw > 180 ? 360 - raw : raw;
}

function angleOf(kind: AspectKind): number {
  return ASPECT_RULES.find((rule) => rule.kind === kind)?.angle ?? 0;
}

function currentOrbForSpan(span: TransitSpan, todayChart: Readonly<Record<Planet, Longitude>>): number {
  const sep = separation(todayChart[span.transitPlanet], span.natalLongitude);
  return Math.abs(sep - angleOf(span.aspectKind));
}

function buildEphemerisRows(
  culture: Culture,
  todayChart: Readonly<Record<Planet, Longitude>>,
  tomorrowChart: Readonly<Record<Planet, Longitude>>,
): readonly EphemerisRow[] {
  return PLANETS.map((planet) => {
    const { deg, min, sign3 } = formatLongitude(todayChart[planet]);
    const retrograde = wrapDelta(todayChart[planet], tomorrowChart[planet]) < 0;
    return {
      planet,
      name: DEITY_MATRIX[culture][planet].name.toUpperCase(),
      deg,
      min,
      sign3,
      retrograde,
      received: isReceived(planet),
    };
  });
}

function buildStationsAndIngresses(culture: Culture, now: Date): readonly StationOrIngressRow[] {
  const stations = findRetrogradeStations(now, 90);
  const ingresses = findYearIngresses(now, 90);

  const stationRows: StationOrIngressRow[] = stations.map((s) => ({
    key: `station-${s.planet}-${s.date.toISOString()}`,
    date: s.date,
    dateLabel: fmt("date.dayMonth", s.date, "UTC"),
    text: `${DEITY_MATRIX[culture][s.planet].name.toUpperCase()} STATIONED${
      s.kind === "retrograde" ? " ℞" : " DIRECT"
    } · ${s.sign.toUpperCase()}`,
    conflict: true,
  }));

  const ingressRows: StationOrIngressRow[] = ingresses.map((ev) => {
    const seasonTurn = ev.planet === "sun" && CARDINAL_SIGNS.has(ev.toSign);
    return {
      key: `ingress-${ev.planet}-${ev.date.toISOString()}`,
      date: ev.date,
      dateLabel: fmt("date.dayMonth", ev.date, "UTC"),
      text: `${DEITY_MATRIX[culture][ev.planet].name.toUpperCase()} → ${ev.toSign.toUpperCase()}${
        seasonTurn ? " · SEASON TURNS" : ""
      }`,
      conflict: false,
    };
  });

  return [...stationRows, ...ingressRows].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 3);
}

function buildAspectRows(
  culture: Culture,
  todayChart: Readonly<Record<Planet, Longitude>>,
): readonly AspectRow[] {
  const aspects = [...computeAspects(todayChart)].sort((a, b) => a.orb - b.orb).slice(0, 3);
  return aspects.map((aspect) => {
    const tone: OrbTone = toneOf(aspect.kind) === "tension" ? "conflict" : "harmony";
    return {
      key: `${aspect.a}-${aspect.kind}-${aspect.b}`,
      a: aspect.a,
      b: aspect.b,
      kind: aspect.kind,
      kindGlyph: ASPECT_GLYPH[aspect.kind],
      nameA: DEITY_MATRIX[culture][aspect.a].name.toUpperCase(),
      nameB: DEITY_MATRIX[culture][aspect.b].name.toUpperCase(),
      orb: aspect.orb,
      maxOrb: orbFor(aspect.kind),
      orbLabel: formatOrbDegMin(aspect.orb),
      tone,
      rulingLabel: shortRulingClause(ASPECT_RULINGS[culture][aspect.kind]),
    };
  });
}

function buildLongTransit(
  culture: Culture,
  now: Date,
  natal: SavedNatal | null,
  todayChart: Readonly<Record<Planet, Longitude>>,
): LongTransitData {
  if (!natal) return { status: "cta" };

  const natalPoints = [
    { key: "sun", longitude: natal.chart.sun },
    { key: "moon", longitude: natal.chart.moon },
    { key: "asc", longitude: natal.angles.ascendant },
    { key: "mc", longitude: natal.angles.midheaven },
  ];
  const start = new Date(now.getTime() - 420 * DAY_MS);
  const spans = computeTransitSpans(natalPoints, SLOW_BODIES, start, 1200);
  if (spans.length === 0) return { status: "none" };

  const active = spans.filter((s) => s.start.getTime() <= now.getTime() && now.getTime() <= s.end.getTime());
  const pool = active.length > 0 ? active : spans.filter((s) => s.start.getTime() > now.getTime());
  if (pool.length === 0) return { status: "none" };

  const chosen =
    active.length > 0
      ? [...pool].sort((a, b) => currentOrbForSpan(a, todayChart) - currentOrbForSpan(b, todayChart))[0]!
      : [...pool].sort((a, b) => a.start.getTime() - b.start.getTime())[0]!;

  const transitDeity = DEITY_MATRIX[culture][chosen.transitPlanet];
  const title1 = str("day.longTransit.title1", culture, {
    deity: transitDeity.name.toUpperCase(),
    signPhrase: fmt("sign.phrase", chosen.transitSign),
  });
  const title2 = str("day.longTransit.title2", culture, {
    verb: ASPECT_VERBS[culture][chosen.aspectKind].toUpperCase(),
    natal: natalPointLabel(culture, chosen.natalKey),
  });
  const rangeLabel = fmt("range.months", [chosen.start, chosen.end], "UTC");
  const footerLabel = str("day.longTransit.footer", culture, {
    exact: chosen.passes.length,
    ahead: chosen.passes.filter((p) => p.getTime() > now.getTime()).length,
    tone: SPAN_TONE_WORDS[spanTone(chosen)],
  });
  const span = chosen.end.getTime() - chosen.start.getTime();
  const progressPct =
    span > 0 ? Math.min(100, Math.max(0, ((now.getTime() - chosen.start.getTime()) / span) * 100)) : 0;

  return {
    status: active.length > 0 ? "active" : "upcoming",
    span: chosen,
    title1,
    title2,
    rangeLabel,
    footerLabel,
    progressPct,
    href: `/transits/${chosen.id}`,
  };
}

/** The mobile "sky, computed" strip: the Sun plus whichever bodies appear in
 * today's tightest aspects, capped at four rows and displayed in the
 * ephemeris's canonical order. */
function buildCompactSkyRows(
  ephemerisRows: readonly EphemerisRow[],
  aspectRows: readonly AspectRow[],
): readonly EphemerisRow[] {
  const byPlanet = new Map(ephemerisRows.map((row) => [row.planet, row]));
  const chosen = new Set<Planet>(["sun"]);
  for (const row of aspectRows) {
    if (chosen.size >= 4) break;
    chosen.add(row.a);
    if (chosen.size < 4) chosen.add(row.b);
  }
  for (const row of ephemerisRows) {
    if (chosen.size >= 4) break;
    chosen.add(row.planet);
  }
  return ephemerisRows.filter((row) => chosen.has(row.planet)).map((row) => byPlanet.get(row.planet)!);
}

export function buildHomeBundle(culture: Culture, now: Date, natal: SavedNatal | null): HomeBundle {
  const todayStart = startOfUtcDay(now);
  const todayChart = computeChart(todayStart);
  const tomorrowChart = computeChart(new Date(todayStart.getTime() + DAY_MS));

  const reading = composeDayPage(culture, now);

  const ephemerisRows = buildEphemerisRows(culture, todayChart, tomorrowChart);
  const aspectRows = buildAspectRows(culture, todayChart);
  const stationsAndIngresses = buildStationsAndIngresses(culture, now);
  const longTransit = buildLongTransit(culture, now, natal, todayChart);
  const compactSkyRows = buildCompactSkyRows(ephemerisRows, aspectRows);

  // The day's tone, the votive and the lists all follow the decree's own
  // headline figure, so the page agrees with itself. The aspects rail ranks
  // slow-slow pairs too and can disagree.
  const top = reading.figures[0];
  const dayTone: Tone = top ? toneOf(top.kind) : "harmony";
  const votive = composeDayVotive(culture, dayTone, now);
  const day = utcDayNumber(now);
  const natalPermissions = natal ? natalDayPermissions(culture, todayChart, natal.chart, day) : null;
  const permissions = natalPermissions ?? dayPermissions(culture, reading.figures, day);
  const natalPoints = natal ? { chart: natal.chart, ascendant: natal.angles.ascendant } : null;
  const pressureGroups = natal ? dayPressure(natal, todayChart, culture) : null;
  const diveDeeper = composeDiveDeeper(culture, reading, todayChart, day, natalPoints, pressureGroups?.map((g) => g.sentence) ?? []);

  return {
    now,
    culture,
    institution: CULTURE_VOICES[culture].institution,
    dateLabel: dateDayUpper(now),
    moon: computeMoonPhase(now),
    season: getCurrentSeason(now),
    todayChart,
    natal,
    reading,
    ephemerisRows,
    compactSkyRows,
    stationsAndIngresses,
    aspectRows,
    longTransit,
    votive,
    comeBack: DECREE_BANKS[culture].comeBack,
    dayTone,
    permissions,
    permissionsSource: natalPermissions ? "natal" : "sky",
    diveDeeper,
    pressureGroups,
  };
}
