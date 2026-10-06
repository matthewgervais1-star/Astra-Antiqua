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
 * The work is written once against [SQLiteConnection]; the
 * [SupportSQLiteDatabase] entry point, which Room uses on Android without a
 * driver, wraps its database in a [SupportSQLiteConnection] and runs the same
 * code.
 */
val MIGRATION_2_3: Migration = object : Migration(2, 3) {
    override fun migrate(db: SupportSQLiteDatabase) = migrate(SupportSQLiteConnection(db))

    override fun migrate(connection: SQLiteConnection) {
        connection.execSQL("ALTER TABLE `user_profile` ADD COLUMN `birthDate` TEXT")
        connection.execSQL("ALTER TABLE `user_profile` ADD COLUMN `birthTime` TEXT")

        val rows = mutableListOf<Pair<Long, Pair<String, String>>>()
        connection.prepare(
            "SELECT `id`, `birthDateUtc`, `timezoneId`, `latitude`, `longitude` FROM `user_profile`"
        ).use { select ->
            while (select.step()) {
                val wallClock = wallClockOf(
                    instantMillis = select.getLong(1),
                    timezoneId = select.getText(2),
                    latitude = select.getDouble(3),
                    longitude = select.getDouble(4),
                )
                rows += select.getLong(0) to wallClock
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
