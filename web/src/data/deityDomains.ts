import type { Culture, Planet } from "@/data/cultures";

/**
 * What each body governs in the reader's own life, said plainly in the
 * second person and in the culture's own nouns. The decree's meaning sentence
 * joins two of these ("{domain A} and {domain B} {relation}"), so every entry
 * has to read naturally as the subject of every relation. The instructions are
 * written per headline body, each for its own domain, so no domain sits in an
 * object slot.
 *
 * Lowercase-initial by design; the composer capitalises one that opens a
 * sentence. No entry repeats across cultures: the five-voice check reads the
 * meaning sentence, and a shared domain would make two cultures rhyme.
 */
export const DEITY_DOMAINS: Readonly<Record<Culture, Readonly<Record<Planet, string>>>> = {
  egypt: {
    sun: "your day's work",
    moon: "your moods",
    mercury: "your letters",
    venus: "your beloved",
    mars: "your temper",
    jupiter: "your patrons",
    saturn: "your duties",
    uranus: "your plans for the new season",
    neptune: "your dreams",
    pluto: "what you have buried",
  },
  greece: {
    sun: "your name in the city",
    moon: "your household",
    mercury: "your errands",
    venus: "your desire",
    mars: "your fighting strength",
    jupiter: "your standing with the powerful",
    saturn: "your old obligations",
    uranus: "your sudden notions",
    neptune: "your wandering thoughts",
    pluto: "your hidden wealth",
  },
  canaan: {
    sun: "your daily labor",
    moon: "your kin at home",
    mercury: "your handiwork",
    venus: "your love",
    mars: "your hot blood",
    jupiter: "your harvest",
    saturn: "your elders' rules",
    uranus: "your change of pasture",
    neptune: "your prayers",
    pluto: "your family's land",
  },
  carthage: {
    sun: "your credit in the harbor",
    moon: "your household accounts",
    mercury: "your contracts",
    venus: "your pleasure fund",
    mars: "your war chest",
    jupiter: "your profits",
    saturn: "your fixed dues",
    uranus: "your new routes",
    neptune: "your sea voyages",
    pluto: "the debts you inherited",
  },
  rome: {
    sun: "your good name",
    moon: "your household affairs",
    mercury: "your dispatches",
    venus: "your courtship",
    mars: "your campaign",
    jupiter: "your run for office",
    saturn: "your treasury",
    uranus: "your reforms",
    neptune: "your days at the baths",
    pluto: "your inheritance",
  },
};
