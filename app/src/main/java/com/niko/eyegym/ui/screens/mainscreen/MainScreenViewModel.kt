// Файл: app/src/main/java/com/niko/eyegym/ui/screens/mainscreen/MainScreenViewModel.kt

package com.niko.eyegym.ui.screens.mainscreen

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.niko.eyegym.data.repository.ExerciseRepository
import com.niko.eyegym.data.repository.SettingsRepository
import com.niko.eyegym.data.repository.models.ExerciseComplex
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MainScreenState(
    val complexes: List<ExerciseComplex> = emptyList(),
    val selectedComplexId: Int? = null,
    val isProUser: Boolean = false
)

@HiltViewModel
class MainScreenViewModel @Inject constructor(
    private val repository: ExerciseRepository,
    private val settingsRepository: SettingsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(MainScreenState())
    val uiState = _uiState.asStateFlow()

    init {
        // Загружаем ВСЕ комплексы один раз
        loadAllComplexes()

        // И отдельно следим за статусом Pro
        viewModelScope.launch {
            settingsRepository.isProUser.collect { isPro ->
                _uiState.update { it.copy(isProUser = isPro) }
            }
        }
    }

    private fun loadAllComplexes() {
        val allComplexes = repository.getComplexes()
        _uiState.update {
            it.copy(
                complexes = allComplexes,
                // Выбираем по умолчанию первый бесплатный комплекс
                selectedComplexId = allComplexes.firstOrNull { !it.isPremium }?.id
            )
        }
    }

    fun onComplexSelected(complexId: Int) {
        _uiState.update { it.copy(selectedComplexId = complexId) }
    }
}