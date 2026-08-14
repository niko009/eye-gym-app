// Файл: app/src/main/java/com/niko/eyegym/ui/screens/settings/SettingsViewModel.kt

package com.niko.eyegym.ui.screens.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.niko.eyegym.data.repository.Reminder
import com.niko.eyegym.data.repository.SettingsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject
import com.niko.eyegym.util.ReminderScheduler
data class SettingsUiState(
    val isVoiceCoachEnabled: Boolean = true,
    val reminder: Reminder = Reminder(false, 14, 30),
    val isProUser: Boolean = false
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsRepository: SettingsRepository,
    private val reminderScheduler: ReminderScheduler
) : ViewModel() {

    val uiState = combine(
        settingsRepository.isVoiceCoachEnabled,
        settingsRepository.reminder,
        settingsRepository.isProUser
    ) { isVoiceEnabled, reminder, isPro  ->
        SettingsUiState(
            isVoiceCoachEnabled = isVoiceEnabled,
            reminder = reminder,
            isProUser = isPro
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), SettingsUiState())

    fun onVoiceCoachToggle(isEnabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.setVoiceCoachEnabled(isEnabled)
        }
    }

    fun onReminderSet(hour: Int, minute: Int) {
        viewModelScope.launch {
            val currentReminder = uiState.value.reminder
            settingsRepository.setReminder(currentReminder.isEnabled, hour, minute)
            // Переустанавливаем напоминание, если оно было включено
            if (currentReminder.isEnabled) {
                reminderScheduler.schedule(hour, minute)
            }
        }
    }

    fun onReminderToggle(isEnabled: Boolean) {
        viewModelScope.launch {
            val currentReminder = uiState.value.reminder
            settingsRepository.setReminder(isEnabled, currentReminder.hour, currentReminder.minute)
            if (isEnabled) {
                reminderScheduler.schedule(currentReminder.hour, currentReminder.minute)
            } else {
                reminderScheduler.cancel()
            }
        }
    }
    fun onPurchasePro() {
        viewModelScope.launch {
            // Имитация успешной покупки.
            // В реальном приложении здесь будет запуск Google Play Billing.
            settingsRepository.setProUser(true)
        }
    }
}