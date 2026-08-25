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
    fun `DST offset is taken at the birth date, not the current season`() {
        // Guard against a rewrite that asks the zone for its offset "now":
        // every other fixture in this file is a June date, so such a
        // regression would pass the rest of the suite whenever CI runs
        // during northern-hemisphere DST. Winter and summer births in the
        // same zone must resolve with different offsets.
        val winter = resolveBirthDateUtcMillis(
            utcMidnightMillisFor(LocalDate.of(1990, 1, 15)), 4, 30, ZoneId.of("America/New_York")
        )
        assertEquals(Instant.parse("1990-01-15T09:30:00Z").toEpochMilli(), winter) // EST, UTC-5

        val summer = resolveBirthDateUtcMillis(
            utcMidnightMillisFor(LocalDate.of(1990, 7, 15)), 4, 30, ZoneId.of("America/New_York")
        )
        assertEquals(Instant.parse("1990-07-15T08:30:00Z").toEpochMilli(), summer) // EDT, UTC-4
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

/**
 * [estimateZoneOffsetForLongitude] stands in for a real birth-location
 * timezone lookup (see its doc): it must depend only on the longitude
 * passed in, never on the JVM/device's own default zone, since the whole
 * point is to stop the assumed birth zone from tracking wherever the
 * device entering the data happens to be configured.
 */
class EstimateZoneOffsetForLongitudeTest {

    @Test
    fun `Rome longitude resolves to standard CET offset`() {
        // Rome, Italy: ~12.4964 E -> UTC+1 (CET, ignoring DST).
        val offset = estimateZoneOffsetForLongitude(12.4964)
        assertEquals(ZoneOffset.ofHours(1), offset)
    }

    @Test
    fun `New York longitude resolves to standard EST offset`() {
        // New York, USA: ~-74.006 -> UTC-5 (EST, ignoring DST).
        val offset = estimateZoneOffsetForLongitude(-74.006)
        assertEquals(ZoneOffset.ofHours(-5), offset)
    }

    @Test
    fun `Tokyo longitude resolves to standard JST offset`() {
        // Tokyo, Japan: ~139.6917 -> UTC+9 (JST, no DST).
        val offset = estimateZoneOffsetForLongitude(139.6917)
        assertEquals(ZoneOffset.ofHours(9), offset)
    }

    @Test
    fun `estimate does not depend on the JVM default zone`() {
        val originalDefault = TimeZone.getDefault()
        try {
            TimeZone.setDefault(TimeZone.getTimeZone("Pacific/Auckland"))
            val offset = estimateZoneOffsetForLongitude(12.4964)
            assertEquals(ZoneOffset.ofHours(1), offset)
        } finally {
            TimeZone.setDefault(originalDefault)
        }
    }

    @Test
    fun `out-of-range longitude is clamped instead of throwing`() {
        assertEquals(ZoneOffset.ofHours(12), estimateZoneOffsetForLongitude(190.0))
        assertEquals(ZoneOffset.ofHours(-12), estimateZoneOffsetForLongitude(-190.0))
    }

    @Test
    fun `a cross-zone entry no longer regresses toward the device zone`() {
        // The regression this guards against: a birth in Rome entered on a
        // device set to America/Toronto used to be resolved against
        // Toronto's zone, not Rome's. The estimate below must depend only
        // on Rome's longitude, matching the same result a Rome-based device
        // would have produced, regardless of the JVM/device default.
        val originalDefault = TimeZone.getDefault()
        try {
            TimeZone.setDefault(TimeZone.getTimeZone("America/Toronto"))

            val romeLongitude = 12.4964
            val offset = estimateZoneOffsetForLongitude(romeLongitude)
            val utcMidnightMillis = LocalDate.of(1990, 1, 15)
                .atStartOfDay(ZoneOffset.UTC)
                .toInstant()
                .toEpochMilli()

            val actual = resolveBirthDateUtcMillis(
                utcMidnightMillis = utcMidnightMillis,
                hour = 4,
                minute = 30,
                zoneId = offset
            )

            // True instant for 04:30 CET (UTC+1, no DST in January) in Rome.
            val expected = Instant.parse("1990-01-15T03:30:00Z").toEpochMilli()
            assertEquals(expected, actual)
        } finally {
            TimeZone.setDefault(originalDefault)
        }
    }
}
