package com.astra.antiqua.data

import android.content.Context
import android.util.Log
import com.astra.antiqua.BuildConfig
import com.astra.antiqua.data.content.ContentLoadException
import com.astra.antiqua.data.content.PlacementContentStore
import com.astra.antiqua.domain.AccuratePlanetPosition
import com.astra.antiqua.domain.NatalPlacementReading
import com.astra.antiqua.domain.NatalReadingComposer
import com.astra.antiqua.model.AncientCulture

/**
 * Replaces `OracleRepository`. Where that class re-read and re-parsed the
 * entire 156 KB `oracle_decrees.json` asset on every single lookup,
 * [getReading] resolves the universal placement text from
 * [PlacementContentStore.forContext] -- loaded and parsed once for the whole
 * process, cached after that -- and composes the culture mask on top of it
 * via [NatalReadingComposer], rather than looking up one of 420 pre-baked
 * records.
 */
class NatalReadingRepository(private val context: Context) {

    private val placementStore: PlacementContentStore
        get() = PlacementContentStore.forContext(context)

    /**
     * A placement's composed reading for [culture]. Stays nullable, like the
     * old `getDecree`, because a lookup failure should drop that one card
     * rather than take the whole dashboard down -- but unlike the old
     * `catch (_: Exception)`, the three [ContentLoadException] variants are
     * logged by name (debug builds only) so a hole in the corpus is visible
     * instead of silently indistinguishable from an IO error.
     */
    fun getReading(position: AccuratePlanetPosition, culture: AncientCulture): NatalPlacementReading? {
        val placementText = try {
            placementStore.textFor(position.planet, position.zodiacSign)
        } catch (e: ContentLoadException) {
            if (BuildConfig.DEBUG) {
                Log.w("NatalReadingRepository", "Placement text unavailable for " +
                    "${position.planet}/${position.zodiacSign}: ${e.message}", e)
            }
            return null
        }

        return NatalReadingComposer.compose(culture, position, placementText)
    }
}
