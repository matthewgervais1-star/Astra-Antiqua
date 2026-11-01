package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.SLOW_BODIES
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class TransitsViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    private suspend fun TransitsViewModel.settled() = state.first { it !is SpansState.Loading }

    @Test
    fun `the slow bodies make spans against the Sun, the Moon, the ascendant and the midheaven`() = runTest(dispatcher) {
        val model = TransitsViewModel(AstronomyEngine(), FakeProfiles(romeProfile()))

        model.load()
        advanceUntilIdle()
        val state = model.settled()

        assertTrue("Expected Ready but was $state", state is SpansState.Ready)
        val spans = (state as SpansState.Ready).spans
        // Depends on the run date. The 1200-day window holds several passes of Jupiter alone over the Rome 1990 Sun, Moon and ascendant, so it holds on any plausible date.
        assertTrue(spans.isNotEmpty())
        assertTrue(spans.all { it.transitPlanet in SLOW_BODIES })
        assertTrue(spans.all { it.natalKey in setOf("sun", "moon", "asc", "mc") })
    }

    @Test
    fun `the sample's spans include web's two against the midheaven`() = runTest(dispatcher) {
        // web's readerSpans walks the Midheaven too; the detail finds a Midheaven span by its id here.
        val model = TransitsViewModel(AstronomyEngine(), FakeProfiles(com.astra.antiqua.domain.SkyDayTest.smokeBirth))

        model.load(com.astra.antiqua.domain.SkyDayTest.sampleNow)
        advanceUntilIdle()
        val spans = (model.settled() as SpansState.Ready).spans

        assertTrue(spans.any { it.id == "saturn-opposition-mc" })
        assertTrue(spans.any { it.id == "jupiter-conjunction-mc" })
    }

    @Test
    fun `a chart cast after the empty state brings the spans on the next load`() = runTest(dispatcher) {
        val profiles = FakeProfiles(profile = null)
        val model = TransitsViewModel(AstronomyEngine(), profiles)
        model.load()
        advanceUntilIdle()
        assertSame(SpansState.NoChart, model.settled())

        profiles.save(romeProfile())
        model.load()
        advanceUntilIdle()

        // The second load reads the profile again; the walk ends in Ready, not the old NoChart.
        val ready = model.state.first { it is SpansState.Ready }
        assertTrue((ready as SpansState.Ready).spans.isNotEmpty())
    }

    @Test
    fun `each span has its own id so one can be looked up from the list`() = runTest(dispatcher) {
        val model = TransitsViewModel(AstronomyEngine(), FakeProfiles(romeProfile()))

        model.load()
        advanceUntilIdle()
        val spans = (model.settled() as SpansState.Ready).spans

        assertEquals(spans.size, spans.map { it.id }.toSet().size)
        val wanted = spans.last()
        assertSame(wanted, spans.first { it.id == wanted.id })
    }

    @Test
    fun `with no birth record there is nothing to read a transit against`() = runTest(dispatcher) {
        val model = TransitsViewModel(AstronomyEngine(), FakeProfiles(profile = null))

        model.load()
        advanceUntilIdle()

        assertSame(SpansState.NoChart, model.settled())
    }

    @Test
    fun `loading twice computes once`() = runTest(dispatcher) {
        val model = TransitsViewModel(AstronomyEngine(), FakeProfiles(romeProfile()))
        model.load()
        advanceUntilIdle()
        val first = model.settled()

        model.load()
        advanceUntilIdle()

        assertSame(first, model.state.value)
    }

    @Test
    fun `a recast chart walks the spans again`() = runTest(dispatcher) {
        val profiles = FakeProfiles(romeProfile())
        val model = TransitsViewModel(AstronomyEngine(), profiles)
        model.load()
        advanceUntilIdle()
        val first = model.settled() as SpansState.Ready

        // Another birth record replaces the one the spans were walked against.
        profiles.save(com.astra.antiqua.domain.SkyDayTest.smokeBirth)
        model.load()
        advanceUntilIdle()
        val second = model.state.first { it is SpansState.Ready && it !== first } as SpansState.Ready

        assertTrue(first.spans.map { it.id } != second.spans.map { it.id } || first.spans.map { it.start } != second.spans.map { it.start })
    }

    @Test
    fun `a recast while the walk runs publishes the new chart's spans`() = runTest(dispatcher) {
        val profiles = FakeProfiles(romeProfile())
        val model = TransitsViewModel(AstronomyEngine(), profiles)
        model.load()
        // The walk starts on the default dispatcher; the record changes while it runs.
        runCurrent()
        val smoke = com.astra.antiqua.domain.SkyDayTest.smokeBirth
        profiles.save(smoke)
        val ready = model.state.first { it is SpansState.Ready } as SpansState.Ready

        val engine = AstronomyEngine()
        val chart = com.astra.antiqua.domain.CalculateNatalChartUseCase(engine).execute(smoke)
        val natal = com.astra.antiqua.domain.SkySeasonComposer.natal(engine, chart, smoke.latitude, smoke.longitude)
        val want = com.astra.antiqua.domain.LongTransitsComposer.readerSpans(engine, natal, ready.now)
        assertEquals(want.map { it.id to it.start }, ready.spans.map { it.id to it.start })
    }
}
