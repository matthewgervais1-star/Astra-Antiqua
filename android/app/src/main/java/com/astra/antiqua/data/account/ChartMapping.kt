package com.astra.antiqua.data.account

import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.domain.birthZoneFor
import com.astra.antiqua.domain.resolveWallClockMillis
import java.time.DateTimeException
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.util.Locale

/** The server's limit on a chart name (`saveSchema` in `web/src/app/api/charts/route.ts`). */
const val CHART_NAME_MAX = 120

/**
 * The mapping between the device's [UserProfile] (an instant, a place and the
 * zone the instant was resolved in) and the server's chart (a wall-clock date
 * and time at a place, with no zone).
 *
 * Up: the stored instant is read back in the profile's own `timezoneId`, so
 * the server receives the date and time the reader typed. The zone is dropped.
 *
 * Down: the zone is looked up from latitude and longitude with [birthZoneFor],
 * the same `tz-lookup` map web uses, and the wall-clock time is resolved with
 * [resolveWallClockMillis], web's own two-step rule. A chart therefore lands
 * on the same instant on both surfaces.
 */
fun UserProfile.toChartInputs(): ChartInputs {
    val zone = try {
        ZoneId.of(timezoneId)
    } catch (_: DateTimeException) {
        birthZoneFor(latitude, longitude)
    }
    val local = Instant.ofEpochMilli(birthDateUtc).atZone(zone).toLocalDateTime()
    return ChartInputs(
        name = chartNameOf(name, cityName),
        date = local.toLocalDate().toString(),
        time = String.format(Locale.ROOT, "%02d:%02d", local.hour, local.minute),
        cityLabel = cityName.trim().take(200),
        latitude = latitude,
        longitude = longitude,
    )
}

/**
 * A name the server accepts: 1 to [CHART_NAME_MAX] characters after trimming.
 * A blank name falls back to the city, then to "My chart".
 */
fun chartNameOf(name: String, cityName: String): String {
    val chosen = name.trim().ifEmpty { cityName.trim() }.ifEmpty { "My chart" }
    return chosen.take(CHART_NAME_MAX).trimEnd()
}

/**
 * The server's chart as a device profile, or null when its date or time does
 * not parse (the server checks the shape of the date, not that the day
 * exists, so `2024-02-31` can be stored). Seconds in the time are dropped,
 * as web drops them (`savedNatal.ts` reads only hour and minute). [id] is
 * the row it replaces.
 */
fun RemoteChart.toUserProfileOrNull(id: Int = 0): UserProfile? {
    val local = try {
        LocalDateTime.of(LocalDate.parse(date), LocalTime.parse(time).withSecond(0).withNano(0))
    } catch (_: DateTimeException) {
        return null
    }
    val zone = birthZoneFor(latitude, longitude)
    return UserProfile(
        id = id,
        name = name,
        birthDateUtc = resolveWallClockMillis(local, zone),
        latitude = latitude,
        longitude = longitude,
        cityName = cityLabel,
        timezoneId = zone.id,
    )
}
