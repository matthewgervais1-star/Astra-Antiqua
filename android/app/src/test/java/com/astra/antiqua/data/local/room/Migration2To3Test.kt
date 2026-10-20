package com.astra.antiqua.data.local.room

import androidx.sqlite.SQLiteConnection
import androidx.sqlite.driver.bundled.BundledSQLiteDriver
import androidx.sqlite.execSQL
import java.io.File
import java.time.Instant
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.boolean
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * [MIGRATION_2_3] on a real SQLite (androidx.sqlite's bundled driver on the
 * JVM), starting from the table exactly as the committed `2.json` creates it
 * and ending checked against the columns `3.json` declares.
 *
 * Room's `MigrationTestHelper` needs instrumentation and Robolectric is not a
 * dependency, so what this does not cover is Room's own open-time
 * validation (identity hash, `TableInfo` comparison) on a device, and the
 * `SupportSQLiteDatabase` entry point, which wraps the database in a
 * `SupportSQLiteConnection` and runs the code tested here.
 */
class Migration2To3Test {
    private val connection: SQLiteConnection = BundledSQLiteDriver().open(":memory:")

    @After
    fun tearDown() = connection.close()

    private fun schema(version: Int) = Json.parseToJsonElement(
        File("schemas/com.astra.antiqua.data.local.room.AppDatabase/$version.json").readText()
    ).jsonObject["database"]!!.jsonObject["entities"]!!.jsonArray[0].jsonObject

    private fun insert(id: Long, instant: String, zone: String, lat: Double, lon: Double) =
        connection.execSQL(
            "INSERT INTO user_profile (id, name, birthDateUtc, latitude, longitude, cityName, timezoneId) " +
                "VALUES ($id, 'R', ${Instant.parse(instant).toEpochMilli()}, $lat, $lon, 'C', '$zone')"
        )

    @Test
    fun `the typed date and time are recovered from the instant in its own zone`() {
        val createSql = schema(2)["createSql"]!!.jsonPrimitive.content.replace("\${TABLE_NAME}", "user_profile")
        connection.execSQL(createSql)
        // Rome, CEST: 12:30Z is 14:30 local.
        insert(1, "1990-06-15T12:30:00Z", "Europe/Rome", 41.9028, 12.4964)
        // A fixed offset, as the longitude estimate stored before 3.
        insert(2, "1990-07-04T19:30:00Z", "-05:00", 40.7128, -74.006)
        // A zone id this runtime does not know: the place's zone is used.
        insert(3, "1990-07-04T18:30:00Z", "Not/AZone", 40.7128, -74.006)

        MIGRATION_2_3.migrate(connection)

        val rows = mutableMapOf<Long, Pair<String?, String?>>()
        connection.prepare("SELECT id, birthDate, birthTime FROM user_profile ORDER BY id").use {
            while (it.step()) rows[it.getLong(0)] = it.getText(1) to it.getText(2)
        }
        assertEquals("1990-06-15" to "14:30", rows[1])
        assertEquals("1990-07-04" to "14:30", rows[2])
        assertEquals("1990-07-04" to "14:30", rows[3])

        val columns = mutableMapOf<String, Pair<String, Boolean>>()
        connection.prepare("PRAGMA table_info(user_profile)").use {
            while (it.step()) columns[it.getText(1)] = it.getText(2) to (it.getLong(3) == 1L)
        }
        val declared = schema(3)["fields"]!!.jsonArray.associate { field ->
            val f = field.jsonObject
            f["columnName"]!!.jsonPrimitive.content to
                (f["affinity"]!!.jsonPrimitive.content to (f["notNull"]?.jsonPrimitive?.boolean ?: false))
        }
        assertEquals(declared, columns)
    }

    private fun instantsAndZones(): Map<Long, Pair<String, String>> {
        val rows = mutableMapOf<Long, Pair<String, String>>()
        connection.prepare("SELECT id, birthDateUtc, timezoneId FROM user_profile ORDER BY id").use {
            while (it.step()) {
                rows[it.getLong(0)] = Instant.ofEpochMilli(it.getLong(1)).toString() to it.getText(2)
            }
        }
        return rows
    }

    @Test
    fun `a row stored under the longitude guess is re-resolved in the place's own zone`() {
        val createSql = schema(2)["createSql"]!!.jsonPrimitive.content.replace("\${TABLE_NAME}", "user_profile")
        connection.execSQL(createSql)
        // Rome, typed 14:30 on 1990-06-15, stored before 3 under the
        // longitude guess "+01:00": 13:30Z. Web reads the typed 14:30 in
        // Europe/Rome (CEST) as 12:30Z, and so must the device.
        insert(1, "1990-06-15T13:30:00Z", "+01:00", 41.9028, 12.4964)
        // Already in the place's own zone: left as it is.
        insert(2, "1990-06-15T12:30:00Z", "Europe/Rome", 41.9028, 12.4964)
        // New York, typed 14:30 on 1990-07-04 under the guess "-05:00":
        // EDT puts it at 18:30Z.
        insert(3, "1990-07-04T19:30:00Z", "-05:00", 40.7128, -74.006)

        MIGRATION_2_3.migrate(connection)

        val rows = instantsAndZones()
        assertEquals("1990-06-15T12:30:00Z" to "Europe/Rome", rows[1])
        assertEquals("1990-06-15T12:30:00Z" to "Europe/Rome", rows[2])
        assertEquals("1990-07-04T18:30:00Z" to "America/New_York", rows[3])
    }

    @Test
    fun `a row whose fill fails keeps null strings and the others are filled`() {
        val createSql = schema(2)["createSql"]!!.jsonPrimitive.content.replace("\${TABLE_NAME}", "user_profile")
        connection.execSQL(createSql)
        insert(1, "1990-06-15T12:30:00Z", "Europe/Rome", 41.9028, 12.4964)
        insert(2, "1990-07-04T19:30:00Z", "Broken/Zone", 40.7128, -74.006)

        val migration = Migration2To3 { instant, zone, lat, lon ->
            if (zone == "Broken/Zone") throw IllegalStateException("zone code failed")
            com.astra.antiqua.domain.wallClockOf(instant, zone, lat, lon)
        }
        migration.migrate(connection)

        val rows = mutableMapOf<Long, Pair<String?, String?>>()
        connection.prepare("SELECT id, birthDate, birthTime FROM user_profile ORDER BY id").use {
            while (it.step()) {
                rows[it.getLong(0)] =
                    (if (it.isNull(1)) null else it.getText(1)) to (if (it.isNull(2)) null else it.getText(2))
            }
        }
        assertEquals("1990-06-15" to "14:30", rows[1])
        assertEquals(null to null, rows[2])
        assertEquals("1990-07-04T19:30:00Z" to "Broken/Zone", instantsAndZones()[2])
    }
}
