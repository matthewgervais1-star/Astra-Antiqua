import type { Culture, Planet } from "@/data/cultures";
import { fmt, str } from "@/strings";
import { ASPECT_GLYPH as ASPECT_GLYPH_OF } from "@/lib/decree";
import type { Longitude } from "@/data/sampleChart";
import { orbFor } from "@/data/sampleChart";
import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { getHouseMeaning } from "@/data/houses";
import { computeWholeSignHouses, houseOfLongitude } from "@/lib/houses";
import { computeTransits, type TransitAspect } from "@/lib/transits";
import { toneOf } from "@/lib/tone";
import type { SavedNatal } from "@/lib/savedNatal";
import type { OrbTone } from "@/components/chrome/OrbBar";

/**
 * "Where the day falls": today's transits bucketed by the whole-sign house
 * of the natal point they touch, into the four house-groups every culture
 * names its own way (cultureVoice.houseGroups, fixed order: work &
 * substance / home & kin / words & errands / inner court).
 */
export type PressureLevel = "loud" | "strained" | "quiet";

export interface PressureGroup {
  name: string;
  sub: string;
  level: PressureLevel;
  levelLabel: string;
  /** The orb of the contact the group reads (rankContacts: a body that
   *  moves daily first, a slow one only when no fast body touches the
   *  group), for the OrbBar; null when nothing in orb touches it today. */
  orb: number | null;
  maxOrb: number;
  tone: OrbTone;
  sentence: string;
  /** "MERCURY ⚹ NATAL SATURN · 3.0° FROM EXACT · EASE" (day.chart.row.data, board P13); null with no contact. */
  data: string | null;
}

const HOUSE_GROUPS: readonly (readonly number[])[] = [
  [2, 6, 10],
  [4, 8],
  [3, 7, 11],
  [1, 5, 9, 12],
];

const LEVEL_LABEL: Readonly<Record<PressureLevel, string>> = {
  loud: "LOUD",
  strained: "STRAINED",
  quiet: "QUIET",
};

const LEVEL_TONE: Readonly<Record<PressureLevel, OrbTone>> = {
  loud: "harmony",
  strained: "conflict",
  quiet: "quiet",
};

const ORDINAL_WORDS: Readonly<Record<number, string>> = {
  1: "first",
  2: "second",
  3: "third",
  4: "fourth",
  5: "fifth",
  6: "sixth",
  7: "seventh",
  8: "eighth",
  9: "ninth",
  10: "tenth",
  11: "eleventh",
  12: "twelfth",
};

function ordinal(house: number): string {
  return ORDINAL_WORDS[house] ?? `${house}th`;
}

const FAST_TRANSITS: ReadonlySet<Planet> = new Set(["moon", "sun", "mercury", "venus", "mars"]);

/**
 * A group's contacts in the order the day page reads them, so the day
 * pressure module and the dive deeper name the same contact: a body that
 * moves daily before a slow one (a slow body's contact holds for months and
 * belongs to the long transits), a body against its own natal place after
 * the other contacts of its speed, then by orb. The Moon against the natal
 * Moon comes last of all: it keys no relation and no consequence, so when
 * nothing else touches the group the dive deeper prints its concrete line
 * alone.
 */
export function rankContacts(hits: readonly TransitAspect[]): TransitAspect[] {
  const key = (h: TransitAspect): [number, number, number] => [
    h.transit === "moon" && h.natal === "moon" ? 1 : 0,
    FAST_TRANSITS.has(h.transit) ? 0 : 1,
    h.transit === h.natal ? 1 : 0,
  ];
  return hits
    .map((h, i) => ({ h, i, k: key(h) }))
    .sort((x, y) => x.k[0] - y.k[0] || x.k[1] - y.k[1] || x.k[2] - y.k[2] || x.h.orb - y.h.orb || x.i - y.i)
    .map(({ h }) => h);
}

