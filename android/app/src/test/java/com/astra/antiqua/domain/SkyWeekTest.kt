package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant
import java.util.Calendar
import java.util.Date

/**
 * Sky Week at the canvas's sample state (2026-10-21 06:00 UTC, read in Rome):
 * the week of Monday 19 October, Wednesday framed as today, the Moon as Sky
 * Day reads it (the band's five facts on Glass-Week).
 */
class SkyWeekTest {

    @get:org.junit.Rule
    val zone = RomeZoneRule()

    private val engine = AstronomyEngine()

    private fun local(y: Int, m: Int, d: Int): Date = Calendar.getInstance().apply {
        clear()
        set(y, m - 1, d)
    }.time

    @Test
    fun `the sample week runs Monday 19 to Sunday 25 October`() {
        val week = SkyWeekComposer.compose(engine, AncientCulture.EGYPT, SkyDayTest.sampleNow)
        assertEquals("19 → 25 OCT 2026", SkyWeekComposer.range(week.start, week.end))
        assertEquals(listOf("MON 19", "TUE 20", "WED 21", "THU 22", "FRI 23", "SAT 24", "SUN 25"), week.days.map { it.label })
        assertEquals(listOf(false, false, true, false, false, false, false), week.days.map { it.isToday })
        assertEquals("Waxing Gibbous", week.moon.phase)
        assertEquals(74, week.moon.percentLit)
        assertTrue(week.moon.waxing)
        // web's buildWeekDays("egypt", mondayOf(sample), null) under TZ=Europe/Rome, run with node
        // against web/src on 2026-10-31: the lines and the shorthand the rows print.
        assertEquals(
            listOf(
                "Your beloved and what you have buried haul each other down. An old grievance is aired anew.",
                "Your beloved and what you have buried get in each other's way, and the cord is drawn tight. An old grievance is aired anew.",
                "Your beloved and what you have buried pull at each other, and Thoth records it to the hair. An old grievance is aired anew.",
                "Your moods and your plans for the new season haul each other down. The scheme you trusted breaks at the dike.",
                "Ra is ferried into the Scorpion. The priest of the hours on the temple roof watches the sign's decans rise and reads the day's own course in them.",
                "Your moods and your dreams go out together, and Thoth records it to the hair. A dream comes true by daylight.",
                "Your moods and your temper like each other. Your effort lands where you aim it.",
            ),
            week.days.map { it.line },
        )
        assertEquals(
            WeekShorthand.Aspect(com.astra.antiqua.model.Planet.VENUS, AspectType.SQUARE, com.astra.antiqua.model.Planet.PLUTO, tight = true),
            week.days[1].shorthand,
        )
        assertEquals(WeekShorthand.Ingress(com.astra.antiqua.model.Planet.SUN, ZodiacSign.SCORPIO), week.days[4].shorthand)
        assertEquals("SEVEN DAYS · SEVEN WEIGHED · NONE QUIET", SkyWeekComposer.countLine(week.days))
        assertEquals("26 OCT 2026", SkyWeekComposer.dayMonthYear(week.moon.nextDate!!))
        // web WeekNave: the hardest day is Monday's tension, its reading id the ISO week.
        assertEquals("WEIGH WHAT IS HEAVY BEFORE\nYOU CARRY IT INTO FRIDAY", WeekVoice.votive(AncientCulture.EGYPT, week.days))
        assertEquals("week-2026-W43", WeekVoice.readingId(week.start))
        assertEquals("week-2026-W53", WeekVoice.readingId(local(2026, 12, 28)))
        // The fallbacks: no tension day takes the harmony line; a quiet week, and an empty one, the quiet line.
        val quiet = WeekDay(Date(0), "MON 1", false, null, "", DayTone.QUIET, false, WeekShorthand.Quiet, null)
        val easy = quiet.copy(tone = DayTone.HARMONY)
        assertEquals("TAKE THE CURRENT WHILE\nIT RUNS WITH YOU", WeekVoice.votive(AncientCulture.EGYPT, listOf(quiet, easy)))
        assertEquals("ORDINARY DAYS ARE NOT\nEMPTY DAYS", WeekVoice.votive(AncientCulture.EGYPT, listOf(quiet)))
        assertEquals("ORDINARY DAYS ARE NOT\nEMPTY DAYS", WeekVoice.votive(AncientCulture.EGYPT, emptyList()))
        // The headline is the day page's, as the web prints it above the line; none on an ingress day.
        assertTrue(week.days[0].headline != null && week.days[4].headline == null)
    }

    @Test
    fun `the range crosses a month and a year in the board's form`() {
        assertEquals("29 SEP → 5 OCT 2026", SkyWeekComposer.range(local(2026, 9, 29), local(2026, 10, 5)))
        assertEquals("28 DEC 2026 → 3 JAN 2027", SkyWeekComposer.range(local(2026, 12, 28), local(2027, 1, 3)))
    }

    @Test
    fun `the count line counts weighed and quiet days`() {
        val day = { s: WeekShorthand -> WeekDay(Date(0), "MON 1", false, null, "", DayTone.QUIET, false, s, null) }
        val ingress = WeekShorthand.Ingress(com.astra.antiqua.model.Planet.MOON, ZodiacSign.PISCES)
        assertEquals("SEVEN DAYS · SIX WEIGHED · ONE QUIET", SkyWeekComposer.countLine(List(6) { day(ingress) } + day(WeekShorthand.Quiet)))
        assertEquals("SEVEN DAYS · SEVEN WEIGHED · NONE QUIET", SkyWeekComposer.countLine(List(7) { day(ingress) }))
    }

    @Test
    fun `a waning Moon lights its left side`() {
        val moon = SkyDayComposer.moonToday(engine, Date.from(Instant.parse("2026-10-30T06:00:00Z")))
        assertTrue(moon.phase, moon.phase.startsWith("Waning"))
        assertTrue(!moon.waxing)
    }
}
