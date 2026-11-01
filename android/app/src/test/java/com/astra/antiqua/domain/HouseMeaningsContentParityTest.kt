package com.astra.antiqua.domain

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Test
import java.io.File

/**
 * HouseMeanings.kt against shared/content/houses.json, the copy web exports
 * from web/src/data/houses.ts: every house's ordinal, title, domain and arena,
 * read off the module directory as DeityRegistryDeitiesJsonParityTest reads
 * deities.json.
 */
class HouseMeaningsContentParityTest {

    @Serializable
    private data class HouseRecord(val house: Int, val ordinal: String, val title: String, val domain: String, val arena: String)

    @Test
    fun `every house reads as web's houses json`() {
        val records = Json.decodeFromString<List<HouseRecord>>(File("../../shared/content/houses.json").readText(Charsets.UTF_8))
        assertEquals(12, records.size)
        records.forEach { r ->
            val m = HouseMeanings.get(r.house)
            assertEquals(HouseRecord(r.house, r.ordinal, r.title, r.domain, r.arena), HouseRecord(m.house, m.ordinal, m.title, m.domain, m.arena))
        }
    }
}
