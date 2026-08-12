import type { Culture, Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import type { AspectKind } from "@/data/sampleChart";
import {
  TRANSIT_PRINCIPLE,
} from "@/lib/personalReading";
import {
  getBeat,
  getSeason,
  getSpecialYear,
  getYearTheme,
} from "@/data/yearNarrative";
import type {
  EclipseEvent,
  NatalTransitPeak,
  RetrogradeEvent,
  SolarReturnEvent,
} from "@/lib/yearForecast";
import { deityWithPlanet } from "@/lib/deityLabel";
import { ASPECT_VERBS } from "@/data/aspectVerbs";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const NATAL_TARGET_FULL: Readonly<Record<string, string>> = {
  sun: "your identity",
  moon: "your inner feelings",
  asc: "the threshold you cross into the world",
  mc: "the public face you wear",
};

function planetWeight(planet: Planet): number {
  switch (planet) {
    case "pluto":
      return 5;
    case "saturn":
    case "uranus":
    case "neptune":
      return 4;
    case "jupiter":
      return 3;
    case "mars":
      return 2;
    case "venus":
    case "mercury":
      return 1.5;
    case "sun":
    case "moon":
      return 1;
  }
}

function aspectWeight(kind: AspectKind): number {
  switch (kind) {
    case "conjunction":
      return 3;
    case "opposition":
      return 3;
    case "square":
      return 2.5;
    case "trine":
      return 2;
    case "sextile":
      return 1;
  }
}

function naturalPointWeight(key: string): number {
  if (key === "sun" || key === "moon") return 2;
  if (key === "asc" || key === "mc") return 1.5;
  return 1;
}

function transitSignificance(t: NatalTransitPeak): number {
  // Heavier transit planet × heavier aspect × heavier natal point × inverse orb proximity to exact
  // (We do not actually have orb here since the peak is found at near-zero orb; rely on weights.)
  return (
    planetWeight(t.transitPlanet) *
    aspectWeight(t.aspectKind) *
    naturalPointWeight(t.natalKey)
  );
}

function isEasingKind(kind: AspectKind): boolean {
  return kind === "trine" || kind === "sextile";
}

function isTenseKind(kind: AspectKind): boolean {
  return kind === "square" || kind === "opposition";
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function cap(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

/** A short body for a standout event, flavoured by the aspect kind so it is a
 *  sentence rather than a bare principle phrase. */
function standoutBody(kind: AspectKind, principle: string): string {
  if (isEasingKind(kind)) return `${cap(principle)} comes as support here, not as a test.`;
  if (kind === "conjunction") return `${cap(principle)} concentrates to a single strong point.`;
  return `${cap(principle)} is put under real pressure in this stretch.`;
}

export interface AnnualTheme {
  headline: string;
  body: string;
  /** The small astro attribution under the story (e.g. "Saturn squares your Sun, exact March 14"). */
  context: string;
  dominantTransit: NatalTransitPeak | null;
}

export interface AnnualQuarter {
  label: string;
  startDate: Date;
  endDate: Date;
  /** The season's story framing. */
  narrative: string;
  /** The dated events in this quarter (the data the framing is built from). */
  events: string;
  notableEventCount: number;
}

export interface AnnualStretch {
  monthLabel: string;
  score: number;
  notable: readonly NatalTransitPeak[];
  narrative: string;
}

export interface AnnualStandout {
  date: Date;
  title: string;
  /** The astro attribution for this beat (e.g. "Saturn square your Sun"). */
  tag: string;
  body: string;
  significance: number;
}

export interface AnnualReport {
  natalName: string;
  yearTheme: AnnualTheme;
  quarters: readonly AnnualQuarter[];
  hardestStretch: AnnualStretch | null;
  easiestStretch: AnnualStretch | null;
  standouts: readonly AnnualStandout[];
  solarReturn: SolarReturnEvent | null;
}

interface BuildArgs {
  now: Date;
  natalName: string;
  culture: Culture;
  majorTransits: readonly NatalTransitPeak[];
  eclipses: readonly EclipseEvent[];
  retrogrades: readonly RetrogradeEvent[];
  solarReturn: SolarReturnEvent | null;
}

export function buildAnnualReport(args: BuildArgs): AnnualReport {
  const { now, natalName, culture, majorTransits, eclipses, retrogrades, solarReturn } = args;
  return {
    natalName,
    yearTheme: pickYearTheme(culture, majorTransits, eclipses),
    quarters: buildQuarters(now, culture, majorTransits, eclipses),
    hardestStretch: pickHardestStretch(culture, majorTransits, eclipses),
    easiestStretch: pickEasiestStretch(culture, majorTransits, eclipses, solarReturn),
    standouts: pickStandouts(culture, majorTransits, eclipses, retrogrades, solarReturn, 6),
    solarReturn,
  };
}

function pickYearTheme(
  culture: Culture,
  transits: readonly NatalTransitPeak[],
  eclipses: readonly EclipseEvent[],
): AnnualTheme {
  if (transits.length === 0 && eclipses.length === 0) {
    const q = getSpecialYear("quiet");
    return {
      headline: q.headline,
      body: q.body,
      context: "No major slow transit touches your chart this year, and no eclipse falls on your personal points.",
      dominantTransit: null,
    };
  }

  // The single transit that most shapes the year, by composite significance.
  const ranked = [...transits].sort(
    (a, b) => transitSignificance(b) - transitSignificance(a),
  );
  const dominant = ranked[0] ?? null;
  if (!dominant) {
    const e = getSpecialYear("eclipse-held");
    return {
      headline: e.headline,
      body: e.body,
      context: "No major slow transit, but the eclipses fall on your personal points.",
      dominantTransit: null,
    };
  }

  const tDeity = DEITY_MATRIX[culture][dominant.transitPlanet].name;
  const nDeity =
    dominant.natalKey === "asc" || dominant.natalKey === "mc"
      ? dominant.natalKey === "asc"
        ? "the threshold of your chart"
        : "the top of your chart"
      : DEITY_MATRIX[culture][dominant.natalKey as Planet].name;
  const verb = ASPECT_VERBS[culture][dominant.aspectKind];
  const principle = TRANSIT_PRINCIPLE[dominant.transitPlanet];
  const target = NATAL_TARGET_FULL[dominant.natalKey] ?? "this point of your chart";
  const dateStr = dominant.date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });

  const context = `${tDeity} ${verb} your ${nDeity}, exact on ${dateStr}.`;
  const theme = getYearTheme(dominant.transitPlanet, dominant.natalKey, dominant.aspectKind);
  if (theme) {
    return { headline: theme.headline, body: theme.body, context, dominantTransit: dominant };
  }

  // Fallback for any dominant pairing not yet hand-written.
  let bodyToneClause: string;
  if (isTenseKind(dominant.aspectKind)) {
    bodyToneClause = `The year presses ${principle} against ${target}. It will be tested, and what holds by the end will be the stronger for the testing.`;
  } else if (isEasingKind(dominant.aspectKind)) {
    bodyToneClause = `The year keeps ${principle} flowing toward ${target}. The support is real, so you will not have to force it.`;
  } else {
    bodyToneClause = `The year fuses ${principle} onto ${target}. You will feel the two as one signal where you usually feel them as two, so use the concentration rather than fighting it.`;
  }
  return {
    headline: `${cap(principle)} shapes the year.`,
    body: `${bodyToneClause} The exact peak falls on ${dateStr}, but the influence runs for weeks on either side.`,
    context,
    dominantTransit: dominant,
  };
}

function buildQuarters(
  now: Date,
  culture: Culture,
  majorTransits: readonly NatalTransitPeak[],
  eclipses: readonly EclipseEvent[],
): readonly AnnualQuarter[] {
  const out: AnnualQuarter[] = [];
  const quarterDays = 91;
  for (let q = 0; q < 4; q += 1) {
    const startDate = new Date(now.getTime() + q * quarterDays * MS_PER_DAY);
    const endDate = new Date(now.getTime() + (q + 1) * quarterDays * MS_PER_DAY - 1);
    const startLabel = startDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const endLabel = endDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

    const transitsInQuarter = majorTransits.filter(
      (t) => t.date >= startDate && t.date <= endDate,
    );
    const eclipsesInQuarter = eclipses.filter(
      (e) => e.date >= startDate && e.date <= endDate,
    );
    const allEventCount = transitsInQuarter.length + eclipsesInQuarter.length;

    const dominantTransit = [...transitsInQuarter].sort(
      (a, b) => transitSignificance(b) - transitSignificance(a),
    )[0];
    const dominantEclipse = eclipsesInQuarter[0];

    const eventParts: string[] = [];
    if (dominantTransit) {
      const tDeity = DEITY_MATRIX[culture][dominantTransit.transitPlanet].name;
      const nDeity =
        dominantTransit.natalKey === "asc"
          ? "the threshold of your chart"
          : dominantTransit.natalKey === "mc"
            ? "the top of your chart"
            : DEITY_MATRIX[culture][dominantTransit.natalKey as Planet].name;
      const verb = ASPECT_VERBS[culture][dominantTransit.aspectKind];
      const dateStr = dominantTransit.date.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
      });
      eventParts.push(`${tDeity} ${verb} your ${nDeity}, exact on ${dateStr}.`);
    }
    if (dominantEclipse) {
      const moonOrSun = dominantEclipse.scope === "lunar" ? "moon" : "sun";
      const dDeity = DEITY_MATRIX[culture][moonOrSun as Planet].name;
      const dateStr = dominantEclipse.date.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
      });
      eventParts.push(`${cap(dominantEclipse.kind)} ${dominantEclipse.scope} eclipse of ${dDeity} in ${dominantEclipse.sign} on ${dateStr}.`);
    }

    const hasTense =
      transitsInQuarter.some(
        (t) =>
          isTenseKind(t.aspectKind) ||
          (t.aspectKind === "conjunction" &&
            (t.transitPlanet === "saturn" || t.transitPlanet === "pluto" || t.transitPlanet === "uranus" || t.transitPlanet === "neptune")),
      ) || eclipsesInQuarter.length > 0;
    const hasEasy = transitsInQuarter.some(
      (t) =>
        isEasingKind(t.aspectKind) ||
        (t.aspectKind === "conjunction" && (t.transitPlanet === "jupiter" || t.transitPlanet === "neptune")),
    );
    const weather: "tense" | "easy" | "mixed" | "quiet" =
      !hasTense && !hasEasy ? "quiet" : hasTense && hasEasy ? "mixed" : hasTense ? "tense" : "easy";

    out.push({
      label: `${startLabel} to ${endLabel}`,
      startDate,
      endDate,
      narrative: getSeason(weather).body,
      events: eventParts.join(" "),
      notableEventCount: allEventCount,
    });
  }
  return out;
}

