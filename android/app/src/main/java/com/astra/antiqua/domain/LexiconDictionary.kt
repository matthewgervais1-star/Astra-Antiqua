package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import com.astra.antiqua.model.DeityRegistry

/** The deity's proper name for a culture/planet, read from the single source of truth. */
private fun deityName(culture: AncientCulture, planet: Planet): String =
    DeityRegistry.getDeity(culture, planet).name

object LexiconDictionary {
    val Greek = CulturalLexicon(
        dashboardTitle = "The Oracle of Delphi",
        birthChartMenu = "Thread of the Fates",
        ephemerisMenu = "The Antikythera",
        settingsTitle = "Mt. Olympus",
        culturalVoices = { planet ->
            when (planet) {
                Planet.SUN -> "The Radiant King"
                Planet.MOON -> "The Night Rider"
                Planet.MERCURY -> "The Messenger"
                Planet.VENUS -> "The Rose"
                Planet.MARS -> "The Warrior"
                Planet.JUPITER -> "The Thunderer"
                Planet.SATURN -> "The Father of Time"
                Planet.URANUS -> "The Elder Sky"
                Planet.NEPTUNE -> "The Earth-Shaker"
                Planet.PLUTO -> "The Host Below"
            }
        },
        highPriestSummaryTitle = "The Pythia's Prophecy",
        officerRole = "The Pythia",
        harmoniousAspectLabel = "Divine Harmony",
        conflictingAspectLabel = "Divine Conflict",
        decreeLine = { deityName, signName ->
            "I am $deityName, and this hour born under $signName is read and sealed by my hand."
        },
        highPriestSummary = { sunSign, moonSign ->
            "The threads of history converge in your alignment. With the Sun in $sunSign, you carry the ancestral fire of command. Yet, the Moon in $moonSign whispers of a fate bound to the deep, silent waters of power. You are a bridge between the old world and the coming storm."
        }
    )

    val Egyptian = CulturalLexicon(
        dashboardTitle = "The Hall of Ma'at",
        birthChartMenu = "Scroll of Thoth",
        ephemerisMenu = "The Decans",
        settingsTitle = "Scales of Ma'at",
        culturalVoices = { planet ->
            when (planet) {
                Planet.SUN -> "The Lord"
                Planet.MOON -> "The Lunar Traveler"
                Planet.MERCURY -> "${deityName(AncientCulture.EGYPT, Planet.MERCURY)} (Set)"
                Planet.VENUS -> "The Mistress of Life"
                Planet.MARS -> deityName(AncientCulture.EGYPT, Planet.MARS)
                Planet.JUPITER -> deityName(AncientCulture.EGYPT, Planet.JUPITER)
                Planet.SATURN -> deityName(AncientCulture.EGYPT, Planet.SATURN)
                Planet.URANUS -> "The Star-Vault"
                Planet.NEPTUNE -> "The First Water"
                Planet.PLUTO -> "The King Below"
            }
        },
        highPriestSummaryTitle = "The Weighing of the Heart",
        officerRole = "The Lector Priest",
        harmoniousAspectLabel = "The Feather of Ma'at",
        conflictingAspectLabel = "The Incursion of Isfet",
        decreeLine = { deityName, signName ->
            "I, $deityName, have decreed it: this hour born under $signName is weighed and found written in Ma'at's record."
        },
        highPriestSummary = { sunSign, moonSign ->
            "The scales of Ma'at find balance in your alignment. The Sun in $sunSign manifest the creative spark, while the Moon in $moonSign flows through the fertile banks of your fate. You are the architect of divine order against the rising chaos."
        }
    )

    val Canaanite = CulturalLexicon(
        dashboardTitle = "The Divine Council",
        birthChartMenu = "Tablets of Destiny",
        ephemerisMenu = "The Watchers",
        settingsTitle = "Council of El",
        culturalVoices = { planet ->
            when (planet) {
                Planet.SUN -> "The Divine Torch"
                Planet.MOON -> "The Crescent Lord"
                Planet.MERCURY -> "The Divine Architect"
                Planet.VENUS -> "The Morning Star"
                Planet.MARS -> deityName(AncientCulture.CANAAN, Planet.MARS)
                Planet.JUPITER -> deityName(AncientCulture.CANAAN, Planet.JUPITER)
                Planet.SATURN -> deityName(AncientCulture.CANAAN, Planet.SATURN)
                Planet.URANUS -> "The Open Heavens"
                Planet.NEPTUNE -> "The Prince of Sea"
                Planet.PLUTO -> "The Swallower"
            }
        },
        highPriestSummaryTitle = "The Seer's Judgment",
        officerRole = "The Diviner",
        harmoniousAspectLabel = "Formal Judgment",
        conflictingAspectLabel = "Council Deliberations",
        decreeLine = { deityName, signName ->
            "I, $deityName, speak from the council: this hour born under $signName is entered into the tablets of destiny."
        },
        highPriestSummary = { sunSign, moonSign ->
            "The Divine Council has spoken. With the Sun in $sunSign, El the Father of Years has marked your path with sovereign fire. The Moon in $moonSign binds you to Yarikh's silent tide. You walk between storm and stillness, chosen of the assembly."
        }
    )

