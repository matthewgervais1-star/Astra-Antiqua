import type { Culture, Planet } from "@/data/cultures";
import type { AspectKind, Longitude } from "@/data/sampleChart";
import { DEITY_DOMAINS } from "@/data/deityDomains";
import { DECREE_BANKS, type PartnerBody } from "@/data/decreeBanks";
import { DIVE_DEEPER_BANKS } from "@/data/diveDeeperBanks";
import { FIGURE_BANKS } from "@/data/figureBanks";
import {
  composeDayPage,
  composeEvidence,
  dayFigures,
  headlineBody,
  pairClause,
  toneForKind,
  utcDayNumber,
  type DayDecree,
  type DayFigure,
} from "@/lib/decree";
import { composeBridge, DOMAIN_GROUP, type NatalPoints } from "@/lib/figureReading";
import { rankContacts, transitsByGroup } from "@/lib/dayPressure";
import { computeChart } from "@/lib/ephemeris";

/**
 * The day page's dive deeper (spec section A.6): four titled paragraphs, one
 * per house group, in the culture's names. A paragraph reads the one figure
 * that touches its group:
 *
 *   with a chart  the tightest of the day's transits to a natal point in the
 *                 group's houses (lib/dayPressure.ts's buckets), from a body
 *                 that moves daily when one touches the group, read the way
 *                 the figure page reads a contact: the transiting body's
 *                 domain, then the natal point's
 *   without one   the tightest of the day's sky figures with a body whose
 *                 domain the group keeps (DOMAIN_GROUP), that body's domain
 *                 first; each figure serves one group while another is free
 *
 * and says it in two or three sentences: the two domains and the day's
 * relation; the consequence (keyed as the decree and the figure page key
 * it); and one concrete thing the reader will meet, from the figure page's
 * manifestations for the group and the tone. A group nothing touches prints
 * the culture's quiet line for it.
 *
 * No sentence the page already prints is printed twice: the relation never
 * takes the decree's variant for the day, and a consequence already on the
 * page gives way to the other body's, or to none. A relation that shares a
 * word with its consequence ("stand on opposite banks. Home and work pull
 * from opposite banks.") gives way to another variant.
 */
export interface DiveGroup {
  /** "The Forum: your standing and your coin". */
  title: string;
  /** The figure the paragraph reads, in mono: "RA △ NUT · 0°19′" or "MARS □ YOUR MERCURIUS · 0°41′"; "" when quiet. */
  evidence: string;
  /** The paragraph's sentences, the concrete line last; the quiet line alone when quiet. */
  sentences: readonly string[];
  quiet: boolean;
}

export interface DiveDeeper {
  groups: readonly DiveGroup[];
  /** True when the paragraphs read the reader's chart. */
  natal: boolean;
}

/** One figure as a group reads it: `first`'s domain opens the sentence. */
interface GroupReading {
  first: Planet;
  second: Planet;
  kind: AspectKind;
  evidence: string;
  /** The consequence keys in order of preference; the Moon keys none. */
  keys: readonly Planet[];
}

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const fill = (template: string, slots: Readonly<Record<string, string>>): string =>
  template.replace(/\{(\w+)\}/g, (whole, key: string) => slots[key] ?? whole);

/**
 * True when a line, or a clause inside a longer sentence (the second-figure
 * sentence carries a meaning clause after its colon), is already on the page.
 */
function onPage(line: string, printed: ReadonlySet<string>): boolean {
  const needle = line.replace(/\.$/, "").toLowerCase();
  for (const s of printed) if (s.toLowerCase().includes(needle)) return true;
  return false;
}

