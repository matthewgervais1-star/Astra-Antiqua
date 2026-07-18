package com.astra.antiqua.domain

import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient

/**
 * Represents the culturally specific content for an astrological placement.
 */
@Serializable
data class OracleContent(
    val deity_name: String,
    val epitheton: String,
    val decree: String,
    val interpretation: String? = null,
    @Transient val planetPosition: AccuratePlanetPosition? = null
)

/**
 * A mapping of all ancient cultures for a single planet/sign combination.
 */
@Serializable
data class CultureSyncretism(
    val GREEK: OracleContent? = null,
    val EGYPTIAN: OracleContent? = null,
    val CANAANITE: OracleContent? = null,
    val CARTHAGINIAN: OracleContent? = null,
    val ROMAN: OracleContent? = null
)

/**
 * The root matrix of all oracle decrees.
 * Key format: "PLANET_SIGN" (e.g., "SUN_LEO").
 */
typealias OracleMatrix = Map<String, CultureSyncretism>
