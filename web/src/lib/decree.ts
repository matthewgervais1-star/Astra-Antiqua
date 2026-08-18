import { type Culture, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { ASPECT_RULINGS } from "@/data/aspectRulings";
import {
  computeAspects,
  longitudeToSign,
  type AspectKind,
  type Longitude,
} from "@/data/sampleChart";
import { ASPECT_IMPERATIVES, QUIET_LINE, composeAspectSentence } from "@/lib/weekReading";

/**
 * The day's decree, composed entirely from the culture's own banks: deity
 * names, aspect verbs, rulings, and imperatives. Nothing here is shared
 * prose; the five-voice check reads the same sky five ways with no common
 * sentence. The universal interpretation layer still exists, but it speaks
 * on the placement pages, not in the decree.
 */
export interface DayDecree {
  headline: string;
  paragraphs: readonly string[];
  tone: "harmony" | "tension" | "quiet";
}

/** Daily weather comes from bodies that move daily; slow-slow pairs hold
 * their orb for months and belong to the season, the year, and the long
 * transits instead. */
const FAST_BODIES: ReadonlySet<Planet> = new Set(["sun", "moon", "mercury", "venus", "mars"]);

const SIGN_PHRASE: Readonly<Record<string, string>> = {
  Aries: "THE RAM",
  Taurus: "THE BULL",
  Gemini: "THE TWINS",
  Cancer: "THE CRAB",
  Leo: "THE LION",
  Virgo: "THE MAIDEN",
  Libra: "THE SCALES",
  Scorpio: "THE SCORPION",
  Sagittarius: "THE ARCHER",
  Capricorn: "THE GOAT",
  Aquarius: "THE WATER-BEARER",
  Pisces: "THE FISHES",
};

/** Paired against QUIET_LINE, which prints directly beneath it: no headline
 *  here may reuse a word the body line already carries. */
const QUIET_HEADLINE: Readonly<Record<Culture, string>> = {
  egypt: "THE SCALE RESTS LEVEL",
  greece: "THE TRIPOD IS COLD",
  canaan: "THE COUNCIL FLOOR IS EMPTY",
  carthage: "NOTHING IS POSTED",
  rome: "A DAY WITHOUT OMEN",
};

/**
 * Closes the decree when the sky offers no second figure worth a paragraph.
 * The old fallback printed QUIET_LINE here, which flatly contradicted the
 * paragraph above it, and the old candidate fallback could print the same
 * aspect kind twice and so repeat its imperative word for word.
 */
const NO_SECOND_FIGURE: Readonly<Record<Culture, string>> = {
  egypt: "Nothing else on the river stands close enough to weigh. One matter goes on the scale today. Set the rest of it aside.",
  greece: "No second shrine has anything to add to this. Carry the one answer out and do not go back up for another.",
  canaan: "No other business reaches the floor behind it. Close it here and go down to the field.",
  carthage: "The ink is spent on this one and nowhere else. Rule off beneath it and leave the sheet at that.",
  rome: "No second sign stands beside it. Act on the one omen and let the rest of the day alone.",
};

function toneForKind(kind: AspectKind): "harmony" | "tension" {
  return kind === "square" || kind === "opposition" ? "tension" : "harmony";
}

export function composeDecree(
  culture: Culture,
  chart: Readonly<Record<Planet, Longitude>>,
): DayDecree {
  const candidates = computeAspects(chart)
    .filter((a) => FAST_BODIES.has(a.a) || FAST_BODIES.has(a.b))
    .sort((a, b) => a.orb - b.orb);

  const top = candidates[0];
  if (!top) {
    return {
      headline: QUIET_HEADLINE[culture],
      paragraphs: [QUIET_LINE[culture]],
      tone: "quiet",
    };
  }

  const deityA = DEITY_MATRIX[culture][top.a].name;
  const deityB = DEITY_MATRIX[culture][top.b].name;
  const verb = ASPECT_VERBS[culture][top.kind];
  const signClause =
    top.kind === "conjunction" ? ` IN ${SIGN_PHRASE[longitudeToSign(chart[top.a]).sign]}` : "";
  const headline = `${deityA} ${verb} ${deityB}${signClause}`.toUpperCase();

  const first = [
    composeAspectSentence(culture, top.a, top.b, top.kind, top.orb < 0.5, chart),
    ASPECT_RULINGS[culture][top.kind],
    ASPECT_IMPERATIVES[culture][top.kind],
  ].join(" ");

  // A second figure only earns its paragraph if it speaks in a different
  // aspect kind. Falling back to the next-tightest candidate regardless of
  // kind reprinted ASPECT_IMPERATIVES[culture][kind] verbatim under the
  // paragraph that had just used it, which is the template seam itself.
  const second = candidates.find(
    (a) => (a.a !== top.a || a.b !== top.b) && a.kind !== top.kind,
  );
  const paragraphs = second
    ? [
        first,
        [
          composeAspectSentence(culture, second.a, second.b, second.kind, second.orb < 0.5, chart, 1),
          ASPECT_IMPERATIVES[culture][second.kind],
        ].join(" "),
      ]
    : [first, NO_SECOND_FIGURE[culture]];

  return { headline, paragraphs, tone: toneForKind(top.kind) };
}
