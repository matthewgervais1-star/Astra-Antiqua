package com.astra.antiqua.data.content

import android.content.Context
import com.astra.antiqua.domain.ZodiacSign
import com.astra.antiqua.model.ClassicalPlanet
import java.io.IOException
import java.io.InputStream
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json

/**
 * Loads `shared/content/planet-in-sign.json` -- the universal, culture-agnostic
 * placement paragraph web authored once per (planet, sign) and this app now
 * shares instead of re-deriving. Wired in as a build-time Android asset (see
 * the `sourceSets.main.assets.srcDir` in `app/build.gradle.kts`) rather than
 * copied into Kotlin or a new JSON under `android/`, so the repo keeps
 * exactly one copy of the prose.
 *
 * `planet-in-sign.json` has 120 paragraphs across the 10 bodies web already
 * ships (7 classical + Uranus/Neptune/Pluto); [ClassicalPlanet] is still 7
 * (Phase 4 of the rollout plan adds the other three), so [textFor] only ever
 * queries the 7 keys this app currently has planets for -- the extra
 * uranus/neptune/pluto entries are parsed along with everything else and
 * simply never looked up until then.
 *
 * [openStream] is injected (an `() -> InputStream` rather than a `Context`
 * directly) so a JVM test can feed this the real file straight off disk, the
 * same pattern `OracleRepository.decreeFromStream` used. The parsed table is
 * cached via `by lazy`, so [openStream] runs at most once per instance no
 * matter how many times [textFor] is called -- the old `OracleRepository`
 * re-read and re-parsed its entire 156 KB asset on every single lookup.
 */
class PlacementContentStore(
    private val assetName: String = ASSET_FILE,
    private val openStream: () -> InputStream,
) {
    private val table: Map<String, Map<String, String>> by lazy { parse() }

    private fun parse(): Map<String, Map<String, String>> {
        val text = try {
            openStream().use { it.bufferedReader().readText() }
        } catch (e: IOException) {
            throw ContentLoadException.Io(assetName, e)
        }
        return try {
            json.decodeFromString(text)
        } catch (e: SerializationException) {
            throw ContentLoadException.Malformed(assetName, e)
        }
    }

    /**
     * The universal placement paragraph for [planet] in [sign]. Throws
     * [ContentLoadException.MissingKey] rather than returning null: for the
     * 7 planets this app currently supports, every (planet, sign) pair is
     * expected to resolve (see `PlacementContentStoreTest`), so a miss means
     * the corpus itself has a hole and callers should be told which key, not
     * silently drop the card.
     */
    fun textFor(planet: ClassicalPlanet, sign: ZodiacSign): String {
        val planetKey = planet.name.lowercase()
        val bySign = table[planetKey]
            ?: throw ContentLoadException.MissingKey(assetName, planetKey)
        return bySign[sign.signName]
            ?: throw ContentLoadException.MissingKey(assetName, "$planetKey.${sign.signName}")
    }

    companion object {
        const val ASSET_FILE = "planet-in-sign.json"

        private val json = Json { ignoreUnknownKeys = true }

        @Volatile
        private var appInstance: PlacementContentStore? = null

        /**
         * The process-wide store: loaded and parsed once for the life of the
         * app, regardless of how many times a caller (e.g.
         * `NatalReadingRepository`, reconstructed on every
         * `DashboardViewModel.calculateChart()` call) asks for it.
         */
        fun forContext(context: Context): PlacementContentStore {
            appInstance?.let { return it }
            synchronized(this) {
                appInstance?.let { return it }
                val appContext = context.applicationContext
                val created = PlacementContentStore { appContext.assets.open(ASSET_FILE) }
                appInstance = created
                return created
            }
        }
    }
}
