// Файл: app/src/main/java/com/niko/eyegym/ui/screens/workout/WorkoutViewModel.kt

package com.niko.eyegym.ui.screens.workout

import android.content.Context // <-- ИЗМЕНЕНИЕ: Используем обычный Context
import android.os.CountDownTimer
import android.speech.tts.TextToSpeech
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.niko.eyegym.R // <-- ИЗМЕНЕНИЕ: Импортируем ресурсы для "Отдыха"
import com.niko.eyegym.data.db.WorkoutHistoryDao
import com.niko.eyegym.data.db.WorkoutHistoryEntity
import com.niko.eyegym.data.repository.ExerciseRepository
import com.niko.eyegym.data.repository.SettingsRepository
import com.niko.eyegym.data.repository.models.Exercise
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext // <-- ИЗМЕНЕНИЕ: Правильный способ получить Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.*
import javax.inject.Inject

// --- ИЗМЕНЕНИЕ: Убираем поле 'title', так как UI будет сам его определять ---
data class WorkoutUiState(
    val currentExercise: Exercise? = null,
    val timeLeft: Int = 0,
    val progress: Float = 1.0f,
    val isResting: Boolean = false,
    val isFinished: Boolean = false,
    val shouldShowAd: Boolean = false,
    val isProUser: Boolean = false,
    val isPaused: Boolean = false
)

@HiltViewModel
class WorkoutViewModel @Inject constructor(
    private val repository: ExerciseRepository,
    private val workoutHistoryDao: WorkoutHistoryDao,
    private val settingsRepository: SettingsRepository,
    savedStateHandle: SavedStateHandle,
    // --- ИЗМЕНЕНИЕ: Внедряем ApplicationContext через Hilt. Это безопасно. ---
    @ApplicationContext private val context: Context
) : ViewModel(), TextToSpeech.OnInitListener {

    private val _uiState = MutableStateFlow(WorkoutUiState())
    val uiState = _uiState.asStateFlow()

    private val complexId: Int = savedStateHandle.get<String>("complexId")!!.toInt()
    private lateinit var exercises: List<Exercise>
    private var currentExerciseIndex = -1
    private var timer: CountDownTimer? = null
    private lateinit var tts: TextToSpeech

    private var timeLeftInMillis: Long = 0L
    private var currentPhaseDuration: Long = 0L
    private var onFinishAction: (() -> Unit)? = null

    init {
        viewModelScope.launch {
            exercises = repository.getExercisesForComplex(complexId)
            settingsRepository.isProUser.collect { isPro ->
                _uiState.update { it.copy(isProUser = isPro) }
            }
        }
        // Используем внедренный context для инициализации TTS
        tts = TextToSpeech(context, this@WorkoutViewModel)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.language =  Locale.getDefault()
            moveToNextPhase()
        }
    }

    private fun moveToNextPhase() {
        currentExerciseIndex++
        if (currentExerciseIndex < exercises.size) {
            startExercise()
        } else {
            finishWorkout()
        }
    }

    private fun startExercise() {
        val exercise = exercises[currentExerciseIndex]
        // --- ИЗМЕНЕНИЕ: ViewModel больше не готовит 'title' ---
        _uiState.update {
            it.copy(
                isResting = false,
                currentExercise = exercise
            )
        }
        // --- ИЗМЕНЕНИЕ: Получаем строку для озвучки из ресурсов ---
        val instructionText = context.getString(exercise.instructionResId)
        tts.speak(instructionText, TextToSpeech.QUEUE_FLUSH, null, null)

        setupTimer(
            duration = exercise.durationSeconds * 1000L,
            onFinish = { startRest() }
        )
    }

    private fun startRest() {
        if (currentExerciseIndex >= exercises.size - 1) {
            moveToNextPhase()
            return
        }
        // --- ИЗМЕНЕНИЕ: Просто выставляем флаг 'isResting' ---
        _uiState.update { it.copy(isResting = true) }
        tts.speak(context.getString(R.string.rest_period), TextToSpeech.QUEUE_FLUSH, null, null)

        setupTimer(
            duration = 10 * 1000L,
            onFinish = { moveToNextPhase() }
        )
    }

    private fun setupTimer(duration: Long, onFinish: () -> Unit) {
        currentPhaseDuration = duration
        timeLeftInMillis = duration
        onFinishAction = onFinish
        resumeTimer()
    }

    private fun resumeTimer() {
        onFinishAction ?: return
        _uiState.update { it.copy(isPaused = false) }

        timer = object : CountDownTimer(timeLeftInMillis, 100) {
            override fun onTick(millisUntilFinished: Long) {
                timeLeftInMillis = millisUntilFinished
                _uiState.update {
                    it.copy(
                        timeLeft = (millisUntilFinished / 1000).toInt() + 1,
                        progress = timeLeftInMillis.toFloat() / currentPhaseDuration
                    )
                }
            }

            override fun onFinish() {
                onFinishAction?.invoke()
            }
        }.start()
    }

    private fun pauseTimer() {
        timer?.cancel()
        _uiState.update { it.copy(isPaused = true) }
    }

    fun onPlayPauseClicked() {
        if (_uiState.value.isPaused) {
            resumeTimer()
        } else {
            pauseTimer()
        }
    }

    private fun finishWorkout() {
        _uiState.update { it.copy(shouldShowAd = true) }
    }

    fun onAdDismissed() {
        val totalDuration = exercises.sumOf { it.durationSeconds } + (exercises.size - 1) * 10
        viewModelScope.launch {
            workoutHistoryDao.insert(
                WorkoutHistoryEntity(
                    timestamp = System.currentTimeMillis(),
                    durationSeconds = totalDuration
                )
            )
            _uiState.update { it.copy(isFinished = true) }
            tts.speak(context.getString(R.string.workout_complete), TextToSpeech.QUEUE_FLUSH, null, null)
        }
    }

    override fun onCleared() {
        timer?.cancel()
        if (this::tts.isInitialized) {
            tts.stop()
            tts.shutdown()
        }
        super.onCleared()
    }
}