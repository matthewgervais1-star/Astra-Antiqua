package com.astra.antiqua.data.local.room

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [UserProfile::class], version = 2, exportSchema = true)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "astra_antiqua_db"
                )
                    // No destructive fallback. It silently wiped the user's
                    // saved birth data on any version bump, which is the one
                    // thing this database holds. A missing migration should
                    // fail loudly in development instead.
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
