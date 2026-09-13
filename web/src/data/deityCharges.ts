import type { Culture, Planet } from "@/data/cultures";

/**
 * What each god brings before its institution: a short noun phrase in the
 * culture's own nouns, written to sit inside a sentence as a subject or an
 * object ("{charge A} lends its wind to {charge B}"). This is what ties a
 * decree's ruling to the two bodies actually in the figure, so Sun sextile
 * Mars and Moon sextile Venus can never print the same sentence.
 *
 * Lowercase-initial by design; the frame that uses one capitalises it when it
 * opens the sentence. No phrase here may be moved to another culture without
 * rewriting it, which is the five-voice check in miniature.
 */
export const DEITY_CHARGES: Readonly<Record<Culture, Readonly<Record<Planet, string>>>> = {
  egypt: {
    sun: "the day's own course",
    moon: "the count of the nights",
    mercury: "the quick fire at the edge of the field",
    venus: "what was scattered and gathered back",
    mars: "a fight already decided",
    jupiter: "the hidden king's hand",
    saturn: "the weight of the ground itself",
    uranus: "the five days outside the year",
    neptune: "the dark water under everything",
    pluto: "the verdict of the hall below",
  },
  greece: {
    sun: "what the sky has seen and will tell",
    moon: "the borrowed light",
    mercury: "the word carried through the door",
    venus: "the pull that needs no argument",
    mars: "the quarrel looking for a field",
    jupiter: "the thunder that settles it",
    saturn: "the sickle's one question",
    uranus: "the sky before there were names",
    neptune: "the ground that will not hold still",
    pluto: "the wealth kept under the floor",
  },
  canaan: {
    sun: "the messenger's report to the council",
    moon: "the lamp of the night watch",
    mercury: "the craftsman's finished work",
    venus: "the name sworn on at the altar",
    mars: "the plague-arrow already on the string",
    jupiter: "the rain that decides the harvest",
    saturn: "the old father's ruling",
    uranus: "the unnamed heavens",
    neptune: "the sea's claim to the throne",
    pluto: "the dry mouth of death",
  },
  carthage: {
    sun: "the day's sailing light",
    moon: "the vow entered under her sign",
    mercury: "the superintendent's tally",
    venus: "the cargo worth the voyage",
    mars: "the pillar the city was founded on",
    jupiter: "the store that fills",
    saturn: "the elder's due called in",
    uranus: "the weather no manifest allows for",
    neptune: "the open sea between ports",
    pluto: "the debt that outlives the debtor",
  },
  rome: {
    sun: "the day's light on the Forum",
    moon: "the night's turning",
    mercury: "the message on the road",
    venus: "the treaty sealed by desire",
    mars: "the legion in the field",
    jupiter: "the thunder on the right",
    saturn: "the old boundary stone",
    uranus: "the whole sky before augury divided it",
    neptune: "the sea the fleet must cross",
    pluto: "the store beneath the earth",
  },
};
