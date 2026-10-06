package com.astra.antiqua.data.account

import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.domain.estimateZoneOffsetForLongitude
import com.astra.antiqua.domain.resolveBirthDateUtcMillis
import com.astra.antiqua.viewmodel.romeProfile
import java.time.LocalDate
import java.time.ZoneOffset
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class ChartMappingTest {

    private fun served(inputs: ChartInputs) = RemoteChart(
        id = "c-1",
        name = inputs.name,
        date = inputs.date,
        time = inputs.time,
        cityLabel = inputs.cityLabel,
        latitude = inputs.latitude,
        longitude = inputs.longitude,
        createdAt = "2026-09-01T10:00:00.000Z",
    )

    @Test
    fun `up - the instant is read back as wall-clock in the profile's own zone`() {
        val inputs = romeProfile().toChartInputs()

        assertEquals(ChartInputs("Livia", "1990-06-15", "14:30", "Rome", 41.9028, 12.4964), inputs)
    }

    @Test
    fun `up - an unreadable zone id falls back to the longitude estimate`() {
        val profile = romeProfile().copy(timezoneId = "Not/AZone")

        // 14:30 CEST is 12:30 UTC; the estimate for 12.5 E is UTC+1.
        assertEquals("13:30", profile.toChartInputs().time)
    }

    @Test
    fun `a chart cast on the device survives the round trip through the server`() {
        // Onboarding stores the longitude estimate as the zone; this is that row.
        val zone = estimateZoneOffsetForLongitude(-73.97)
        val midnight = LocalDate.of(1979, 11, 4).atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli()
        val device = UserProfile(
            id = 3,
            name = "Quintus",
            birthDateUtc = resolveBirthDateUtcMillis(midnight, 23, 50, zone),
            latitude = 40.78,
            longitude = -73.97,
            cityName = "New York",
            timezoneId = zone.id,
        )

        val back = served(device.toChartInputs()).toUserProfileOrNull(id = 3)

        assertEquals(device, back)
    }

    @Test
    fun `down - seconds in the server's time are kept`() {
        val chart = served(ChartInputs("A", "2000-01-01", "00:00:30", "Greenwich", 51.48, 0.0))

        assertEquals(
            LocalDate.of(2000, 1, 1).atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli() + 30_000,
            chart.toUserProfileOrNull()!!.birthDateUtc,
        )
    }

    @Test
    fun `down - a date the calendar does not have maps to null`() {
        val chart = served(ChartInputs("A", "2024-02-31", "12:00", "Rome", 41.9, 12.5))

        assertNull(chart.toUserProfileOrNull())
    }
}
