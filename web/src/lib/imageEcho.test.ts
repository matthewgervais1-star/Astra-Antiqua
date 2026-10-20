import { test } from "node:test";
import assert from "node:assert/strict";
import { composeDayPage, dayFigures } from "@/lib/decree";
import { composeDiveDeeperForDay } from "@/lib/diveDeeper";
import { DIVE_DEEPER_BANKS } from "@/data/diveDeeperBanks";
import { DEITY_DOMAINS } from "@/data/deityDomains";
import { CULTURES, PLANETS, type Culture, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { BASE_440C3AB } from "@/lib/imageEcho.fixture";
import { composeFigurePage, composeSpanFigure, figureId, type FigureAnatomy, type NatalPoints } from "@/lib/figureReading";
import { computeChart } from "@/lib/ephemeris";
import { FIGURE_BANKS } from "@/data/figureBanks";
import { ASPECT_RULES, ZODIAC_SIGNS } from "@/data/sampleChart";
import { signPhraseProse } from "@/components/transits/spanDisplay";
import type { SlowBody } from "@/data/transitSpine";

/**
 * Each culture's image words: the institution's nouns its banks draw on. A
 * reader who meets one twice on a page hears the bank repeat itself. Stems are
 * folded (scribe and scribe's, door and doors, cross and crossing), and for
 * Egypt every river word counts as the river.
 */
const IMAGE_WORDS: Readonly<Record<Culture, readonly string[]>> = {
  egypt: [
    "river", "cross", "procession", "scribe", "door", "tally", "rival", "court", "scale", "ink", "crown", "sledge", "seal", "roll",
    "boat", "barge", "barque", "oar", "sail", "harpoon", "granary", "grain", "emmer", "reed", "papyrus", "sheet", "rope",
    "lamp", "balance", "beam", "pan", "feather", "flood", "canal", "dike", "field", "hall", "gate", "bread", "beer",
    "overseer", "foreman", "hippopotamus", "cistern", "wind", "temple", "shrine", "bolt", "plumb", "cord", "mudbrick",
    "brick", "stone", "ration", "jar", "oil", "mat", "lotus", "pool", "pylon", "chapel", "altar", "offering", "table",
    "hymn", "amulet", "tomb", "priest", "watchman", "boatman", "chisel", "linen", "clay", "threshing", "messenger",
  ],
  greece: [
    "agora", "road", "oracle", "pythia", "shrine", "door", "hearth", "tripod", "herm", "wine", "symposium", "herald",
    "shield", "spear", "phalanx", "crossroad", "delphi", "silver", "coin", "assembly", "table", "field", "threshold",
    "guest", "stranger", "krater", "apple", "laurel", "gymnasium", "pnyx", "andron",
  ],
  canaan: [
    "gate", "council", "elder", "floor", "tent", "field", "threshing", "well", "plow", "cistern", "cedar", "beam", "peg",
    "stone", "forge", "bow", "arrow", "harvest", "sheaf", "sheaves", "bread", "lamp", "window", "palace", "bench", "seat",
    "door", "table", "feast", "olive", "fig", "flock", "caravan", "horn", "terrace", "wedding", "bride",
  ],
  carthage: [
    "ship", "harbor", "cargo", "contract", "book", "clerk", "quay", "chest", "captain", "entry", "page", "door",
    "balance", "seal", "berth", "tyre", "coin", "route", "stele", "fleet", "tithe", "column", "purse", "shekel", "sail",
    "ledger", "warehouse", "loan", "table", "temple", "altar", "wind", "precinct", "courtyard", "lock", "amphora",
    "amphorae", "purple", "moneychanger",
  ],
  rome: [
    "forum", "dispatch", "augur", "shrine", "door", "senate", "auspice", "camp", "atrium", "client", "dinner",
    "magistrate", "vote", "gate", "road", "river", "bench", "couch", "treasury", "legion", "eagle", "courier", "garland",
    "omen", "crossing", "shield", "cake", "capitol", "lares", "praetor", "rostra", "curia", "insula", "triclinium",
    "gladius", "spear",
  ],
};

/** Egypt's river family, one image however it is named: its banks, its water, its current and its flood. */
const RIVER = new Set([
  "riverbank", "riverbed", "nile", "bank", "shore", "water", "ferry", "ferryman", "downstream", "upstream", "current",
  "stream", "flood", "flow",
]);
/** Ma'at's scale is one image whether the line names the scale, the balance, its beam or a pan. */
const SCALE = new Set(["scale", "balance", "beam", "pan"]);
/** The messenger and the message he carries are one image. */
const MESSAGE = new Set(["messenger", "message"]);

function stemOf(culture: Culture, word: string): string | null {
  const vocab = new Set(IMAGE_WORDS[culture]);
  const t = word.toLowerCase().replace(/'s$/, "");
  for (const s of [t, t.replace(/s$/, ""), t.replace(/es$/, ""), t.replace(/ing$/, ""), t.replace(/ed$/, ""), t.replace(/d$/, "")]) {
    if (culture === "egypt" && RIVER.has(s)) return "river";
    if (culture === "egypt" && SCALE.has(s)) return "scale";
    if (culture === "egypt" && MESSAGE.has(s)) return "messenger";
    if (vocab.has(s)) return s;
  }
  return null;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, (m) => `\\${m}`);

/**
 * The image words of a line. Two kinds of words are not the bank's echo and
 * are taken out first: the group names the dive deeper always prints in its
 * titles and names again in its pointer line ("the Ferry", "the Sealed
 * Shrine"); the titles themselves are not read at all. And the domains
 * ("your credit in the harbor"), which every meaning sentence names by design.
 */
function imageWords(culture: Culture, line: string): string[] {
  const labels = [
    ...DIVE_DEEPER_BANKS[culture].titles.map((t) => t.split(":")[0]!.replace(/^The /, "")),
    ...Object.values(DEITY_DOMAINS[culture]),
  ].sort((a, b) => b.length - a.length);
  const bare = labels.reduce((l, label) => l.replace(new RegExp(escape(label), "gi"), ""), line);
  return (bare.match(/[A-Za-z']+/g) ?? []).map((w) => stemOf(culture, w)).filter((s): s is string => s !== null);
}

function repeats(culture: Culture, lines: readonly string[]): string[] {
  const seen = new Map<string, number>();
  for (const line of lines) for (const w of imageWords(culture, line)) seen.set(w, (seen.get(w) ?? 0) + 1);
  return [...seen].filter(([, n]) => n > 1).map(([w, n]) => `${w} x${n}`);
}

const DAY_MS = 86_400_000;
const YEAR_2026 = Array.from({ length: 365 }, (_, i) => new Date(Date.UTC(2026, 0, 1) + i * DAY_MS));

/** The day paragraph (headline and its five sentences), and the dive deeper's sentences, read without a chart. */
function page(culture: Culture, date: Date): { paragraph: string[]; dive: string[] } {
  const decree = composeDayPage(culture, date);
  return {
    paragraph: [decree.headline, ...decree.sentences],
    dive: composeDiveDeeperForDay(culture, date, null).groups.flatMap((g) => g.sentences),
  };
}

test("over 2026, an Egypt page names each image once: in the paragraph, and with its dive deeper", () => {
  for (const date of YEAR_2026) {
    const { paragraph, dive } = page("egypt", date);
    const day = date.toISOString().slice(0, 10);
    assert.deepEqual(repeats("egypt", paragraph), [], `${day} paragraph: ${paragraph.join(" ")}`);
    assert.deepEqual(repeats("egypt", [...paragraph, ...dive]), [], `${day} with the dive deeper: ${[...paragraph, ...dive].join(" ")}`);
  }
});

test("over 2026, no culture's sentence names one image twice", () => {
  for (const culture of CULTURES) {
    for (const date of YEAR_2026) {
      const { paragraph, dive } = page(culture, date);
      for (const line of [...paragraph, ...dive]) assert.deepEqual(repeats(culture, [line]), [], `${culture}: ${line}`);
    }
  }
});

/**
 * Content words, for the Egypt paragraph check and the page ratchet. A word
 * counts when it has three letters or more and is not on the stop-list below.
 * Stems are folded ('s, plural s and es, ies to y, ed, ing) and a few
 * irregular forms are mapped to their base (sent to send, stood to stand,
 * messenger to message), so stand and stands, end and ends, step and steps,
 * send and sent, message and messenger are one word.
 *
 * Not counted: god names (the evidence and the second figure name them by
 * design), the domains (every meaning sentence names two), the dive deeper's
 * group names, the reader-address words (your, yours, yourself, you), and
 * function words. The stop-list is the controller's list (your through while)
 * extended only with function words: the three-letter ones (the, and, for,
 * but, not, are, was, its, his, her, our, all, can, any, has, had, out, off,
 * who, how, too, yet, nor, own, him, she), "one" as the determiner and
 * pronoun it is in every Egypt line that uses it ("one task", "ride as one",
 * "pick one"), the determiners some, every and both, the auxiliaries would,
 * should, could, been, were and being, the prepositions about, over, under,
 * until and down, and the pronouns whoever, someone, something, nothing,
 * anything and everyone. Content words such as same, side, way, path, place,
 * step, stand, end and send are counted, and so are back, once and again.
 */
const STOP = new Set([
  "your", "yours", "yourself", "you", "with", "that", "this", "they", "their", "them", "when", "then", "have", "will",
  "what", "into", "from", "each", "other", "more", "than", "before", "after", "only", "also", "does", "done", "there",
  "here", "where", "while",
  "the", "and", "for", "but", "not", "are", "was", "its", "his", "her", "our", "all", "can", "any", "has", "had", "out",
  "off", "who", "how", "too", "yet", "nor", "own", "him", "she", "one",
  "some", "would", "should", "could", "been", "were", "being", "every", "about", "over", "under", "until",
  "down", "both", "whoever", "someone", "something", "nothing", "anything", "everyone",
]);
const IRREGULAR: Readonly<Record<string, string>> = {
  sent: "send", stood: "stand", held: "hold", told: "tell", brought: "bring", came: "come", gave: "give",
  took: "take", taken: "take", kept: "keep", went: "go",
  // A messenger carries a message: one word to a reader who meets both on a page.
  messenger: "message", messengers: "message",
};

/** Words that end in "ing" and are not a verb form. */
const ING_WORDS = new Set(["evening", "morning", "during", "ceiling", "string", "sibling", "landing"]);

function fold(word: string): string {
  let w = word.toLowerCase().replace(/'s$/, "").replace(/'$/, "");
  if (IRREGULAR[w]) return IRREGULAR[w]!;
  if (w.length > 4 && w.endsWith("ies")) w = `${w.slice(0, -3)}y`;
  else if (w.length > 4 && /(s|x|ch|sh)es$/.test(w)) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  if (w.length > 5 && w.endsWith("ing") && !ING_WORDS.has(w)) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
  return w;
}

function contentWords(culture: Culture, line: string): string[] {
  const labels = [
    ...DIVE_DEEPER_BANKS[culture].titles.map((t) => t.split(":")[0]!.replace(/^The /, "")),
    ...Object.values(DEITY_DOMAINS[culture]),
    ...Object.values(DEITY_MATRIX[culture]).map((d) => d.name),
  ].sort((a, b) => b.length - a.length);
  const bare = labels.reduce((l, label) => l.replace(new RegExp(`\\b${escape(label)}\\b`, "gi"), ""), line);
  return (bare.match(/[A-Za-z']+/g) ?? [])
    .filter((w) => w.replace(/'/g, "").length >= 3 && !STOP.has(w.toLowerCase().replace(/'s$/, "")))
    .map(fold)
    .filter((w) => !STOP.has(w));
}

function wordRepeats(culture: Culture, lines: readonly string[]): string[] {
  const seen = new Map<string, number>();
  for (const line of lines) for (const w of contentWords(culture, line)) seen.set(w, (seen.get(w) ?? 0) + 1);
  return [...seen].filter(([, n]) => n > 1).map(([w]) => w);
}

test("over 2026, an Egypt day paragraph uses no content word twice", () => {
  for (const date of YEAR_2026) {
    const { paragraph } = page("egypt", date);
    assert.deepEqual(wordRepeats("egypt", paragraph), [], `${date.toISOString().slice(0, 10)}: ${paragraph.join(" ")}`);
  }
});

test("over 2026, no content word repeats on more Egypt pages than it did at 440c3ab", () => {
  const days = new Map<string, number>();
  for (const date of YEAR_2026) {
    const { paragraph, dive } = page("egypt", date);
    for (const w of wordRepeats("egypt", [...paragraph, ...dive])) days.set(w, (days.get(w) ?? 0) + 1);
  }
  const counts = Object.fromEntries([...days].sort(([a], [b]) => a.localeCompare(b)));
  if (process.env.ECHO_DUMP) console.log(JSON.stringify(counts));
  const over = Object.entries(counts).filter(([w, n]) => n > (BASE_440C3AB[w] ?? 0)).map(([w, n]) => `${w} ${n} > ${BASE_440C3AB[w] ?? 0}`);
  assert.deepEqual(over, []);
});

/**
 * Every Egypt figure page prints the river twice by design: in the
 * recurrence line ("comes round on the river again") and in the section
 * title ("HOW THIS PLAYS OUT ON THE RIVER"). No other line on the page may
 * name the river family, or the page names the river a third time.
 */
function figureLines(a: FigureAnatomy & { headline: string; evidence?: string; bridge?: string | null }): string[] {
  return [
    a.headline,
    a.evidence ?? "",
    a.bridge ?? "",
    a.moveOne,
    a.moveTwo,
    ...a.parts.map((p) => p.phrase),
    a.actLine,
    ...a.manifestations,
    ...a.cards.flatMap((c) => [c.title, c.source]),
    a.lesson,
  ];
}

/** The sign names ("the Water-Bearer") are the site's labels for the zodiac, not a bank's image, and are taken out first. */
const SIGN_NAMES = ZODIAC_SIGNS.map(signPhraseProse);

const riverWords = (lines: readonly string[]): string[] =>
  lines.filter((line) => {
    const bare = SIGN_NAMES.reduce((l, sign) => l.split(sign).join(""), line);
    return (bare.match(/[A-Za-z']+/g) ?? []).some((w) => stemOf("egypt", w) === "river");
  });

test("the fixed Egypt figure-page lines name the river, and only they do", () => {
  const bank = FIGURE_BANKS.egypt;
  assert.equal(riverWords([bank.recurrenceFrame, bank.recurrenceIrregular, bank.playsOutTitle]).length, 3);
});

test("over 2026, an Egypt fast-figure page names the river only in its recurrence line and title", () => {
  const found = new Set<string>();
  for (const date of YEAR_2026) {
    const day = date.toISOString().slice(0, 10);
    for (const f of dayFigures(computeChart(date))) {
      const page = composeFigurePage("egypt", day, figureId(f), null);
      if (!page) continue;
      for (const line of riverWords(figureLines(page))) found.add(line);
    }
  }
  assert.deepEqual([...found].sort(), []);
});

test("every Egypt long-transit figure names the river only in its recurrence line and title", () => {
  const sky = computeChart(new Date(Date.UTC(2026, 0, 1)));
  const chart = {} as Record<Planet, number>;
  PLANETS.forEach((p, i) => (chart[p] = (sky[p] + 17 + i * 31) % 360));
  const natal: NatalPoints = { chart, ascendant: 200 };
  const slow: readonly SlowBody[] = ["jupiter", "saturn", "uranus", "neptune", "pluto"];
  const found = new Set<string>();
  for (const body of slow) {
    for (const { kind } of ASPECT_RULES) {
      for (const natalKey of ["sun", "moon", "asc", "mc"]) {
        const span = composeSpanFigure("egypt", { transitPlanet: body, natalKey, natalLongitude: 40, aspectKind: kind }, natal, 40, new Date(Date.UTC(2026, 5, 1)));
        for (const line of riverWords(figureLines(span))) found.add(line);
      }
    }
  }
  assert.deepEqual([...found].sort(), []);
});
