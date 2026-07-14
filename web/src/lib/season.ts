import { SearchSunLongitude } from "astronomy-engine";
import type { Culture, Planet } from "@/data/cultures";
import { computeGeocentricLongitude } from "@/lib/ephemeris";
import {
  ZODIAC_SIGNS,
  longitudeToSign,
  type AspectKind,
  type ZodiacSign,
} from "@/data/sampleChart";
import { computeWholeSignHouses, houseOfSign } from "@/lib/houses";
import { getHouseMeaning, type HouseMeaning } from "@/data/houses";
import {
  findEclipses,
  findMajorTransits,
  findMoonPhases,
  findRetrogradeStations,
  findYearIngresses,
  type EclipseEvent,
  type MoonPhaseEvent,
  type NatalTransitPeak,
  type RetrogradeEvent,
  type YearIngressEvent,
} from "@/lib/yearForecast";
import type { SavedNatal } from "@/lib/savedNatal";
import { getBeat } from "@/data/yearNarrative";
import { TRANSIT_PRINCIPLE } from "@/lib/personalReading";
import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_VERBS, PLAIN_ASPECT_VERBS } from "@/data/aspectVerbs";
import { deityWithPlanet } from "@/lib/deityLabel";
import { transitPlanetWeight } from "@/lib/transits";
import { toneOf, type Tone } from "@/lib/tone";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * The zodiac season: the window during which the Sun transits one whole sign,
 * bounded by the exact solar ingresses on either side. Event-anchored (real
 * ephemeris ingress moments), never static calendar dates.
 */
export interface SeasonWindow {
  sign: ZodiacSign;
  start: Date;
  end: Date;
  /** 1-based day of the season that `date` falls on. */
  dayOfSeason: number;
  totalDays: number;
  daysRemaining: number;
}

function signIndexOf(sign: ZodiacSign): number {
  const idx = ZODIAC_SIGNS.indexOf(sign);
  return idx < 0 ? 0 : idx;
}

export function getCurrentSeason(date: Date): SeasonWindow {
  const { sign } = longitudeToSign(computeGeocentricLongitude("sun", date));
  const signIdx = signIndexOf(sign);
  const startTarget = signIdx * 30;
  const endTarget = ((signIdx + 1) % 12) * 30;

  // The Sun entered the current sign at most ~32 days ago; search forward from
  // safely before that. The end boundary is the next ingress after `date`.
  const searchFrom = new Date(date.getTime() - 40 * MS_PER_DAY);
  const startHit = SearchSunLongitude(startTarget, searchFrom, 45);
  const endHit = SearchSunLongitude(endTarget, date, 45);

  // Defensive fallbacks only; astronomy-engine finds solar ingresses reliably.
  const start = startHit ? startHit.date : new Date(date.getTime() - 15 * MS_PER_DAY);
  const end = endHit ? endHit.date : new Date(date.getTime() + 15 * MS_PER_DAY);

  // Day counting uses LOCAL calendar days, because the page shows the counter
  // beside locale-formatted dates: "day 1" must be the calendar day the
  // ingress date renders as, not the first 24 hours after the UTC instant.
  const localDayIndex = (from: Date, to: Date): number => {
    const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
  };
  const totalDays = Math.max(1, localDayIndex(start, end) + 1);
  const dayOfSeason = Math.min(totalDays, Math.max(1, localDayIndex(start, date) + 1));
  return {
    sign,
    start,
    end,
    dayOfSeason,
    totalDays,
    daysRemaining: Math.max(0, totalDays - dayOfSeason),
  };
}

/** Planets whose season-window movements are worth naming. */
const SEASON_INGRESS_PLANETS: readonly Planet[] = ["mercury", "venus", "mars"];
const SEASON_TRANSIT_PLANETS: readonly Planet[] = ["venus", "mars", "jupiter", "saturn"];

export interface SeasonSkyEvents {
  moonPhases: readonly MoonPhaseEvent[];
  eclipses: readonly EclipseEvent[];
  retrogrades: readonly RetrogradeEvent[];
  ingresses: readonly YearIngressEvent[];
}

export interface SeasonEvents extends SeasonSkyEvents {
  /** Personal transit peaks inside the window; empty without a saved chart. */
  transits: readonly NatalTransitPeak[];
}

