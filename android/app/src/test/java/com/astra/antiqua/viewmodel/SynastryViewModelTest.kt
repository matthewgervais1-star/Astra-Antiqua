package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.AspectType
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class SynastryViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    private fun model(profiles: FakeProfiles, culture: AncientCulture? = AncientCulture.ROME) =
        SynastryViewModel(AstronomyEngine(), profiles, FakeSettings(culture))

    private suspend fun SynastryViewModel.until(done: (SynastryState) -> Boolean) = state.first(done)

    @Test
    fun `with no birth record synastry asks for a chart first`() = runTest(dispatcher) {
        val model = model(FakeProfiles(profile = null))

        model.load()
        advanceUntilIdle()

        assertSame(SynastryState.NeedsChart, model.until { it !is SynastryState.Computing })
    }

    @Test
    fun `a stored chart waits for the second party under the reader's name and culture`() = runTest(dispatcher) {
        val model = model(FakeProfiles(romeProfile("Livia")), AncientCulture.EGYPT)

        model.load()
        advanceUntilIdle()

        val state = model.until { it !is SynastryState.Computing }
        assertEquals(SynastryState.Waiting("Livia", AncientCulture.EGYPT), state)
    }

    @Test
    fun `a chart compared with an identical birth binds each body to itself, exactly`() = runTest(dispatcher) {
        val model = model(FakeProfiles(romeProfile()))
        model.load()
        advanceUntilIdle()
        model.until { it is SynastryState.Waiting }

        model.compare("Twin", ROME_BIRTH_UTC_MS, 41.9028, 12.4964)
        advanceUntilIdle()
        val state = model.until { it is SynastryState.Ready || it is SynastryState.Error }

        assertTrue("Expected Ready but was $state", state is SynastryState.Ready)
        val ready = state as SynastryState.Ready
        assertEquals("Twin", ready.theirName)
        val sunSun = ready.bonds.single { it.mine == Planet.SUN && it.theirs == Planet.SUN }
        assertEquals(AspectType.CONJUNCTION, sunSun.aspect)
        assertEquals(0.0, sunSun.orb, 1e-9)
        assertEquals(ready.bonds.map { it.orb }.sorted(), ready.bonds.map { it.orb })
        assertTrue(ready.bonds.all { it.orb <= it.aspect.orb })
    }

    @Test
    fun `the second party is never written to the device`() = runTest(dispatcher) {
        val profiles = FakeProfiles(romeProfile())
        val model = model(profiles)
        model.load()
        advanceUntilIdle()
        model.until { it is SynastryState.Waiting }

        model.compare("Stranger", 0L, 0.0, 0.0)
        advanceUntilIdle()
        model.until { it is SynastryState.Ready }

        assertEquals(0, profiles.saveCount)
        assertEquals(romeProfile(), profiles.stored())
    }

    @Test
    fun `a blank name for the second party reads as Them, and reset returns to waiting`() = runTest(dispatcher) {
        val model = model(FakeProfiles(romeProfile("Livia")))
        model.load()
        advanceUntilIdle()
        model.until { it is SynastryState.Waiting }

        model.compare("", ROME_BIRTH_UTC_MS, 41.9028, 12.4964)
        advanceUntilIdle()
        val ready = model.until { it is SynastryState.Ready } as SynastryState.Ready
        model.reset()

        assertEquals("Them", ready.theirName)
        assertEquals(SynastryState.Waiting("Livia", AncientCulture.ROME), model.state.value)
    }
}
