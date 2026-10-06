import { type Culture, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { DEITY_DOMAINS } from "@/data/deityDomains";
import { DECREE_BANKS, QUIET_LINE, type FastBody, type PartnerBody } from "@/data/decreeBanks";
import { ASPECT_RULES, computeAspects, type AspectKind, type Longitude } from "@/data/sampleChart";
import { computeChart } from "@/lib/ephemeris";

/**
 * The day's decree, composed from the culture's own banks into the anatomy
 * the reading-voice spec lays out: a headline to the reader, an evidence line
 * naming the figure, and one paragraph of five sentences (meaning,
 * consequence, the institution's image, the second figure, the instruction).
 * Nothing here is shared prose; the five-voice check reads the same sky five
 * ways with no common sentence.
 */
export interface DayFigure {
  a: Planet;
  b: Planet;
  kind: AspectKind;
  orb: number;
}

export interface DayDecree {
  /** One sentence to the reader, in sentence case. */
  headline: string;
  /** "RA △ NUT · 0°19′", or "" on a quiet day. */
  evidence: string;
  /** One paragraph. An array so pages that map over paragraphs keep working. */
  paragraphs: readonly string[];
  tone: "harmony" | "tension" | "quiet";
  /** The paragraph's sentences in order: meaning, consequence, image, second, instruction. */
  sentences: readonly string[];
  /** The headline figure, then the second figure, then every other candidate by orb. */
  figures: readonly DayFigure[];
}

/** Daily weather comes from bodies that move daily; slow-slow pairs hold
 * their orb for months and belong to the season, the year, and the long
 * transits instead. Ordered fastest first: when both bodies of a figure are
 * fast, the faster one is the headline body. */
export const FAST_ORDER: readonly FastBody[] = ["moon", "sun", "mercury", "venus", "mars"];
const FAST_BODIES: ReadonlySet<Planet> = new Set(FAST_ORDER);

/**
 * Under half a degree a figure is exact: the meaning sentence carries the
 * culture's exact tail, and the week marks the day EXACT. One threshold for
 * every surface that says "exact".
 */
export const EXACT_ORB = 0.5;

/** Below this orb the evidence line prints EXACT instead of the orb. */
const EXACT_EVIDENCE_ORB = 0.1;

/**
 * No sentence repeats within seven days: a day's page avoids every sentence
 * the six days before it printed. Those six pages have to be the ones the
 * reader saw, and a walk that starts anywhere else drifts from them (measured:
 * walks begun 13 to 100 days back disagree with a 200-day walk on 20 to 43 of
 * 90 days). So every page of a year comes from one walk that starts LEAD_DAYS
 * before 1 January (UTC) with no history.
 */
export const REPEAT_WINDOW_DAYS = 7;
const LEAD_DAYS = 14;
const DAY_MS = 86_400_000;

export const ASPECT_GLYPH: Readonly<Record<AspectKind, string>> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

/** A quiet day's headline, a sentence to the reader like any other. None
 *  repeats a word QUIET_LINE's opening already carries. */
export const QUIET_HEADLINE: Readonly<Record<Culture, string>> = {
  egypt: "Do the plain work and call it enough.",
  greece: "You can leave the questions for another day.",
  canaan: "Nobody needs anything from you today.",
  carthage: "You owe nothing extra today.",
  rome: "Go about your business without looking for signs.",
};

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

function fill(template: string, slots: Readonly<Record<string, string>>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => slots[key] ?? whole);
}

function toneForKind(kind: AspectKind): "harmony" | "tension" {
  return kind === "square" || kind === "opposition" ? "tension" : "harmony";
}

/** Which of a bank's two variants a day uses: they alternate day by day. */
function variant(day: number): 0 | 1 {
  return ((day % 2) + 2) % 2 === 0 ? 0 : 1;
}

/** The headline body of a figure: its fast body, the faster when both are. */
export function headlineBody(a: Planet, b: Planet): { body: FastBody; partner: PartnerBody } {
  for (const fast of FAST_ORDER) {
    if (a === fast) return { body: fast, partner: b as PartnerBody };
    if (b === fast) return { body: fast, partner: a as PartnerBody };
  }
  throw new Error(`no fast body in ${a}-${b}`);
}

