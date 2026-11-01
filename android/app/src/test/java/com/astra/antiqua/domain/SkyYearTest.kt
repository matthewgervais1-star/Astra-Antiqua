package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.screens.YearMonth
import com.astra.antiqua.ui.screens.yearMonths
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant
import java.util.Date

/**
 * Sky Year at the canvas's sample state (2026-10-21 06:00 UTC, read in Rome,
 * the smoke birth) and at 2025-03-01, 2026-12-30 and 2026-09-29. The slots
 * (kicker, title, count, month labels, rows, prose, TODAY, votive, cast lines)
 * are pinned by ScreenGoldenTest against web's year goldens; this test pins
 * what the goldens do not: the opening paragraph, the segments, the spine and
 * the votive's tone. Every expected string is web's, from a node run of
 * `buildYearScreen`, `buildYearSegments`, `computeTransitSpans` with YearNave's
 * filter and `spanHeadline` against `web/src` with `process.env.TZ =
 * "Europe/Rome"` on 2026-11-01 (an en-US runtime for toLocaleDateString).
 */
class SkyYearTest {

    @get:org.junit.Rule
    val zone = RomeZoneRule()

    private val engine = AstronomyEngine()

    private val natal by lazy {
        SkySeasonComposer.natal(engine, CalculateNatalChartUseCase(engine).execute(SkyDayTest.smokeBirth), SkyDayTest.smokeBirth.latitude, SkyDayTest.smokeBirth.longitude)
    }

    private fun at(iso: String): Date = Date.from(Instant.parse(iso))

    private fun year(culture: AncientCulture, now: Date = SkyDayTest.sampleNow, withChart: Boolean = true) =
        SkyYearComposer.compose(engine, culture, now, if (withChart) natal else null)

    private fun segments(y: SkyYear) = y.segments.map { listOf(it.label, it.dateRange, it.summary, it.status) }

    private fun spine(y: SkyYear) = y.spine.map { "${it.headline} | ${it.end}" }

    private val quiet = "This is a quiet stretch with little coming at you. No push, no pull, just room. Do not waste it waiting for something to happen. Rest properly, clean up what you have let slide, the inbox, the paperwork, the half-finished thing, and decide plainly what you want next. The lull is short. Use it to get clear and steady before the next demanding stretch arrives."

    private val saturnSquareSun = "Something presses on who you are this year, and it does not let up. An old voice says you have to earn the right to take up space, so you keep proving yourself to people who never really watch. The job that hollows you out, the parent you cannot satisfy, the room where you go quiet and small: the pressure is here to show you the cost. It will feel like failure. It is not. It is the bill for a life spent performing. The peak forces the question you keep avoiding: who is this actually for. Cut the dead weight and stand as you are."

    @Test
    fun `the sample year, 21 turnings and 49 lunations, web's tones, TODAY on the 21st`() {
        val y = year(AncientCulture.EGYPT)
        assertEquals(21, y.turnings.size)
        assertEquals(49, y.lunations)
        assertEquals(
            "conflict,dim,dim,dim,dim,conflict,conflict,dim,conflict,dim,dim,dim,conflict,conflict,dim,conflict,dim,conflict,conflict,conflict,dim",
            y.turnings.joinToString(",") { if (it.conflict) "conflict" else "dim" },
        )
        // web's timeline starts at the instant: no turning sits before TODAY.
        assertTrue(y.turnings.all { it.date.time >= y.now.time })
        val slots = SkyYearSlots.build(y, AncientCulture.EGYPT)
        assertEquals("70 TURNINGS · STATIONS, INGRESSES, LUNATIONS", slots.text("year.countLine"))
        assertEquals("24 OCT · MERCURY TURNS RETROGRADE", slots.list("year.row.head").first())
        assertEquals("TODAY · 21 OCT", slots.text("year.today"))
        assertEquals("year-2026", y.readingId)
        // TODAY leads October, whose one turning follows it.
        assertEquals(YearMonth("OCT 2026", true, 0..0), yearMonths(slots.list("year.monthLabel"), SkyYearSlots.todayMonth(y)).first())
    }

