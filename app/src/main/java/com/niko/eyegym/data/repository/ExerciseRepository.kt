// Файл: app/src/main/java/com/niko/eyegym/data/repository/ExerciseRepository.kt

package com.niko.eyegym.data.repository

import com.niko.eyegym.R
import com.niko.eyegym.data.repository.models.AnimationType
import com.niko.eyegym.data.repository.models.Exercise
import com.niko.eyegym.data.repository.models.ExerciseComplex
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ExerciseRepository @Inject constructor() {

    // --- БАЗОВЫЕ УПРАЖНЕНИЯ ---
    private val baseExercises = listOf(
        Exercise(R.string.exercise_name_up_down, R.string.exercise_instruction_up_down, animationType = AnimationType.UP_DOWN),
        Exercise(R.string.exercise_name_left_right, R.string.exercise_instruction_left_right, animationType = AnimationType.LEFT_RIGHT),
        Exercise(R.string.exercise_name_diagonal, R.string.exercise_instruction_diagonal, animationType = AnimationType.DIAGONAL),
        Exercise(R.string.exercise_name_circle, R.string.exercise_instruction_circle, animationType = AnimationType.CIRCLE),
        Exercise(R.string.exercise_name_blink, R.string.exercise_instruction_blink, animationType = AnimationType.BLINK, durationSeconds = 10),
        Exercise(R.string.exercise_name_focus, R.string.exercise_instruction_focus, animationType = AnimationType.FOCUS)
    )

    // --- ПРЕМИУМ УПРАЖНЕНИЯ ---
    private val premiumExercises = listOf(
        Exercise(R.string.exercise_name_square, R.string.exercise_instruction_square, animationType = AnimationType.UP_DOWN),
        Exercise(R.string.exercise_name_snake, R.string.exercise_instruction_snake, animationType = AnimationType.LEFT_RIGHT),
        Exercise(R.string.exercise_name_palming, R.string.exercise_instruction_palming, animationType = AnimationType.FOCUS),
        Exercise(R.string.exercise_name_focus_approach, R.string.exercise_instruction_focus_approach, animationType = AnimationType.FOCUS),
        Exercise(R.string.exercise_name_butterfly, R.string.exercise_instruction_butterfly, animationType = AnimationType.BLINK, durationSeconds = 20),
        Exercise(R.string.exercise_name_infinity, R.string.exercise_instruction_infinity, animationType = AnimationType.CIRCLE),
        Exercise(R.string.exercise_name_nose_writing, R.string.exercise_instruction_nose_writing, animationType = AnimationType.FOCUS)
    )

    private val malyshevExercises = listOf(
        Exercise(
            R.string.exercise_name_malyshev_switches,
            R.string.exercise_instruction_malyshev_switches,
            animationType = AnimationType.LEFT_RIGHT,
            durationSeconds = 70
        ),
        Exercise(
            R.string.exercise_name_malyshev_convergence,
            R.string.exercise_instruction_malyshev_convergence,
            animationType = AnimationType.FOCUS,
            durationSeconds = 70
        ),
        Exercise(
            R.string.exercise_name_malyshev_circle_tracking,
            R.string.exercise_instruction_malyshev_circle_tracking,
            animationType = AnimationType.CIRCLE,
            durationSeconds = 80
        )
    )

    // --- КАРТА КОМПЛЕКСОВ ---
    private val allExercises = mapOf(
        1 to baseExercises, // Быстрый старт (6 упражнений)
        2 to (baseExercises + premiumExercises).shuffled().take(10), // Рабочий перерыв (10 случайных упражнений)
        3 to premiumExercises.shuffled().take(8), // Полное восстановление
        4 to (baseExercises.shuffled() + premiumExercises.shuffled()).take(10), // Снятие напряжения
        5 to listOf( // Фокус-марафон
            premiumExercises.find { it.nameResId == R.string.exercise_name_focus_approach }!!,
            premiumExercises.find { it.nameResId == R.string.exercise_name_nose_writing }!!,
            premiumExercises.find { it.nameResId == R.string.exercise_name_infinity }!!,
            premiumExercises.find { it.nameResId == R.string.exercise_name_palming }!!
        ),
        6 to malyshevExercises
    )

    fun getExercisesForComplex(complexId: Int): List<Exercise> {
        return allExercises[complexId] ?: emptyList()
    }

    fun getComplexes(): List<ExerciseComplex> {
        return listOf(
            ExerciseComplex(id = 1, nameResId = R.string.complex_name_quick_start, descriptionResId = R.string.complex_desc_quick_start),
            ExerciseComplex(id = 2, nameResId = R.string.complex_name_work_break, descriptionResId = R.string.complex_desc_work_break),
            ExerciseComplex(id = 3, nameResId = R.string.complex_name_full_recovery, descriptionResId = R.string.complex_desc_full_recovery, isPremium = true),
            ExerciseComplex(id = 4, nameResId = R.string.complex_name_stress_relief, descriptionResId = R.string.complex_desc_stress_relief, isPremium = true),
            ExerciseComplex(id = 5, nameResId = R.string.complex_name_focus_marathon, descriptionResId = R.string.complex_desc_focus_marathon, isPremium = true),
            ExerciseComplex(id = 6, nameResId = R.string.complex_name_malyshev_method, descriptionResId = R.string.complex_desc_malyshev_method)
        )
    }
}
