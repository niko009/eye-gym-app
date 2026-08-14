// Файл: app/src/main/java/com/niko/eyegym/data/repository/SettingsRepository.kt

package com.niko.eyegym.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

// Создаем экземпляр DataStore
private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

data class Reminder(
    val isEnabled: Boolean,
    val hour: Int,
    val minute: Int
)

@Singleton
class SettingsRepository @Inject constructor(@ApplicationContext private val context: Context) {

    // --- Ключи для хранения ---
    private val voiceCoachKey = booleanPreferencesKey("voice_coach_enabled")
    private val reminderEnabledKey = booleanPreferencesKey("reminder_enabled")
    private val reminderHourKey = intPreferencesKey("reminder_hour")
    private val reminderMinuteKey = intPreferencesKey("reminder_minute")
    private val isProKey = booleanPreferencesKey("is_pro_user")
    // --- Голосовой помощник ---
    val isVoiceCoachEnabled: Flow<Boolean> = context.dataStore.data
        .map { preferences ->
            preferences[voiceCoachKey] ?: true // По умолчанию включен
        }

    suspend fun setVoiceCoachEnabled(isEnabled: Boolean) {
        context.dataStore.edit { settings ->
            settings[voiceCoachKey] = isEnabled
        }
    }

    // --- Напоминания ---
    val reminder: Flow<Reminder> = context.dataStore.data
        .map { preferences ->
            Reminder(
                isEnabled = preferences[reminderEnabledKey] ?: false, // По умолчанию выключены
                hour = preferences[reminderHourKey] ?: 14,
                minute = preferences[reminderMinuteKey] ?: 30
            )
        }

    suspend fun setReminder(isEnabled: Boolean, hour: Int, minute: Int) {
        context.dataStore.edit { settings ->
            settings[reminderEnabledKey] = isEnabled
            settings[reminderHourKey] = hour
            settings[reminderMinuteKey] = minute
        }
    }
    val isProUser: Flow<Boolean> = context.dataStore.data
        .map { preferences ->
            preferences[isProKey] ?: false
        }

    suspend fun setProUser(isPro: Boolean) {
        context.dataStore.edit { settings ->
            settings[isProKey] = isPro
        }
    }
}