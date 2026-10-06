import { type Culture, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { DEITY_DOMAINS } from "@/data/deityDomains";
import { DECREE_BANKS, QUIET_LINE, type FastBody, type PartnerBody } from "@/data/decreeBanks";
import { computeAspects, type AspectKind, type Longitude } from "@/data/sampleChart";
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
 * Under half a degree a figure is tight: the meaning sentence carries the
 * culture's tight tail and the week flags the day TIGHT. One threshold for
 * every surface that says "tight". The evidence line does not use it; it
 * prints the measured orb, and says EXACT only under one minute of arc.
 */
export const TIGHT_ORB = 0.5;

/** The evidence line says EXACT only under this: one minute of arc. */
const ONE_ARCMINUTE = 1 / 60;

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

/**
 * Which of a bank's three variants a day uses, by the UTC day number. A
 * figure that holds for three days prints three different relations, tight
 * tails and second-figure openers. The sky picks the figure; the day only
 * picks among the words.
 */
function variant(day: number): 0 | 1 | 2 {
  return (((day % 3) + 3) % 3) as 0 | 1 | 2;
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

/** "RA △ NUT · 0°19′", the measured orb; "MARS ☍ DIS PATER · EXACT" only under one minute of arc. */
export function composeEvidence(culture: Culture, f: DayFigure): string {
  const nameA = DEITY_MATRIX[culture][f.a].name.toUpperCase();
  const nameB = DEITY_MATRIX[culture][f.b].name.toUpperCase();
  const measure = f.orb < ONE_ARCMINUTE ? "EXACT" : formatOrb(f.orb);
  return `${nameA} ${ASPECT_GLYPH[f.kind]} ${nameB} · ${measure}`;
}

/** The unpunctuated meaning clause: "your letters and your temper haul on opposite ropes". */
function meaningClause(culture: Culture, f: DayFigure, day: number): string {
  const domains = DEITY_DOMAINS[culture];
  return `${domains[f.a]} and ${domains[f.b]} ${DECREE_BANKS[culture].relations[f.kind][variant(day)]}`;
}

/** Sentence (a): two domains and a relation, the tight tail under half a degree. */
export function composeMeaning(culture: Culture, f: DayFigure, day = 0): string {
  const tail = f.orb < TIGHT_ORB ? DECREE_BANKS[culture].tightTails[variant(day)] : "";
  return `${cap(meaningClause(culture, f, day))}${tail}.`;
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

/** Sentence (c): the institution's image, naming the headline god. */
function composeImage(culture: Culture, f: DayFigure): string {
  return fill(DECREE_BANKS[culture].images[f.kind][headlineBody(f.a, f.b).body], godSlots(culture, f));
}

/** Sentence (e): the one instruction, written for the headline body's domain. */
function composeInstruction(culture: Culture, f: DayFigure): string {
  return fill(DECREE_BANKS[culture].instructions[f.kind][headlineBody(f.a, f.b).body], godSlots(culture, f));
}

/**
 * Sentence (d): the second figure. Its opener names the headline figure's two
 * gods, unless the two figures share a god: then the plain opener, so no god
 * is named twice in one sentence.
 */
function composeSecond(culture: Culture, top: DayFigure, f: DayFigure, day: number): string {
  const names = DEITY_MATRIX[culture];
  // Compared by name: Carthage gives Jupiter and Saturn one god.
  const headlineGods = new Set([names[top.a].name, names[top.b].name]);
  const shared = headlineGods.has(names[f.a].name) || headlineGods.has(names[f.b].name);
  const bank = DECREE_BANKS[culture];
  const opener = shared
    ? bank.secondFigurePlain[variant(day)]
    : fill(bank.secondFigure[variant(day)], godSlots(culture, top));
  return `${opener} ${names[f.a].name} ${ASPECT_VERBS[culture][f.kind]} ${names[f.b].name}: ${meaningClause(culture, f, day)}.`;
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
}

/**
 * The decree for one chart. The headline figure is the tightest figure that
 * touches a fast body, always: the sky decides it, and nothing here moves it
 * to avoid a repeat. The second figure is the tightest one of another kind.
 */
export function composeDecree(
  culture: Culture,
  chart: Readonly<Record<Planet, Longitude>>,
  options: DecreeOptions = {},
): DayDecree {
  const day = options.day ?? 0;
  const candidates = dayFigures(chart);
  const top = candidates[0];
  if (!top) {
    return {
      headline: QUIET_HEADLINE[culture],
      evidence: "",
      paragraphs: [QUIET_LINE[culture]],
      tone: "quiet",
      sentences: [QUIET_LINE[culture]],
      figures: [],
    };
  }

  // A second figure only earns its sentence if it speaks in a different
  // aspect kind, so its relation never repeats the meaning sentence's.
  const second = candidates.find((f) => f.kind !== top.kind);
  const secondSentence = second ? composeSecond(culture, top, second, day) : DECREE_BANKS[culture].noSecondFigure;
  const sentences = [
    composeMeaning(culture, top, day),
    composeConsequence(culture, top),
    composeImage(culture, top),
    secondSentence,
    composeInstruction(culture, top),
  ];
  return {
    headline: composeHeadline(culture, top),
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

/** The day page for the UTC day containing `date`: the sky at 00:00 UTC. */
export function composeDayPage(culture: Culture, date: Date): DayDecree {
  const day = utcDayNumber(date);
  return composeDecree(culture, computeChart(new Date(day * DAY_MS)), { day });
}
