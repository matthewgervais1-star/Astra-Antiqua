package com.astra.antiqua.viewmodel

import android.content.Context
import android.content.ContextWrapper
import com.astra.antiqua.data.NatalReadingRepository
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.SettingsRepository
import com.astra.antiqua.data.content.PlacementContentStore
import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.model.AncientCulture
import java.io.File
import java.time.ZoneId
import java.time.ZonedDateTime
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow

/**
 * The shared harness for every ViewModel test: two in-memory repositories
 * that implement the same interfaces the app wires in, so no test needs a
 * device, a DataStore or a Room database.
 */
internal class FakeSettings(
    culture: AncientCulture? = null,
    onboardingCompleted: Boolean = false,
) : SettingsRepository {
    private val culture = MutableStateFlow(culture)
    private val completed = MutableStateFlow(onboardingCompleted)

    override val selectedCulture: Flow<AncientCulture?> = this.culture
    override val isOnboardingCompleted: Flow<Boolean> = completed

    override suspend fun saveCulture(culture: AncientCulture) {
        this.culture.value = culture
    }

    override suspend fun setOnboardingCompleted(completed: Boolean) {
        this.completed.value = completed
    }

    fun storedCulture() = culture.value
    fun storedCompleted() = completed.value
}

internal class FakeProfiles(
    profile: UserProfile? = null,
    private val failOnSave: Boolean = false,
) : ProfileRepository {
    private val state = MutableStateFlow(profile)
    override val profile: Flow<UserProfile?> = state

    /** How many times a ViewModel asked to write a profile. */
    var saveCount = 0
        private set

    override suspend fun save(profile: UserProfile) {
        saveCount++
        if (failOnSave) error("disk full")
        state.value = profile
    }

    fun stored() = state.value
}

/** 1990-06-15 14:30 in Rome (CEST), as the epoch milliseconds the profile stores. */
internal val ROME_BIRTH_UTC_MS: Long =
    ZonedDateTime.of(1990, 6, 15, 14, 30, 0, 0, ZoneId.of("Europe/Rome")).toInstant().toEpochMilli()

internal fun romeProfile(name: String = "Livia") = UserProfile(
    id = 1,
    name = name,
    birthDateUtc = ROME_BIRTH_UTC_MS,
    latitude = 41.9028,
    longitude = 12.4964,
    cityName = "Rome",
    timezoneId = "Europe/Rome",
)

/**
 * A reading repository backed by the real `shared/content` JSON. The
 * repository asks [PlacementContentStore.forContext] for its store, which
 * returns the process-wide instance before it touches the Context, so this
 * seeds that instance from the file (the same relative path
 * `PlacementContentStoreTest` uses) and hands over an inert Context.
 */
internal fun readingsFromSharedContent(): NatalReadingRepository {
    val file = File("../../shared/content/planet-in-sign.json")
    check(file.exists()) { "Expected to find ${file.path}" }
    val field = PlacementContentStore::class.java.getDeclaredField("appInstance")
    field.isAccessible = true
    field.set(null, PlacementContentStore { file.inputStream() })
    return NatalReadingRepository(inertContext())
}

internal fun inertContext(): Context = ContextWrapper(null)
