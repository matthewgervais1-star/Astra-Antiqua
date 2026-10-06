import { PLANETS, type Culture, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { DEITY_DOMAINS } from "@/data/deityDomains";
import { DECREE_BANKS, type FastBody, type PartnerBody } from "@/data/decreeBanks";
import { FIGURE_BANKS, PLACEMENT_CLAUSES, type TryThisCard } from "@/data/figureBanks";
import type { SlowBody } from "@/data/transitSpine";
import { ASPECT_RULES, longitudeToSign, type AspectKind } from "@/data/sampleChart";
import {
  ASPECT_GLYPH,
  composeConsequence,
  composeEvidence,
  composeHeadline,
  composeImage,
  headlineBody,
  meaningClause,
  orbMeasure,
  pairClause,
  toneForKind,
  utcDayNumber,
  type DayFigure,
} from "@/lib/decree";
import { computeChart } from "@/lib/ephemeris";
import {
  ASPECT_ANGLE,
  composeRecurrence,
  natalRecurrenceDays,
  natalWindow,
  skyRecurrenceDays,
  skyWindow,
  type OrbWindow,
} from "@/lib/recurrence";
import type { TransitSpan } from "@/lib/transitSpans";
import { houseGroupIndex, signPhraseProse, spanTone, wholeSignHouse } from "@/components/transits/spanDisplay";

/**
 * The figure page: one figure read the way the reference reads it
 * (docs/superpowers/specs/2026-09-29-daily-reading-voice.md, section B). A
 * day's figure is two transiting bodies; a reader with a chart gets the same
 * figure read against the natal point it touches. A long transit is a slow
 * body against a natal point, and TransitDetail wraps the same anatomy
 * around its four-part spine.
 *
 * The headline, the evidence line and move two read the sky figure the
 * reader opened. Everything from "what it looks like in space" down reads the
 * figure as it lands on the reader: the natal contact when there is one, the
 * sky figure when not.
 */

const DAY_MS = 86_400_000;

/** One part of the decomposed sentence: a plain phrase, the fact beneath it in mono, the glyph beside it. */
export interface FigurePart {
  phrase: string;
  tag: string;
  /** The body whose glyph sits beside the part, or null (the relation, an angle). */
  body: Planet | null;
}

/** One end of the two-body diagram. */
export interface DiagramPoint {
  body: Planet | null;
  longitude: number;
  label: string;
}

/** What both pages print below the paragraph, and the paragraph itself. */
export interface FigureAnatomy {
  /** The transiting body whose glyph is the hero, and whose cards and recurrence the page reads. */
  heroBody: Planet;
  moveOne: string;
  moveTwo: string;
  parts: readonly [FigurePart, FigurePart, FigurePart];
  diagram: { from: DiagramPoint; to: DiagramPoint; kind: AspectKind };
  kind: AspectKind;
  recurrence: string;
  playsOutTitle: string;
  actLine: string;
  manifestations: readonly string[];
  cards: readonly TryThisCard[];
  lesson: string;
}

export interface FigurePage extends FigureAnatomy {
  /** YYYY-MM-DD, UTC. */
  date: string;
  /** `${a}-${kind}-${b}` in canonical planet order. */
  id: string;
  headline: string;
  evidence: string;
  /** 00:00 UTC on the date, the instant the day page reads. */
  instant: Date;
  /** The stretch the displayed figure holds its orb. */
  window: OrbWindow;
  /**
   * With a chart, the mono line under the evidence that names the contact
   * the rest of the page reads: "MARS ⚹ YOUR MERCURIUS · 0°40′". Null when
   * the page reads the sky figure.
   */
  bridge: string | null;
  /** True when the page reads the figure against the reader's chart. */
  natal: boolean;
  feedbackId: string;
}

/** The reader's chart, as the figure page needs it. */
export interface NatalPoints {
  chart: Readonly<Record<Planet, number>>;
  ascendant: number;
}

// --- ids and dates --------------------------------------------------------------

const KINDS: ReadonlySet<string> = new Set(ASPECT_RULES.map((r) => r.kind));
const PLANET_SET: ReadonlySet<string> = new Set(PLANETS);

/** `${a}-${kind}-${b}` with the two bodies in canonical planet order. */
export function figureId(f: Pick<DayFigure, "a" | "b" | "kind">): string {
  const [a, b] = PLANETS.indexOf(f.a) <= PLANETS.indexOf(f.b) ? [f.a, f.b] : [f.b, f.a];
  return `${a}-${f.kind}-${b}`;
}

export function parseFigureId(id: string): { a: Planet; kind: AspectKind; b: Planet } | null {
  const [a, kind, b, ...rest] = id.split("-");
  if (rest.length || !a || !b || !kind || !PLANET_SET.has(a) || !PLANET_SET.has(b) || !KINDS.has(kind) || a === b) {
    return null;
  }
  return { a: a as Planet, kind: kind as AspectKind, b: b as Planet };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** YYYY-MM-DD of the UTC day containing `date`. */
export function isoDateUtc(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

/** 00:00 UTC on a YYYY-MM-DD date, or null if the string is not one. */
export function parseIsoDate(date: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return isoDateUtc(d) === date ? d : null;
}

/** The page a day's figure opens on. */
export function figureHref(date: string, f: Pick<DayFigure, "a" | "b" | "kind">): string {
  return `/day/${date}/figure/${figureId(f)}`;
}

// --- the pieces -----------------------------------------------------------------

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const lower = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);
const fill = (template: string, slots: Readonly<Record<string, string>>): string =>
  template.replace(/\{(\w+)\}/g, (whole, key: string) => slots[key] ?? whole);

const name = (culture: Culture, body: Planet): string => DEITY_MATRIX[culture][body].name;

/**
 * The partner body's house group when the reader has no chart, by what the
 * body governs in DEITY_DOMAINS: the work and the coin (Sun, Jupiter,
 * Saturn), the house and the kin (Moon, Venus, Pluto), the letters and the
 * crossings (Mercury, Uranus), and the inner room (Mars, Neptune).
 */
export const DOMAIN_GROUP: Readonly<Record<Planet, 0 | 1 | 2 | 3>> = {
  sun: 0,
  jupiter: 0,
  saturn: 0,
  moon: 1,
  venus: 1,
  pluto: 1,
  mercury: 2,
  uranus: 2,
  mars: 3,
  neptune: 3,
};

/** Move one for a natal planet: the culture's frame around the placement's authored clause. */
export function composeNatalMoveOne(culture: Culture, point: Planet, longitude: number): string {
  const { sign } = longitudeToSign(longitude);
  return fill(FIGURE_BANKS[culture].natalFrame, {
    deity: name(culture, point),
    sign: signPhraseProse(sign),
    clause: PLACEMENT_CLAUSES[point][sign],
  });
}

/** Move one with no chart: the transiting god in its sign and the domain it keeps. */
function composeSkyMoveOne(culture: Culture, body: Planet, longitude: number): string {
  const { sign } = longitudeToSign(longitude);
  return fill(FIGURE_BANKS[culture].skyMoveOne, {
    god: name(culture, body),
    sign: signPhraseProse(sign),
    domain: DEITY_DOMAINS[culture][body],
  });
}

/**
 * "Right now {two domains and a relation}: {the consequence}." A colon
 * rather than ", and": the relation and the consequence each carry their
 * own "and" often enough that a third would stack.
 */
function composeMoveTwo(clause: string, consequence: string | null): string {
  return consequence ? `Right now ${clause}: ${lower(consequence)}` : `Right now ${clause}.`;
}

function relationPart(culture: Culture, kind: AspectKind): FigurePart {
  return { phrase: FIGURE_BANKS[culture].shortRelations[kind], tag: `${kind.toUpperCase()} (${ASPECT_ANGLE[kind]}°)`, body: null };
}

const nowTag = (culture: Culture, body: Planet) => `${name(culture, body).toUpperCase()} NOW`;
const natalTag = (culture: Culture, body: Planet, longitude: number) =>
  `YOUR ${name(culture, body).toUpperCase()} IN ${longitudeToSign(longitude).sign.toUpperCase()}`;

function manifestationsFor(culture: Culture, group: 0 | 1 | 2 | 3, tone: "harmony" | "tension"): readonly string[] {
  return FIGURE_BANKS[culture].manifestations[group][tone];
}

function lessonFor(culture: Culture, kind: AspectKind, god: Planet): string {
  return fill(FIGURE_BANKS[culture].lessons[kind], { god: name(culture, god) });
}

// --- the natal contact ----------------------------------------------------------

export interface NatalContact {
  /** The transiting body, one of the sky figure's two. */
  body: Planet;
  /** The natal planet it touches. */
  point: Planet;
  kind: AspectKind;
  orb: number;
}

function separation(x: number, y: number): number {
  const raw = Math.abs(x - y) % 360;
  return raw > 180 ? 360 - raw : raw;
}

/**
 * The natal point the figure touches: the tightest aspect, inside the
 * documented orbs, from the headline body to any other natal planet; from
 * the partner when the headline body touches none. A body against its own
 * natal place is a return, not a contact, and is left out. Null when neither
 * touches anything, and the page then reads the sky figure.
 */
export function natalContact(
  sky: Readonly<Record<Planet, number>>,
  natal: NatalPoints,
  headline: Planet,
  partner: Planet,
): NatalContact | null {
  const contactsOf = (body: Planet): NatalContact[] => {
    const out: NatalContact[] = [];
    for (const point of PLANETS) {
      if (point === body) continue;
      const angle = separation(sky[body], natal.chart[point]);
      for (const rule of ASPECT_RULES) {
        const orb = Math.abs(angle - rule.angle);
        if (orb <= rule.orb) {
          out.push({ body, point, kind: rule.kind, orb });
          break;
        }
      }
    }
    return out.sort((x, y) => x.orb - y.orb);
  };
  return contactsOf(headline)[0] ?? contactsOf(partner)[0] ?? null;
}

// --- the day's figure -------------------------------------------------------------

const FAST: ReadonlySet<Planet> = new Set(["sun", "moon", "mercury", "venus", "mars"]);

/** Why a figure page has nothing to read: a malformed date or id, two slow bodies, or a sky without the figure. */
export type FigureMissing = "malformed" | "slow" | "absent";

/** The reason composeFigurePage returned null, or null when it would compose. */
export function figureMissing(date: string, id: string): FigureMissing | null {
  const instant = parseIsoDate(date);
  const key = parseFigureId(id);
  if (!instant || !key) return "malformed";
  if (!FAST.has(key.a) && !FAST.has(key.b)) return "slow";
  const sky = computeChart(instant);
  const angle = separation(sky[key.a], sky[key.b]);
  const rule = ASPECT_RULES.find((r) => Math.abs(angle - r.angle) <= r.orb);
  return rule?.kind === key.kind ? null : "absent";
}

/**
 * The figure page for one day's figure. Null when the date or the id does not
 * parse, or when the sky at 00:00 UTC that day does not hold the figure
 * inside its orb (the page then says so rather than invent one).
 */
export function composeFigurePage(
  culture: Culture,
  date: string,
  id: string,
  natal: NatalPoints | null,
): FigurePage | null {
  const instant = parseIsoDate(date);
  const parsed = parseFigureId(id);
  if (!instant || !parsed) return null;
  // Canonical order, so an id written either way reads as the day page reads it.
  const key = PLANETS.indexOf(parsed.a) < PLANETS.indexOf(parsed.b) ? parsed : { a: parsed.b, kind: parsed.kind, b: parsed.a };
  const sky = computeChart(instant);
  const angle = separation(sky[key.a], sky[key.b]);
  const orb = Math.abs(angle - ASPECT_ANGLE[key.kind]);
  const rule = ASPECT_RULES.find((r) => Math.abs(angle - r.angle) <= r.orb);
  if (!rule || rule.kind !== key.kind) return null;
  if (!FAST.has(key.a) && !FAST.has(key.b)) return null;

  const figure: DayFigure = { a: key.a, b: key.b, kind: key.kind, orb };
  const { body: headline, partner } = headlineBody(figure.a, figure.b);
  const day = utcDayNumber(instant);
  const contact = natal ? natalContact(sky, natal, headline, partner) : null;
  const bank = FIGURE_BANKS[culture];
  const domains = DEITY_DOMAINS[culture];

  let anatomy: FigureAnatomy;
  let window: OrbWindow;
  if (natal && contact) {
    const natalLon = natal.chart[contact.point];
    const group = houseGroupIndex(wholeSignHouse(natalLon, natal.ascendant));
    window = natalWindow(contact.body, natalLon, contact.kind, instant);
    // Move two reads the contact: its kind, its two domains, and the
    // consequence keyed by the point it touches (by the transiting body when
    // that point is the Moon, which the consequence bank never keys).
    const consequences = DECREE_BANKS[culture].consequences[contact.kind];
    const consequence = contact.point === "moon" ? consequences[contact.body as PartnerBody] : consequences[contact.point];
    // The act names the god of the contact, so hero, act and cards agree.
    const act = FAST.has(contact.body)
      ? fill(DECREE_BANKS[culture].images[contact.kind][contact.body as FastBody], { god: name(culture, contact.body) })
      : fill(bank.slowActs[contact.body as SlowBody], { god: name(culture, contact.body) });
    anatomy = {
      heroBody: contact.body,
      moveOne: composeNatalMoveOne(culture, contact.point, natalLon),
      moveTwo: composeMoveTwo(
        pairClause(culture, domains[contact.body], domains[contact.point], contact.kind, day),
        consequence ?? null,
      ),
      parts: [
        { phrase: cap(domains[contact.body]), tag: nowTag(culture, contact.body), body: contact.body },
        relationPart(culture, contact.kind),
        { phrase: `${domains[contact.point]}.`, tag: natalTag(culture, contact.point, natalLon), body: contact.point },
      ],
      diagram: {
        from: { body: contact.body, longitude: sky[contact.body], label: nowTag(culture, contact.body) },
        to: { body: contact.point, longitude: natalLon, label: `YOUR ${name(culture, contact.point).toUpperCase()}` },
        kind: contact.kind,
      },
      kind: contact.kind,
      recurrence: composeRecurrence(culture, natalRecurrenceDays(contact.body, contact.kind)),
      playsOutTitle: bank.playsOutTitle,
      actLine: act,
      manifestations: manifestationsFor(culture, group, toneForKind(contact.kind)),
      cards: bank.tryThis[contact.body],
      lesson: lessonFor(culture, contact.kind, contact.body),
    };
  } else {
    // No chart, or a chart the figure does not touch: the sky figure itself,
    // its manifestations keyed by the partner body's domain group.
    window = skyWindow(figure.a, figure.b, figure.kind, instant);
    anatomy = {
      heroBody: headline,
      moveOne: composeSkyMoveOne(culture, headline, sky[headline]),
      moveTwo: composeMoveTwo(meaningClause(culture, figure, day), composeConsequence(culture, figure)),
      parts: [
        { phrase: cap(domains[headline]), tag: nowTag(culture, headline), body: headline },
        relationPart(culture, figure.kind),
        { phrase: `${domains[partner]}.`, tag: nowTag(culture, partner), body: partner },
      ],
      diagram: {
        from: { body: headline, longitude: sky[headline], label: nowTag(culture, headline) },
        to: { body: partner, longitude: sky[partner], label: nowTag(culture, partner) },
        kind: figure.kind,
      },
      kind: figure.kind,
      recurrence: composeRecurrence(culture, skyRecurrenceDays(figure.a, figure.b, figure.kind)),
      playsOutTitle: bank.playsOutTitle,
      actLine: composeImage(culture, figure),
      manifestations: manifestationsFor(culture, DOMAIN_GROUP[partner], toneForKind(figure.kind)),
      cards: bank.tryThis[headline],
      lesson: lessonFor(culture, figure.kind, headline),
    };
  }

  const canonical = figureId(figure);
  return {
    ...anatomy,
    date,
    id: canonical,
    headline: composeHeadline(culture, figure),
    evidence: composeEvidence(culture, figure),
    instant,
    window,
    natal: Boolean(natal && contact),
    bridge: natal && contact
      ? `${name(culture, contact.body).toUpperCase()} ${ASPECT_GLYPH[contact.kind]} YOUR ${name(culture, contact.point).toUpperCase()} · ${orbMeasure(contact.orb)}`
      : null,
    feedbackId: `figure-${date}-${canonical}`,
  };
}

// --- the long transit -------------------------------------------------------------

/** What a long transit's headline and anatomy need beyond the span. */
export interface SpanFigure extends FigureAnatomy {
  headline: string;
}

/** The angle's label in a tag: "YOUR RISING IN LEO". */
const ANGLE_LABEL: Readonly<Record<"asc" | "mc", string>> = { asc: "RISING", mc: "MIDHEAVEN" };

/**
 * The anatomy around a long transit's spine: a slow body against the natal
 * Sun, Moon, rising or midheaven. `now` picks the relation's variant, the
 * way the day page's UTC day does.
 */
export function composeSpanFigure(
  culture: Culture,
  span: Pick<TransitSpan, "transitPlanet" | "natalKey" | "natalLongitude" | "aspectKind">,
  natal: NatalPoints,
  transitLongitude: number,
  now: Date,
): SpanFigure {
  const body = span.transitPlanet as SlowBody;
  const kind = span.aspectKind;
  const bank = FIGURE_BANKS[culture];
  const domains = DEITY_DOMAINS[culture];
  const day = Math.floor(now.getTime() / DAY_MS);
  const { sign } = longitudeToSign(span.natalLongitude);

  const isAngle = span.natalKey === "asc" || span.natalKey === "mc";
  const angle = span.natalKey as "asc" | "mc";
  const point = span.natalKey as Planet;
  const pointDomain = isAngle ? bank.angleDomains[angle] : domains[point];
  const moveOne = isAngle
    ? fill(bank.angleMoveOne[angle], { sign: signPhraseProse(sign) })
    : composeNatalMoveOne(culture, point, span.natalLongitude);
  const consequence = DECREE_BANKS[culture].consequences[kind][body];
  // The rising sits in the first house by construction; every other point by its own sign.
  const house = wholeSignHouse(span.natalLongitude, natal.ascendant);
  const tone = spanTone({ aspectKind: kind, transitPlanet: body }) === "ease" ? "harmony" : "tension";
  const pointTag = isAngle
    ? `YOUR ${ANGLE_LABEL[angle]} IN ${sign.toUpperCase()}`
    : natalTag(culture, point, span.natalLongitude);

  return {
    headline: bank.slowHeadlines[kind][body],
    heroBody: body,
    moveOne,
    moveTwo: composeMoveTwo(pairClause(culture, domains[body], pointDomain, kind, day), consequence),
    parts: [
      { phrase: cap(domains[body]), tag: nowTag(culture, body), body },
      relationPart(culture, kind),
      { phrase: `${pointDomain}.`, tag: pointTag, body: isAngle ? null : point },
    ],
    diagram: {
      from: { body, longitude: transitLongitude, label: nowTag(culture, body) },
      to: {
        body: isAngle ? null : point,
        longitude: span.natalLongitude,
        label: isAngle ? `YOUR ${ANGLE_LABEL[angle]}` : `YOUR ${name(culture, point).toUpperCase()}`,
      },
      kind,
    },
    kind,
    recurrence: composeRecurrence(culture, natalRecurrenceDays(body, kind)),
    playsOutTitle: bank.playsOutTitle,
    actLine: fill(bank.slowActs[body], { god: name(culture, body) }),
    manifestations: manifestationsFor(culture, houseGroupIndex(house), tone),
    cards: bank.tryThis[body],
    lesson: lessonFor(culture, kind, body),
  };
}
