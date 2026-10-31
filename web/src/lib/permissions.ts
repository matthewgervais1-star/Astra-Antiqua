import type { Culture, Planet } from "@/data/cultures";
import { toneOf, type Tone } from "@/lib/tone";
import { PERMISSIONS_REGISTER } from "@/data/permissionsRegister";
import { FAST_ORDER, type DayFigure } from "@/lib/decree";
import type { Longitude } from "@/data/sampleChart";
import { computeTransits } from "@/lib/transits";

/**
 * The day's permissions: the culture's own pair (PROCEED/REFRAIN,
 * OFFER/WITHHOLD and the rest, see cultureVoice.permissionPair), four items a
 * column, drawn from the bodies of the day's figures (data/
 * permissionsRegister.ts). Nothing is shuffled: the same figures always give
 * the same lists, and a reader can trace each item to a body named in the
 * evidence line or the second figure.
 */
export interface DayPermissions {
  proceed: string[];
  refrain: string[];
}

const PER_COLUMN = 4;

/** A quiet sky names no bodies; the Sun and Moon give and Saturn and Mars withhold. */
const QUIET_PROCEED: readonly Planet[] = ["sun", "moon"];
const QUIET_REFRAIN: readonly Planet[] = ["saturn", "mars"];

/**
 * Fill one column from groups of bodies, a figure's two bodies to a group:
 * the first item of each body in the group, then the second, then the third,
 * moving to the next group only when the column still has room. A body
 * already used in the column is skipped.
 */
function column(
  culture: Culture,
  groups: ReadonlyArray<readonly Planet[]>,
  side: "proceed" | "refrain",
  day: number,
): string[] {
  const out: string[] = [];
  const used = new Set<Planet>();
  // The day turns which of a body's three items comes first, so a figure that
  // holds from one day to the next does not print the same lists twice.
  const offset = ((day % 3) + 3) % 3;
  for (const group of groups) {
    const bodies = group.filter((b) => !used.has(b));
    bodies.forEach((b) => used.add(b));
    for (let rank = 0; rank < 3; rank += 1) {
      for (const body of bodies) {
        const item = PERMISSIONS_REGISTER[culture][body][side][(rank + offset) % 3];
        if (item && out.length < PER_COLUMN && !out.includes(item)) out.push(item);
      }
    }
    if (out.length >= PER_COLUMN) break;
  }
  return out;
}

/**
 * The lists for a day, from its figures in the decree's order: the headline
 * figure, the second figure, then the rest by orb. On a day of favor or union
 * the headline figure's bodies fill the proceed column and the second
 * figure's bodies the refrain column; on a day of trial the two swap. Either
 * column fills to four from the figures after those two. `day` is the UTC day
 * number; it rotates which of each body's three items leads.
 */
export function dayPermissions(culture: Culture, figures: readonly DayFigure[], day = 0): DayPermissions {
  const [top, second, ...rest] = figures;
  if (!top) {
    return { proceed: column(culture, [QUIET_PROCEED], "proceed", day), refrain: column(culture, [QUIET_REFRAIN], "refrain", day) };
  }
  const tail = rest.map((f) => [f.a, f.b] as const);
  const lead = [[top.a, top.b] as const, ...tail];
  const follow = [...(second ? [[second.a, second.b] as const] : []), ...tail];
  const trial = toneOf(top.kind) === "tension";
  return {
    proceed: column(culture, trial ? follow : lead, "proceed", day),
    refrain: column(culture, trial ? lead : follow, "refrain", day),
  };
}

const FAST: ReadonlySet<Planet> = new Set(FAST_ORDER);

/**
 * The day's transits to a reader's chart in the decree's order, as figures
 * whose first body moves and whose second is the natal point: the tightest
 * contact, the tightest of another kind, then the rest by orb. Only the
 * bodies that move daily (the decree's fast bodies) are read while one of
 * them touches the chart: a slow body's contact holds for months, belongs to
 * the long transits, and would fix the lists for a season. A body against
 * its own natal place is left out, as the figure page leaves it out: it
 * would give one body's items where a contact gives two.
 */
export function natalDayFigures(
  sky: Readonly<Record<Planet, Longitude>>,
  natalChart: Readonly<Record<Planet, Longitude>>,
): DayFigure[] {
  const all = computeTransits(sky, natalChart)
    .filter((h) => h.transit !== h.natal)
    .map(({ transit, natal, kind, orb }) => ({ a: transit, b: natal, kind, orb }))
    .sort((x, y) => x.orb - y.orb);
  const fast = all.filter((f) => FAST.has(f.a));
  const contacts = fast.length ? fast : all;
  const [top] = contacts;
  if (!top) return [];
  const second = contacts.find((f) => f.kind !== top.kind);
  return [top, ...(second ? [second] : []), ...contacts.filter((f) => f !== top && f !== second)];
}

/**
 * The lists for a reader with a chart: the day's transits to the natal
 * points, by the rule dayPermissions applies to sky figures (the tightest
 * contact's bodies fill the proceed column on a day of favor and the refrain
 * column on a day of trial), with the same day rotation. Null when nothing
 * touches the chart, and the reader then gets the sky's lists.
 */
export function natalDayPermissions(
  culture: Culture,
  sky: Readonly<Record<Planet, Longitude>>,
  natalChart: Readonly<Record<Planet, Longitude>>,
  day = 0,
): DayPermissions | null {
  const figures = natalDayFigures(sky, natalChart);
  return figures.length ? dayPermissions(culture, figures, day) : null;
}

