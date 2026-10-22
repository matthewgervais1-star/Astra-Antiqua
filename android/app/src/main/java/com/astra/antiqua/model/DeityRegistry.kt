package com.astra.antiqua.model

/**
 * Single source of truth for deity identities across all five ancient cultures.
 *
 * One [Deity] per (culture x planet) pair, the Android equivalent of web's
 * `DEITY_MATRIX` (`web/src/data/deities.ts`). Other Android components
 * (`data/DeityManager`, `domain/LexiconDictionary`) should read deity names
 * and epithets from here rather than hardcoding their own copies.
 *
 * [getDeity] is an exhaustive `when` on [AncientCulture] nested around an
 * exhaustive `when` on [Planet] rather than a `Map` read via
 * `getValue()`: a (culture, planet) pair missing its `Deity` is now a
 * compile error instead of a runtime `NoSuchElementException`, and adding a
 * new culture or planet forces every branch to be updated before the module
 * compiles.
 */
object DeityRegistry {
    // Every entry is ported verbatim from web's DEITIES
    // (web/src/data/deities.ts), the source of truth for deity content per
    // docs/shared-content-model.md. Do not edit names or epithets here
    // without changing the web side first.
    fun getDeity(culture: AncientCulture, planet: Planet): Deity = when (culture) {
        AncientCulture.EGYPT -> when (planet) {
            Planet.SUN -> Deity("Ra", "The Creator and King")
            Planet.MOON -> Deity("Khonsu", "The Traveller")
            Planet.MERCURY -> Deity("Sebegu", "Aspect of Set")
            Planet.VENUS -> Deity("Isis", "The One Who Crosses")
            Planet.MARS -> Deity("Horus the Red", "God of the Horizon")
            Planet.JUPITER -> Deity("Amun", "He Who Limits the Two Lands")
            Planet.SATURN -> Deity("Geb", "Father of the Earth")
            Planet.URANUS -> Deity("Nut", "the vault of stars, whose five stolen days stand outside the year")
            Planet.NEPTUNE -> Deity("Nun", "the water before the world, still standing beneath every river")
            Planet.PLUTO -> Deity("Osiris", "the murdered king enthroned below, green with returning grain")
        }
        AncientCulture.GREECE -> when (planet) {
            Planet.SUN -> Deity("Helios", "Who Sees All Things")
            Planet.MOON -> Deity("Selene", "The Moon Herself")
            Planet.MERCURY -> Deity("Hermes", "The Messenger")
            Planet.VENUS -> Deity("Aphrodite", "Goddess of Love")
            Planet.MARS -> Deity("Ares", "God of War")
            Planet.JUPITER -> Deity("Zeus", "King of Olympus")
            Planet.SATURN -> Deity("Kronos", "Father of Time")
            Planet.URANUS -> Deity("Ouranos", "the first sky, unthroned by his own son's sickle")
            Planet.NEPTUNE -> Deity("Poseidon", "earth-shaker, the sea that sets its own price for every crossing")
            Planet.PLUTO -> Deity("Plouton", "the host below, called Wealth because none dared say Death")
        }
        AncientCulture.CANAAN -> when (planet) {
            Planet.SUN -> Deity("Shapash", "Luminary of the Deities")
            Planet.MOON -> Deity("Yarikh", "Lord of the Night")
            Planet.MERCURY -> Deity("Kothar", "Skilled and Wise")
            Planet.VENUS -> Deity("Attart", "Queen of Heaven")
            Planet.MARS -> Deity("Resheph", "Lord of the Arrow")
            Planet.JUPITER -> Deity("Baal Hadad", "Rider of the Clouds")
            Planet.SATURN -> Deity("El", "Father of Years")
            Planet.URANUS -> Deity("Shamem", "the heavens themselves, sudden as weather off the sea")
            Planet.NEPTUNE -> Deity("Yammu", "Prince Sea, the dissolving flood that tests every shore")
            Planet.PLUTO -> Deity("Motu", "Death the swallower, before whom even Baal goes down and returns")
        }
        AncientCulture.CARTHAGE -> when (planet) {
            Planet.SUN -> Deity("Semes", "The Solar Force")
            Planet.MOON -> Deity("Tanit", "Dea Caelestis")
            Planet.MERCURY -> Deity("Sakun", "The Guide")
            Planet.VENUS -> Deity("Astarte", "Lady of the Sea")
            Planet.MARS -> Deity("Melqart", "Protector of Tyre")
            Planet.JUPITER -> Deity("Baal Hammon", "Lord of the Sky")
            Planet.SATURN -> Deity("Baal Hammon", "The Ancient One")
            Planet.URANUS -> Deity("Baal Shamem", "Lord of the Heavens, first witness named when the city swears")
            Planet.NEPTUNE -> Deity("Yam", "the sea itself, the partner every voyage out of Carthage signs with")
            Planet.PLUTO -> Deity("Mot", "Death the creditor, in whose ledger every living name is entered")
        }
        AncientCulture.ROME -> when (planet) {
            Planet.SUN -> Deity("Sol", "The Unconquered")
            Planet.MOON -> Deity("Luna", "Driver of the Night-Chariot")
            Planet.MERCURY -> Deity("Mercurius", "Lord of Exchange")
            Planet.VENUS -> Deity("Venus", "Genetrix, Mother of the Race")
            Planet.MARS -> Deity("Mars", "Father of the Legions")
            Planet.JUPITER -> Deity("Iuppiter", "Optimus Maximus, Best and Greatest")
            Planet.SATURN -> Deity("Saturnus", "King of the Golden Age")
            Planet.URANUS -> Deity("Caelus", "father of Saturn, the canopy under which every auspice is taken")
            Planet.NEPTUNE -> Deity("Neptunus", "lord of all waters, from the field-spring to the open sea")
            Planet.PLUTO -> Deity("Dis Pater", "the Rich Father below, to whom the last census always reports")
        }
    }

    fun getDeitiesFor(culture: AncientCulture): Map<Planet, Deity> =
        Planet.values().associateWith { planet -> getDeity(culture, planet) }
}
