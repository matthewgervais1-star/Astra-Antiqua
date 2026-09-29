package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.SkyEventKind
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import java.util.Calendar
import java.util.Date
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
class HorizonViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    private fun model(culture: AncientCulture? = AncientCulture.ROME) =
        HorizonViewModel(AstronomyEngine(), FakeSettings(culture))

    @Test
    fun `the week has seven days and exactly one of them is today`() = runTest(dispatcher) {
        val model = model()

        model.loadWeek()
        advanceUntilIdle()
        val state = model.week.first { it !is WeekState.Loading }

        assertTrue("Expected Ready but was $state", state is WeekState.Ready)
        val week = state as WeekState.Ready
        assertEquals(7, week.days.size)
        assertEquals(1, week.days.count { it.isToday })
        val span = week.end.time - week.start.time
        assertEquals(6L, Math.round(span / 86_400_000.0))
    }

    @Test
    fun `the season is the Sun's current sign and holds today`() = runTest(dispatcher) {
        val model = model(AncientCulture.EGYPT)
        val before = Date()

        model.loadSeason()
        advanceUntilIdle()
        val state = model.season.first { it !is SeasonState.Loading }

        assertTrue("Expected Ready but was $state", state is SeasonState.Ready)
        val season = state as SeasonState.Ready
        assertEquals(AncientCulture.EGYPT, season.culture)
        assertTrue(season.window.start.time <= before.time)
        assertTrue(season.window.end.time >= before.time)
        val dates = season.events.map { it.date.time }
        assertEquals(dates.sorted(), dates)
        assertTrue(dates.all { it <= season.window.end.time })
    }

    @Test
    fun `the year starts this month, leaves the Moon out and stays in date order`() = runTest(dispatcher) {
        val model = model()

        model.loadYear()
        advanceUntilIdle()
        val state = model.year.first { it !is YearState.Loading }

        assertTrue("Expected Ready but was $state", state is YearState.Ready)
        val year = state as YearState.Ready
        val start = Calendar.getInstance().apply { time = year.start }
        assertEquals(1, start.get(Calendar.DAY_OF_MONTH))
        assertTrue(year.events.isNotEmpty())
        assertTrue(year.events.none { it.body == Planet.MOON })
        assertTrue(year.events.any { it.kind == SkyEventKind.INGRESS })
        val dates = year.events.map { it.date.time }
        assertEquals(dates.sorted(), dates)
    }

    @Test
    fun `with no culture chosen the year reads in the default voice`() = runTest(dispatcher) {
        val model = model(culture = null)

        model.loadYear()
        advanceUntilIdle()
        val year = model.year.first { it !is YearState.Loading } as YearState.Ready

        assertEquals(AncientCulture.GREECE, year.culture)
    }
}
