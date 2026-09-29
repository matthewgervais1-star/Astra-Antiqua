import { type Culture, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { DEITY_DOMAINS } from "@/data/deityDomains";
import { DECREE_BANKS, QUIET_LINE, type FastBody } from "@/data/decreeBanks";
import { computeAspects, type Aspect, type AspectKind, type Longitude } from "@/data/sampleChart";

/**
 * The day's decree, composed from the culture's own banks into the anatomy
 * the reading-voice spec lays out: a headline to the reader, an evidence line
 * naming the figure, and one paragraph of five sentences (meaning,
 * consequence, the institution's image, the second figure, the instruction).
 * Nothing here is shared prose; the five-voice check reads the same sky five
 * ways with no common sentence.
 */
export interface DayDecree {
  /** One sentence to the reader, in sentence case. */
  headline: string;
  /** "RA △ NUT · 0°19′", or "" on a quiet day. */
  evidence: string;
  /** One paragraph. An array so pages that map over paragraphs keep working. */
  paragraphs: readonly string[];
  tone: "harmony" | "tension" | "quiet";
}

/** Daily weather comes from bodies that move daily; slow-slow pairs hold
 * their orb for months and belong to the season, the year, and the long
 * transits instead. Ordered fastest first: when both bodies of a figure are
 * fast, the faster one is the headline body. */
export const FAST_ORDER: readonly FastBody[] = ["moon", "sun", "mercury", "venus", "mars"];
const FAST_BODIES: ReadonlySet<Planet> = new Set(FAST_ORDER);

/** Below this orb the meaning sentence carries the culture's exact tail. */
export const EXACT_ORB = 0.5;

/** Below this orb the evidence line prints EXACT instead of the orb. */
const EXACT_EVIDENCE_ORB = 0.1;

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

/** The headline body of a figure: its fast body, the faster when both are. */
export function headlineBody(a: Planet, b: Planet): { body: FastBody; partner: Planet } {
  for (const fast of FAST_ORDER) {
    if (a === fast) return { body: fast, partner: b };
    if (b === fast) return { body: fast, partner: a };
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
export function composeEvidence(culture: Culture, a: Planet, b: Planet, kind: AspectKind, orb: number): string {
  const nameA = DEITY_MATRIX[culture][a].name.toUpperCase();
  const nameB = DEITY_MATRIX[culture][b].name.toUpperCase();
  const measure = orb < EXACT_EVIDENCE_ORB ? "EXACT" : formatOrb(orb);
  return `${nameA} ${ASPECT_GLYPH[kind]} ${nameB} · ${measure}`;
}

/** The unpunctuated meaning clause: "your letters and your temper haul on opposite ropes". */
function meaningClause(culture: Culture, a: Planet, b: Planet, kind: AspectKind): string {
  const domains = DEITY_DOMAINS[culture];
  return `${domains[a]} and ${domains[b]} ${DECREE_BANKS[culture].relations[kind]}`;
}

/** Sentence (a): two domains and a relation, the exact tail under half a degree. */
export function composeMeaning(culture: Culture, a: Planet, b: Planet, kind: AspectKind, orb: number): string {
  const tail = orb < EXACT_ORB ? DECREE_BANKS[culture].exactTail : "";
  return `${cap(meaningClause(culture, a, b, kind))}${tail}.`;
}

/** Sentence (b): the consequence for the reader, naming the partner god. */
export function composeConsequence(culture: Culture, a: Planet, b: Planet, kind: AspectKind): string {
  const { partner } = headlineBody(a, b);
  return fill(DECREE_BANKS[culture].consequences[kind], { partner: DEITY_MATRIX[culture][partner].name });
}

/** The headline for a figure: keyed by culture, kind and headline body. */
export function composeHeadline(culture: Culture, a: Planet, b: Planet, kind: AspectKind): string {
  return DECREE_BANKS[culture].headlines[kind][headlineBody(a, b).body];
}

/** Sentence (e): the one instruction, naming the headline god and its domain. */
function composeInstruction(culture: Culture, a: Planet, b: Planet, kind: AspectKind): string {
  const { body } = headlineBody(a, b);
  return fill(DECREE_BANKS[culture].instructions[kind], {
    god: DEITY_MATRIX[culture][body].name,
    domain: DEITY_DOMAINS[culture][body],
  });
}

/** The day's candidates: every aspect touching a fast body, tightest first. */
function dayFigures(chart: Readonly<Record<Planet, Longitude>>): Aspect[] {
  return computeAspects(chart)
    .filter((a) => FAST_BODIES.has(a.a) || FAST_BODIES.has(a.b))
    .sort((a, b) => a.orb - b.orb);
}

export function composeDecree(
  culture: Culture,
  chart: Readonly<Record<Planet, Longitude>>,
): DayDecree {
  const candidates = dayFigures(chart);
  const top = candidates[0];
  if (!top) {
    return { headline: QUIET_HEADLINE[culture], evidence: "", paragraphs: [QUIET_LINE[culture]], tone: "quiet" };
  }

  const bank = DECREE_BANKS[culture];
  const { body } = headlineBody(top.a, top.b);
  const god = DEITY_MATRIX[culture][body].name;

  // A second figure only earns its sentence if it speaks in a different
  // aspect kind, so its relation never repeats the meaning sentence's.
  const second = candidates.find((a) => (a.a !== top.a || a.b !== top.b) && a.kind !== top.kind);
  const secondSentence = second
    ? `${bank.secondFigure} ${DEITY_MATRIX[culture][second.a].name} ${ASPECT_VERBS[culture][second.kind]} ${
        DEITY_MATRIX[culture][second.b].name
      }: ${meaningClause(culture, second.a, second.b, second.kind)}.`
    : bank.noSecondFigure;

  const paragraph = [
    composeMeaning(culture, top.a, top.b, top.kind, top.orb),
    composeConsequence(culture, top.a, top.b, top.kind),
    fill(bank.images[top.kind], { god }),
    secondSentence,
    composeInstruction(culture, top.a, top.b, top.kind),
  ].join(" ");

  return {
    headline: composeHeadline(culture, top.a, top.b, top.kind),
    evidence: composeEvidence(culture, top.a, top.b, top.kind, top.orb),
    paragraphs: [paragraph],
    tone: toneForKind(top.kind),
  };
}

/**
 * The day's message in one breath, for a push notification or a widget: the
 * headline, then the meaning, the consequence and the instruction. Every
 * sentence of it is a sentence of the decree, in the decree's order.
 */
export function composeDayMessageParts(
  culture: Culture,
  chart: Readonly<Record<Planet, Longitude>>,
): { headline: string; sentences: readonly string[]; tone: DayDecree["tone"] } {
  const top = dayFigures(chart)[0];
  if (!top) return { headline: QUIET_HEADLINE[culture], sentences: [QUIET_LINE[culture]], tone: "quiet" };
  return {
    headline: composeHeadline(culture, top.a, top.b, top.kind),
    sentences: [
      composeMeaning(culture, top.a, top.b, top.kind, top.orb),
      composeConsequence(culture, top.a, top.b, top.kind),
      composeInstruction(culture, top.a, top.b, top.kind),
    ],
    tone: toneForKind(top.kind),
  };
}
