package com.astra.antiqua.domain

/**
 * Android-only vocabulary from before the shared catalog. The ruled table
 * (docs/design/shared-strings-table-2026-11.md, "Android-only vocabulary")
 * drops every field: dashboardTitle (the catalog's common.institution now),
 * the three menu names, culturalVoices and the two aspect labels are gone.
 * The four left feed the old Day sections below Sky Day and the unreached
 * MainDashboardScreen; they go when the Chart screen takes web's SUMMARY_*
 * (deferred, plan Task 7).
 */
data class CulturalLexicon(
    val highPriestSummaryTitle: String,
    val officerRole: String,
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
    // vocabulary lives in exactly one place.
    val highPriestSummary: (sunSign: String, moonSign: String) -> String
)