/** The words of five letters or more in a line, lowercased. */
const longWords = (line: string): Set<string> => new Set(line.toLowerCase().match(/[a-z']{5,}/g) ?? []);

/**
 * The relation sentence for a group. Groups alternate between the two
 * variants the decree does not use today, then the day's own variant. A
 * choice whose clause is on the page already, alone or inside a longer
 * sentence, is skipped. Of the rest, the group takes the first that shares
 * the fewest words with the consequence.
 */
function relationSentence(
  culture: Culture,
  reading: GroupReading,
  day: number,
  group: number,
  consequence: string | undefined,
  printed: ReadonlySet<string>,
): string {
  const domains = DEITY_DOMAINS[culture];
  const echo = consequence ? longWords(consequence) : new Set<string>();
  const relations = DECREE_BANKS[culture].relations[reading.kind];
  const choices = (group % 2 === 0 ? [day + 1, day + 2, day] : [day + 2, day + 1, day]).map((d) => ({
    shared: [...longWords(relations[((d % 3) + 3) % 3]!)].filter((w) => echo.has(w)).length,
    sentence: `${cap(pairClause(culture, domains[reading.first], domains[reading.second], reading.kind, d))}.`,
  }));
  const fresh = choices.filter((c) => !onPage(c.sentence, printed));
  const pool = fresh.length ? fresh : choices;
  return pool.reduce((best, c) => (c.shared < best.shared ? c : best)).sentence;
}

function composeGroup(
  culture: Culture,
  group: 0 | 1 | 2 | 3,
  reading: GroupReading | null,
  day: number,
  printed: Set<string>,
): DiveGroup {
  const bank = DIVE_DEEPER_BANKS[culture];
  const title = bank.titles[group];
  if (!reading) return { title, evidence: "", sentences: [bank.quiet[group]], quiet: true };

  const consequences = DECREE_BANKS[culture].consequences[reading.kind];
  const consequence = reading.keys
    .filter((k): k is PartnerBody => k !== "moon")
    .map((k) => consequences[k])
    .find((line) => !onPage(line, printed));
  const sentences: string[] = [];
  // A body against its own natal place reads one domain twice; the contact
  // then speaks through its consequence alone.
  if (reading.first !== reading.second) {
    sentences.push(relationSentence(culture, reading, day, group, consequence, printed));
  }
  if (consequence) sentences.push(consequence);
  const things = FIGURE_BANKS[culture].manifestations[group][toneForKind(reading.kind)];
  const thing = things[((day % things.length) + things.length) % things.length]!;
  sentences.push(fill(bank.concrete, { thing }));
  sentences.forEach((s) => printed.add(s));
  return { title, evidence: reading.evidence, sentences, quiet: false };
}

/**
 * Without a chart: each group's tightest sky figure that no earlier group
 * reads. A group whose figures are all taken prints its quiet line.
 */
function skyReadings(culture: Culture, figures: readonly DayFigure[]): (GroupReading | null)[] {
  const used = new Set<DayFigure>();
  return ([0, 1, 2, 3] as const).map((group) => {
    const touching = figures.filter((f) => DOMAIN_GROUP[f.a] === group || DOMAIN_GROUP[f.b] === group);
    const f = touching.find((x) => !used.has(x));
    if (!f) return null;
    used.add(f);
    const { body, partner } = headlineBody(f.a, f.b);
    const [first, second] = DOMAIN_GROUP[body] === group ? [body, partner] : [partner, body];
    return { first, second, kind: f.kind, evidence: composeEvidence(culture, f), keys: [first, second] };
  });
}

/**
 * With a chart: each group's tightest transit to a natal point in its houses.
 * A contact from a body that moves daily comes first: a slow body's contact
 * holds for months and belongs to the long transits, so the day page reads it
 * only when nothing faster touches the group. A body against its own natal
 * place comes after the other contacts of its speed, and the Moon against the
 * natal Moon last of all; when that is all there is, the group is quiet. The
 * ranking is the day pressure module's (rankContacts), so both name one
 * contact per group.
 */
function natalReadings(
  culture: Culture,
  sky: Readonly<Record<Planet, Longitude>>,
  natal: NatalPoints,
): (GroupReading | null)[] {
  return transitsByGroup(natal.chart, natal.ascendant, sky).map((hits) => {
    // The same ranking the day pressure module reads, so both name one contact.
    const h = rankContacts(hits)[0];
    if (!h || (h.transit === "moon" && h.natal === "moon")) return null;
    return {
      first: h.transit,
      second: h.natal,
      kind: h.kind,
      evidence: composeBridge(culture, h.transit, h.natal, h.kind, h.orb),
      // Keyed as the figure page keys a contact: by the natal point, by the
      // transiting body when that point is the Moon.
      keys: h.natal === "moon" ? [h.transit] : [h.natal, h.transit],
    };
  });
}

/**
 * The four paragraphs for a day page. `sky` is the chart at 00:00 UTC of the
 * day, `day` its UTC day number, `decree` the page's decree (its headline and
 * sentences are not printed again), `natal` the reader's chart or null, and
 * `pageLines` any other line the page prints above (the day pressure
 * module's sentences).
 */
export function composeDiveDeeper(
  culture: Culture,
  decree: Pick<DayDecree, "headline" | "sentences">,
  sky: Readonly<Record<Planet, Longitude>>,
  day: number,
  natal: NatalPoints | null,
  pageLines: readonly string[] = [],
): DiveDeeper {
  const readings = natal ? natalReadings(culture, sky, natal) : skyReadings(culture, dayFigures(sky));
  const printed = new Set([decree.headline, ...decree.sentences, ...pageLines]);
  return {
    groups: readings.map((r, g) => composeGroup(culture, g as 0 | 1 | 2 | 3, r, day, printed)),
    natal: Boolean(natal),
  };
}

const DAY_MS = 86_400_000;

/** The dive deeper for the UTC day containing `date`, read at 00:00 UTC as the day page is. */
export function composeDiveDeeperForDay(culture: Culture, date: Date, natal: NatalPoints | null): DiveDeeper {
  const day = utcDayNumber(date);
  const sky = computeChart(new Date(day * DAY_MS));
  return composeDiveDeeper(culture, composeDayPage(culture, date), sky, day, natal);
}