/** "0°19′" with the minutes carried, the notation the aspects rail uses. */
function formatOrb(orb: number): string {
  const deg = Math.floor(orb);
  const min = Math.round((orb - deg) * 60);
  const [d, m] = min === 60 ? [deg + 1, 0] : [deg, min];
  return `${d}°${String(m).padStart(2, "0")}′`;
}

/** "RA △ NUT · 0°19′" or "MARS ☍ DIS PATER · EXACT". */
export function composeEvidence(culture: Culture, f: DayFigure): string {
  const nameA = DEITY_MATRIX[culture][f.a].name.toUpperCase();
  const nameB = DEITY_MATRIX[culture][f.b].name.toUpperCase();
  const measure = f.orb < EXACT_EVIDENCE_ORB ? "EXACT" : formatOrb(f.orb);
  return `${nameA} ${ASPECT_GLYPH[f.kind]} ${nameB} · ${measure}`;
}

/** The unpunctuated meaning clause: "your letters and your temper haul on opposite ropes". */
function meaningClause(culture: Culture, f: DayFigure): string {
  const domains = DEITY_DOMAINS[culture];
  return `${domains[f.a]} and ${domains[f.b]} ${DECREE_BANKS[culture].relations[f.kind]}`;
}

/** Sentence (a): two domains and a relation, the exact tail under half a degree. */
export function composeMeaning(culture: Culture, f: DayFigure, day = 0): string {
  const tail = f.orb < EXACT_ORB ? DECREE_BANKS[culture].exactTails[variant(day)] : "";
  return `${cap(meaningClause(culture, f))}${tail}.`;
}

/** Sentence (b): the consequence for the reader, keyed by kind and partner body. */
export function composeConsequence(culture: Culture, f: DayFigure): string {
  return DECREE_BANKS[culture].consequences[f.kind][headlineBody(f.a, f.b).partner];
}

/** The headline for a figure: keyed by culture, kind and headline body. */
export function composeHeadline(culture: Culture, f: DayFigure): string {
  return DECREE_BANKS[culture].headlines[f.kind][headlineBody(f.a, f.b).body];
}

function godSlots(culture: Culture, f: DayFigure): Readonly<Record<string, string>> {
  const { body, partner } = headlineBody(f.a, f.b);
  return { god: DEITY_MATRIX[culture][body].name, partner: DEITY_MATRIX[culture][partner].name };
}

/** Sentence (c): the institution's image, naming both gods. */
function composeImage(culture: Culture, f: DayFigure): string {
  return fill(DECREE_BANKS[culture].images[f.kind][headlineBody(f.a, f.b).body], godSlots(culture, f));
}

/** Sentence (e): the one instruction, written for the headline body's domain. */
function composeInstruction(culture: Culture, f: DayFigure): string {
  return fill(DECREE_BANKS[culture].instructions[f.kind][headlineBody(f.a, f.b).body], godSlots(culture, f));
}

/** Sentence (d) for a candidate second figure. */
function composeSecond(culture: Culture, f: DayFigure, day: number): string {
  const names = DEITY_MATRIX[culture];
  return `${DECREE_BANKS[culture].secondFigure[variant(day)]} ${names[f.a].name} ${ASPECT_VERBS[culture][f.kind]} ${
    names[f.b].name
  }: ${meaningClause(culture, f)}.`;
}

/** The day's candidates: every aspect touching a fast body, tightest first. */
export function dayFigures(chart: Readonly<Record<Planet, Longitude>>): DayFigure[] {
  return computeAspects(chart)
    .filter((a) => FAST_BODIES.has(a.a) || FAST_BODIES.has(a.b))
    .sort((a, b) => a.orb - b.orb)
    .map(({ a, b, kind, orb }) => ({ a, b, kind, orb }));
}

export interface DecreeOptions {
  /** The UTC day number (epoch milliseconds / one day); picks the variants. */
  day?: number;
  /** Sentences the six days before this one printed; the decree avoids them. */
  recent?: ReadonlySet<string>;
  /** Tomorrow's sky: a figure that will be tighter tomorrow waits for it. */
  tomorrow?: Readonly<Record<Planet, Longitude>>;
}

/** The orb the same pair makes in the same kind on another chart, or Infinity when out of orb. */
function orbOn(chart: Readonly<Record<Planet, Longitude>>, f: DayFigure): number {
  const rule = ASPECT_RULES.find((r) => r.kind === f.kind);
  if (!rule) return Infinity;
  const raw = Math.abs(chart[f.a] - chart[f.b]) % 360;
  const separation = raw > 180 ? 360 - raw : raw;
  const orb = Math.abs(separation - rule.angle);
  return orb <= rule.orb ? orb : Infinity;
}