    @Test
    fun `with the chart, Saturn square the Sun leads the year, so the votive is tension`() {
        val y = year(AncientCulture.EGYPT)
        assertEquals(AspectType.SQUARE, y.report!!.dominant)
        assertEquals("tension", SkyYearComposer.votiveTone(y.report!!.dominant))
        assertEquals(saturnSquareSun, y.opening)
        assertEquals("WEIGH THIS YEAR BEFORE\nTHE FLOOD WEIGHS IT FOR YOU", SkyYearSlots.build(y, AncientCulture.EGYPT).text("year.votive"))
        assertFalse(y.festivals)
        assertEquals(
            listOf(
                listOf("AKHET · THE FLOOD", "21 OCT → 20 JAN", quiet, "DAY 1 / 92"),
                listOf(
                    "PERET · THE SOWING",
                    "20 JAN → 21 JUL",
                    "Geb bars the door against your the top of your chart, exact on March 22. Annular solar eclipse of Ra in Aquarius on February 6. Geb tips the scales against your Ra, exact on June 8. Penumbral lunar eclipse of Khonsu in Capricorn on July 18.",
                    "COMING",
                ),
                listOf("SHEMU · THE HARVEST", "21 JUL → 20 OCT", "Geb tips the scales against your Ra, exact on October 13. Total solar eclipse of Ra in Leo on August 2.", "COMING"),
            ),
            segments(y),
        )
        assertEquals(
            listOf(
                "AMUN ROWS IN TIME WITH YOUR ASCENDANT | → JUN 2027",
                "GEB BARS THE DOOR AGAINST YOUR MIDHEAVEN | → APR 2027",
                "GEB ROWS IN TIME WITH YOUR ASCENDANT | → JUN 2027",
                "GEB TIPS THE SCALES AGAINST YOUR NATAL RA | → NOV 2027",
                "AMUN JOINS THE BARQUE OF YOUR NATAL KHONSU | → OCT 2027",
            ),
            spine(y),
        )
    }

    @Test
    fun `without the chart, web's sky-only opening, no segments, spine or votive`() {
        val y = year(AncientCulture.EGYPT, withChart = false)
        assertNull(y.report)
        assertEquals("This is the sky alone, without a chart to carry it. Cast one, and the year gains a thread the flood can follow.", y.opening)
        assertTrue(y.segments.isEmpty() && y.spine.isEmpty())
        val slots = SkyYearSlots.build(y, AncientCulture.EGYPT)
        assertFalse(slots.has("year.votive"))
        assertEquals(listOf("CAST A CHART TO READ THE YEAR AGAINST YOUR OWN SKY", "CAST A CHART →"), slots.list("year.noChart"))
        assertEquals(
            "This is the sky alone, read without a chart to take the auspices for. Cast one, and the year has a subject.",
            year(AncientCulture.ROME, withChart = false).opening,
        )
    }

    @Test
    fun `each culture cuts the year its own way`() {
        val rome = year(AncientCulture.ROME)
        assertEquals(
            listOf(
                listOf("VER", "21 OCT → 20 JAN", quiet, "DAY 1 / 92"),
                listOf("AESTAS", "20 JAN → 21 APR", "Saturnus sits on the opposite bench from your the top of your chart, exact on March 22. Annular solar eclipse of Sol in Aquarius on February 6.", "COMING"),
                listOf("AUTUMNUS", "21 APR → 21 JUL", "Saturnus raises the spear against your Sol, exact on June 8. Penumbral lunar eclipse of Luna in Capricorn on July 18.", "COMING"),
                listOf("HIEMS", "21 JUL → 20 OCT", "Saturnus raises the spear against your Sol, exact on October 13. Total solar eclipse of Sol in Leo on August 2.", "COMING"),
            ),
            segments(rome),
        )
        assertEquals("IUPPITER MARCHES UNDER THE SAME EAGLE AS YOUR NATAL LUNA | → OCT 2027", spine(rome).last())

        val greece = year(AncientCulture.GREECE)
        assertTrue(greece.festivals)
        assertEquals(listOf("LENAIA", "ANTHESTERIA TO THARGELIA", "PANATHENAIA", "THE MYSTERIES"), greece.segments.map { it.label })
        assertEquals("Kronos challenges your Helios, exact on June 8. Penumbral lunar eclipse of Selene in Capricorn on July 18.", greece.segments[2].summary)
        assertEquals("ZEUS STANDS SHOULDER TO SHOULDER WITH YOUR NATAL SELENE | → OCT 2027", spine(greece).last())

        val canaan = year(AncientCulture.CANAAN)
        assertEquals(
            listOf(
                listOf("THE RAINS · BAAL RETURNED", "21 OCT → 21 APR", "$quiet El convenes the council against your the top of your chart, exact on March 22. Annular solar eclipse of Shapash in Aquarius on February 6.", "DAY 1 / 183"),
                listOf("THE DRY · MOT HOLDS HIM", "21 APR → 20 OCT", "El draws the bow against your Shapash, exact on June 8. Penumbral lunar eclipse of Yarikh in Capricorn on July 18. El draws the bow against your Shapash, exact on October 13. Total solar eclipse of Shapash in Leo on August 2.", "COMING"),
            ),
            segments(canaan),
        )
        assertEquals("BAAL HADAD SPEAKS FAVOR OVER YOUR ASCENDANT | → JUN 2027", spine(canaan).first())

        val carthage = year(AncientCulture.CARTHAGE)
        assertEquals(listOf("MARE APERTUM · THE OPEN SEA", "MARE CLAUSUM · THE HAULED-UP MONTHS"), carthage.segments.map { it.label })
        assertEquals("Baal Hammon turns the prow against your Semes, exact on June 8. Penumbral lunar eclipse of Tanit in Capricorn on July 18. Baal Hammon turns the prow against your Semes, exact on October 13. Total solar eclipse of Semes in Leo on August 2.", carthage.segments[1].summary)
        assertEquals("BAAL HAMMON SAILS UNDER ONE BANNER WITH YOUR NATAL TANIT | → OCT 2027", spine(carthage).last())
        // Every culture's year turns on the same Saturn square.
        AncientCulture.entries.forEach { assertEquals(saturnSquareSun, year(it).opening) }
    }

