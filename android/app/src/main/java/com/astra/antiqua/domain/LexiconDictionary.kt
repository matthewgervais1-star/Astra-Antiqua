package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import com.astra.antiqua.model.DeityRegistry

/** The deity's proper name for a culture/planet, read from the single source of truth. */
private fun deityName(culture: AncientCulture, planet: Planet): String =
    DeityRegistry.getDeity(culture, planet).name

object LexiconDictionary {
    val Greek = CulturalLexicon(
        highPriestSummaryTitle = "The Pythia's Prophecy",
        officerRole = "The Pythia",
        decreeLine = { deityName, signName ->
            "I am $deityName, and this hour born under $signName is read and sealed by my hand."
        },
        highPriestSummary = { sunSign, moonSign ->
            "The threads of history converge in your alignment. With the Sun in $sunSign, you carry the ancestral fire of command. Yet, the Moon in $moonSign whispers of a fate bound to the deep, silent waters of power. You are a bridge between the old world and the coming storm."
        }
    )

    val Egyptian = CulturalLexicon(
        highPriestSummaryTitle = "The Weighing of the Heart",
        officerRole = "The Lector Priest",
        decreeLine = { deityName, signName ->
            "I, $deityName, have decreed it: this hour born under $signName is weighed and found written in Ma'at's record."
        },
        highPriestSummary = { sunSign, moonSign ->
            "The scales of Ma'at find balance in your alignment. The Sun in $sunSign manifest the creative spark, while the Moon in $moonSign flows through the fertile banks of your fate. You are the architect of divine order against the rising chaos."
        }
    )

    val Canaanite = CulturalLexicon(
        highPriestSummaryTitle = "The Seer's Judgment",
        officerRole = "The Diviner",
        decreeLine = { deityName, signName ->
            "I, $deityName, speak from the council: this hour born under $signName is entered into the tablets of destiny."
        },
        highPriestSummary = { sunSign, moonSign ->
            "The Divine Council has spoken. With the Sun in $sunSign, El the Father of Years has marked your path with sovereign fire. The Moon in $moonSign binds you to Yarikh's silent tide. You walk between storm and stillness, chosen of the assembly."
        }
    )

    val Carthaginian = CulturalLexicon(
        highPriestSummaryTitle = "The Ba'al Priest's Command",
        officerRole = "The Ba'al Priest",
        decreeLine = { deityName, signName ->
            "I, $deityName, post this decree at the Tophet: the hour born under $signName belongs to the city, and the city collects."
        },
        highPriestSummary = { sunSign, moonSign ->
            "The Decree is absolute. With the Sun in $sunSign, your life is a territory claimed by the Suffete. The Moon in $moonSign demands the sacrifice of your hesitation. Bow to the cosmic authority of the Ba'al Priest; power is the reward for the disciplined soul."
        }
    )

    val Roman = CulturalLexicon(
        highPriestSummaryTitle = "The Pontifex Maximus's Judgment",
        officerRole = "The Augur",
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
