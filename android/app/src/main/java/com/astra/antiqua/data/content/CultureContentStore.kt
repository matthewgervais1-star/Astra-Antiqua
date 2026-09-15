package com.astra.antiqua.data.content

import android.content.Context
import com.astra.antiqua.model.AncientCulture
import java.io.IOException
import java.io.InputStream
import kotlinx.serialization.SerializationException
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/**
 * Loads `shared/content/cultures.json`, the tagline and subtitle web sets
 * under each culture's name. Same arrangement as [PlacementContentStore]: the
 * file is an Android asset through the `sourceSets` entry in
 * `app/build.gradle.kts`, so the repository keeps one copy of the prose and
 * neither surface authors its own.
 *
 * Nothing here writes to `shared/content`. It is the web surface's authored
 * text, read.
 */
@Serializable
private data class CultureEntry(
    val id: String,
    val label: String,
    val tagline: String,
    val subtitle: String,
)

@Serializable
private data class CulturesFile(val cultures: List<CultureEntry>)

/** What a culture's doorway prints under its name. */
data class CultureCopy(
    val label: String,
    val tagline: String,
    val subtitle: String,
)

class CultureContentStore(
    private val assetName: String = ASSET_FILE,
    private val openStream: () -> InputStream,
) {
    private val table: Map<String, CultureCopy> by lazy { parse() }

    private fun parse(): Map<String, CultureCopy> {
        val text = try {
            openStream().use { it.bufferedReader().readText() }
        } catch (e: IOException) {
            throw ContentLoadException.Io(assetName, e)
        }
        val parsed = try {
            json.decodeFromString<CulturesFile>(text)
        } catch (e: SerializationException) {
            throw ContentLoadException.Malformed(assetName, e)
        }
        return parsed.cultures.associate {
            it.id to CultureCopy(it.label, it.tagline, it.subtitle)
        }
    }

    /**
     * The copy for [culture]. Throws rather than returning null: all five are
     * expected to resolve, so a miss means the corpus has a hole and the
     * caller should be told which key.
     */
    fun copyFor(culture: AncientCulture): CultureCopy {
        val key = culture.name.lowercase()
        return table[key] ?: throw ContentLoadException.MissingKey(assetName, key)
    }

    companion object {
        const val ASSET_FILE = "cultures.json"

        private val json = Json { ignoreUnknownKeys = true }

        @Volatile
        private var appInstance: CultureContentStore? = null

        /** The process-wide store: read and parsed once for the life of the app. */
        fun forContext(context: Context): CultureContentStore {
            appInstance?.let { return it }
            synchronized(this) {
                appInstance?.let { return it }
                val appContext = context.applicationContext
                val created = CultureContentStore { appContext.assets.open(ASSET_FILE) }
                appInstance = created
                return created
            }
        }
    }
}
