package com.astra.antiqua.data.account

import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.domain.birthZoneFor
import com.astra.antiqua.domain.resolveBirthDateUtcMillis
import com.astra.antiqua.viewmodel.romeProfile
import java.time.Instant
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
    fun `up - an unreadable zone id falls back to the place's own zone`() {
        val profile = romeProfile().copy(timezoneId = "Not/AZone")

        assertEquals("14:30", profile.toChartInputs().time)
    }

    @Test
    fun `up - a blank name falls back to the city, then to My chart`() {
        assertEquals("Rome", romeProfile(name = "  ").toChartInputs().name)
        assertEquals("My chart", romeProfile(name = "").copy(cityName = " ").toChartInputs().name)
    }

    @Test
    fun `up - a long name is cut to the server's 120 characters`() {
        assertEquals(120, romeProfile(name = "L".repeat(300)).toChartInputs().name.length)
    }

    @Test
    fun `a chart cast on the device survives the round trip through the server`() {
        // Onboarding stores the place's own zone; this is that row.
        val zone = birthZoneFor(40.78, -73.97)
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

        assertEquals("America/New_York", zone.id)
        assertEquals(device, back)
    }

    @Test
    fun `down - New York in July lands on daylight time, as on web`() {
        val chart = served(ChartInputs("A", "1990-07-04", "14:30", "New York", 40.7128, -74.006))

        val profile = chart.toUserProfileOrNull()!!

        assertEquals("America/New_York", profile.timezoneId)
        assertEquals(Instant.parse("1990-07-04T18:30:00Z").toEpochMilli(), profile.birthDateUtc)
    }

    @Test
    fun `down - seconds in the server's time are dropped, as web drops them`() {
        val chart = served(ChartInputs("A", "2000-01-01", "00:00:30", "Greenwich", 51.48, 0.0))

        assertEquals(
            Instant.parse("2000-01-01T00:00:00Z").toEpochMilli(),
            chart.toUserProfileOrNull()!!.birthDateUtc,
        )
    }

    @Test
    fun `down - a date the calendar does not have maps to null`() {
        val chart = served(ChartInputs("A", "2024-02-31", "12:00", "Rome", 41.9, 12.5))

        assertNull(chart.toUserProfileOrNull())
    }
}
