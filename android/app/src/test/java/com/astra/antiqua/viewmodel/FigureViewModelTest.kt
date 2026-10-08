package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.FigureReadingComposer
import com.astra.antiqua.model.AncientCulture
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
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class FigureViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    // The page is composed on Dispatchers.Default, so wait for the state to leave Loading.
    private suspend fun FigureViewModel.settled() = state.first { it !is FigureState.Loading }

    @Test
    fun `a composer that throws leaves the screen on its missing state`() = runTest(dispatcher) {
        val model = FigureViewModel(AstronomyEngine(), FakeProfiles()) { _, _, _, _, _ ->
            throw IllegalStateException("ephemeris failed")
        }

        model.load(AncientCulture.ROME, "2026-03-01", "mars-trine-neptune")
        advanceUntilIdle()

        assertEquals(FigureState.Missing(FigureReadingComposer.Missing.ABSENT), model.settled())
    }

    @Test
    fun `a figure the sky did not hold reads as absent`() = runTest(dispatcher) {
        val model = FigureViewModel(AstronomyEngine(), FakeProfiles()) { _, _, _, _, _ -> null }

        model.load(AncientCulture.ROME, "2026-03-01", "sun-opposition-moon")
        advanceUntilIdle()

        val state = model.settled()
        assertTrue("Expected Missing but was $state", state is FigureState.Missing)
    }
}
