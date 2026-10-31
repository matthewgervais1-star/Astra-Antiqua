package com.astra.antiqua.data

import com.astra.antiqua.data.local.room.UserDao
import com.astra.antiqua.data.local.room.UserProfile
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test

class ProfileRepositoryTest {

    /** A table that behaves as Room's does for these calls: id 0 takes a new key. */
    private class TableDao : UserDao {
        val rows = MutableStateFlow<Map<Long, UserProfile>>(emptyMap())
        private var nextKey = 1L

        override fun getUserProfile(): Flow<UserProfile?> =
            rows.map { table -> table.maxByOrNull { it.key }?.value }

        override suspend fun insertUserProfile(profile: UserProfile): Long {
            val key = if (profile.id == 0) nextKey++ else profile.id.toLong()
            rows.value = rows.value + (key to profile.copy(id = key.toInt()))
            return key
        }

        override suspend fun deleteProfilesExcept(keep: Long) {
            rows.value = rows.value.filterKeys { it == keep }
        }
    }

    private fun cast(city: String) = UserProfile(
        name = "Livia",
        birthDateUtc = 0L,
        latitude = 0.0,
        longitude = 0.0,
        cityName = city,
        timezoneId = "UTC",
    )

    @Test
    fun castingAgainReplacesTheRecord() = runTest {
        val dao = TableDao()
        val profiles = RoomProfileRepository(dao)

        profiles.save(cast("Rome"))
        profiles.save(cast("London"))

        assertEquals(1, dao.rows.value.size)
        assertEquals("London", profiles.profile.first()?.cityName)
    }

    @Test
    fun aSecondRowLeftByAnOlderBuildGoesOnTheNextSave() = runTest {
        val dao = TableDao()
        dao.insertUserProfile(cast("Rome"))
        dao.insertUserProfile(cast("London"))

        RoomProfileRepository(dao).save(cast("Paris"))

        assertEquals(listOf("Paris"), dao.rows.value.values.map { it.cityName })
    }
}
