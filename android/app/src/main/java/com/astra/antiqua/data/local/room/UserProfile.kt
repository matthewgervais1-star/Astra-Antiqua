package com.astra.antiqua.data.local.room

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * The one birth record. [birthDateUtc] is the instant the chart is cast for,
 * resolved in [timezoneId]. [birthDate] (`YYYY-MM-DD`) and [birthTime]
 * (`HH:MM`, or `HH:MM:SS` as a server chart may carry it) are the wall clock
 * the reader typed, kept as typed: inside a daylight-saving gap the instant
 * cannot give the typed time back, and the web account stores the typed
 * strings. Null on rows that predate them only if the 2 to 3 migration could
 * not recover them.
 */
@Entity(tableName = "user_profile")
data class UserProfile(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val name: String,
    val birthDateUtc: Long,
    val latitude: Double,
    val longitude: Double,
    val cityName: String,
    val timezoneId: String,
    val birthDate: String? = null,
    val birthTime: String? = null,
)
