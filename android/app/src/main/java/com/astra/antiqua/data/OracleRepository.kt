package com.astra.antiqua.data

import android.content.Context
import android.util.Log
import com.astra.antiqua.BuildConfig
import com.astra.antiqua.data.local.datastore.DataStoreManager
import com.astra.antiqua.domain.CultureSyncretism
import com.astra.antiqua.domain.OracleContent
import com.astra.antiqua.domain.OracleMatrix
import com.astra.antiqua.domain.ZodiacUtils
import com.astra.antiqua.model.ClassicalPlanet
import java.io.InputStream
import kotlinx.coroutines.flow.first
import kotlinx.serialization.json.Json

class OracleRepository(
    private val context: Context,
    private val dataStoreManager: DataStoreManager
) {

    /**
     * Fetches the culturally accurate oracle content for a specific planet and its degree.
     */
    suspend fun getDecree(planet: ClassicalPlanet, degree: Double): OracleContent? {
        val storedPantheon = dataStoreManager.selectedPantheon.first()?.uppercase() ?: "GREECE"

        return try {
            context.assets.open(ASSET_FILE).use { inputStream ->
                decreeFromStream(inputStream, planet, degree, storedPantheon)
            }
        } catch (_: Exception) {
            null
        }
    }

    companion object {
        const val ASSET_FILE = "oracle_decrees.json"

        private val json = Json {
            ignoreUnknownKeys = true
            coerceInputValues = true
        }

        /**
         * Core lookup, split out of [getDecree] so it takes an [InputStream] rather
         * than reading `context.assets` directly: a JVM unit test can then feed it
         * `oracle_decrees.json` straight from disk without needing a Context (and
         * without the androidTest/Robolectric machinery that would otherwise
         * require). [getDecree] is the only production caller.
         *
         * A decree can genuinely be absent for a given culture, so this stays
         * nullable rather than throwing — but a missing "PLANET_SIGN" entry
         * (as opposed to a present entry that simply has no content for one
         * culture) usually means the corpus itself has a hole, so that case is
         * logged by name in debug builds so it isn't silently invisible.
         */
        fun decreeFromStream(
            inputStream: InputStream,
            planet: ClassicalPlanet,
            degree: Double,
            pantheon: String
        ): OracleContent? {
            val zodiacSign = ZodiacUtils.getZodiacSign(degree)
            val key = "${planet.name.uppercase()}_${zodiacSign.name.uppercase()}"
            val pantheonKey = when (pantheon.uppercase()) {
                "GREECE" -> "GREEK"
                "EGYPT" -> "EGYPTIAN"
                "CANAAN" -> "CANAANITE"
                "CARTHAGE" -> "CARTHAGINIAN"
                "ROME" -> "ROMAN"
                else -> "GREEK"
            }

            val decrees: OracleMatrix = json.decodeFromString(
                inputStream.bufferedReader().use { it.readText() }
            )

            val syncretism = decrees[key]
            if (syncretism == null && BuildConfig.DEBUG) {
                Log.w("OracleRepository", "No oracle_decrees.json entry for key \"$key\"")
            }

            return syncretism.forPantheon(pantheonKey)
        }

        private fun CultureSyncretism?.forPantheon(pantheonKey: String): OracleContent? = when (pantheonKey) {
            "GREEK" -> this?.GREEK
            "EGYPTIAN" -> this?.EGYPTIAN
            "CANAANITE" -> this?.CANAANITE
            "CARTHAGINIAN" -> this?.CARTHAGINIAN
            "ROMAN" -> this?.ROMAN
            else -> this?.GREEK
        }
    }
}
