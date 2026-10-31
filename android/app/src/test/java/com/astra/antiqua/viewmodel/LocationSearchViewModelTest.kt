package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.Cities
import com.astra.antiqua.data.local.room.UserProfile
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
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class LocationSearchViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    private val rome = Place("Rome, Italy", "Rome", 41.9028, 12.4964, offline = true)

    @Test
    fun `before anything is typed the picker offers the popular packaged cities`() = runTest(dispatcher) {
        val model = LocationSearchViewModel(FakeProfiles())

        val results = model.searchResults.value

        assertEquals(Cities.POPULAR.map { it.name }, results.map { it.cityName })
        assertTrue(results.all { it.offline })
    }

    @Test
    fun `a short query narrows the picker to packaged matches with no network`() = runTest(dispatcher) {
        val model = LocationSearchViewModel(FakeProfiles())

        // Two characters stays under the geocoder's threshold, so the
        // Android-only path never runs.
        model.onSearchQueryChanged(inertContext(), "Ro")
        advanceUntilIdle()

        assertEquals("Ro", model.searchQuery.value)
        val results = model.searchResults.value
        assertEquals("Rome", results.first().cityName)
        assertTrue(results.all { it.offline })
        assertFalse(model.isSearching.value)
    }

    @Test
    fun `saving a profile stores the place and the zone it was resolved against`() = runTest(dispatcher) {
        val profiles = FakeProfiles()
        val model = LocationSearchViewModel(profiles)
        var saved = false

        model.saveProfile("Livia", ROME_BIRTH_UTC_MS, "Europe/Rome", rome) { saved = true }
        advanceUntilIdle()

        assertTrue(saved)
        assertEquals(
            UserProfile(
                name = "Livia",
                birthDateUtc = ROME_BIRTH_UTC_MS,
                latitude = 41.9028,
                longitude = 12.4964,
                cityName = "Rome",
                timezoneId = "Europe/Rome",
            ),
            profiles.stored(),
        )
    }

    @Test
    fun `a failed save does not announce success`() = runTest(dispatcher) {
        val profiles = FakeProfiles(failOnSave = true)
        val model = LocationSearchViewModel(profiles)
        var saved = false

        model.saveProfile("Livia", ROME_BIRTH_UTC_MS, "Europe/Rome", rome) { saved = true }
        advanceUntilIdle()

        assertEquals(1, profiles.saveCount)
        assertFalse(saved)
    }
}
