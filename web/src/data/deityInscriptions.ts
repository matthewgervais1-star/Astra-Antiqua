import type { Culture, Planet } from "@/data/cultures";

/**
 * A hand-written inscription for each of the 50 deities: one or two lines that
 * say what this specific god IS, drawn from its own mythology and written in
 * its pantheon's register, the way a museum places a line of text beside a
 * carved figure. This is the line that sits under the deity name in a natal
 * reading; the sign, the degree, and the per-sign meaning are shown around it,
 * so the inscription is free to be pure myth rather than a placement formula.
 *
 * Grounded in the same primary-source notes that fix the deity mappings (see
 * deities.ts). No two share a cadence; none is a template.
 */
export const DEITY_INSCRIPTIONS: Readonly<Record<Culture, Readonly<Record<Planet, string>>>> = {
  egypt: {
    sun: "Ra sails the day in the barque of a million years, and at dusk goes down to fight the serpent in the dark so that morning can come at all.",
    moon: "Khonsu counts the months and rules the nights; the calendar walks wherever he walks, and time answers to his measure.",
    mercury: "Sebegu is the star Egypt gave to Set, a quick and restless fire at the edge of order, the cunning that works best in the red land.",
    venus: "Isis crosses as the morning star and returns as the evening, gathering what was scattered and binding the broken back into one body.",
    mars: "Horus the Red rises on the horizon in his fighting aspect, the falcon that fixes its eye on a war it has already decided to win.",
    jupiter: "Amun the Hidden moves unseen behind all things, and when he wears the sun as Amun-Ra there is no greater king among the gods.",
    saturn: "Geb is the earth itself, and his back bears everything raised upon it; his shifting is the earthquake, his patience the slow law of time.",
    uranus: "Nut arches over the earth on fingertips and toes, swallowing the sun each dusk and bearing it again each dawn; her children were born on the five days Thoth won from the moon, days outside the year entirely.",
    neptune: "Nun is the dark water that was everything before the first mound rose; his arms lift the sun's barque out of the deep at dawn, and at the end of days his water is all that remains.",
    pluto: "Osiris was drowned, dismembered, and gathered back together by Isis; now he presides in the Duat, where each heart is weighed against the feather before him.",
  },
  greece: {
    sun: "Apollo draws the bow of light and speaks the oracle that cannot be unsaid; whatever he shines on is held to its true shape.",
    moon: "Artemis runs the night woods with her hounds, answerable to no husband and no king, lit only by the moon she carries.",
    mercury: "Hermes slips through every door the other gods cannot, carrying word up to Olympus and the newly dead down to the dark.",
    venus: "Aphrodite, risen from the sea-foam, turns heads and topples cities; no god and no mortal is exempt from the pull of her.",
    mars: "Ares is the joy and the horror of the battlefield itself, the one Olympian his own family cannot bring themselves to love.",
    jupiter: "Zeus holds the thunderbolt and the scales of fate; a single nod from him settles what the whole council cannot.",
    saturn: "Cronus, who swallowed his children sooner than be overthrown, keeps the oldest debt: all that grows is reaped, all that begins must end.",
    uranus: "Ouranos was the first sky and the first king, until Kronos waited in ambush with the sickle his mother forged; from that one cut came the Furies, the Giants, and Aphrodite out of the sea-foam.",
    neptune: "Poseidon carries the trident that splits ships and shakes cities off their footings; Odysseus paid ten years on the water for the blinding of one son.",
    pluto: "Plouton keeps the house every mortal enters and none leaves twice; the grain and the silver under the earth are his, and the Greeks said Wealth rather than speak his older name.",
  },
  canaan: {
    sun: "Shapash crosses the sky as herald of the divine council, and each night descends to carry the dead and judge among them.",
    moon: "Yarikh lights the night and pays the bride-price for Nikkal; the city of the moon was named for the god who keeps it.",
    mercury: "Kothar-wa-Khasis forges the weapons that win the gods their wars and speaks the incantations that make those weapons strike true.",
    venus: "Astarte, Queen of Heaven, is desire and war in a single body, rising as the morning star and going down as the evening.",
    mars: "Resheph looses his arrows of plague and battle into the living world; where they fall, the strong are laid as low as the weak.",
    jupiter: "Baal Hadad rides the storm clouds and breaks the drought with his thunder; his rain is the whole distance between famine and life.",
    saturn: "El, Father of Years, presides from his mountain at the source of the waters, and the council holds its breath for his ancient word.",
    uranus: "Shamem stands in the god-lists of Ugarit as Heaven itself, paired with Earth and owed offerings of its own; the council convenes beneath a power no god made and none commands.",
    neptune: "Yammu, Prince Sea and Judge River, demanded the kingship before the assembled gods; Baal struck him down with the two maces Kothar forged, and the sea has never withdrawn its claim.",
    pluto: "Motu opens a gullet with one lip to the earth and one to the sky, and Baal himself goes down it; Anat cleaves him, winnows him, burns him, grinds him, and sows him in the fields, and still death comes back.",
  },
  carthage: {
    sun: "Semes is the old solar force carried west out of Tyre, the same sun that burned over Phoenicia now standing watch above a new city.",
    moon: "Tanit, the face of heaven over Carthage, wears the crescent above the disc; the city's fortune rises and wanes as she does.",
    mercury: "Sakun guides the trader through open water and foreign ports, the steady hand the Phoenicians trusted on the long sea-roads.",
    venus: "Astarte, Lady of the Sea, blesses the marriage bed and the war-fleet alike; in Carthage both love and naval power are hers.",
    mars: "Melqart, champion of the city, burns on his pyre each year and wakes again from the ash; the Greeks saw their Heracles in his labors.",
    jupiter: "Baal Hammon, lord of the Carthaginian sky, presides as father over the gods of the city that Rome would one day learn to fear.",
    saturn: "Baal Hammon, in his eldest aspect, keeps the turning of the agricultural year, the ancient one who must be given everything he is owed.",
    uranus: "Baal Shamem holds the open sky over Tyre and every harbor west of it; when a treaty is sworn, his name is set first among the witnesses.",
    neptune: "Yam is the water under every keel out of Carthage; he carries a fleet to Gades in one season and swallows it whole in the next.",
    pluto: "Mot waits at the bottom of the old Phoenician account of the world; the cosmogony has living things first stirring in his mud, and to his keeping every one of them returns.",
  },
  rome: {
    sun: "Sol drives the chariot of the day and rises each dawn undefeated; the Empire made his unconquered light a god of the state.",
    moon: "Luna drives her two-horse chariot across the dark, taking up the sky that Sol lays down at every dusk.",
    mercury: "Mercurius carries the message, closes the bargain, and walks the dead to the threshold; nothing in transit slips past him.",
    venus: "Venus, mother of the Roman line through Aeneas, makes alliances out of desire and a whole people out of love.",
    mars: "Mars, father of Romulus and guardian of the legions, takes the field for Rome itself; the year's first campaigns open in his name.",
    jupiter: "Iuppiter Optimus Maximus holds the Capitoline and the thunderbolt, and on his name the Republic swore every oath that mattered.",
    saturn: "Saturnus ruled the lost Golden Age and keeps the turning of the year; once each winter he frees the city into Saturnalia, then takes it back.",
    uranus: "Caelus spreads the canopy of heaven above gods and armies alike; Saturnus is counted his son, and every bird the augur reads flies through his house.",
    neptune: "Neptunus keeps the springs, the rivers, and the sea Rome learned to rule; at the Neptunalia in high summer the city raises him huts of branches against the drought.",
    pluto: "Dis Pater holds court below with Proserpina beside him; his altar in the Campus Martius stays buried until the Secular Games return, and no living Roman sees those Games twice.",
  },
};

/** The mythic inscription for a single deity. */
export function getDeityInscription(culture: Culture, planet: Planet): string {
  return DEITY_INSCRIPTIONS[culture][planet];
}
