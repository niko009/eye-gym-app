// Файл: app/src/main/java/com/niko/eyegym/EyeGymApp.kt

package com.niko.eyegym

import android.app.Application
import com.google.android.gms.ads.MobileAds
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class EyeGymApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Инициализируем AdMob SDK
        MobileAds.initialize(this)
    }
}