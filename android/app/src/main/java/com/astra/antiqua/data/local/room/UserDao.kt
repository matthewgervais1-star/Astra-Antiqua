package com.astra.antiqua.data.local.room

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    /**
     * The newest row. Builds before this one inserted a second row on every
     * cast-again (a profile with id 0 makes Room generate a new key) and read
     * the oldest, so the chart never changed; on those devices the newest row
     * is the one the reader cast last.
     */
    @Query("SELECT * FROM user_profile ORDER BY id DESC LIMIT 1")
    fun getUserProfile(): Flow<UserProfile?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUserProfile(profile: UserProfile): Long

    @Query("DELETE FROM user_profile WHERE id != :keep")
    suspend fun deleteProfilesExcept(keep: Long)

    /** The app keeps one birth record: write this one and drop every other row. */
    @Transaction
    suspend fun replaceUserProfile(profile: UserProfile) {
        val kept = insertUserProfile(profile)
        deleteProfilesExcept(kept)
    }
}
