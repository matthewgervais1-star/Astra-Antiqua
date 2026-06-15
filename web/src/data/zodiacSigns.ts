import type { ZodiacSign } from "@/data/sampleChart";

/**
 * Reference data for the twelve zodiac signs: the standard tropical date range
 * (the Sun's ingress shifts by about a day year to year; these are the usual
 * bounds), element, modality, a few trait words, a one-line image, and a
 * stylized hand-authored constellation drawn as a polyline through `points`
 * (0..100 viewBox, y down). No external imagery; the figures are our own.
 */
export interface ZodiacSignInfo {
  sign: ZodiacSign;
  symbol: string;
  dates: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  traits: string;
  blurb: string;
  points: ReadonlyArray<readonly [number, number]>;
}

export const ZODIAC_SIGN_INFO: readonly ZodiacSignInfo[] = [
  {
    sign: "Aries",
    symbol: "♈",
    dates: "March 21 to April 19",
    element: "Fire",
    modality: "Cardinal",
    traits: "Bold, headlong, first",
    blurb: "The ram that charges before it counts the cost; the spark that starts the fire.",
    points: [[15, 72], [35, 60], [55, 52], [72, 46], [82, 58]],
  },
  {
    sign: "Taurus",
    symbol: "♉",
    dates: "April 20 to May 20",
    element: "Earth",
    modality: "Fixed",
    traits: "Steady, sensuous, immovable",
    blurb: "The bull in its pasture; slow to move, impossible to push, content in the body.",
    points: [[14, 42], [34, 56], [52, 62], [70, 54], [88, 40]],
  },
  {
    sign: "Gemini",
    symbol: "♊",
    dates: "May 21 to June 20",
    element: "Air",
    modality: "Mutable",
    traits: "Quick, curious, many-voiced",
    blurb: "The twins, the crossing wind; two minds at once, never quite at rest.",
    points: [[28, 24], [30, 76], [50, 74], [48, 26], [70, 28], [72, 72]],
  },
  {
    sign: "Cancer",
    symbol: "♋",
    dates: "June 21 to July 22",
    element: "Water",
    modality: "Cardinal",
    traits: "Tender, guarded, tidal",
    blurb: "The crab in its shell; soft within, armored without, ruled by the moon's pull.",
    points: [[50, 74], [50, 48], [32, 30], [50, 48], [68, 30]],
  },
  {
    sign: "Leo",
    symbol: "♌",
    dates: "July 23 to August 22",
    element: "Fire",
    modality: "Fixed",
    traits: "Proud, warm, radiant",
    blurb: "The lion at noon; made to be seen, generous when adored, sullen when ignored.",
    points: [[20, 40], [34, 30], [50, 30], [62, 40], [64, 56], [80, 66]],
  },
  {
    sign: "Virgo",
    symbol: "♍",
    dates: "August 23 to September 22",
    element: "Earth",
    modality: "Mutable",
    traits: "Precise, useful, exacting",
    blurb: "The gleaner at harvest; sorts the grain from the chaff, and is hard on both.",
    points: [[16, 38], [34, 46], [50, 42], [64, 52], [80, 46], [86, 64]],
  },
  {
    sign: "Libra",
    symbol: "♎",
    dates: "September 23 to October 22",
    element: "Air",
    modality: "Cardinal",
    traits: "Fair, paired, weighing",
    blurb: "The scales; forever balancing, reluctant to settle, at its best in partnership.",
    points: [[30, 42], [50, 28], [70, 42], [78, 60], [50, 28], [22, 60]],
  },
  {
    sign: "Scorpio",
    symbol: "♏",
    dates: "October 23 to November 21",
    element: "Water",
    modality: "Fixed",
    traits: "Intense, deep, unrelenting",
    blurb: "The scorpion at the desert's edge; goes to the bottom of things and does not forget.",
    points: [[16, 32], [32, 40], [48, 44], [62, 52], [74, 66], [84, 58], [78, 46]],
  },
  {
    sign: "Sagittarius",
    symbol: "♐",
    dates: "November 22 to December 21",
    element: "Fire",
    modality: "Mutable",
    traits: "Free, seeking, far-ranging",
    blurb: "The archer's high road; aims past the horizon, restless wherever it is held.",
    points: [[18, 66], [40, 52], [60, 42], [78, 32], [64, 28], [78, 32], [74, 48]],
  },
  {
    sign: "Capricorn",
    symbol: "♑",
    dates: "December 22 to January 19",
    element: "Earth",
    modality: "Cardinal",
    traits: "Patient, climbing, enduring",
    blurb: "The goat's ascent; takes the long way up and is still climbing when the rest have stopped.",
    points: [[18, 40], [40, 32], [62, 44], [80, 60], [50, 66], [30, 56]],
  },
  {
    sign: "Aquarius",
    symbol: "♒",
    dates: "January 20 to February 18",
    element: "Air",
    modality: "Fixed",
    traits: "Contrary, inventive, distant",
    blurb: "The poured waters; pledged to the idea over the person, the future over the room.",
    points: [[14, 48], [28, 38], [40, 52], [54, 40], [68, 54], [82, 42]],
  },
  {
    sign: "Pisces",
    symbol: "♓",
    dates: "February 19 to March 20",
    element: "Water",
    modality: "Mutable",
    traits: "Dreaming, porous, merciful",
    blurb: "The deep tide; the edges of the self dissolve, and everything flows in.",
    points: [[20, 30], [34, 46], [48, 40], [34, 46], [50, 64], [68, 58], [82, 72]],
  },
];
