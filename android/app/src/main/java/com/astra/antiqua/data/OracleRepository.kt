package com.astra.antiqua.data

import android.content.Context
import com.astra.antiqua.data.local.datastore.DataStoreManager
import com.astra.antiqua.domain.CultureSyncretism
import com.astra.antiqua.domain.OracleContent
import com.astra.antiqua.domain.OracleMatrix
import com.astra.antiqua.domain.ZodiacUtils
import com.astra.antiqua.model.ClassicalPlanet
import kotlinx.coroutines.flow.first
import kotlinx.serialization.json.Json

class OracleRepository(
    private val context: Context,
    private val dataStoreManager: DataStoreManager
) {
    private val json = Json { 
        ignoreUnknownKeys = true 
        coerceInputValues = true
    }

    /**
     * Fetches the culturally accurate oracle content for a specific planet and its degree.
     */
    suspend fun getDecree(planet: ClassicalPlanet, degree: Double): OracleContent? {
        val zodiacSign = ZodiacUtils.getZodiacSign(degree)
        val key = "${planet.name.uppercase()}_${zodiacSign.name.uppercase()}"
        val storedPantheon = dataStoreManager.selectedPantheon.first()?.uppercase() ?: "GREECE"
        val pantheonKey = when (storedPantheon) {
            "GREECE" -> "GREEK"
            "EGYPT" -> "EGYPTIAN"
            "CANAAN" -> "CANAANITE"
            "CARTHAGE" -> "CARTHAGINIAN"
            else -> "GREEK"
        }

        return try {
            val inputStream = context.assets.open("oracle_decrees.json")
            val decrees: OracleMatrix = json.decodeFromString(
                inputStream.bufferedReader().use { it.readText() }
            )

            val syncretism = decrees[key]
            when (pantheonKey) {
                "GREEK" -> syncretism?.GREEK
                "EGYPTIAN" -> syncretism?.EGYPTIAN
                "CANAANITE" -> syncretism?.CANAANITE
                "CARTHAGINIAN" -> syncretism?.CARTHAGINIAN
                else -> syncretism?.GREEK
            }
        } catch (_: Exception) {
            null
        }
    }
}
