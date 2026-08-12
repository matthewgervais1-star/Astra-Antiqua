export const CULTURES = ["egypt", "greece", "canaan", "carthage", "rome"] as const;
export type Culture = (typeof CULTURES)[number];

export const PLANETS = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;
export type Planet = (typeof PLANETS)[number];

/** The three modern bodies, invisible to the naked eye, that every culture on
 *  this surface receives into its own mythic register rather than pretends
 *  its ancients named. See deities.ts for the per-culture receptions. */
export const RECEIVED_BODIES = ["uranus", "neptune", "pluto"] as const;
export type ReceivedBody = (typeof RECEIVED_BODIES)[number];

export function isReceived(planet: Planet): planet is ReceivedBody {
  return (RECEIVED_BODIES as readonly string[]).includes(planet);
}

export const CULTURE_LABELS: Readonly<Record<Culture, string>> = {
  egypt: "Egypt",
  greece: "Greece",
  canaan: "Canaan",
  carthage: "Carthage",
  rome: "Rome",
};

export const CULTURE_TAGLINES: Readonly<Record<Culture, string>> = {
  egypt: "The Hall of Ma'at",
  greece: "The Oracle of Delphi",
  canaan: "The Divine Council",
  carthage: "The Decree of the Council",
  rome: "The Sibylline Books",
};

export const CULTURE_SUBTITLES: Readonly<Record<Culture, string>> = {
  egypt: "Memphis. Thebes. The voyage of the solar barque.",
  greece: "Delphi. Alexandria. The planets and the four elements.",
  canaan: "Ugarit. The Baal cycle. The council at the mountain.",
  carthage: "Qart-hadasht. The suffetes and the Council. The line that ran from Tyre.",
  rome: "The Capitoline. The auspices. The names that still order the week.",
};

export const PLANET_LABELS: Readonly<Record<Planet, string>> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
};

export const PLANET_SYMBOLS: Readonly<Record<Planet, string>> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
};

export function isCulture(value: string): value is Culture {
  return (CULTURES as readonly string[]).includes(value);
}
