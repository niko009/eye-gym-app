// Файл: app/src/main/java/com/niko/eyegym/di/AdModule.kt
package com.niko.eyegym.di

import com.niko.eyegym.util.InterstitialAdManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ActivityComponent

@Module
@InstallIn(ActivityComponent::class) // Привязываем к жизненному циклу Activity
object AdModule {

    @Provides
    fun provideInterstitialAdManager(activity: android.app.Activity): InterstitialAdManager {
        return InterstitialAdManager(activity)
    }
}