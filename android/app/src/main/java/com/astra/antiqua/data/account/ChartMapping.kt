package com.astra.antiqua.data.account

import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.domain.estimateZoneOffsetForLongitude
import java.time.DateTimeException
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.util.Locale

/**
 * The mapping between the device's [UserProfile] (an instant, a place and the
 * zone the instant was resolved in) and the server's chart (a wall-clock date
 * and time at a place, with no zone).
 *
 * Up: the stored instant is read back in the profile's own `timezoneId`, so
 * the server receives the date and time the reader typed. The zone is dropped.
 *
 * Down: the zone is re-derived from the place, as web derives it from
 * latitude and longitude with `tz-lookup`. Android has no zone database, so
 * this uses [estimateZoneOffsetForLongitude], the same estimate onboarding
 * stores today. A chart that leaves the device and comes back therefore
 * lands on the same instant; a chart cast on web lands on the standard-time
 * offset for its longitude, which can differ from web's IANA zone by the
 * daylight-saving hour or a band boundary. That is the app's existing limit,
 * stated where onboarding shows its zone note.
 */
fun UserProfile.toChartInputs(): ChartInputs {
    val zone = runCatching { ZoneId.of(timezoneId) }
        .getOrElse { estimateZoneOffsetForLongitude(longitude) }
    val local = Instant.ofEpochMilli(birthDateUtc).atZone(zone).toLocalDateTime()
    return ChartInputs(
        name = name.trim(),
        date = local.toLocalDate().toString(),
        time = String.format(Locale.ROOT, "%02d:%02d", local.hour, local.minute),
        cityLabel = cityName.trim(),
        latitude = latitude,
        longitude = longitude,
    )
}

/**
 * The server's chart as a device profile, or null when its date or time does
 * not parse (the server checks the shape of the date, not that the day
 * exists, so `2024-02-31` can be stored). [id] is the row it replaces.
 */
fun RemoteChart.toUserProfileOrNull(id: Int = 0): UserProfile? {
    val local = try {
        LocalDateTime.of(LocalDate.parse(date), LocalTime.parse(time))
    } catch (_: DateTimeException) {
        return null
    }
    val zone = estimateZoneOffsetForLongitude(longitude)
    return UserProfile(
        id = id,
        name = name,
        birthDateUtc = local.atZone(zone).toInstant().toEpochMilli(),
        latitude = latitude,
        longitude = longitude,
        cityName = cityLabel,
        timezoneId = zone.id,
    )
}
