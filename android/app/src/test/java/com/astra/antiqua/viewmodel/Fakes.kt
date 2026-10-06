package com.astra.antiqua.viewmodel

import android.content.Context
import android.content.ContextWrapper
import com.astra.antiqua.data.NatalReadingRepository
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.SettingsRepository
import com.astra.antiqua.data.account.AccountError
import com.astra.antiqua.data.account.AccountExport
import com.astra.antiqua.data.account.AccountRepository
import com.astra.antiqua.data.account.AccountResult
import com.astra.antiqua.data.account.AccountUser
import com.astra.antiqua.data.account.RemoteChart
import com.astra.antiqua.data.account.SyncOutcome
import com.astra.antiqua.data.account.WaitListEntry
import com.astra.antiqua.data.account.WaitListPlace
import com.astra.antiqua.data.account.toChartInputs
import com.astra.antiqua.data.account.toUserProfileOrNull
import com.astra.antiqua.data.content.PlacementContentStore
import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.model.AncientCulture
import java.io.File
import java.time.ZoneId
import java.time.ZonedDateTime
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first

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

/**
 * The web account in memory, for the account ViewModels. It keeps the
 * repository's contract: [AccountResult] in, nothing thrown, the web's merge
 * rule against [profiles], sign-out and strike that leave the device chart.
 * Set [failWith] to make the next calls fail with that error.
 */
internal class FakeAccount(
    private val profiles: ProfileRepository = FakeProfiles(),
    signedIn: Boolean = false,
    var user: AccountUser = AccountUser(id = "u-1", email = "livia@example.com"),
    var serverChart: RemoteChart? = null,
    var waitListPosition: Int = 1,
    var failWith: AccountError? = null,
) : AccountRepository {
    private val session = MutableStateFlow(signedIn)
    override val isSignedIn: Flow<Boolean> = session

    /** The calls made, by name, in order. */
    val calls = mutableListOf<String>()

    /** The last profile sent up with [putChart]. */
    var uploaded: UserProfile? = null
        private set

    var lastExport: AccountExport = AccountExport("{}", "astra-antiqua-export.json")

    fun signedIn() = session.value

    private fun <T> answer(name: String, value: () -> T): AccountResult<T> {
        calls += name
        failWith?.let { return AccountResult.Failed(it) }
        return AccountResult.Ok(value())
    }

    override suspend fun signUp(email: String, password: String, displayName: String?) =
        answer("signUp") { session.value = true; user }

    override suspend fun signIn(email: String, password: String) =
        answer("signIn") { session.value = true; user }

    override suspend fun signOut(): AccountResult<Unit> {
        calls += "signOut"
        session.value = false
        return AccountResult.Ok(Unit)
    }

    override suspend fun me() = answer("me") { if (session.value) user else null }

    override suspend fun getChart() = answer("getChart") { serverChart }

    /**
     * Applies the server's rule on `name` (trimmed, 1 to 120 characters) to
     * what the mapping sends, so a ViewModel test sees the 400 the server
     * would give.
     */
    override suspend fun putChart(profile: UserProfile): AccountResult<RemoteChart> {
        val name = profile.toChartInputs().name.trim()
        if (failWith == null && name.isEmpty()) {
            calls += "putChart"
            return AccountResult.Failed(AccountError.Server(400, "String must contain at least 1 character(s)"))
        }
        if (failWith == null && name.length > 120) {
            calls += "putChart"
            return AccountResult.Failed(AccountError.Server(400, "String must contain at most 120 character(s)"))
        }
        return storeChart(profile)
    }

    private fun storeChart(profile: UserProfile) = answer("putChart") {
        uploaded = profile
        val inputs = profile.toChartInputs()
        RemoteChart("c-1", inputs.name, inputs.date, inputs.time, inputs.cityLabel, inputs.latitude, inputs.longitude, "2026-01-01T00:00:00.000Z")
            .also { serverChart = it }
    }

    override suspend fun deleteChart() = answer("deleteChart") { (serverChart != null).also { serverChart = null } }

    override suspend fun export() = answer("export") { lastExport }

    override suspend fun strike() = answer("strike") { session.value = false; serverChart = null }

    override suspend fun joinWaitList(entry: WaitListEntry) =
        answer("joinWaitList") { WaitListPlace(waitListPosition, duplicate = false, persisted = true) }

    override suspend fun syncAfterSignIn(): AccountResult<SyncOutcome> {
        calls += "syncAfterSignIn"
        failWith?.let { return AccountResult.Failed(it) }
        val device = profiles.profile.first()
        serverChart?.let { chart ->
            profiles.save(chart.toUserProfileOrNull(id = device?.id ?: 0)!!)
            return AccountResult.Ok(SyncOutcome.SERVER_CHART_KEPT)
        }
        if (device == null) return AccountResult.Ok(SyncOutcome.NOTHING_TO_SYNC)
        putChart(device)
        return AccountResult.Ok(SyncOutcome.DEVICE_CHART_UPLOADED)
    }
}
