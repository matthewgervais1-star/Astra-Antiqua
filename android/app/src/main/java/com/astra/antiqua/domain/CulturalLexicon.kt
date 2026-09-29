package com.astra.antiqua.domain

import com.astra.antiqua.model.Planet

data class CulturalLexicon(
    val dashboardTitle: String,
    val birthChartMenu: String,
    val ephemerisMenu: String,
    val settingsTitle: String,
    // A function rather than a `Map` so each culture's definition (see
    // LexiconDictionary) is forced to be an exhaustive `when` on
    // Planet: a planet missing its cultural voice is a compile
    // error instead of the old `map[planet] ?: "The Servant"` fallback,
    // which silently produced wrong copy for any lookup miss.
    val culturalVoices: (Planet) -> String,
    val highPriestSummaryTitle: String,
    val officerRole: String,
    val harmoniousAspectLabel: String = "Divine Harmony",
    val conflictingAspectLabel: String = "Divine Conflict",
    val aspectFraming: String = "The alignment of the stars",
    // The OracleDecreeCard's first-person "decree" line, composed at render
    // time from the deity's name (DeityRegistry) and the placement's sign
    // rather than authored per (culture, planet, sign) -- the 420-record
    // shape this migration retires. One template per culture, not per
    // placement: Phase 3 of the rollout plan is architecture, not voice; the
    // per-culture prose pass is Phase 5/6 territory.
    val decreeLine: (deityName: String, signName: String) -> String,
    // DashboardViewModel's high-priest summary, ported verbatim from the
    // hardcoded `when (culture)` block it used to hold (docs/shared-content
    // -model.md's sixth per-culture copy site) so the per-culture UI
    // vocabulary lives in exactly one place, alongside dashboardTitle et al.
    val highPriestSummary: (sunSign: String, moonSign: String) -> String
) {
    fun getOfficerName(planet: Planet, deityName: String): String {
        val voice = culturalVoices(planet)
        return "$voice of $deityName"
    }
}