// The coarsest finder sampling step is 5 days (Mars ingresses); scanning this
// many days past the window guarantees every finder's last sample lands
// beyond the ingress boundary, so no in-window event in the season's tail is
// missed. inWindow() then trims the overshoot.
const SAMPLING_PAD_DAYS = 6;

function windowDays(window: SeasonWindow): number {
  return (
    Math.ceil((window.end.getTime() - window.start.getTime()) / MS_PER_DAY) + SAMPLING_PAD_DAYS
  );
}

function inWindow<T extends { date: Date }>(
  events: readonly T[],
  end: Date,
): readonly T[] {
  return events.filter((e) => e.date <= end);
}

/** The culture- and chart-independent beats of the window: one ephemeris scan. */
export function getSeasonSkyEvents(window: SeasonWindow): SeasonSkyEvents {
  const days = windowDays(window);
  const { start, end } = window;
  return {
    moonPhases: inWindow(findMoonPhases(start, days), end),
    eclipses: inWindow(findEclipses(start, days), end),
    retrogrades: inWindow(findRetrogradeStations(start, days), end),
    ingresses: inWindow(findYearIngresses(start, days, SEASON_INGRESS_PLANETS), end),
  };
}

/** The moments the moving sky touches the visitor's chart inside the window. */
export function getSeasonPersonalTransits(
  window: SeasonWindow,
  natal: SavedNatal,
): readonly NatalTransitPeak[] {
  const natalPoints = [
    { key: "sun", longitude: natal.chart.sun },
    { key: "moon", longitude: natal.chart.moon },
    { key: "asc", longitude: natal.angles.ascendant },
    { key: "mc", longitude: natal.angles.midheaven },
  ];
  return inWindow(
    findMajorTransits(natalPoints, SEASON_TRANSIT_PLANETS, window.start, windowDays(window)),
    window.end,
  );
}

export function getSeasonEvents(window: SeasonWindow, natal: SavedNatal | null): SeasonEvents {
  return {
    ...getSeasonSkyEvents(window),
    transits: natal ? getSeasonPersonalTransits(window, natal) : [],
  };
}

/**
 * The whole-sign house the season's sign occupies in the visitor's chart: the
 * room of their life the Sun is walking through this month. This is the
 * personalization no shorter horizon uses.
 */
export function getSeasonHouse(natal: SavedNatal, sign: ZodiacSign): HouseMeaning {
  const houses = computeWholeSignHouses(natal.angles.ascendant);
  return getHouseMeaning(houseOfSign(sign, houses.ascendantSignIndex));
}

/**
 * The whole-sign aspect the season's sign makes to the visitor's natal Sun
 * sign, if any: conjunction (same sign), sextile, square, trine, opposition.
 */
export function seasonAspectToNatalSun(
  natal: SavedNatal,
  seasonSign: ZodiacSign,
): AspectKind | null {
  const natalSunSign = longitudeToSign(natal.chart.sun).sign;
  const distance = (signIndexOf(seasonSign) - signIndexOf(natalSunSign) + 12) % 12;
  const steps = Math.min(distance, 12 - distance);
  switch (steps) {
    case 0:
      return "conjunction";
    case 2:
      return "sextile";
    case 3:
      return "square";
    case 4:
      return "trine";
    case 6:
      return "opposition";
    default:
      return null;
  }
}

export interface SeasonStandout {
  date: Date;
  title: string;
  /** The astro attribution for the beat (e.g. "Full Moon in Leo"). */
  tag: string;
  body: string;
  tone: Tone | null;
  significance: number;
}

