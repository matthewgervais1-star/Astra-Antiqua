package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.ClassicalPlanet
import com.astra.antiqua.model.DeityRegistry

/** The deity's proper name for a culture/planet, read from the single source of truth. */
private fun deityName(culture: AncientCulture, planet: ClassicalPlanet): String =
    DeityRegistry.getDeity(culture, planet).name

object LexiconDictionary {
    val Greek = CulturalLexicon(
        dashboardTitle = "The Oracle of Delphi",
        birthChartMenu = "Thread of the Fates",
        ephemerisMenu = "The Antikythera",
        settingsTitle = "Mt. Olympus",
        culturalVoices = mapOf(
            ClassicalPlanet.SUN to "The Radiant King",
            ClassicalPlanet.MOON to "The Huntress",
            ClassicalPlanet.MERCURY to "The Messenger",
            ClassicalPlanet.VENUS to "The Rose",
            ClassicalPlanet.MARS to "The Warrior",
            ClassicalPlanet.JUPITER to "The Thunderer",
            ClassicalPlanet.SATURN to "The Chronos"
        ),
        highPriestSummaryTitle = "The Pythia's Prophecy",
        officerRole = "The Pythia",
        harmoniousAspectLabel = "Divine Harmony",
        conflictingAspectLabel = "Divine Conflict"
    )

    val Egyptian = CulturalLexicon(
        dashboardTitle = "The Hall of Ma'at",
        birthChartMenu = "Scroll of Thoth",
        ephemerisMenu = "The Decans",
        settingsTitle = "Scales of Ma'at",
        culturalVoices = mapOf(
            ClassicalPlanet.SUN to "The Lord",
            ClassicalPlanet.MOON to "The Lunar Traveler",
            ClassicalPlanet.MERCURY to "${deityName(AncientCulture.EGYPT, ClassicalPlanet.MERCURY)} (Set)",
            ClassicalPlanet.VENUS to "The Mistress of Life",
            ClassicalPlanet.MARS to deityName(AncientCulture.EGYPT, ClassicalPlanet.MARS),
            ClassicalPlanet.JUPITER to deityName(AncientCulture.EGYPT, ClassicalPlanet.JUPITER),
            ClassicalPlanet.SATURN to deityName(AncientCulture.EGYPT, ClassicalPlanet.SATURN)
        ),
        highPriestSummaryTitle = "The Weighing of the Heart",
        officerRole = "The Lector Priest",
        harmoniousAspectLabel = "The Feather of Ma'at",
        conflictingAspectLabel = "The Incursion of Isfet"
    )

    val Canaanite = CulturalLexicon(
        dashboardTitle = "The Divine Council",
        birthChartMenu = "Tablets of Destiny",
        ephemerisMenu = "The Watchers",
        settingsTitle = "Council of El",
        culturalVoices = mapOf(
            ClassicalPlanet.SUN to "The Divine Torch",
            ClassicalPlanet.MOON to "The Crescent Lord",
            ClassicalPlanet.MERCURY to "The Divine Architect",
            ClassicalPlanet.VENUS to "The Morning Star",
            ClassicalPlanet.MARS to deityName(AncientCulture.CANAAN, ClassicalPlanet.MARS),
            ClassicalPlanet.JUPITER to deityName(AncientCulture.CANAAN, ClassicalPlanet.JUPITER),
            ClassicalPlanet.SATURN to deityName(AncientCulture.CANAAN, ClassicalPlanet.SATURN)
        ),
        highPriestSummaryTitle = "The Seer's Judgment",
        officerRole = "The Diviner",
        harmoniousAspectLabel = "Formal Judgment",
        conflictingAspectLabel = "Council Deliberations"
    )

    val Carthaginian = CulturalLexicon(
        dashboardTitle = "The Decree of the Tophet",
        birthChartMenu = "Vows of Tophet",
        ephemerisMenu = "The Navigator's Sphere",
        settingsTitle = "The Suffetes",
        culturalVoices = mapOf(
            ClassicalPlanet.SUN to "The Lord of the Altar",
            ClassicalPlanet.MOON to "The Face of Baal",
            ClassicalPlanet.MERCURY to "The Herald",
            ClassicalPlanet.VENUS to "The Phoenician Queen",
            ClassicalPlanet.MARS to deityName(AncientCulture.CARTHAGE, ClassicalPlanet.MARS),
            ClassicalPlanet.JUPITER to deityName(AncientCulture.CARTHAGE, ClassicalPlanet.JUPITER),
            ClassicalPlanet.SATURN to deityName(AncientCulture.CARTHAGE, ClassicalPlanet.SATURN)
        ),
        highPriestSummaryTitle = "The Ba'al Priest's Command",
        officerRole = "The Ba'al Priest",
        harmoniousAspectLabel = "Sacrificial Demand",
        conflictingAspectLabel = "Sacrificial Demand"
    )

    val Roman = CulturalLexicon(
        dashboardTitle = "The Auspices of the Capitoline",
        birthChartMenu = "The Augur's Templum",
        ephemerisMenu = "The Fasti",
        settingsTitle = "The Forum",
        culturalVoices = mapOf(
            ClassicalPlanet.SUN to deityName(AncientCulture.ROME, ClassicalPlanet.SUN),
            ClassicalPlanet.MOON to deityName(AncientCulture.ROME, ClassicalPlanet.MOON),
            ClassicalPlanet.MERCURY to deityName(AncientCulture.ROME, ClassicalPlanet.MERCURY),
            ClassicalPlanet.VENUS to deityName(AncientCulture.ROME, ClassicalPlanet.VENUS),
            ClassicalPlanet.MARS to deityName(AncientCulture.ROME, ClassicalPlanet.MARS),
            ClassicalPlanet.JUPITER to deityName(AncientCulture.ROME, ClassicalPlanet.JUPITER),
            ClassicalPlanet.SATURN to deityName(AncientCulture.ROME, ClassicalPlanet.SATURN)
        ),
        highPriestSummaryTitle = "The Pontifex Maximus's Judgment",
        officerRole = "The Augur",
        harmoniousAspectLabel = "Favorable Auspices",
        conflictingAspectLabel = "Unfavorable Auspices"
    )
}
