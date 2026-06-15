package com.astra.antiqua.domain

import com.astra.antiqua.model.ClassicalPlanet

data class CulturalLexicon(
    val dashboardTitle: String,
    val birthChartMenu: String,
    val ephemerisMenu: String,
    val settingsTitle: String,
    val culturalVoices: Map<ClassicalPlanet, String>,
    val highPriestSummaryTitle: String,
    val officerRole: String,
    val harmoniousAspectLabel: String = "Divine Harmony",
    val conflictingAspectLabel: String = "Divine Conflict",
    val aspectFraming: String = "The alignment of the stars"
) {
    fun getOfficerName(planet: ClassicalPlanet, deityName: String): String {
        val voice = culturalVoices[planet] ?: "The Servant"
        return "$voice of $deityName"
    }
}
