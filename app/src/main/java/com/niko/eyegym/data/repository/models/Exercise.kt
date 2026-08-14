// Файл: app/src/main/java/com/niko/eyegym/data/repository/models/Exercise.kt

package com.niko.eyegym.data.repository.models

import androidx.annotation.StringRes

data class Exercise(
    @StringRes val nameResId: Int,
    @StringRes val instructionResId: Int,
    val animationType: AnimationType,
    val durationSeconds: Int = 30
)