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
    blurb: "Who you are at the core, and the role you take up in the world.",
  },
  moon: {
    area: "Moods & Emotions",
    blurb: "Your inner weather, your instincts, and what you need to feel safe.",
  },
  mercury: {
    area: "Mind & Communication",
    blurb: "How you think, speak, learn, and carry messages across.",
  },
  venus: {
    area: "Love & Pleasure",
    blurb: "What you find beautiful, what you value, and how you draw close.",
  },
  mars: {
    area: "Desire & Aggression",
    blurb: "How you act, pursue, push, and contend; what you fight for.",
  },
  jupiter: {
    area: "Growth & Meaning",
    blurb: "Where you expand, where you trust, and what you take on faith.",
  },
  saturn: {
    area: "Duty & Limits",
    blurb: "Where you meet responsibility, weight, time, and the long discipline.",
  },
};

export const ASCENDANT_AREA: PlanetArea = {
  area: "First Impressions",
  blurb: "The face you lead with, and how you come across before you speak.",
};
