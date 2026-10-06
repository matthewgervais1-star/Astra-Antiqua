package com.astra.antiqua.data.local.room

import androidx.room.migration.Migration
import androidx.sqlite.SQLiteConnection
import androidx.sqlite.db.SupportSQLiteDatabase
import androidx.sqlite.driver.SupportSQLiteConnection
import androidx.sqlite.execSQL
import com.astra.antiqua.domain.wallClockOf

/**
 * 2 to 3: `birthDate` and `birthTime`, the wall clock the reader typed.
 *
 * Version 2 kept only the instant and its zone, so the typed strings are gone
 * for existing rows. This fills them with the best recovery available: the
 * stored instant read back in the stored zone (or the place's own zone when
 * the stored id does not parse). That is the typed time for every row except
 * one typed inside a daylight-saving gap, where the instant reads back an
 * hour off and nothing can say what was typed.
 *
 * Each row's fill runs inside `runCatching`. A row whose fill fails keeps
 * null strings, and the upload rebuilds them from the instant, as it does
 * for any profile without them. A later change to the zone code can never stop the
 * app opening.
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

        val rows = mutableListOf<Pair<Long, Pair<String, String>>>()
        connection.prepare(
            "SELECT `id`, `birthDateUtc`, `timezoneId`, `latitude`, `longitude` FROM `user_profile`"
        ).use { select ->
            while (select.step()) {
                val id = select.getLong(0)
                val wallClock = runCatching {
                    fill(select.getLong(1), select.getText(2), select.getDouble(3), select.getDouble(4))
                }.getOrNull() ?: continue
                rows += id to wallClock
            }
        }
        connection.prepare(
            "UPDATE `user_profile` SET `birthDate` = ?, `birthTime` = ? WHERE `id` = ?"
        ).use { update ->
            for ((id, wallClock) in rows) {
                update.bindText(1, wallClock.first)
                update.bindText(2, wallClock.second)
                update.bindLong(3, id)
                update.step()
                update.reset()
                update.clearBindings()
            }
        }
    }
}
