package com.astra.antiqua.domain

import java.time.DateTimeException
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZoneOffset
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The birthplace zone lookup and web's wall-clock rule. The expected
 * instants in [webParity] were produced by running `resolveBirth` from
 * `web/src/lib/birthDateTime.ts` under Node 24 on 2026-10-06 (tz-lookup
 * 6.1.25), so a disagreement here is a disagreement with web.
 */
class BirthZoneTest {

    private fun utc(text: String) = Instant.parse(text).toEpochMilli()

    private fun resolve(lat: Double, lon: Double, y: Int, mo: Int, d: Int, h: Int, mi: Int): Long =
        resolveWallClockMillis(LocalDateTime.of(y, mo, d, h, mi), birthZoneFor(lat, lon))

    @Test
    fun `New York on 4 July 1990 at 14 30 is 18 30Z, daylight time`() {
        assertEquals(utc("1990-07-04T18:30:00Z"), resolve(40.7128, -74.006, 1990, 7, 4, 14, 30))
    }

    @Test
    fun `Madrid keeps Central European time in winter and summer`() {
        assertEquals("Europe/Madrid", birthZoneIdAt(40.4168, -3.7038))
        assertEquals(utc("1990-01-15T11:00:00Z"), resolve(40.4168, -3.7038, 1990, 1, 15, 12, 0))
        assertEquals(utc("1990-07-15T10:00:00Z"), resolve(40.4168, -3.7038, 1990, 7, 15, 12, 0))
    }

    @Test
    fun `Kolkata is five and a half hours ahead`() {
        assertEquals("Asia/Kolkata", birthZoneIdAt(22.5726, 88.3639))
        assertEquals(utc("1990-06-15T03:45:00Z"), resolve(22.5726, 88.3639, 1990, 6, 15, 9, 15))
    }

    @Test
    fun `Buenos Aires is three hours behind`() {
        assertEquals("America/Argentina/Buenos_Aires", birthZoneIdAt(-34.6037, -58.3816))
        assertEquals(utc("2000-12-26T02:50:00Z"), resolve(-34.6037, -58.3816, 2000, 12, 25, 23, 50))
    }

    /** Place, wall clock, and the instant web's `resolveBirth` gives. */
    private val webParity = listOf(
        Triple(Pair(41.9028, 12.4964), LocalDateTime.of(1990, 6, 15, 14, 30), "1990-06-15T12:30:00Z"), // Rome, CEST
        Triple(Pair(37.98, 23.73), LocalDateTime.of(1985, 3, 2, 6, 15), "1985-03-02T04:15:00Z"), // Athens
        Triple(Pair(43.8256, 87.6168), LocalDateTime.of(2005, 3, 1, 8, 0), "2005-03-01T02:00:00Z"), // Urumqi
        Triple(Pair(27.7172, 85.324), LocalDateTime.of(1999, 4, 1, 6, 0), "1999-04-01T00:15:00Z"), // Kathmandu +5:45
        Triple(Pair(40.7128, -74.006), LocalDateTime.of(2021, 3, 14, 2, 30), "2021-03-14T06:30:00Z"), // New York, gap
        Triple(Pair(40.7128, -74.006), LocalDateTime.of(2021, 11, 7, 1, 30), "2021-11-07T05:30:00Z"), // New York, overlap
        Triple(Pair(-33.8688, 151.2093), LocalDateTime.of(1995, 10, 29, 2, 30), "1995-10-28T16:30:00Z"), // Sydney, gap
    )

    @Test
    fun `the same places resolve to the same instants as web, gaps and overlaps included`() {
        webParity.forEach { (place, local, expected) ->
            val zone = birthZoneFor(place.first, place.second)
            assertEquals("$place $local", utc(expected), resolveWallClockMillis(local, zone))
        }
    }

    @Test
    fun `open sea names a nautical zone, as tz-lookup does`() {
        assertEquals("Etc/GMT+2", birthZoneIdAt(0.0, -30.0))
        assertEquals("Etc/GMT+8", birthZoneIdAt(-40.0, -120.0))
    }

    @Test
    fun `coordinates off the globe fall back to the longitude estimate`() {
        assertNull(birthZoneIdAt(91.0, 0.0))
        assertNull(birthZoneIdAt(Double.NaN, 0.0))
        assertEquals(ZoneOffset.ofHours(1), birthZoneFor(-91.0, 12.5))
    }

    @Test
    fun `every zone the lookup can name is known to java time`() {
        val unknown = TzLookupData.ZONES.filter { id ->
            try {
                ZoneId.of(id)
                false
            } catch (_: DateTimeException) {
                true
            }
        }
        assertTrue("Unknown zones: $unknown", unknown.isEmpty())
    }
}
