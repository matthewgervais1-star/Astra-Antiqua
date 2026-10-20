import type { Culture, Planet } from "@/data/cultures";

/**
 * What each god brings before its institution: a short noun phrase in the
 * culture's own nouns. The week's ingress line reads the crossing god's
 * charge into its frame (data/ingressFrames.ts), so the line changes with
 * the body that moved. The day page's decree speaks through the plainer
 * domains in data/deityDomains.ts instead.
 *
 * Lowercase-initial by design; the frame that uses one capitalises it when it
 * opens the sentence. No phrase here may be moved to another culture without
 * rewriting it, which is the five-voice check in miniature.
 */
export const DEITY_CHARGES: Readonly<Record<Culture, Readonly<Record<Planet, string>>>> = {
  egypt: {
    sun: "the day's own course",
    moon: "the count of the months",
    mercury: "the storm off the red land",
    venus: "the gathering of the limbs",
    mars: "the falcon's harpoon",
    jupiter: "the hidden king's hand",
    saturn: "the weight of the ground itself",
    uranus: "the gap of five days outside the year",
    neptune: "the dark water under everything",
    pluto: "the green grain of the Duat",
  },
  greece: {
    sun: "the eye that misses no deed",
    moon: "the light borrowed from Helios",
    mercury: "the word carried through the door",
    venus: "the girdle that turns every head",
    mars: "the slaughter looking for a field",
    jupiter: "the nod that shakes Olympus",
    saturn: "the sickle's one question",
    uranus: "the sky unthroned in one stroke",
    neptune: "the ground that will not hold still",
    pluto: "the silver under the earth",
  },
  canaan: {
    sun: "the herald's message brought down from the sky",
    moon: "the bride price paid by moonlight",
    mercury: "the mace forged for Baal's hand",
    venus: "the armed morning star",
    mars: "the arrow of plague in flight",
    jupiter: "the rain that decides the harvest",
    saturn: "the word from the tent at the source of the rivers",
    uranus: "the offering owed to Heaven itself",
    neptune: "the sea's claim to the throne",
    pluto: "the open gullet of death",
  },
  carthage: {
    sun: "the Tyrian sun over the new city",
    moon: "the dedication cut into the stele beneath the crescent",
    mercury: "the guide's landfall on a foreign shore",
    venus: "the war fleet launched under the Lady of the Sea",
    mars: "the champion's yearly tithe to Tyre",
    jupiter: "the horned lord of the gods",
    saturn: "the whole of the Ancient One's due",
    uranus: "the foremost name in the city's oath",
    neptune: "the partner of every hull out of Carthage",
    pluto: "the debt that outlives the debtor",
  },
  rome: {
    sun: "the unconquered light",
    moon: "the chariot of the moon",
    mercury: "the bargain struck in the market",
    venus: "the marriage of two houses",
    mars: "the shield of the Salii",
    jupiter: "the thunderbolt from the Alban Mount",
    saturn: "the treasury at the Capitol's foot",
    uranus: "the canopy over every army",
    neptune: "the failing spring at the Neptunalia",
    pluto: "the altar buried at the Tarentum",
  },
};
