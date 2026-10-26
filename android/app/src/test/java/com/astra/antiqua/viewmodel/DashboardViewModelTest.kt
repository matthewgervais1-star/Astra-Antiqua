package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.DecreeBanks
import com.astra.antiqua.domain.LongTransits
import com.astra.antiqua.domain.natalPointsOf
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
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class DashboardViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    private fun model(
        profiles: FakeProfiles,
        settings: FakeSettings = FakeSettings(AncientCulture.ROME),
    ) = DashboardViewModel(AstronomyEngine(), profiles, settings, readingsFromSharedContent())

    // The chart is computed on Dispatchers.Default, so advanceUntilIdle alone
    // returns before it lands; wait for the state to leave Loading.
    private suspend fun DashboardViewModel.settled() = chartState.first { it !is ChartState.Loading }

    @Test
    fun `a stored birth record yields a chart that lists all ten bodies`() = runTest(dispatcher) {
        val model = model(FakeProfiles(romeProfile()))

        model.calculateChart()
        advanceUntilIdle()
        val state = model.settled()

        assertTrue("Expected Success but was $state", state is ChartState.Success)
        val success = state as ChartState.Success
        assertEquals(Planet.entries.toSet(), success.chartData.planets.keys)
        assertEquals(Planet.entries.toSet(), success.placements.keys)
        // With a chart the lists and the dive deeper read it.
        val extras = model.dayExtras.value!!
        assertEquals(true, extras.listsFromChart)
        assertEquals(true, extras.diveDeeper.natal)
    }

    @Test
    fun `the big three are the Sun and the Moon composed for the reader`() = runTest(dispatcher) {
        val model = model(FakeProfiles(romeProfile()))

        model.calculateChart()
        advanceUntilIdle()
        val success = model.settled() as ChartState.Success

        assertEquals(2, success.bigThreePlacements.size)
        assertEquals(success.placements[Planet.SUN], success.bigThreePlacements[0])
        assertEquals(success.placements[Planet.MOON], success.bigThreePlacements[1])
    }

    @Test
    fun `the high priest speaks in the culture in force`() = runTest(dispatcher) {
        val rome = model(FakeProfiles(romeProfile()), FakeSettings(AncientCulture.ROME))
        val egypt = model(FakeProfiles(romeProfile()), FakeSettings(AncientCulture.EGYPT))

        rome.calculateChart()
        egypt.calculateChart()
        advanceUntilIdle()
        val romeSummary = (rome.settled() as ChartState.Success).highPriestSummary
        val egyptSummary = (egypt.settled() as ChartState.Success).highPriestSummary

        assertTrue(romeSummary.isNotBlank())
        assertNotEquals(romeSummary, egyptSummary)
    }

    @Test
    fun `with no birth record the dashboard asks the reader to start over`() = runTest(dispatcher) {
        val model = model(FakeProfiles(profile = null))

        model.calculateChart()
        advanceUntilIdle()
        val state = model.settled()

        assertTrue("Expected Error but was $state", state is ChartState.Error)
        assertTrue((state as ChartState.Error).message.contains("onboarding"))
    }

    @Test
    fun `with a chart the day names its long transit, read against the day it reads`() = runTest(dispatcher) {
        val model = model(FakeProfiles(romeProfile()))
        val now = java.util.Date.from(java.time.Instant.parse("2026-12-15T15:00:00Z"))

        model.calculateChart(now, date = "2026-10-27")
        advanceUntilIdle()
        val chart = (model.settled() as ChartState.Success).chartData
        val teaser = model.longTransit.first { it != null }!!

        assertTrue(teaser.status == LongTransits.TeaserStatus.ACTIVE || teaser.status == LongTransits.TeaserStatus.UPCOMING)
        val dated = java.util.Date.from(java.time.Instant.parse("2026-10-27T00:00:00Z"))
        assertEquals(LongTransits.teaser(AstronomyEngine(), AncientCulture.ROME, dated, natalPointsOf(chart)), teaser)
    }

    @Test
    fun `with no birth record the long transit asks for a chart`() = runTest(dispatcher) {
        val model = model(FakeProfiles(profile = null))

        model.calculateChart()
        advanceUntilIdle()
        model.settled()

        assertEquals(LongTransits.TeaserStatus.CTA, model.longTransit.first { it != null }!!.status)
    }

    @Test
    fun `the day page shows without a birth record, in the culture in force`() = runTest(dispatcher) {
        val model = model(FakeProfiles(profile = null), FakeSettings(AncientCulture.CARTHAGE))
        val now = java.util.Date.from(java.time.Instant.parse("2026-09-29T15:00:00Z"))

        model.calculateChart(now)
        advanceUntilIdle()
        model.settled()
        val decree = model.dayDecree.first { it != null }!!

        assertEquals("Your name is good for credit anywhere on the quay.", decree.headline)
        assertEquals("SEMES △ BAAL SHAMEM · 0°19′", decree.evidence)
        assertEquals(DecreeBanks.comeBack(AncientCulture.CARTHAGE), decree.comeBack)
        // Without a chart the lists and the dive deeper read the sky.
        val extras = model.dayExtras.value!!
        assertEquals(false, extras.listsFromChart)
        assertEquals(false, extras.diveDeeper.natal)
        assertEquals(4, extras.diveDeeper.groups.size)
    }

    @Test
    fun `a dated day reads midnight UTC on its date, not now`() = runTest(dispatcher) {
        val model = model(FakeProfiles(profile = null), FakeSettings(AncientCulture.CARTHAGE))
        val now = java.util.Date.from(java.time.Instant.parse("2026-10-26T15:00:00Z"))

        model.calculateChart(now, date = "2026-09-29")
        advanceUntilIdle()
        model.settled()
        val decree = model.dayDecree.first { it != null }!!

        // The pinned reading of 2026-09-29, the one the live-day test above reads at 15:00 UTC.
        assertEquals("Your name is good for credit anywhere on the quay.", decree.headline)
        assertEquals("SEMES △ BAAL SHAMEM · 0°19′", decree.evidence)
        val live = model(FakeProfiles(profile = null), FakeSettings(AncientCulture.CARTHAGE))
        live.calculateChart(now)
        advanceUntilIdle()
        live.settled()
        assertNotEquals(decree.evidence, live.dayDecree.first { it != null }!!.evidence)
    }

    @Test
    fun `a date that is no day reads the live day`() = runTest(dispatcher) {
        val now = java.util.Date.from(java.time.Instant.parse("2026-09-29T15:00:00Z"))
        val live = model(FakeProfiles(profile = null), FakeSettings(AncientCulture.CARTHAGE))
        live.calculateChart(now)
        advanceUntilIdle()
        live.settled()
        val liveDecree = live.dayDecree.first { it != null }!!

        // Not a date, a date that does not exist, and one past the 1900 to 2100 span a page reads.
        listOf("garbage", "2026-02-30", "1850-01-01", "2150-06-01").forEach { date ->
            val model = model(FakeProfiles(profile = null), FakeSettings(AncientCulture.CARTHAGE))
            model.calculateChart(now, date = date)
            advanceUntilIdle()
            model.settled()
            assertEquals(date, liveDecree, model.dayDecree.first { it != null }!!)
        }
    }
}
