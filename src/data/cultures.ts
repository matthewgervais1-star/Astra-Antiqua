export const CULTURES = ["egypt", "greece", "canaan", "carthage"] as const;
export type Culture = (typeof CULTURES)[number];

export const PLANETS = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
] as const;
export type Planet = (typeof PLANETS)[number];

export const CULTURE_LABELS: Readonly<Record<Culture, string>> = {
  egypt: "Egypt",
  greece: "Greece",
  canaan: "Canaan",
  carthage: "Carthage",
};

export const CULTURE_TAGLINES: Readonly<Record<Culture, string>> = {
  egypt: "The Hall of Ma'at",
  greece: "The Oracle of Delphi",
  canaan: "The Divine Council",
  carthage: "The Decree of the Tophet",
};

export const CULTURE_SUBTITLES: Readonly<Record<Culture, string>> = {
  egypt: "Memphis. Thebes. The voyage of the solar barque.",
  greece: "Delphi. Alexandria. The seven planets and the four elements.",
  canaan: "Ugarit. The Baal cycle. The council at the mountain.",
  carthage: "Qart-hadasht. The Tophet. The line that ran from Tyre.",
};

export const PLANET_LABELS: Readonly<Record<Planet, string>> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
};

export const PLANET_SYMBOLS: Readonly<Record<Planet, string>> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
};

export function isCulture(value: string): value is Culture {
  return (CULTURES as readonly string[]).includes(value);
}

export function isPlanet(value: string): value is Planet {
  return (PLANETS as readonly string[]).includes(value);
}