// FNV-1a: a small, dependency-free string hash, good enough to seed a PRNG
// deterministically from a composite key (culture|day-of-year|year|tone|salt).
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// mulberry32: a tiny deterministic PRNG. Given the same seed it always
// produces the same stream, which is the whole point here: no Math.random.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((current - start) / 86_400_000) + 1;
}

function seedFor(culture: Culture, date: Date, tone: Tone, salt: string): number {
  return fnv1a(`${culture}|${date.getUTCFullYear()}|${dayOfYear(date)}|${tone}|${salt}`);
}

/**
 * The day's votive instruction: two authored imperative lines per culture and
 * tone. These are written, not assembled. An earlier version slotted items
 * from the permissions bank into a fixed frame and produced lines like
 * "LET COUNT ANYTHING", which is the template-seam failure that
 * docs/design/reading-voice.md exists to forbid.
 */
const DAY_VOTIVES: Readonly<Record<Culture, Readonly<Record<Tone, readonly string[]>>>> = {
  egypt: {
    harmony: [
      "LET WHAT IS TRUE BE\nWEIGHED WHERE OTHERS CAN SEE IT",
      "MAKE THE OFFERING YOU HAVE POSTPONED;\nLET THE RECORD BE EXACT",
    ],
    tension: [
      "BRING THE EXACT NUMBER TO THE SCALE;\nTHE ROUND ONE IS AN OFFERING TO ISFET",
      "SET DOWN WHAT YOU CANNOT CARRY LEVEL;\nTHE FEATHER DOES NOT NEGOTIATE",
    ],
    union: [
      "DECLARE THE TWO AS ONE;\nLET THE SCRIBES ENTER IT IN ONE LINE",
      "LET THE JOINED THING BE NAMED ALOUD;\nAN UNRECORDED UNION IS NO UNION",
    ],
  },
  greece: {
    harmony: [
      "ASK THE LARGER QUESTION TODAY;\nTHE GOD IS IN A MOOD TO ANSWER",
      "TAKE THE ANSWER THAT IS OFFERED;\nDO NOT HAGGLE WITH A GIFT",
    ],
    tension: [
      "NAME THE PRICE BEFORE YOU AGREE TO IT;\nEVERY ANSWER COSTS SOMETHING",
      "CHANGE THE QUESTION, NOT THE GOD;\nTHE SHRINE IS NOT THE PROBLEM",
    ],
    union: [
      "ASK ONE QUESTION, NOT THREE;\nTHE ORACLE ANSWERS A SINGLE VOICE",
      "PUT THE TWO MATTERS TO ONE HEARING;\nTHEY WILL NOT BE HEARD APART",
    ],
  },
  canaan: {
    harmony: [
      "MAKE THE VOW WHILE THE RAINS HOLD;\nIT WILL BE HEARD TODAY",
      "WORK THE FIELD BEFORE YOU PRAY OVER IT;\nBAAL HAS ALREADY ANSWERED",
    ],
    tension: [
      "LET THE WITNESS FINISH SPEAKING;\nAN OBJECTION SILENCED IS AN OBJECTION KEPT",
      "BRING THE OLD VOW TO TERM;\nTHEN COME BACK FOR THE NEW ONE",
    ],
    union: [
      "PUT IT TO THE COUNCIL AS ONE MATTER;\nEL WILL NOT RULE ON TWO",
      "SEAL THE TWO NAMES IN ONE COVENANT;\nCALL THE WITNESSES BEFORE DUSK",
    ],
  },
  carthage: {
    harmony: [
      "LOAD THE CARGO WHILE THE WIND IS FAIR;\nIT WILL NOT STAY FAIR FOREVER",
      "SET OUT TODAY;\nNOTHING IS CALLED IN FIRST",
    ],
    tension: [
      "LEAVE THE BOOKS OPEN\nUNTIL THE ACCOUNT IS TRUE",
      "PAY THE OLD VOW BEFORE YOU SAIL;\nTHE PRECINCT TAKES NO INSTALLMENTS",
    ],
    union: [
      "ENTER IT UNDER ONE NAME;\nDO NOT SPLIT WHAT THE SKY HAS JOINED",
      "BRING THE CARGO TO THE SCALE,\nAND THE VOW TO THE PRECINCT",
    ],
  },
  rome: {
    harmony: [
      "LET WHAT HAS RIPENED BE\nCOUNTED BEFORE WITNESSES",
      "ASK THE FAVOR OWED YOU;\nTHE AUSPICES ARE TAKEN ON THE RIGHT",
    ],
    tension: [
      "PROCEED, BUT PREPARE THE DEFENSE;\nTHE OBJECTION HAS STANDING",
      "SIGN NOTHING IN ANGER;\nTHE CENSOR READS EVERY CLAUSE TWICE",
    ],
    union: [
      "ACT AS ONE POWER, NOT TWO;\nDIVIDED COMMAND LOSES THE FIELD",
      "SWEAR THE TREATY BEFORE WITNESSES;\nAN UNWITNESSED OATH BINDS NO ONE",
    ],
  },
};

export function composeDayVotive(culture: Culture, tone: Tone, date: Date): string {
  const bank = DAY_VOTIVES[culture][tone];
  const rng = mulberry32(seedFor(culture, date, tone, "votive"));
  return bank[Math.floor(rng() * bank.length)] ?? bank[0] ?? "";
}
