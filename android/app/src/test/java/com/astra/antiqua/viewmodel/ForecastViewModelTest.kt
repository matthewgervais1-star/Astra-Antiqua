package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import java.util.Calendar
import java.util.Date
import java.util.TimeZone
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
class ForecastViewModelTest {
    private val dispatcher = StandardTestDispatcher()
    private val dayMs = 86_400_000L

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    private suspend fun ForecastViewModel.settled() = state.first { it !is ForecastState.Loading }

    private fun model(profiles: FakeProfiles, culture: AncientCulture? = AncientCulture.ROME) =
        ForecastViewModel(AstronomyEngine(), profiles, FakeSettings(culture))

    @Test
    fun `the solar return lands within a year, in the sign and degree the Sun held at birth`() = runTest(dispatcher) {
        val model = model(FakeProfiles(romeProfile()))
        val before = Date()

        model.load()
        advanceUntilIdle()
        val state = model.settled()

        assertTrue("Expected Ready but was $state", state is ForecastState.Ready)
        val solarReturn = (state as ForecastState.Ready).solarReturn!!
        val natalSun = CalculateNatalChartUseCase(AstronomyEngine())
            .execute(romeProfile()).planets.getValue(Planet.SUN)
        assertEquals(natalSun.zodiacSign, solarReturn.sign)
        assertEquals(natalSun.longitude % 30.0, solarReturn.degree, 1e-9)
        assertTrue(solarReturn.date.time > before.time)
        assertTrue(solarReturn.date.time <= before.time + 367 * dayMs)
    }

    @Test
    fun `the solar return falls in the birth month`() = runTest(dispatcher) {
        val model = model(FakeProfiles(romeProfile()))

        model.load()
        advanceUntilIdle()
        val ready = model.settled() as ForecastState.Ready

        val month = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
            .apply { time = ready.solarReturn!!.date }.get(Calendar.MONTH)
        assertEquals(Calendar.JUNE, month)
    }

    @Test
    fun `only spans and stations open inside the coming year are listed`() = runTest(dispatcher) {
        val model = model(FakeProfiles(romeProfile()), AncientCulture.CANAAN)

        model.load()
        advanceUntilIdle()
        val ready = model.settled() as ForecastState.Ready

        assertEquals(AncientCulture.CANAAN, ready.culture)
        // Depends on the run date. Jupiter moves about a sign a year and aspects each of the Rome 1990 Sun, Moon, ascendant and midheaven every 30 to 60 degrees, so some span opens inside any coming year.
        assertTrue(ready.spans.isNotEmpty())
        assertTrue(ready.spans.all { it.end.time >= ready.now.time })
        assertTrue(ready.spans.all { it.start.time <= ready.now.time + 365 * dayMs })
        assertTrue(ready.stations.all { it.date.time in ready.now.time..(ready.now.time + 365 * dayMs) })
    }

    @Test
    fun `with no birth record the forecast has no chart to read`() = runTest(dispatcher) {
        val model = model(FakeProfiles(profile = null))

        model.load()
        advanceUntilIdle()

        assertSame(ForecastState.NoChart, model.settled())
    }
}
