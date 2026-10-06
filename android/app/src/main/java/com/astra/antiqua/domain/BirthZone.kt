package com.astra.antiqua.domain

import java.time.DateTimeException
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZoneOffset

/**
 * The IANA zone in force at a place, from the same packed quadtree web uses
 * (`tz-lookup`, data in [TzLookupData]), or null for coordinates outside the
 * globe. A port of the package's walk; `gen-android-tz.mjs` checks the walk
 * against the package on a half-degree grid each time it regenerates.
 * Over open sea the tree names an `Etc/GMT±N` nautical zone.
 */
fun birthZoneIdAt(latitude: Double, longitude: Double): String? {
    if (!(latitude >= -90.0 && latitude <= 90.0 && longitude >= -180.0 && longitude <= 180.0)) return null
    if (latitude >= 90.0) return "Etc/GMT"
    val tree = TzLookupData.TREE
    val zones = TzLookupData.ZONES
    var n = -1
    var x = (180.0 + longitude) * 48.0 / 360.00000000000006
    var y = (90.0 - latitude) * 24.0 / 180.00000000000003
    var u = x.toInt()
    var v = y.toInt()
    var i = v * 96 + u * 2
    i = tree[i].code * 56 + tree[i + 1].code - 1995
    while (i + zones.size < 3136) {
        n = n + i + 1
        x = (x - u) * 2.0 % 2.0
        y = (y - v) * 2.0 % 2.0
        u = x.toInt()
        v = y.toInt()
        i = n * 8 + v * 4 + u * 2 + 2304
        i = tree[i].code * 56 + tree[i + 1].code - 1995
    }
    return zones[i + zones.size - 3136]
}

/**
 * The zone a birth at this place is read in: the IANA zone from
 * [birthZoneIdAt], with its full daylight-saving history from java.time.
 * When the lookup names no zone, or names one this runtime's tz database
 * does not know, [estimateZoneOffsetForLongitude] stands in.
 */
fun birthZoneFor(latitude: Double, longitude: Double): ZoneId =
    birthZoneIdAt(latitude, longitude)
        ?.let { id ->
            try {
                ZoneId.of(id)
            } catch (_: DateTimeException) {
                null
            }
        }
        ?: estimateZoneOffsetForLongitude(longitude)

/**
 * The UTC instant of a wall-clock time in [zone], resolved the way
 * `resolveBirth` in `web/src/lib/birthDateTime.ts` resolves it, so both
 * surfaces put the same birth on the same instant:
 *
 * 1. Read the wall-clock time as if it were UTC, and take the zone's offset
 *    at that instant.
 * 2. Step back by that offset, take the zone's offset again there, and use
 *    the second offset.
 *
 * Outside a transition both offsets agree. In a spring-forward gap the
 * second offset is the later (summer) one, so 02:30 on a New York
 * spring-forward day lands on 06:30Z, where java.time's own
 * `atZone` would shift it to 07:30Z. In a fall-back overlap the first
 * occurrence (summer time) wins, as it does with `atZone`.
 */
fun resolveWallClockMillis(local: LocalDateTime, zone: ZoneId): Long {
    val naive = local.toInstant(ZoneOffset.UTC).toEpochMilli()
    val rules = zone.rules
    val first = rules.getOffset(Instant.ofEpochMilli(naive)).totalSeconds
    val second = rules.getOffset(Instant.ofEpochMilli(naive - first * 1000L)).totalSeconds
    return naive - second * 1000L
}
