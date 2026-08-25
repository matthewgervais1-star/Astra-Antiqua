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
 * function never guesses one. See [estimateZoneOffsetForLongitude] for how
 * OnboardingScreen derives that zone from the birth location instead of the
 * device.
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
    return wallClockBirth.atZone(zoneId).toInstant().toEpochMilli()
}

/**
 * Estimates the standard-time UTC offset for a birth from the birth
 * LOCATION's longitude, as a stand-in for a real IANA-zone lookup.
 *
 * This app has no birth-location timezone database: Android's Geocoder
 * returns coordinates and address text, not a UTC offset, and bundling one
 * (e.g. a timezone-boundary polygon library) costs tens of megabytes of APK
 * size that hasn't been signed off on. Standard civil time zones track
 * longitude in ~15-degree (one hour) bands to keep clocks close to local
 * solar time, so `round(longitude / 15)` hours recovers the correct
 * STANDARD offset for the large majority of the globe. It is still only an
 * estimate:
 *  - it never reflects daylight saving time (there is no birth-date-aware
 *    DST rule table here, only a fixed offset),
 *  - it cannot know about the fractional-hour offsets some regions use
 *    (India UTC+5:30, Nepal UTC+5:45, parts of Australia UTC+9:30/+10:30,
 *    Newfoundland UTC-3:30, ...) since those aren't derivable from longitude
 *    alone, and
 *  - it ignores political zone boundaries, which do not follow meridians.
 *
 * Earlier this app used the DEVICE's current zone as the stand-in instead.
 * That was exactly correct when the user entered their own birth data on a
 * device set to their birth zone, but for a birth entered on a device in a
 * different zone than the birth, it could be off by however many hours
 * separate the device's zone from the birth's -- as much as +/-12 hours in
 * the worst case, and often WORSE than doing nothing at all. This
 * longitude-based estimate depends only on the birth location (which the
 * user has already searched for and confirmed on screen), never on the
 * device, so it no longer regresses based on where the phone happens to be
 * configured. Its own error is bounded to roughly the width of one
 * time-zone band (usually well under an hour, occasionally more at zone
 * boundaries or in fractional-offset regions) instead of being unbounded.
 */
fun estimateZoneOffsetForLongitude(longitudeDegrees: Double): ZoneOffset {
    val clampedLongitude = longitudeDegrees.coerceIn(-180.0, 180.0)
    val offsetHours = Math.round(clampedLongitude / 15.0).toInt().coerceIn(-12, 14)
    return ZoneOffset.ofHours(offsetHours)
}
