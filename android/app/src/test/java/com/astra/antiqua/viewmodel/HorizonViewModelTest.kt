package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.NatalPoint
import com.astra.antiqua.domain.SeasonStandouts
import com.astra.antiqua.domain.SkyEventKind
import com.astra.antiqua.domain.SkyEvents
import com.astra.antiqua.domain.natalPointsOf
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
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

    private fun model(culture: AncientCulture? = AncientCulture.ROME, profiles: FakeProfiles = FakeProfiles()) =
        HorizonViewModel(AstronomyEngine(), FakeSettings(culture), profiles)

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
    fun `the season says what is changing, from the reader's transits when there is a chart`() = runTest(dispatcher) {
        val engine = AstronomyEngine()
        val profile = romeProfile()
        val plain = model()
        val read = model(profiles = FakeProfiles(profile))

        plain.loadSeason(SCORPIO_2026)
        read.loadSeason(SCORPIO_2026)
        advanceUntilIdle()
        val sky = plain.season.first { it !is SeasonState.Loading } as SeasonState.Ready
        val natal = read.season.first { it !is SeasonState.Loading } as SeasonState.Ready

        val window = SkyEvents.currentSeason(engine, SCORPIO_2026)
        val points = natalPointsOf(CalculateNatalChartUseCase(engine).execute(profile))
        fun composed(natal: List<NatalPoint>?) = SeasonStandouts.whatIsChanging(
            AncientCulture.ROME,
            SeasonStandouts.standouts(AncientCulture.ROME, SeasonStandouts.events(engine, window, natal)),
        )
        assertEquals(composed(null), sky.whatIsChanging)
        assertEquals(composed(points), natal.whatIsChanging)
        // On this date the chart's own transits lead: Iuppiter's sextile to the natal Sun.
        val sol = DeityRegistry.getDeity(AncientCulture.ROME, Planet.SUN).name
        assertTrue(natal.whatIsChanging, natal.whatIsChanging.startsWith("Iuppiter strikes a treaty with your $sol."))
        assertTrue(sky.whatIsChanging, "your $sol" !in sky.whatIsChanging)
    }

    @Test
    fun `with a chart the year carries its spine, six spans at most in the order they open`() = runTest(dispatcher) {
        val model = model(profiles = FakeProfiles(romeProfile()))

        model.loadYear(SCORPIO_2026)
        advanceUntilIdle()
        val year = model.year.first { it !is YearState.Loading } as YearState.Ready

        assertEquals(6, year.spine.size)
        val starts = year.spine.map { it.start.time }
        assertEquals(starts.sorted(), starts)
        assertTrue(year.spine.all { it.end.time >= SCORPIO_2026.time })
        val start = Calendar.getInstance().apply { time = year.start }
        val now = Calendar.getInstance().apply { time = SCORPIO_2026 }
        assertEquals(now.get(Calendar.MONTH), start.get(Calendar.MONTH))
    }

    @Test
    fun `without a chart the year has no spine`() = runTest(dispatcher) {
        val model = model()

        model.loadYear(SCORPIO_2026)
        advanceUntilIdle()
        val year = model.year.first { it !is YearState.Loading } as YearState.Ready

        assertTrue(year.spine.isEmpty())
    }

    @Test
    fun `with no culture chosen the year reads in the default voice`() = runTest(dispatcher) {
        val model = model(culture = null)

        model.loadYear()
        advanceUntilIdle()
        val year = model.year.first { it !is YearState.Loading } as YearState.Ready

        assertEquals(AncientCulture.GREECE, year.culture)
    }

    private companion object {
        /** Scorpio season, 2026: no eclipse in it, and the seeded chart's transits lead it. */
        val SCORPIO_2026: Date = Date.from(java.time.Instant.parse("2026-10-27T12:00:00Z"))
    }
}
