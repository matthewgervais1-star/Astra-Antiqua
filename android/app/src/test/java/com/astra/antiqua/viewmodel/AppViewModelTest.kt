package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.SettingsRepository
import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.AppPhase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Before
import org.junit.Test

/**
 * What the container bought: this whole file. AppViewModel used to take a
 * Context into every method and build a DataStore and a Room database from
 * it, so none of this could run without a device. It now takes two
 * interfaces, and the fakes below are the entire test harness.
 */
private class FakeSettings(
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

private class FakeProfiles(profile: UserProfile? = null) : ProfileRepository {
    private val state = MutableStateFlow(profile)
    override val profile: Flow<UserProfile?> = state
    override suspend fun save(profile: UserProfile) {
        state.value = profile
    }
}

private fun aProfile() = UserProfile(
    id = 1,
    name = "Test",
    birthDateUtc = 0L,
    latitude = 0.0,
    longitude = 0.0,
    cityName = "Nowhere",
    timezoneId = "UTC",
)

@OptIn(ExperimentalCoroutinesApi::class)
class AppViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    @Test
    fun `a reader with a record and a completed flow goes straight to the dashboard`() = runTest(dispatcher) {
        val settings = FakeSettings(AncientCulture.ROME, onboardingCompleted = true)
        val model = AppViewModel(settings, FakeProfiles(aProfile()))

        model.start()
        advanceUntilIdle()

        assertEquals(AppPhase.MAIN_DASHBOARD, model.currentPhase.value)
        assertEquals(AncientCulture.ROME, model.selectedCulture.value)
    }

    @Test
    fun `a completed flag with no record behind it is cleared, not trusted`() = runTest(dispatcher) {
        val settings = FakeSettings(AncientCulture.EGYPT, onboardingCompleted = true)
        val model = AppViewModel(settings, FakeProfiles(profile = null))

        model.start()
        advanceUntilIdle()

        assertEquals(AppPhase.CULTURE_SELECTION, model.currentPhase.value)
        assertFalse(settings.storedCompleted())
    }

    @Test
    fun `a first run with nothing stored opens the culture picker in the default voice`() = runTest(dispatcher) {
        val model = AppViewModel(FakeSettings(), FakeProfiles())

        model.start()
        advanceUntilIdle()

        assertEquals(AppPhase.CULTURE_SELECTION, model.currentPhase.value)
        assertEquals(AncientCulture.GREECE, model.selectedCulture.value)
    }

    @Test
    fun `choosing a culture stores it and moves on to the birth details`() = runTest(dispatcher) {
        val settings = FakeSettings()
        val model = AppViewModel(settings, FakeProfiles())

        model.selectCulture(AncientCulture.CANAAN)
        advanceUntilIdle()

        assertEquals(AncientCulture.CANAAN, settings.storedCulture())
        assertEquals(AncientCulture.CANAAN, model.selectedCulture.value)
        assertEquals(AppPhase.ONBOARDING, model.currentPhase.value)
    }

    @Test
    fun `the splash runs once, however many times the screen recomposes`() = runTest(dispatcher) {
        val settings = FakeSettings(AncientCulture.ROME, onboardingCompleted = true)
        val model = AppViewModel(settings, FakeProfiles(aProfile()))

        model.start()
        advanceUntilIdle()
        // A second start must not send the reader back to the splash.
        model.start()

        assertEquals(AppPhase.MAIN_DASHBOARD, model.currentPhase.value)
    }
}
