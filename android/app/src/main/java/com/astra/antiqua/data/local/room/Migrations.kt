package com.astra.antiqua.data.local.room

import androidx.room.migration.Migration
import androidx.sqlite.SQLiteConnection
import androidx.sqlite.db.SupportSQLiteDatabase
import androidx.sqlite.driver.SupportSQLiteConnection
import androidx.sqlite.execSQL
import com.astra.antiqua.domain.birthZoneFor
import com.astra.antiqua.domain.resolveWallClockMillis
import com.astra.antiqua.domain.wallClockOf
import java.time.LocalDate
import java.time.LocalTime

/**
 * 2 to 3: `birthDate` and `birthTime`, the wall clock the reader typed, and
 * the instant and zone re-read from them where version 2 guessed the zone.
 *
 * Version 2 kept only the instant and its zone, so the typed strings are gone
 * for existing rows. This fills them with the best recovery available: the
 * stored instant read back in the stored zone (or the place's own zone when
 * the stored id does not parse). That is the typed time for every row except
 * one typed inside a daylight-saving gap, where the instant reads back an
 * hour off and nothing can say what was typed.
 *
 * Rows saved before the place's IANA zone was looked up carry a longitude
 * guess, a fixed offset such as "+01:00" for Rome, and an instant resolved in
 * it. Sync uploads the recovered wall clock and web reads it in the place's
 * IANA zone, so such a row would put one birth on two instants. Where the
 * stored zone id differs from [birthZoneFor]'s id for the place, the row's
 * `birthDateUtc` is re-resolved from the recovered wall clock in that zone
 * with [resolveWallClockMillis], and `timezoneId` becomes that zone's id: the
 * values `ChartMapping` writes for the same chart coming down from web.
 *
 * Each row's work runs inside `runCatching`. A row whose recovery fails keeps
 * null strings and its old instant and zone, and the upload rebuilds the
 * strings from the instant, as it does for any profile without them. A later
 * change to the zone code can never stop the app opening.
 *
 * The work is written once against [SQLiteConnection]; the
 * [SupportSQLiteDatabase] entry point, which Room uses on Android without a
 * driver, wraps its database in a [SupportSQLiteConnection] and runs the same
 * code.
 */
val MIGRATION_2_3: Migration = Migration2To3(::wallClockOf)

/**
 * [MIGRATION_2_3] with its fill function injected, so a test can force the
 * failure path. The fill takes the instant, the stored zone id, latitude and
 * longitude, and returns the date and the time.
 */
internal class Migration2To3(
    private val fill: (instantMillis: Long, timezoneId: String, latitude: Double, longitude: Double) -> Pair<String, String>,
) : Migration(2, 3) {
    override fun migrate(db: SupportSQLiteDatabase) = migrate(SupportSQLiteConnection(db))

    override fun migrate(connection: SQLiteConnection) {
        connection.execSQL("ALTER TABLE `user_profile` ADD COLUMN `birthDate` TEXT")
        connection.execSQL("ALTER TABLE `user_profile` ADD COLUMN `birthTime` TEXT")

        val rows = mutableListOf<Pair<Long, Recovered>>()
        connection.prepare(
            "SELECT `id`, `birthDateUtc`, `timezoneId`, `latitude`, `longitude` FROM `user_profile`"
        ).use { select ->
            while (select.step()) {
                val id = select.getLong(0)
                val recovered = runCatching {
                    recover(select.getLong(1), select.getText(2), select.getDouble(3), select.getDouble(4))
                }.getOrNull() ?: continue
                rows += id to recovered
            }
        }
        connection.prepare(
            "UPDATE `user_profile` SET `birthDate` = ?, `birthTime` = ?, `birthDateUtc` = ?, `timezoneId` = ? " +
                "WHERE `id` = ?"
        ).use { update ->
            for ((id, recovered) in rows) {
                update.bindText(1, recovered.date)
                update.bindText(2, recovered.time)
                update.bindLong(3, recovered.instantMillis)
                update.bindText(4, recovered.timezoneId)
                update.bindLong(5, id)
                update.step()
                update.reset()
                update.clearBindings()
            }
        }
    }

    /**
     * One row's new values: the typed strings from [fill], and the instant
     * and zone, re-resolved in the place's own zone when the stored zone id
     * is not that zone's id.
     */
    private fun recover(instantMillis: Long, timezoneId: String, latitude: Double, longitude: Double): Recovered {
        val (date, time) = fill(instantMillis, timezoneId, latitude, longitude)
        val zone = birthZoneFor(latitude, longitude)
        if (zone.id == timezoneId) return Recovered(date, time, instantMillis, timezoneId)
        val local = LocalDate.parse(date).atTime(LocalTime.parse(time))
        return Recovered(date, time, resolveWallClockMillis(local, zone), zone.id)
    }

    private class Recovered(val date: String, val time: String, val instantMillis: Long, val timezoneId: String)
}