function levelFor(hits: readonly TransitAspect[]): PressureLevel {
  if (hits.length === 0) return "quiet";
  const lead = rankContacts(hits)[0]!;
  if (lead.orb < 1.5) return "loud";
  const tensionCount = hits.filter((h) => toneOf(h.kind) === "tension").length;
  if (lead.orb < 4 && tensionCount > hits.length / 2) return "strained";
  return "quiet";
}

/**
 * Today's transits (computeTransits against the natal chart), bucketed by the
 * whole-sign house of the natal point each hit touches, in the four groups'
 * fixed order. Each hit lands in exactly one group. The day pressure module
 * and the day page's dive deeper (lib/diveDeeper.ts) read the same buckets.
 */
export function transitsByGroup(
  natalChart: Readonly<Record<Planet, Longitude>>,
  ascendant: Longitude,
  todayChart: Readonly<Record<Planet, Longitude>>,
): readonly (readonly TransitAspect[])[] {
  const houses = computeWholeSignHouses(ascendant);
  const hits = computeTransits(todayChart, natalChart);
  return HOUSE_GROUPS.map((houseNumbers) =>
    hits.filter((h) => houseNumbers.includes(houseOfLongitude(natalChart[h.natal], houses.ascendantSignIndex))),
  );
}

/**
 * Buckets today's transits by group (transitsByGroup) and composes one
 * honest sentence per group: the contact rankContacts puts first (a body
 * that moves daily before a slow one, then by orb) in the culture's own
 * aspect register when the group is live, or a plain "nothing exact" line when it
 * truly is quiet.
 */
export function dayPressure(
  natal: SavedNatal,
  todayChart: Readonly<Record<Planet, Longitude>>,
  culture: Culture,
): readonly PressureGroup[] {
  const houses = computeWholeSignHouses(natal.angles.ascendant);
  const buckets = transitsByGroup(natal.chart, natal.angles.ascendant, todayChart);
  const voiceGroups = CULTURE_VOICES[culture].houseGroups;

  return HOUSE_GROUPS.map((houseNumbers, i) => {
    const voice = voiceGroups[i] ?? { name: `GROUP ${i + 1}`, sub: "" };
    const groupHits = buckets[i] ?? [];
    const level = levelFor(groupHits);

    if (groupHits.length === 0) {
      const primaryHouse = houseNumbers[0]!;
      return {
        name: voice.name,
        sub: voice.sub,
        level,
        levelLabel: LEVEL_LABEL[level],
        orb: null,
        maxOrb: 8,
        tone: LEVEL_TONE[level],
        sentence: `Nothing exact touches your ${ordinal(primaryHouse)}.`,
        data: null,
      };
    }

    // The contact the dive deeper reads for this group (rankContacts).
    const lead = rankContacts(groupHits)[0]!;
    const tDeity = DEITY_MATRIX[culture][lead.transit];
    const nDeity = DEITY_MATRIX[culture][lead.natal];
    const verb = ASPECT_VERBS[culture][lead.kind];
    const natalHouse = houseOfLongitude(natal.chart[lead.natal], houses.ascendantSignIndex);
    const arena = getHouseMeaning(natalHouse).arena;
    const sentence = `${tDeity.name} ${verb} your ${nDeity.name} in the ${ordinal(natalHouse)}. It touches ${arena}.`;

    return {
      name: voice.name,
      sub: voice.sub,
      level,
      levelLabel: LEVEL_LABEL[level],
      orb: lead.orb,
      maxOrb: orbFor(lead.kind),
      tone: LEVEL_TONE[level],
      sentence,
      data: str("day.chart.row.data", culture, {
        planet: fmt("planet.name", lead.transit),
        aspectGlyph: ASPECT_GLYPH_OF[lead.kind],
        natalPlanet: fmt("planet.name", lead.natal),
        orb: fmt("angle.orbDecimal", lead.orb),
        tone: fmt("tone.word", lead.kind),
      }),
    };
  });
}
