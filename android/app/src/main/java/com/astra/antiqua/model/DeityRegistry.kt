package com.astra.antiqua.model

/**
 * Single source of truth for deity identities across all five ancient cultures.
 *
 * One [Deity] per (culture x planet) pair — the Android equivalent of web's
 * `DEITY_MATRIX` (`web/src/data/deities.ts`). Other Android components
 * (`data/DeityManager`, `domain/LexiconDictionary`) should read deity names
 * and epithets from here rather than hardcoding their own copies.
 *
 * [getDeity] is an exhaustive `when` on [AncientCulture] nested around an
 * exhaustive `when` on [ClassicalPlanet] rather than a `Map` read via
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
    fun getDeity(culture: AncientCulture, planet: ClassicalPlanet): Deity = when (culture) {
        AncientCulture.EGYPT -> when (planet) {
            ClassicalPlanet.SUN -> Deity("Ra", "The Creator and King")
            ClassicalPlanet.MOON -> Deity("Khonsu", "The Traveller")
            ClassicalPlanet.MERCURY -> Deity("Sebegu", "Aspect of Set")
            ClassicalPlanet.VENUS -> Deity("Isis", "The One Who Crosses")
            ClassicalPlanet.MARS -> Deity("Horus the Red", "God of the Horizon")
            ClassicalPlanet.JUPITER -> Deity("Amun", "He Who Limits the Two Lands")
            ClassicalPlanet.SATURN -> Deity("Geb", "Father of the Earth")
        }
        AncientCulture.GREECE -> when (planet) {
            ClassicalPlanet.SUN -> Deity("Helios", "Who Sees All Things")
            ClassicalPlanet.MOON -> Deity("Selene", "The Moon Herself")
            ClassicalPlanet.MERCURY -> Deity("Hermes", "The Messenger")
            ClassicalPlanet.VENUS -> Deity("Aphrodite", "Goddess of Love")
            ClassicalPlanet.MARS -> Deity("Ares", "God of War")
            ClassicalPlanet.JUPITER -> Deity("Zeus", "King of Olympus")
            ClassicalPlanet.SATURN -> Deity("Kronos", "Father of Time")
        }
        AncientCulture.CANAAN -> when (planet) {
            ClassicalPlanet.SUN -> Deity("Shapash", "Luminary of the Deities")
            ClassicalPlanet.MOON -> Deity("Yarikh", "Lord of the Night")
            ClassicalPlanet.MERCURY -> Deity("Kothar", "Skilled and Wise")
            ClassicalPlanet.VENUS -> Deity("Attart", "Queen of Heaven")
            ClassicalPlanet.MARS -> Deity("Resheph", "Lord of the Arrow")
            ClassicalPlanet.JUPITER -> Deity("Baal Hadad", "Rider of the Clouds")
            ClassicalPlanet.SATURN -> Deity("El", "Father of Years")
        }
        AncientCulture.CARTHAGE -> when (planet) {
            ClassicalPlanet.SUN -> Deity("Semes", "The Solar Force")
            ClassicalPlanet.MOON -> Deity("Tanit", "Dea Caelestis")
            ClassicalPlanet.MERCURY -> Deity("Sakun", "The Guide")
            ClassicalPlanet.VENUS -> Deity("Astarte", "Lady of the Sea")
            ClassicalPlanet.MARS -> Deity("Melqart", "Protector of Tyre")
            ClassicalPlanet.JUPITER -> Deity("Baal Hammon", "Lord of the Sky")
            ClassicalPlanet.SATURN -> Deity("Baal Hammon", "The Ancient One")
        }
        AncientCulture.ROME -> when (planet) {
            ClassicalPlanet.SUN -> Deity("Sol", "The Unconquered")
            ClassicalPlanet.MOON -> Deity("Luna", "Driver of the Night-Chariot")
            ClassicalPlanet.MERCURY -> Deity("Mercurius", "Lord of Exchange")
            ClassicalPlanet.VENUS -> Deity("Venus", "Genetrix, Mother of the Race")
            ClassicalPlanet.MARS -> Deity("Mars", "Father of the Legions")
            ClassicalPlanet.JUPITER -> Deity("Iuppiter", "Optimus Maximus, Best and Greatest")
            ClassicalPlanet.SATURN -> Deity("Saturnus", "King of the Golden Age")
        }
    }

    fun getDeitiesFor(culture: AncientCulture): Map<ClassicalPlanet, Deity> =
        ClassicalPlanet.values().associateWith { planet -> getDeity(culture, planet) }
}
