package com.astra.antiqua.model

import java.io.File
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * `model/DeityRegistry.kt` stays the compile-enforced source of truth for
 * deity lookups (an exhaustive `when`, not a runtime map read) rather than
 * being replaced by a JSON lookup -- but that only stays safe to claim if
 * something actually checks it agrees with `shared/content/deities.json`,
 * the same generated file the dotnet surface embeds. This test is that
 * check: it reads the JSON directly (the same relative-path-off-the-module-
 * directory approach `PlacementContentStoreTest` and the old
 * `OracleDecreeKeyCoverageTest` use) and asserts record-for-record agreement
 * for the 7 classical planets DeityRegistry currently covers. The JSON also
 * carries uranus/neptune/pluto records (Phase 4 territory); those are parsed
 * and simply excluded from the comparison until ClassicalPlanet grows to
 * match.
 */
class DeityRegistryDeitiesJsonParityTest {

    @Serializable
    private data class DeityRecord(
        val planet: String,
        val culture: String,
        val name: String,
        val epithet: String,
        val note: String? = null,
        val contested: Boolean = false,
    )

    private val assetFile = File("../../shared/content/deities.json")

    private val json = Json { ignoreUnknownKeys = true }

    private fun classicalPlanetFor(jsonKey: String): ClassicalPlanet? =
        ClassicalPlanet.values().firstOrNull { it.name.equals(jsonKey, ignoreCase = true) }

    private fun cultureFor(jsonKey: String): AncientCulture =
        AncientCulture.values().first { it.name.equals(jsonKey, ignoreCase = true) }

    @Test
    fun `DeityRegistry agrees with deities json for every classical planet by culture pair`() {
        assertTrue("Expected to find ${assetFile.path}", assetFile.exists())

        val records: List<DeityRecord> = json.decodeFromString(assetFile.readText())
        val classicalRecords = records.filter { classicalPlanetFor(it.planet) != null }

        // 5 cultures x 7 classical planets: every classical record in the
        // JSON is exercised, and none is silently skipped by a typo'd key.
        assertEquals(35, classicalRecords.size)

        for (record in classicalRecords) {
            val planet = classicalPlanetFor(record.planet)!!
            val culture = cultureFor(record.culture)
            val deity = DeityRegistry.getDeity(culture, planet)

            assertEquals(
                "Name mismatch for $culture/$planet",
                record.name,
                deity.name
            )
            assertEquals(
                "Epithet mismatch for $culture/$planet",
                record.epithet,
                deity.epithet
            )
        }
    }
}
