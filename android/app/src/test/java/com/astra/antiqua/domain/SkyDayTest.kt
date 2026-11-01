package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.data.local.room.UserProfile
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test
import java.text.SimpleDateFormat
import java.time.Instant
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Sky Day at the canvas's sample state: 2026-10-21 06:00 UTC, the smoke
 * birth (Rome, 1990-01-15 05:30 local, 04:30 UTC). The Moon and Season facts
 * are the design record's (docs/design/ios-layout-2026-10-21.md, 2026-10-28:
 * illuminated fraction 0.741 at 06:00 UTC, the next full moon 2026-10-26
 * 04:12 UTC; the Glass-Day board: SUN IN LIBRA · DAY 29 OF 31, 23 SEP to 23 OCT).
 */
class SkyDayTest {

    companion object {
        val sampleNow: Date = Date.from(Instant.parse("2026-10-21T06:00:00Z"))

        val smokeBirth = UserProfile(
            name = "Smoke Test",
            birthDateUtc = Instant.parse("1990-01-15T04:30:00Z").toEpochMilli(),
            latitude = 41.9028,
            longitude = 12.4964,
            cityName = "Rome, Italy",
            timezoneId = "Europe/Rome",
        )
    }

    // The season counts local calendar days (web season.ts); the sample is read
    // in Rome, the smoke birth's city, as the canvas reads it (08:00 Rome).
    @get:org.junit.Rule
    val zone = RomeZoneRule()

    private val engine = AstronomyEngine()

    // Built inside each test, after the zone rule has run.
    private val chart by lazy { CalculateNatalChartUseCase(engine).execute(smokeBirth) }

    private fun utc(date: Date, pattern: String): String =
        SimpleDateFormat(pattern, Locale.UK).apply { timeZone = TimeZone.getTimeZone("UTC") }.format(date)

    @Test
    fun `the Moon reads as the design record`() {
        val moon = SkyDayComposer.moonToday(engine, sampleNow)
        assertEquals("Waxing Gibbous", moon.phase)
        assertEquals(74, moon.percentLit)
        assertEquals("Full Moon", moon.nextName)
        assertEquals("2026-10-26 04:12", utc(moon.nextDate!!, "yyyy-MM-dd HH:mm"))
    }

    @Test
    fun `the season reads as the board`() {
        val season = SkyEvents.currentSeason(engine, sampleNow)
        assertEquals(ZodiacSign.LIBRA, season.sign)
        assertEquals(29, season.dayOfSeason)
        assertEquals(31, season.totalDays)
    }

    @Test
    fun `the sample day composes for every culture`() {
        AncientCulture.entries.forEach { culture ->
            val day = SkyDayComposer.compose(engine, culture, sampleNow, chart)
            println("SKYDAY $culture headline=${day.decree.headline} | evidence=${day.decree.evidence} | body=${day.headlineBody}")
            day.contacts!!.forEach { println("SKYDAY $culture contact ${it.transit} ${it.aspect} ${it.natal} %.4f | ${it.sentence}".format(it.orb)) }
            val lt = day.longTransit
            assertNotNull(lt)
            println("SKYDAY $culture long ${lt!!.span.id} active=${lt.active} progress=%.3f passes=${lt.span.passes.size} %s to %s".format(lt.progress, utc(lt.span.start, "yyyy-MM-dd"), utc(lt.span.end, "yyyy-MM-dd")))
        }
        println("SKYDAY chart asc=%.3f sun=%.3f".format(chart.ascendant, chart.planets.getValue(com.astra.antiqua.model.Planet.SUN).longitude))
    }
}

/** Runs a test with the JVM's default zone set to Europe/Rome, then restores it. */
class RomeZoneRule : org.junit.rules.ExternalResource() {
    private var saved: TimeZone? = null

    override fun before() {
        saved = TimeZone.getDefault()
        TimeZone.setDefault(TimeZone.getTimeZone("Europe/Rome"))
    }

    override fun after() {
        saved?.let { TimeZone.setDefault(it) }
    }
}
