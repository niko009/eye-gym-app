// Файл: app/src/main/java/com/niko/eyegym/data/db/WorkoutHistoryEntity.kt

package com.niko.eyegym.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "workout_history")
data class WorkoutHistoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val timestamp: Long, // Время завершения тренировки
    val durationSeconds: Int // Длительность в секундах
)