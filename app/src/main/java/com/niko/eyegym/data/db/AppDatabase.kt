// Файл: app/src/main/java/com/niko/eyegym/data/db/AppDatabase.kt

package com.niko.eyegym.data.db

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [WorkoutHistoryEntity::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun workoutHistoryDao(): WorkoutHistoryDao
}