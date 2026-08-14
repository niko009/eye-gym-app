// Файл: app/src/main/java/com/niko/eyegym/data/db/WorkoutHistoryDao.kt

package com.niko.eyegym.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface WorkoutHistoryDao {
    @Insert
    suspend fun insert(workoutHistory: WorkoutHistoryEntity)

    @Query("SELECT * FROM workout_history ORDER BY timestamp DESC")
    fun getAllHistory(): Flow<List<WorkoutHistoryEntity>>
}