interface MonthScore {
  monthKey: string;
  monthLabel: string;
  tension: number;
  ease: number;
  transits: NatalTransitPeak[];
  eclipses: EclipseEvent[];
}

function scoreMonths(
  transits: readonly NatalTransitPeak[],
  eclipses: readonly EclipseEvent[],
): MonthScore[] {
  const map = new Map<string, MonthScore>();
  const get = (date: Date) => {
    const key = monthKey(date);
    let entry = map.get(key);
    if (!entry) {
      entry = {
        monthKey: key,
        monthLabel: monthLabel(date),
        tension: 0,
        ease: 0,
        transits: [],
        eclipses: [],
      };
      map.set(key, entry);
    }
    return entry;
  };
  for (const t of transits) {
    const m = get(t.date);
    m.transits.push(t);
    const w = transitSignificance(t);
    // Opposition is weighty but a touch less than a hard square; check it first
    // since isTenseKind() also matches opposition.
    if (t.aspectKind === "opposition") m.tension += w * 0.8;
    else if (isTenseKind(t.aspectKind)) m.tension += w; // square
    else if (isEasingKind(t.aspectKind)) m.ease += w; // trine, sextile
    else if (t.aspectKind === "conjunction") {
      // Conjunctions add weight to both registers; the kind of contact decides.
      // Treat conjunction of Jupiter as easing, conjunction of Saturn as
      // weighting. Pluto and Uranus conjunctions read the same as Saturn's
      // (tension); Neptune's conjunction is genuinely mixed, part gift and
      // part fog, so it adds to both registers at half weight each.
      if (t.transitPlanet === "saturn" || t.transitPlanet === "pluto" || t.transitPlanet === "uranus") {
        m.tension += w;
      } else if (t.transitPlanet === "jupiter") {
        m.ease += w;
      } else if (t.transitPlanet === "neptune") {
        m.tension += w * 0.5;
        m.ease += w * 0.5;
      } else {
        m.tension += w * 0.5;
      }
    }
  }
  for (const e of eclipses) {
    const m = get(e.date);
    m.eclipses.push(e);
    m.tension += 1.5;
  }
  return Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

function pickHardestStretch(
  culture: Culture,
  transits: readonly NatalTransitPeak[],
  eclipses: readonly EclipseEvent[],
): AnnualStretch | null {
  const months = scoreMonths(transits, eclipses);
  const hardest = [...months].sort((a, b) => b.tension - a.tension)[0];
  if (!hardest || hardest.tension === 0) return null;
  const top = [...hardest.transits].sort(
    (a, b) => transitSignificance(b) - transitSignificance(a),
  )[0];
  const narrativeParts: string[] = [];
  if (top) {
    const tLabel = deityWithPlanet(culture, top.transitPlanet);
    const nKey = top.natalKey;
    const nLabel =
      nKey === "asc" || nKey === "mc"
        ? nKey === "asc"
          ? "your Ascendant"
          : "your Midheaven"
        : `your ${deityWithPlanet(culture, nKey as Planet)}`;
    narrativeParts.push(
      `${tLabel} ${top.aspectKind} ${nLabel} drives the weight, peaking on ${top.date.toLocaleDateString(undefined, { month: "long", day: "numeric" })}.`,
    );
  }
  if (hardest.eclipses.length > 0) {
    narrativeParts.push(
      `${hardest.eclipses.length} eclipse${hardest.eclipses.length === 1 ? "" : "s"} fall${hardest.eclipses.length === 1 ? "s" : ""} in this stretch.`,
    );
  }
  return {
    monthLabel: hardest.monthLabel,
    score: hardest.tension,
    notable: hardest.transits.slice(0, 3),
    narrative: narrativeParts.join(" "),
  };
}

function pickEasiestStretch(
  culture: Culture,
  transits: readonly NatalTransitPeak[],
  eclipses: readonly EclipseEvent[],
  solarReturn: SolarReturnEvent | null,
): AnnualStretch | null {
  const months = scoreMonths(transits, eclipses);
  // Boost the solar return's month for "easing" purposes; it is the personal new year.
  if (solarReturn) {
    const srKey = monthKey(solarReturn.date);
    const m = months.find((mm) => mm.monthKey === srKey);
    if (m) m.ease += 2.5;
  }
  const easiest = [...months].sort((a, b) => b.ease - a.ease)[0];
  if (!easiest || easiest.ease === 0) return null;
  const top = [...easiest.transits].sort(
    (a, b) => transitSignificance(b) - transitSignificance(a),
  )[0];
  const narrativeParts: string[] = [];
  if (top) {
    const tLabel = deityWithPlanet(culture, top.transitPlanet);
    const nKey = top.natalKey;
    const nLabel =
      nKey === "asc" || nKey === "mc"
        ? nKey === "asc"
          ? "your Ascendant"
          : "your Midheaven"
        : `your ${deityWithPlanet(culture, nKey as Planet)}`;
    narrativeParts.push(
      `${tLabel} ${top.aspectKind} ${nLabel} carries the support, peaking on ${top.date.toLocaleDateString(undefined, { month: "long", day: "numeric" })}.`,
    );
  }
  if (
    solarReturn &&
    monthKey(solarReturn.date) === easiest.monthKey
  ) {
    narrativeParts.push(
      `Your solar return falls in this stretch on ${solarReturn.date.toLocaleDateString(undefined, { month: "long", day: "numeric" })}.`,
    );
  }
  return {
    monthLabel: easiest.monthLabel,
    score: easiest.ease,
    notable: easiest.transits.slice(0, 3),
    narrative: narrativeParts.join(" ") || "The lightest stretch of the year falls here, even without a single dominant easing event.",
  };
}

function pickStandouts(
  culture: Culture,
  transits: readonly NatalTransitPeak[],
  eclipses: readonly EclipseEvent[],
  retrogrades: readonly RetrogradeEvent[],
  solarReturn: SolarReturnEvent | null,
  count: number,
): readonly AnnualStandout[] {
  const out: AnnualStandout[] = [];
  for (const t of transits) {
    const tLabel = deityWithPlanet(culture, t.transitPlanet);
    const nLabel =
      t.natalKey === "asc"
        ? "your Ascendant"
        : t.natalKey === "mc"
          ? "your Midheaven"
          : `your ${deityWithPlanet(culture, t.natalKey as Planet)}`;
    const beat = getBeat(`${t.transitPlanet}-peak`);
    const astro = `${tLabel} ${t.aspectKind} ${nLabel}`;
    out.push({
      date: t.date,
      title: beat?.headline ?? astro,
      tag: astro,
      body: beat?.body ?? standoutBody(t.aspectKind, TRANSIT_PRINCIPLE[t.transitPlanet]),
      significance: transitSignificance(t),
    });
  }
  for (const e of eclipses) {
    const moonOrSun = e.scope === "lunar" ? "moon" : "sun";
    const dLabel = deityWithPlanet(culture, moonOrSun as Planet);
    const beat = getBeat(`eclipse-${e.scope === "lunar" ? "lunar" : "solar"}`);
    const astro = `${cap(e.kind)} ${e.scope} eclipse of ${dLabel} in ${e.sign}`;
    out.push({
      date: e.date,
      title: beat?.headline ?? astro,
      tag: astro,
      body: beat?.body ?? (e.scope === "lunar"
        ? "The lunar eclipse pulls a feeling that was hidden into the light."
        : "The solar eclipse asks identity itself to start again, on a new line."),
      significance: 4 + e.obscuration * 2,
    });
  }
  const STANDOUT_RETROGRADE_PLANETS: readonly Planet[] = [
    "mercury",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
  ];
  for (const r of retrogrades) {
    if (r.kind !== "retrograde") continue;
    if (!STANDOUT_RETROGRADE_PLANETS.includes(r.planet)) continue;
    const dLabel = deityWithPlanet(culture, r.planet);
    const beat = getBeat(`retrograde-${r.planet}`);
    const astro = `${dLabel} turns retrograde at ${r.degree.toFixed(1)}° ${r.sign}`;
    out.push({
      date: r.date,
      title: beat?.headline ?? astro,
      tag: astro,
      body: beat?.body ?? "This planet's work slows and doubles back for a stretch; a time to review and revise rather than to launch.",
      significance:
        r.planet === "saturn"
          ? 2.5
          : r.planet === "jupiter"
            ? 2
            : r.planet === "uranus" || r.planet === "neptune" || r.planet === "pluto"
              ? 1.8
              : 1.2,
    });
  }
  if (solarReturn) {
    const sunLabel = deityWithPlanet(culture, "sun");
    const beat = getBeat("solar-return");
    const astro = `${sunLabel} returns to its natal degree`;
    out.push({
      date: solarReturn.date,
      title: beat?.headline ?? astro,
      tag: astro,
      body: beat?.body ?? "Your astrological birthday; the chart cast for this moment sets the tone for the year from this date forward.",
      significance: 3,
    });
  }
  out.sort((a, b) => b.significance - a.significance);
  // Take the top N and then re-sort by date for chronological display.
  const top = out.slice(0, count);
  top.sort((a, b) => a.date.getTime() - b.date.getTime());
  return top;
}
