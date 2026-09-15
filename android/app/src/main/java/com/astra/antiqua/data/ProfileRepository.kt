package com.astra.antiqua.data

import com.astra.antiqua.data.local.room.UserDao
import com.astra.antiqua.data.local.room.UserProfile
import kotlinx.coroutines.flow.Flow

/**
 * The one birth record this app keeps. An interface for the same reason
 * [SettingsRepository] is one: a ViewModel that takes this can be tested with
 * a fake, where one that reaches for Room cannot be tested at all without a
 * device.
 */
interface ProfileRepository {
    val profile: Flow<UserProfile?>
    suspend fun save(profile: UserProfile)
}

class RoomProfileRepository(private val dao: UserDao) : ProfileRepository {
    override val profile: Flow<UserProfile?> = dao.getUserProfile()
    override suspend fun save(profile: UserProfile) = dao.insertUserProfile(profile)
}
