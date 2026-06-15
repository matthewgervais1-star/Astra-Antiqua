package com.astra.antiqua.data.local.room

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_profile")
data class UserProfile(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val name: String,
    val birthDateUtc: Long,
    val latitude: Double,
    val longitude: Double,
    val cityName: String,
    val timezoneId: String
)
