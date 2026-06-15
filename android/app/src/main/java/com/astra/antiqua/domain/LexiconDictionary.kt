package com.astra.antiqua.domain

import com.astra.antiqua.model.ClassicalPlanet

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
            ClassicalPlanet.MERCURY to "Sebegu (Set)",
            ClassicalPlanet.VENUS to "The Mistress of Life",
            ClassicalPlanet.MARS to "Horus the Red",
            ClassicalPlanet.JUPITER to "Amun",
            ClassicalPlanet.SATURN to "Geb"
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
            ClassicalPlanet.MARS to "Resheph",
            ClassicalPlanet.JUPITER to "Baal Hadad",
            ClassicalPlanet.SATURN to "El"
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
            ClassicalPlanet.MARS to "Melqart",
            ClassicalPlanet.JUPITER to "Baal Hammon",
            ClassicalPlanet.SATURN to "Baal Hammon"
        ),
        highPriestSummaryTitle = "The Ba'al Priest's Command",
        officerRole = "The Ba'al Priest",
        harmoniousAspectLabel = "Sacrificial Demand",
        conflictingAspectLabel = "Sacrificial Demand"
    )
}