function cap(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

/**
 * The dated beats of the season, scored and trimmed: personal transit peaks,
 * eclipses, New and Full Moons, retrograde stations, and inner-planet
 * ingresses, in one chronological list.
 */
export function buildSeasonStandouts(
  culture: Culture | null,
  events: SeasonEvents,
  count = 6,
): readonly SeasonStandout[] {
  const out: SeasonStandout[] = [];

  for (const t of events.transits) {
    const tLabel = deityWithPlanet(culture, t.transitPlanet);
    const nLabel =
      t.natalKey === "asc"
        ? "your Ascendant"
        : t.natalKey === "mc"
          ? "your Midheaven"
          : `your ${deityWithPlanet(culture, t.natalKey as Planet)}`;
    const verb = culture ? ASPECT_VERBS[culture][t.aspectKind] : PLAIN_ASPECT_VERBS[t.aspectKind];
    const tone = toneOf(t.aspectKind);
    const principle = TRANSIT_PRINCIPLE[t.transitPlanet];
    const body =
      tone === "harmony"
        ? `${cap(principle)} arrives as support here. Take the opening while it is open.`
        : tone === "tension"
          ? `${cap(principle)} is put under real pressure on this date. Decide what gives before the day decides for you.`
          : `${cap(principle)} concentrates to a single strong point. Spend it deliberately.`;
    out.push({
      date: t.date,
      title: `${tLabel} ${verb} ${nLabel}.`,
      tag: `${tLabel} ${t.aspectKind} ${nLabel}`,
      body,
      tone,
      significance: transitPlanetWeight(t.transitPlanet) * (tone === "tension" ? 2.5 : 2),
    });
  }

  for (const e of events.eclipses) {
    const moonOrSun: Planet = e.scope === "lunar" ? "moon" : "sun";
    const dLabel = deityWithPlanet(culture, moonOrSun);
    const beat = getBeat(`eclipse-${e.scope}`);
    const astro = `${cap(e.kind)} ${e.scope} eclipse of ${dLabel} in ${e.sign}`;
    out.push({
      date: e.date,
      title: beat?.headline ?? astro,
      tag: astro,
      body:
        beat?.body ??
        (e.scope === "lunar"
          ? "The lunar eclipse pulls a feeling that was hidden into the light."
          : "The solar eclipse asks identity itself to start again, on a new line."),
      tone: "tension",
      significance: 5 + e.obscuration * 2,
    });
  }

  for (const p of events.moonPhases) {
    if (p.name !== "New Moon" && p.name !== "Full Moon") continue;
    const isNew = p.name === "New Moon";
    out.push({
      date: p.date,
      title: `${p.name} in ${p.sign}.`,
      tag: `${p.name} at ${p.degree.toFixed(0)}° ${p.sign}`,
      body: isNew
        ? "The month's clean page. Start the thing here and it inherits the whole cycle's momentum."
        : "The month's full light. What was building since the New Moon shows its results, ready or not.",
      tone: null,
      significance: isNew ? 2.2 : 2.4,
    });
  }

  for (const r of events.retrogrades) {
    const dLabel = deityWithPlanet(culture, r.planet);
    const beat = r.kind === "retrograde" ? getBeat(`retrograde-${r.planet}`) : null;
    const astro =
      r.kind === "retrograde"
        ? `${dLabel} turns retrograde at ${r.degree.toFixed(1)}° ${r.sign}`
        : `${dLabel} turns direct at ${r.degree.toFixed(1)}° ${r.sign}`;
    out.push({
      date: r.date,
      title: beat?.headline ?? `${astro}.`,
      tag: astro,
      body:
        beat?.body ??
        (r.kind === "retrograde"
          ? "This planet's work slows and doubles back for a stretch. Review and revise rather than launch."
          : "The doubling-back ends and held work starts moving forward again."),
      tone: r.kind === "retrograde" ? "tension" : "harmony",
      significance: r.planet === "mercury" ? 2 : 1.5,
    });
  }

  for (const ing of events.ingresses) {
    const dLabel = deityWithPlanet(culture, ing.planet);
    out.push({
      date: ing.date,
      title: `${dLabel} enters ${ing.toSign}.`,
      tag: `${dLabel} from ${ing.fromSign} into ${ing.toSign}`,
      body: `${cap(TRANSIT_PRINCIPLE[ing.planet])} changes register for the weeks ahead as ${culture ? DEITY_MATRIX[culture][ing.planet].name : "this planet"} crosses into ${ing.toSign}.`,
      tone: null,
      significance: 1,
    });
  }

  out.sort((a, b) => b.significance - a.significance);
  const top = out.slice(0, count);
  top.sort((a, b) => a.date.getTime() - b.date.getTime());
  return top;
}
