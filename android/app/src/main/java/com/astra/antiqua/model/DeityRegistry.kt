package com.astra.antiqua.model

/**
 * Single source of truth for deity identities across all five ancient cultures.
 *
 * One [Deity] per (culture x planet) pair — the Android equivalent of web's
 * `DEITY_MATRIX` (`web/src/data/deities.ts`). Other Android components
 * (`data/DeityManager`, `domain/LexiconDictionary`) should read deity names
 * and epithets from here rather than hardcoding their own copies.
 */
object DeityRegistry {
    // Every entry is ported verbatim from web's DEITIES
    // (web/src/data/deities.ts), the source of truth for deity content per
    // docs/shared-content-model.md. Do not edit names or epithets here
    // without changing the web side first.
    private val registry: Map<AncientCulture, Map<ClassicalPlanet, Deity>> = mapOf(
        AncientCulture.EGYPT to mapOf(
            ClassicalPlanet.SUN to Deity("Ra", "The Creator and King"),
            ClassicalPlanet.MOON to Deity("Khonsu", "The Traveller"),
            ClassicalPlanet.MERCURY to Deity("Sebegu", "Aspect of Set"),
            ClassicalPlanet.VENUS to Deity("Isis", "The One Who Crosses"),
            ClassicalPlanet.MARS to Deity("Horus the Red", "God of the Horizon"),
            ClassicalPlanet.JUPITER to Deity("Amun", "He Who Limits the Two Lands"),
            ClassicalPlanet.SATURN to Deity("Geb", "Father of the Earth")
        ),
        AncientCulture.GREECE to mapOf(
            ClassicalPlanet.SUN to Deity("Apollo", "God of Light"),
            ClassicalPlanet.MOON to Deity("Artemis", "The Huntress"),
            ClassicalPlanet.MERCURY to Deity("Hermes", "The Messenger"),
            ClassicalPlanet.VENUS to Deity("Aphrodite", "Goddess of Love"),
            ClassicalPlanet.MARS to Deity("Ares", "God of War"),
            ClassicalPlanet.JUPITER to Deity("Zeus", "King of Olympus"),
            ClassicalPlanet.SATURN to Deity("Cronus", "Father of Time")
        ),
        AncientCulture.CANAAN to mapOf(
            ClassicalPlanet.SUN to Deity("Shapash", "Luminary of the Deities"),
            ClassicalPlanet.MOON to Deity("Yarikh", "Lord of the Night"),
            ClassicalPlanet.MERCURY to Deity("Kothar-wa-Khasis", "The Skilled Craftsman"),
            ClassicalPlanet.VENUS to Deity("Astarte", "Queen of Heaven"),
            ClassicalPlanet.MARS to Deity("Resheph", "Lord of the Arrow"),
            ClassicalPlanet.JUPITER to Deity("Baal Hadad", "Rider of the Clouds"),
            ClassicalPlanet.SATURN to Deity("El", "Father of Years")
        ),
        AncientCulture.CARTHAGE to mapOf(
            ClassicalPlanet.SUN to Deity("Semes", "The Solar Force"),
            ClassicalPlanet.MOON to Deity("Tanit", "Dea Caelestis"),
            ClassicalPlanet.MERCURY to Deity("Sakun", "The Guide"),
            ClassicalPlanet.VENUS to Deity("Astarte", "Lady of the Sea"),
            ClassicalPlanet.MARS to Deity("Melqart", "Protector of Tyre"),
            ClassicalPlanet.JUPITER to Deity("Baal Hammon", "Lord of the Sky"),
            ClassicalPlanet.SATURN to Deity("Baal Hammon", "The Ancient One")
        ),
        AncientCulture.ROME to mapOf(
            ClassicalPlanet.SUN to Deity("Sol", "The Unconquered"),
            ClassicalPlanet.MOON to Deity("Luna", "Driver of the Night-Chariot"),
            ClassicalPlanet.MERCURY to Deity("Mercurius", "Lord of Exchange"),
            ClassicalPlanet.VENUS to Deity("Venus", "Genetrix, Mother of the Race"),
            ClassicalPlanet.MARS to Deity("Mars", "Father of the Legions"),
            ClassicalPlanet.JUPITER to Deity("Iuppiter", "Optimus Maximus, Best and Greatest"),
            ClassicalPlanet.SATURN to Deity("Saturnus", "King of the Golden Age")
        )
    )

    fun getDeity(culture: AncientCulture, planet: ClassicalPlanet): Deity =
        registry.getValue(culture).getValue(planet)

    fun getDeitiesFor(culture: AncientCulture): Map<ClassicalPlanet, Deity> =
        registry.getValue(culture)
}
