import type { Planet } from "@/data/cultures";

/**
 * The Co-Star-style legend: each classical planet (and the Ascendant) keyed to
 * the area of life it governs. This is the inverse of lifeDomains.ts, which
 * groups planets under daily domains; here each planet owns one category, for a
 * reference legend on the chart and the learn page. Universal across pantheons
 * (the deity is the mask; the governed area is the underlying principle).
 */
export interface PlanetArea {
  area: string;
  blurb: string;
}

export const PLANET_AREAS: Readonly<Record<Planet, PlanetArea>> = {
  sun: {
    area: "Identity & Self",
    blurb:
      "The core of who you are: your will, your purpose, and the self you most want seen. Where the Sun falls in your chart is where you need to shine, take the lead, and feel genuinely alive.",
  },
  moon: {
    area: "Moods & Emotions",
    blurb:
      "Your inner life: feeling, instinct, memory, and what you need in order to feel safe. The fastest-moving of the seven, the Moon governs how you comfort yourself and the emotional weather you carry under the face you show the world.",
  },
  mercury: {
    area: "Mind & Communication",
    blurb:
      "The mind in motion: how you think, learn, speak, and connect one idea to the next. Mercury rules curiosity and every kind of exchange, from a quick message to the hard conversation, and shows the voice you reach for when you need to be understood.",
  },
  venus: {
    area: "Love & Pleasure",
    blurb:
      "What you love and how you love it: beauty, affection, pleasure, and worth. Venus rules attraction and the way you draw people and comforts toward you; its placement shows what you value and where you look for harmony.",
  },
  mars: {
    area: "Desire & Drive",
    blurb:
      "Your drive and your edge: how you act, pursue, compete, and defend yourself. Mars is energy, courage, anger, and desire, the force that turns wanting into doing; its placement shows how you chase what you want and how you handle a fight.",
  },
  jupiter: {
    area: "Growth & Fortune",
    blurb:
      "The planet of expansion: growth, opportunity, optimism, and meaning. Jupiter shows where life opens up for you, what you believe in, and the luck you tend to find when you take a chance, along with the risk of reaching too far.",
  },
  saturn: {
    area: "Duty & Limits",
    blurb:
      "The planet of structure and time: discipline, responsibility, limits, and the slow work that lasts. Saturn shows where life asks you to grow up, where mastery has to be earned rather than handed over, and the foundations you build that actually hold.",
  },
};

export const ASCENDANT_AREA: PlanetArea = {
  area: "First Impressions",
  blurb:
    "The sign that was rising on the eastern horizon at your birth: the mask you lead with and the first impression you make before you say a word. It also sets the frame of the houses, so it shapes how every other planet in your chart plays out.",
};
