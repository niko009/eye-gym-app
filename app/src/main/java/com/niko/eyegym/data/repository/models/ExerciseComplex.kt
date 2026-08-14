package com.niko.eyegym.data.repository.models

import androidx.annotation.StringRes

data class ExerciseComplex(
    val id: Int,
    @StringRes val nameResId: Int,
    @StringRes val descriptionResId: Int,
    val isPremium: Boolean = false
)