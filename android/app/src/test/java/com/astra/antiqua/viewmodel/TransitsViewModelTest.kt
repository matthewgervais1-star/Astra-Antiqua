package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.SLOW_BODIES
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
class TransitsViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    private suspend fun TransitsViewModel.settled() = state.first { it !is SpansState.Loading }

    @Test
    fun `the slow bodies make spans against the Sun, the Moon and the ascendant`() = runTest(dispatcher) {
        val model = TransitsViewModel(AstronomyEngine(), FakeProfiles(romeProfile()))

        model.load()
        advanceUntilIdle()
        val state = model.settled()

        assertTrue("Expected Ready but was $state", state is SpansState.Ready)
        val spans = (state as SpansState.Ready).spans
        // Depends on the run date. The 1200-day window holds several passes of Jupiter alone over the Rome 1990 Sun, Moon and ascendant, so it holds on any plausible date.
        assertTrue(spans.isNotEmpty())
        assertTrue(spans.all { it.transitPlanet in SLOW_BODIES })
        assertTrue(spans.all { it.natalKey in setOf("sun", "moon", "asc") })
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
}