    @Test
    fun `1 March 2025, Jupiter opposite the Sun, web's two paragraphs, six spans`() {
        val y = year(AncientCulture.EGYPT, at("2025-03-01T06:00:00Z"))
        assertEquals(27, y.turnings.size)
        assertEquals(AspectType.OPPOSITION, y.report!!.dominant)
        assertEquals(
            "Opportunity keeps arriving, and so does the urge to grab all of it. This is the year you say yes to too much, promise more than you can build, and confuse motion with a plan. The confidence is not the problem. The overreach is. You will feel ten feet tall right up until the bill lands and you are known for finishing nothing.\n\nPick the two things that actually matter to who you are becoming and let the rest go, even the flattering offers, even the prestigious ones. Commit only to what you can finish. Say no to the third project out loud. The version of you that delivers on two things beats the version that brags about ten and crumbles in front of everyone watching.",
            y.opening,
        )
        assertEquals(
            listOf(
                listOf("AKHET · THE FLOOD", "1 MAR → 31 MAY", "Nut rows in time with your Ra, exact on April 1. Total lunar eclipse of Khonsu in Virgo on March 14.", "DAY 1 / 92"),
                listOf("PERET · THE SOWING", "31 MAY → 29 NOV", "Amun tips the scales against your the top of your chart, exact on August 19. Amun bars the door against your Ra, exact on October 27. Total lunar eclipse of Khonsu in Pisces on September 7.", "COMING"),
                listOf("SHEMU · THE HARVEST", "29 NOV → 28 FEB", "Amun tips the scales against your the top of your chart, exact on February 21. Annular solar eclipse of Ra in Aquarius on February 17.", "COMING"),
            ),
            segments(y),
        )
        assertEquals(
            listOf(
                "NUT ROWS IN TIME WITH YOUR NATAL RA | → MAY 2025",
                "AMUN TIPS THE SCALES AGAINST YOUR NATAL KHONSU | → APR 2025",
                "GEB TIPS THE SCALES AGAINST YOUR ASCENDANT | → APR 2025",
                "AMUN ROWS IN TIME WITH YOUR MIDHEAVEN | → APR 2025",
                "GEB OFFERS A STEADY HAND TO YOUR NATAL RA | → APR 2025",
                "AMUN BARS THE DOOR AGAINST YOUR ASCENDANT | → MAY 2025",
            ),
            spine(y),
        )
    }

