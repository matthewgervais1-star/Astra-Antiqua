import type { Culture, Planet } from "@/data/cultures";
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
  /** The tightest hit's orb, for the OrbBar; null when the group is
   *  genuinely empty (nothing in orb touches it today). */
  orb: number | null;
  maxOrb: number;
  tone: OrbTone;
  sentence: string;
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

function levelFor(hits: readonly TransitAspect[]): PressureLevel {
  if (hits.length === 0) return "quiet";
  const sorted = [...hits].sort((a, b) => a.orb - b.orb);
  const tightest = sorted[0]!;
  if (tightest.orb < 1.5) return "loud";
  const tensionCount = hits.filter((h) => toneOf(h.kind) === "tension").length;
  if (tightest.orb < 4 && tensionCount > hits.length / 2) return "strained";
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
 * honest sentence per group: the tightest hit in the culture's own aspect
 * register when the group is live, or a plain "nothing exact" line when it
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
      };
    }

    const tightest = [...groupHits].sort((a, b) => a.orb - b.orb)[0]!;
    const tDeity = DEITY_MATRIX[culture][tightest.transit];
    const nDeity = DEITY_MATRIX[culture][tightest.natal];
    const verb = ASPECT_VERBS[culture][tightest.kind];
    const natalHouse = houseOfLongitude(natal.chart[tightest.natal], houses.ascendantSignIndex);
    const arena = getHouseMeaning(natalHouse).arena;
    const sentence = `${tDeity.name} ${verb} your ${nDeity.name} in the ${ordinal(natalHouse)}. It touches ${arena}.`;

    return {
      name: voice.name,
      sub: voice.sub,
      level,
      levelLabel: LEVEL_LABEL[level],
      orb: tightest.orb,
      maxOrb: orbFor(tightest.kind),
      tone: LEVEL_TONE[level],
      sentence,
    };
  });
}
