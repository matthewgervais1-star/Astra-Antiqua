import { test } from "node:test";
import assert from "node:assert/strict";
import { composeDayPage } from "@/lib/decree";
import { composeDiveDeeperForDay } from "@/lib/diveDeeper";
import { DIVE_DEEPER_BANKS } from "@/data/diveDeeperBanks";
import { DEITY_DOMAINS } from "@/data/deityDomains";
import { CULTURES, type Culture } from "@/data/cultures";

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

/** Egypt's river family, one image however it is named. */
const RIVER = new Set(["riverbank", "riverbed", "nile", "bank", "shore", "water", "ferry", "ferryman", "downstream", "upstream"]);

function stemOf(culture: Culture, word: string): string | null {
  const vocab = new Set(IMAGE_WORDS[culture]);
  const t = word.toLowerCase().replace(/'s$/, "");
  for (const s of [t, t.replace(/s$/, ""), t.replace(/es$/, ""), t.replace(/ing$/, ""), t.replace(/ed$/, ""), t.replace(/d$/, "")]) {
    if (culture === "egypt" && RIVER.has(s)) return "river";
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
