// Файл: app/src/main/java/com/niko/eyegym/ui/screens/statistics/StatisticsViewModel.kt
package com.niko.eyegym.ui.screens.statistics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.niko.eyegym.data.db.WorkoutHistoryDao
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import kotlin.time.Duration.Companion.milliseconds

data class StatisticsUiState(
    val streakDays: Int = 0,
    val totalTimeFormatted: String = "00:00"
)

@HiltViewModel
class StatisticsViewModel @Inject constructor(
    workoutHistoryDao: WorkoutHistoryDao
) : ViewModel() {

    val uiState = workoutHistoryDao.getAllHistory()
        .map { historyList ->
            // --- Логика подсчета ---
            val streak = calculateStreak(historyList.map { it.timestamp })
            val totalSeconds = historyList.sumOf { it.durationSeconds }
            val minutes = TimeUnit.SECONDS.toMinutes(totalSeconds.toLong())
            val seconds = totalSeconds - TimeUnit.MINUTES.toSeconds(minutes)

            StatisticsUiState(
                streakDays = streak,
                totalTimeFormatted = String.format("%02d:%02d", minutes, seconds)
            )
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), StatisticsUiState())

    private fun calculateStreak(timestamps: List<Long>): Int {
        if (timestamps.isEmpty()) return 0

        val uniqueDays = timestamps
            .map { it.milliseconds.inWholeDays }
            .distinct()
            .sortedDescending()

        var streak = 1
        val today = System.currentTimeMillis().milliseconds.inWholeDays

        // Проверяем, была ли тренировка сегодня или вчера
        if (uniqueDays.first() < today - 1) return 0

        for (i in 0 until uniqueDays.size - 1) {
            if (uniqueDays[i] == uniqueDays[i+1] + 1) {
                streak++
            } else {
                break
            }
        }
        return streak
    }
}