package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.AppPhase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
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
 * interfaces, and the fakes in Fakes.kt are the entire test harness.
 */
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
    fun `choosing a culture with a kept chart and a completed flow goes to the dashboard`() = runTest(dispatcher) {
        // The strike's return: the device chart and the flag are kept.
        val settings = FakeSettings(AncientCulture.ROME, onboardingCompleted = true)
        val model = AppViewModel(settings, FakeProfiles(aProfile()))
        model.start()
        advanceUntilIdle()
        model.returnToCultureSelection()
        assertEquals(AppPhase.CULTURE_SELECTION, model.currentPhase.value)

        model.selectCulture(AncientCulture.CARTHAGE)
        advanceUntilIdle()

        assertEquals(AncientCulture.CARTHAGE, settings.storedCulture())
        assertEquals(AppPhase.MAIN_DASHBOARD, model.currentPhase.value)
    }

    @Test
    fun `choosing a culture with a chart but no completed flow goes to the birth details`() = runTest(dispatcher) {
        val settings = FakeSettings(onboardingCompleted = false)
        val model = AppViewModel(settings, FakeProfiles(aProfile()))

        model.selectCulture(AncientCulture.EGYPT)
        advanceUntilIdle()

        assertEquals(AppPhase.ONBOARDING, model.currentPhase.value)
    }

    @Test
    fun `switching culture later does not send the reader back to the birth form`() = runTest(dispatcher) {
        val settings = FakeSettings(AncientCulture.ROME, onboardingCompleted = true)
        val model = AppViewModel(settings, FakeProfiles(aProfile()))
        model.start()
        advanceUntilIdle()

        model.switchCulture(AncientCulture.EGYPT)
        advanceUntilIdle()

        assertEquals(AncientCulture.EGYPT, settings.storedCulture())
        assertEquals(AncientCulture.EGYPT, model.selectedCulture.value)
        // The regression this guards: entering a voice from its doorway used
        // to call the first run's setter, which dropped the reader into the
        // birth details with no way back.
        assertEquals(AppPhase.MAIN_DASHBOARD, model.currentPhase.value)
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