export function composeDecree(
  culture: Culture,
  chart: Readonly<Record<Planet, Longitude>>,
  options: DecreeOptions = {},
): DayDecree {
  const day = options.day ?? 0;
  const recent = options.recent ?? new Set<string>();
  const candidates = dayFigures(chart);
  if (candidates.length === 0) {
    return {
      headline: QUIET_HEADLINE[culture],
      evidence: "",
      paragraphs: [QUIET_LINE[culture]],
      tone: "quiet",
      sentences: [QUIET_LINE[culture]],
      figures: [],
    };
  }

  // The headline figure is the tightest one whose headline and sentences the
  // last six days have not printed. A figure that tightens overnight waits,
  // so a figure that holds for several days speaks once, on its tightest day,
  // and the days around it hear from the next figure. When every candidate
  // repeats something (about nine days a year), the one that repeats least
  // speaks, the tightest among equals.
  const own = (f: DayFigure) => [
    composeHeadline(culture, f),
    composeMeaning(culture, f, day),
    composeConsequence(culture, f),
    composeImage(culture, f),
    composeInstruction(culture, f),
  ];
  const tomorrow = options.tomorrow;
  const ripening = (f: DayFigure) => tomorrow !== undefined && orbOn(tomorrow, f) < f.orb;
  const stale = (f: DayFigure) => own(f).filter((s) => recent.has(s)).length;
  const fresh = candidates.filter((f) => stale(f) === 0);
  const leastStale = () => candidates.reduce((best, f) => (stale(f) < stale(best) ? f : best));
  const top = fresh.find((f) => !ripening(f)) ?? fresh[0] ?? leastStale();

  // A second figure only earns its sentence if it speaks in a different
  // aspect kind, so its relation never repeats the meaning sentence's.
  const others = candidates.filter((f) => f.kind !== top.kind);
  const second = others.find((f) => !recent.has(composeSecond(culture, f, day))) ?? others[0];
  const secondSentence = second ? composeSecond(culture, second, day) : DECREE_BANKS[culture].noSecondFigure;

  const [headline, meaning, consequence, image, instruction] = own(top) as [string, string, string, string, string];
  const sentences = [meaning, consequence, image, secondSentence, instruction];
  return {
    headline,
    evidence: composeEvidence(culture, top),
    paragraphs: [sentences.join(" ")],
    tone: toneForKind(top.kind),
    sentences,
    figures: [top, ...(second ? [second] : []), ...candidates.filter((f) => f !== top && f !== second)],
  };
}

/** The UTC day number of an instant. */
export function utcDayNumber(date: Date): number {
  return Math.floor(date.getTime() / DAY_MS);
}

interface Walk {
  pages: DayDecree[];
  next: Readonly<Record<Planet, Longitude>>;
}
const walks = new Map<string, Walk>();

/**
 * The day page for the UTC day containing `date`: the sky at 00:00 UTC, read
 * so that no sentence repeats one printed in the six days before, and so that
 * a figure that tightens overnight waits for its tightest day. Pages come from
 * the year's one walk (see REPEAT_WINDOW_DAYS), extended as far as `date` and
 * kept for the session; the first call in late December computes about 380
 * charts.
 */
export function composeDayPage(culture: Culture, date: Date): DayDecree {
  const today = utcDayNumber(date);
  const year = new Date(today * DAY_MS).getUTCFullYear();
  const anchor = utcDayNumber(new Date(Date.UTC(year, 0, 1))) - LEAD_DAYS;
  const key = `${culture}|${anchor}`;
  let walk = walks.get(key);
  if (!walk) {
    walk = { pages: [], next: computeChart(new Date(anchor * DAY_MS)) };
    walks.set(key, walk);
  }
  while (anchor + walk.pages.length <= today) {
    const day = anchor + walk.pages.length;
    const tomorrow = computeChart(new Date((day + 1) * DAY_MS));
    const recent = new Set(
      walk.pages.slice(-(REPEAT_WINDOW_DAYS - 1)).flatMap((p) => [p.headline, ...p.sentences]),
    );
    walk.pages.push(composeDecree(culture, walk.next, { day, recent, tomorrow }));
    walk.next = tomorrow;
  }
  return walk.pages[today - anchor]!;
}