    val Carthaginian = CulturalLexicon(
        dashboardTitle = "The Decree of the Tophet",
        birthChartMenu = "Vows of Tophet",
        ephemerisMenu = "The Navigator's Sphere",
        settingsTitle = "The Suffetes",
        culturalVoices = { planet ->
            when (planet) {
                Planet.SUN -> "The Lord of the Altar"
                Planet.MOON -> "The Face of Baal"
                Planet.MERCURY -> "The Herald"
                Planet.VENUS -> "The Phoenician Queen"
                Planet.MARS -> deityName(AncientCulture.CARTHAGE, Planet.MARS)
                Planet.JUPITER -> deityName(AncientCulture.CARTHAGE, Planet.JUPITER)
                Planet.SATURN -> deityName(AncientCulture.CARTHAGE, Planet.SATURN)
                Planet.URANUS -> "The Witness Above"
                Planet.NEPTUNE -> "The Sea-Partner"
                Planet.PLUTO -> "The Creditor"
            }
        },
        highPriestSummaryTitle = "The Ba'al Priest's Command",
        officerRole = "The Ba'al Priest",
        harmoniousAspectLabel = "Sacrificial Demand",
        conflictingAspectLabel = "Sacrificial Demand",
        decreeLine = { deityName, signName ->
            "I, $deityName, post this decree at the Tophet: the hour born under $signName belongs to the city, and the city collects."
        },
        highPriestSummary = { sunSign, moonSign ->
            "The Decree is absolute. With the Sun in $sunSign, your life is a territory claimed by the Suffete. The Moon in $moonSign demands the sacrifice of your hesitation. Bow to the cosmic authority of the Ba'al Priest; power is the reward for the disciplined soul."
        }
    )

    val Roman = CulturalLexicon(
        dashboardTitle = "The Auspices of the Capitoline",
        birthChartMenu = "The Augur's Templum",
        ephemerisMenu = "The Fasti",
        settingsTitle = "The Forum",
        culturalVoices = { planet ->
            when (planet) {
                Planet.SUN -> deityName(AncientCulture.ROME, Planet.SUN)
                Planet.MOON -> deityName(AncientCulture.ROME, Planet.MOON)
                Planet.MERCURY -> deityName(AncientCulture.ROME, Planet.MERCURY)
                Planet.VENUS -> deityName(AncientCulture.ROME, Planet.VENUS)
                Planet.MARS -> deityName(AncientCulture.ROME, Planet.MARS)
                Planet.JUPITER -> deityName(AncientCulture.ROME, Planet.JUPITER)
                Planet.SATURN -> deityName(AncientCulture.ROME, Planet.SATURN)
                Planet.URANUS -> "The Elder Canopy"
                Planet.NEPTUNE -> "The Lord of Waters"
                Planet.PLUTO -> "The Rich Father"
            }
        },
        highPriestSummaryTitle = "The Pontifex Maximus's Judgment",
        officerRole = "The Augur",
        harmoniousAspectLabel = "Favorable Auspices",
        conflictingAspectLabel = "Unfavorable Auspices",
        decreeLine = { deityName, signName ->
            "I, $deityName, pronounce this augury: the hour born under $signName is favorable, and the Republic takes note."
        },
        highPriestSummary = { sunSign, moonSign ->
            "Roma Aeterna records your fate in her annals. With the Sun in $sunSign, Jupiter Optimus Maximus grants you the auctoritas to command. The Moon in $moonSign binds you to Juno's watchful counsel. You stand in the Forum of destiny, heir to an empire of will."
        }
    )

    /**
     * The single AncientCulture -> CulturalLexicon mapping that remains after
     * this migration: `ui/theme/Theme.kt` (LocalLexicon), `DashboardViewModel`
     * (the high-priest summary and, via NatalReadingComposer, the decree
     * line), and anywhere else that needs a culture's vocabulary all read it
     * from here instead of each keeping its own `when`.
     */
    fun forCulture(culture: AncientCulture): CulturalLexicon = when (culture) {
        AncientCulture.GREECE -> Greek
        AncientCulture.EGYPT -> Egyptian
        AncientCulture.CANAAN -> Canaanite
        AncientCulture.CARTHAGE -> Carthaginian
        AncientCulture.ROME -> Roman
    }
}
