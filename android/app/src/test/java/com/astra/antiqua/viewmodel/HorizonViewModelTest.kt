package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.LongTransits
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
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flow
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

    private fun composed(at: Date, natal: List<NatalPoint>?): String {
        val engine = AstronomyEngine()
        val window = SkyEvents.currentSeason(engine, at)
        return SeasonStandouts.whatIsChanging(
            AncientCulture.CARTHAGE,
            SeasonStandouts.standouts(AncientCulture.CARTHAGE, SeasonStandouts.events(engine, window, natal)),
        )
    }

    @Test
    fun `the season says what is changing, from the reader's transits when there is a chart`() = runTest(dispatcher) {
        val profile = romeProfile()
        val plain = model(AncientCulture.CARTHAGE)
        val read = model(AncientCulture.CARTHAGE, FakeProfiles(profile))

        plain.loadSeason(TAURUS_2027)
        read.loadSeason(TAURUS_2027)
        advanceUntilIdle()
        val sky = plain.season.first { it !is SeasonState.Loading } as SeasonState.Ready
        val natal = read.season.first { it !is SeasonState.Loading } as SeasonState.Ready

        val points = natalPointsOf(CalculateNatalChartUseCase(AstronomyEngine()).execute(profile))
        assertEquals(composed(TAURUS_2027, null), sky.whatIsChanging)
        assertEquals(composed(TAURUS_2027, points), natal.whatIsChanging)
        // In this season the chart's own transits lead: Melqart's sextile to the natal Sun.
        val semes = DeityRegistry.getDeity(AncientCulture.CARTHAGE, Planet.SUN).name
        assertTrue(natal.whatIsChanging, natal.whatIsChanging.startsWith("Melqart trades safe passage with your $semes."))
        assertTrue(sky.whatIsChanging, "your $semes" !in sky.whatIsChanging)
    }

    @Test
    fun `a chart that cannot be read leaves the season reading the sky`() = runTest(dispatcher) {
        val broken = object : ProfileRepository {
            override val profile: Flow<UserProfile?> = flow { throw IllegalStateException("disk unreadable") }
            override suspend fun save(profile: UserProfile) = Unit
        }
        val model = HorizonViewModel(AstronomyEngine(), FakeSettings(AncientCulture.CARTHAGE), broken)

        model.loadSeason(TAURUS_2027)
        advanceUntilIdle()
        val state = model.season.first { it !is SeasonState.Loading }

        assertTrue("Expected Ready but was $state", state is SeasonState.Ready)
        assertEquals(composed(TAURUS_2027, null), (state as SeasonState.Ready).whatIsChanging)
    }

    @Test
    fun `with a chart the year carries its spine, six spans at most in the order they open`() = runTest(dispatcher) {
        val profile = romeProfile()
        val model = model(profiles = FakeProfiles(profile))

        model.loadYear(TAURUS_2027)
        advanceUntilIdle()
        val year = model.year.first { it !is YearState.Loading } as YearState.Ready

        val engine = AstronomyEngine()
        val points = natalPointsOf(CalculateNatalChartUseCase(engine).execute(profile))
        val expected = LongTransits.yearSpine(engine, points, TAURUS_2027)
        assertTrue(expected.isNotEmpty())
        assertEquals(expected.map { it.id }, year.spine.map { it.id })
        val start = Calendar.getInstance().apply { time = year.start }
        val now = Calendar.getInstance().apply { time = TAURUS_2027 }
        assertEquals(now.get(Calendar.YEAR), start.get(Calendar.YEAR))
        assertEquals(now.get(Calendar.MONTH), start.get(Calendar.MONTH))
    }

    @Test
    fun `without a chart the year has no spine`() = runTest(dispatcher) {
        val model = model()

        model.loadYear(TAURUS_2027)
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
        /**
         * Taurus season, 2027: no eclipse in it, the seeded chart's transits
         * lead it, and it is months from when these tests were written, so a
         * page that read the clock again would not pass by chance.
         */
        val TAURUS_2027: Date = Date.from(java.time.Instant.parse("2027-05-01T12:00:00Z"))
    }
}
