import type { Planet } from "@/data/cultures";

export type LifeDomain = "family" | "friends" | "love" | "work" | "body";

export interface LifeDomainSpec {
  id: LifeDomain;
  label: string;
  kicker: string; // shorter chip label
  description: string;
  /** Planets whose placements and aspects feed this domain's reading. */
  planets: readonly Planet[];
}

export const LIFE_DOMAINS: readonly LifeDomainSpec[] = [
  {
    id: "body",
    label: "Body & feeling",
    kicker: "Body",
    description: "What the body knows before language; the inner weather.",
    planets: ["moon", "pluto"],
  },
  {
    id: "love",
    label: "Love & pull",
    kicker: "Love",
    description: "What draws you toward, and what you push back against.",
    planets: ["venus", "mars", "neptune"],
  },
  {
    id: "friends",
    label: "Friends & exchange",
    kicker: "Friends",
    description: "The crossings of edges, the shared message, the wider room.",
    planets: ["mercury", "jupiter", "uranus"],
  },
  {
    id: "work",
    label: "Work & endurance",
    kicker: "Work",
    description: "What asks for sustained effort; what holds shape over time.",
    planets: ["mars", "saturn", "uranus", "pluto"],
  },
  {
    id: "family",
    label: "Family & shelter",
    kicker: "Family",
    description: "The roots, the threshold, the people you carry whether you chose them or not.",
    planets: ["moon", "saturn", "neptune"],
  },
];
