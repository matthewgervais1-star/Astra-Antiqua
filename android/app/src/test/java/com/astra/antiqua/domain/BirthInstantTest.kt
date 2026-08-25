package com.astra.antiqua.domain

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZoneOffset
import java.util.TimeZone
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

/**
 * [resolveBirthDateUtcMillis] must resolve a wall-clock birth date/time
 * using the [java.time.ZoneId] it is explicitly given, never an ambient
 * default -- that is the whole point of threading the zone through as a
 * parameter (see the function doc). These tests force the JVM's own default
 * zone to something else entirely, so a regression that reads
 * `ZoneId.systemDefault()` / `TimeZone.getDefault()` internally instead of
 * its parameter would fail here even on a CI machine whose default zone
 * happens to already match the test data.
 */
class BirthInstantTest {

    private fun utcMidnightMillisFor(date: LocalDate): Long =
        date.atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli()

    @Test
    fun `birth in a zone different from the JVM default is resolved correctly`() {
        val originalDefault = TimeZone.getDefault()
        try {
            // The JVM/"device" default is Auckland; the birth zone passed in
            // is Tokyo. If the function ever fell back to reading the
            // ambient default instead of its zoneId parameter, this test
            // would compute the wrong instant.
            TimeZone.setDefault(TimeZone.getTimeZone("Pacific/Auckland"))

            // DatePickerState.selectedDateMillis encodes the calendar date
            // as UTC midnight: 2000-06-15.
            val utcMidnightMillis = utcMidnightMillisFor(LocalDate.of(2000, 6, 15))

            // Birth: 14:30 wall-clock time in Tokyo (UTC+9, no DST).
            val actual = resolveBirthDateUtcMillis(
                utcMidnightMillis = utcMidnightMillis,
                hour = 14,
                minute = 30,
                zoneId = ZoneId.of("Asia/Tokyo")
            )

            val expected = Instant.parse("2000-06-15T05:30:00Z").toEpochMilli()
            assertEquals(expected, actual)
        } finally {
            TimeZone.setDefault(originalDefault)
        }
    }

    @Test
    fun `same wall-clock birth time in different zones yields different UTC instants`() {
        val utcMidnightMillis = utcMidnightMillisFor(LocalDate.of(2000, 6, 15))

        val tokyo = resolveBirthDateUtcMillis(utcMidnightMillis, 14, 30, ZoneId.of("Asia/Tokyo"))
        val newYork = resolveBirthDateUtcMillis(utcMidnightMillis, 14, 30, ZoneId.of("America/New_York"))

        // Tokyo is UTC+9 year-round.
        assertEquals(Instant.parse("2000-06-15T05:30:00Z").toEpochMilli(), tokyo)
        // New York is UTC-4 (EDT) in June.
        assertEquals(Instant.parse("2000-06-15T18:30:00Z").toEpochMilli(), newYork)
        assertNotEquals(tokyo, newYork)
    }

    @Test
    fun `a birth just before local midnight rolls onto the previous UTC day`() {
        // 23:45 local time in Tokyo (UTC+9) on 2000-06-15 is 14:45 UTC on
        // 2000-06-15 still (same day) -- pick a zone west of UTC instead so
        // the wall-clock date and the UTC date actually diverge.
        val utcMidnightMillis = utcMidnightMillisFor(LocalDate.of(2000, 6, 15))

        val actual = resolveBirthDateUtcMillis(
            utcMidnightMillis = utcMidnightMillis,
            hour = 23,
            minute = 45,
            zoneId = ZoneId.of("America/Los_Angeles") // UTC-7 (PDT) in June
        )

        val expected = Instant.parse("2000-06-16T06:45:00Z").toEpochMilli()
        assertEquals(expected, actual)
    }
}
