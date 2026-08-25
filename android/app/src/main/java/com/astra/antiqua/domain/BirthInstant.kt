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
 * function never guesses one.
 *
 * This app has no birth-location timezone lookup: Android's Geocoder
 * returns coordinates and address text, not a UTC offset, and adding a
 * lat/lng-to-zone library or a network timezone API is out of scope for this
 * fix. Today's caller (OnboardingScreen) passes the DEVICE's current default
 * zone as the best-available stand-in for "the zone this birth's clock time
 * was recorded in" -- correct when the user is entering their own birth data
 * on a device set to their birth zone, and wrong otherwise. That is a real,
 * documented limitation of the product today, not a silent one.
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
