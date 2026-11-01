package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.screens.wheelAngle
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.cos
import kotlin.math.sin

/**
 * Sky Season at the canvas's sample state (2026-10-21 06:00 UTC, read in Rome,
 * the smoke birth): the expected strings are web's, from a node run of
 * `getCurrentSeason`, `getSeasonSkyEvents`, `buildSeasonSkyRows`,
 * `composeWhatItTouchesSky` and `composeWhatItTouchesNatal` against `web/src`
 * with TZ Europe/Rome on 2026-10-31.
 */
class SkySeasonTest {

    @get:org.junit.Rule
    val zone = RomeZoneRule()

    private val engine = AstronomyEngine()

    private val chart by lazy { CalculateNatalChartUseCase(engine).execute(SkyDayTest.smokeBirth) }

    private fun season(culture: AncientCulture, withChart: Boolean = true) =
        SkySeasonComposer.compose(engine, culture, SkyDayTest.sampleNow, if (withChart) chart.ascendant else null)

    @Test
    fun `the sample season is the Scales, day 29 of 31, closing`() {
        val s = season(AncientCulture.EGYPT)
        assertEquals(ZodiacSign.LIBRA, s.window.sign)
        assertEquals("23 SEP → 23 OCT 2026", SkyWeekComposer.range(s.window.start, s.window.end))
        assertEquals("THE SEASON OF THE SCALES", s.headline)
        assertEquals("DAY 29 OF 31 · CLOSING", s.status)
        assertEquals(2, s.daysRemaining)
        // web OrbBar: round((1 - 2/31) * 100).
        assertEquals(94, s.barPercent)
        assertEquals("The scales; forever balancing, reluctant to settle, at its best in partnership.", s.signProse)
    }

    @Test
    fun `the rows are web's for Egypt and Rome`() {
        fun rows(c: AncientCulture) = season(c).rows.map { "${SkySeasonComposer.dayMonth(it.date)} ${it.label} ${it.tone}" }
        assertEquals(
            listOf(
                "23 SEP RA → THE SCALES · SEASON OPENS DIM",
                "3 OCT ISIS STATIONED ℞ CONFLICT",
                "23 OCT RA → THE SCORPION · SEASON CLOSES DIM",
            ),
            rows(AncientCulture.EGYPT),
        )
        assertEquals(
            listOf(
                "23 SEP SOL → THE SCALES · SEASON OPENS DIM",
                "3 OCT VENUS STATIONED ℞ CONFLICT",
                "23 OCT SOL → THE SCORPION · SEASON CLOSES DIM",
            ),
            rows(AncientCulture.ROME),
        )
    }

    @Test
    fun `the house is the eleventh, in web's sentence`() {
        val egypt = season(AncientCulture.EGYPT).house!!
        assertEquals(11, egypt.house)
        assertEquals("The eleventh house · The Assembly", egypt.title)
        assertEquals(
            "The season sits in your eleventh house, which this culture keeps under the ferry. It works on your allies, your assembly, and the things you hope for.",
            egypt.prose,
        )
        assertEquals(
            "The season sits in your eleventh house, which this culture keeps under via. It works on your allies, your assembly, and the things you hope for.",
            season(AncientCulture.ROME).house!!.prose,
        )
    }

    @Test
    fun `without a chart the section reads the sky's ingresses`() {
        val s = season(AncientCulture.EGYPT, withChart = false)
        assertNull(s.house)
        assertEquals("Horus the Red enters the Lion on 28 SEP. Sebegu enters the Scorpion on 30 SEP.", s.touchesSky)
        assertEquals("Mars enters the Lion on 28 SEP. Mercurius enters the Scorpion on 30 SEP.", season(AncientCulture.ROME, false).touchesSky)
    }

    @Test
    fun `web's status and fill at the edges`() {
        assertEquals("OPENING", SkySeasonComposer.status(30, 4, 26))
        assertEquals("MIDPOINT PASSED", SkySeasonComposer.status(30, 6, 24))
        assertEquals("CLOSING", SkySeasonComposer.status(30, 26, 4))
        assertEquals(6, SkySeasonComposer.barPercent(30, 31))
        assertEquals("Water-Bearer", SkySeasonComposer.properCase("WATER-BEARER"))
    }

    @Test
    fun `the wheel places the board's points`() {
        // r3-common.mjs at Sagittarius 22°23′ rising: the eleventh house's outer corner
        // at -7.42, -55.51 and the Sun's mark (Libra 27°56′) at -25, -34.98.
        val asc = 240 + 22 + 23 / 60.0
        fun pt(lon: Double, r: Double): Pair<Double, Double> {
            val a = Math.toRadians(wheelAngle(lon, asc).toDouble())
            return r * cos(a) to r * sin(a)
        }
        val near = { a: Pair<Double, Double>, x: Double, y: Double -> kotlin.math.abs(a.first - x) < 0.02 && kotlin.math.abs(a.second - y) < 0.02 }
        assertTrue(pt(540.0, 56.0).toString(), near(pt(540.0, 56.0), -7.42, -55.51))
        assertTrue(pt(207.94, 43.0).toString(), near(pt(207.94, 43.0), -25.0, -34.98))
        assertTrue(pt(asc, 56.0).toString(), near(pt(asc, 56.0), -56.0, 0.0))
        // The smoke birth is the brief's chart: Sagittarius rising.
        assertEquals(ZodiacSign.SAGITTARIUS, ZodiacSign.entries[(chart.ascendant / 30).toInt()])
    }
}