    @Test
    fun `30 December 2026, the year reads across the year's end, TODAY under its own month`() {
        val y = year(AncientCulture.EGYPT, at("2026-12-30T06:00:00Z"))
        assertEquals(18, y.turnings.size)
        assertEquals("year-2026", y.readingId)
        val slots = SkyYearSlots.build(y, AncientCulture.EGYPT)
        assertEquals("MMXXVI · THE YEAR OF THE RIVER", slots.text("year.title"))
        assertEquals("10 JAN · MARS TURNS RETROGRADE", slots.list("year.row.head").first())
        // No turning falls on 30 or 31 December: TODAY takes DEC 2026, the first turning opens JAN 2027.
        val months = yearMonths(slots.list("year.monthLabel"), SkyYearSlots.todayMonth(y))
        assertEquals(YearMonth("DEC 2026", true, IntRange.EMPTY), months[0])
        assertEquals("JAN 2027", months[1].label)
        assertFalse(months[1].today)
        assertEquals(
            listOf(
                listOf("AKHET · THE FLOOD", "30 DEC → 31 MAR", "Geb bars the door against your the top of your chart, exact on March 22. Annular solar eclipse of Ra in Aquarius on February 6.", "DAY 1 / 92"),
                listOf("PERET · THE SOWING", "31 MAR → 29 SEP", "Geb tips the scales against your Ra, exact on June 8. Amun joins the barque of your Khonsu, exact on September 27. Penumbral lunar eclipse of Khonsu in Capricorn on July 18.", "COMING"),
                listOf("SHEMU · THE HARVEST", "29 SEP → 29 DEC", "Geb tips the scales against your Ra, exact on October 13.", "COMING"),
            ),
            segments(y),
        )
        assertEquals(
            listOf(
                "AMUN ROWS IN TIME WITH YOUR ASCENDANT | → JUN 2027",
                "GEB BARS THE DOOR AGAINST YOUR MIDHEAVEN | → APR 2027",
                "GEB ROWS IN TIME WITH YOUR ASCENDANT | → MAR 2028",
                "GEB TIPS THE SCALES AGAINST YOUR NATAL RA | → NOV 2027",
                "AMUN JOINS THE BARQUE OF YOUR NATAL KHONSU | → OCT 2027",
                "AMUN TIPS THE SCALES AGAINST YOUR ASCENDANT | → DEC 2027",
            ),
            spine(y),
        )
    }

    @Test
    fun `29 September 2026, no turning before TODAY, which takes September`() {
        val y = year(AncientCulture.EGYPT, at("2026-09-29T06:00:00Z"))
        assertTrue(y.turnings.all { it.date.time >= y.now.time })
        val slots = SkyYearSlots.build(y, AncientCulture.EGYPT)
        assertEquals("3 OCT · VENUS TURNS RETROGRADE", slots.list("year.row.head").first())
        assertEquals("TODAY · 29 SEP", slots.text("year.today"))
        val months = yearMonths(slots.list("year.monthLabel"), SkyYearSlots.todayMonth(y))
        assertEquals(YearMonth("SEP 2026", true, IntRange.EMPTY), months[0])
        assertEquals("OCT 2026", months[1].label)
        assertEquals(
            listOf("AKHET · THE FLOOD", "29 SEP → 29 DEC", "Amun rows in time with your the threshold of your chart, exact on October 18.", "DAY 1 / 92"),
            segments(y).first(),
        )
        assertEquals("GEB TIPS THE SCALES AGAINST YOUR NATAL RA | → JUL 2027", spine(y)[3])
    }

    @Test
    fun `web's segment status and votive tone at the edges`() {
        val start = at("2026-01-01T00:00:00Z")
        val end = Date(start.time + 91L * 86_400_000 - 1)
        assertEquals("COMING", SkyYearComposer.status(start, end, Date(start.time - 1)))
        assertEquals("DONE", SkyYearComposer.status(start, end, Date(end.time + 1)))
        assertEquals("DAY 1 / 92", SkyYearComposer.status(start, end, start))
        assertEquals("DAY 92 / 92", SkyYearComposer.status(start, end, end))
        assertEquals("quiet", SkyYearComposer.votiveTone(null))
        assertEquals("tension", SkyYearComposer.votiveTone(AspectType.OPPOSITION))
        assertEquals("harmony", SkyYearComposer.votiveTone(AspectType.CONJUNCTION))
        assertEquals("harmony", SkyYearComposer.votiveTone(AspectType.SEXTILE))
        assertEquals("A QUIET YEAR IS\nSTILL COUNSEL GIVEN", SkyYearComposer.votive(AncientCulture.GREECE, "quiet"))
    }
}
