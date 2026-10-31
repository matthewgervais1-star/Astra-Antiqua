package com.astra.antiqua.domain

import java.time.Instant
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZoneOffset

/**
 * Resolves the true UTC instant of a birth from wall-clock date/time
 * components plus an explicit time zone.
 *
 * [utcMidnightMillis] is what Compose Material3's
 * `DatePickerState.selectedDateMillis` returns: UTC midnight of the
 * selected calendar date -- a date encoded as epoch millis so the picker's
 * calendar math stays timezone-agnostic, NOT a real moment in time.
 * [hour]/[minute] are the wall-clock birth time the user entered. [zoneId]
 * is the timezone those wall-clock digits should be read in.
 *
 * [zoneId] must be supplied explicitly by the caller rather than read from
 * an ambient default (`TimeZone.getDefault()` / `ZoneId.systemDefault()`)
 * inside this function. That is what makes a birth outside the caller's own
 * timezone computed correctly: the caller decides and states the zone, this
 * function never guesses one. See [birthZoneFor] for how OnboardingScreen
 * derives that zone from the birth location instead of the device, and
 * [resolveWallClockMillis] for how a time inside a daylight-saving gap or
 * overlap is resolved (the way web resolves it).
 *
 * Pre-fix rows: profiles saved before this function existed carry a
 * `birthDateUtc` built by the old, wrong arithmetic (UTC-midnight + local
 * hour/minute millis). Decision: no Room migration -- the app has never
 * shipped past versionCode 1, so no external installs hold such rows. If
 * that ever changes, the old encoding is losslessly recoverable: read the
 * stored value as UTC to get back the wall-clock date/time, then re-resolve
 * it with the row's stored `timezoneId`.
 */
fun resolveBirthDateUtcMillis(
    utcMidnightMillis: Long,
    hour: Int,
    minute: Int,
    zoneId: ZoneId
): Long {
    val calendarDate = Instant.ofEpochMilli(utcMidnightMillis)
        .atZone(ZoneOffset.UTC)
        .toLocalDate()
    val wallClockBirth = LocalDateTime.of(calendarDate, LocalTime.of(hour, minute))
    return resolveWallClockMillis(wallClockBirth, zoneId)
}

/**
 * Estimates the standard-time UTC offset for a place from its longitude:
 * `round(longitude / 15)` hours, clamped to -12..+14.
 *
 * This is the FALLBACK only. A birth's zone comes from [birthZoneFor], which
 * looks the place up in the same IANA zone map web uses and applies that
 * zone's daylight-saving history. [birthZoneFor] falls back to this estimate
 * when the lookup names no zone (coordinates off the globe) or names one the
 * runtime's tz database does not know. The estimate ignores daylight saving,
 * fractional offsets (India +5:30, Nepal +5:45) and political boundaries
 * (Spain and France keep Central European Time west of 7.5 E; western China
 * keeps +8), so it is wrong by an hour or more in much of the world and is
 * never the first choice.
 */
fun estimateZoneOffsetForLongitude(longitudeDegrees: Double): ZoneOffset {
    val clampedLongitude = longitudeDegrees.coerceIn(-180.0, 180.0)
    val offsetHours = Math.round(clampedLongitude / 15.0).toInt().coerceIn(-12, 14)
    return ZoneOffset.ofHours(offsetHours)
}
