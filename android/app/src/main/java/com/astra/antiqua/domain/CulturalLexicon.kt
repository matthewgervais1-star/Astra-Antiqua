package com.astra.antiqua.domain

import com.astra.antiqua.model.ClassicalPlanet

data class CulturalLexicon(
    val dashboardTitle: String,
    val birthChartMenu: String,
    val ephemerisMenu: String,
    val settingsTitle: String,
    // A function rather than a `Map` so each culture's definition (see
    // LexiconDictionary) is forced to be an exhaustive `when` on
    // ClassicalPlanet: a planet missing its cultural voice is a compile
    // error instead of the old `map[planet] ?: "The Servant"` fallback,
    // which silently produced wrong copy for any lookup miss.
    val culturalVoices: (ClassicalPlanet) -> String,
    val highPriestSummaryTitle: String,
    val officerRole: String,
    val harmoniousAspectLabel: String = "Divine Harmony",
    val conflictingAspectLabel: String = "Divine Conflict",
    val aspectFraming: String = "The alignment of the stars"
) {
    fun getOfficerName(planet: ClassicalPlanet, deityName: String): String {
        val voice = culturalVoices(planet)
        return "$voice of $deityName"
    }
}
