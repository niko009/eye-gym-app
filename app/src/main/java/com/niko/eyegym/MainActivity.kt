// Файл: app/src/main/java/com/niko/eyegym/MainActivity.kt

package com.niko.eyegym

import android.Manifest // <-- ИЗМЕНЕНИЕ: Добавляем импорт
import android.os.Build // <-- ИЗМЕНЕНИЕ: Добавляем импорт
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts // <-- ИЗМЕНЕНИЕ: Добавляем импорт
import androidx.lifecycle.lifecycleScope
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.niko.eyegym.data.repository.SettingsRepository
import com.niko.eyegym.ui.screens.mainscreen.MainScreen
import com.niko.eyegym.ui.screens.settings.SettingsScreen
import com.niko.eyegym.ui.screens.statistics.StatisticsScreen
import com.niko.eyegym.ui.screens.workout.WorkoutScreen
import com.niko.eyegym.ui.theme.EyeGymTheme
import com.niko.eyegym.util.BillingManager
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject
    lateinit var settingsRepository: SettingsRepository

    private lateinit var billingManager: BillingManager

    // --- ИЗМЕНЕНИЕ: Добавляем полную реализацию запроса разрешений ---
    private val requestPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted: Boolean ->
            // Здесь можно обработать ответ пользователя, если он отказал.
            // Например, показать сообщение, что напоминания не будут работать.
        }

    private fun askNotificationPermission() {
        // Запрашиваем разрешение только на Android 13 (API 33) и выше.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }
    // --- КОНЕЦ ИЗМЕНЕНИЙ ---

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        billingManager = BillingManager(this, settingsRepository, lifecycleScope)

        // <-- ИЗМЕНЕНИЕ: Вызываем запрос разрешения при старте приложения
        askNotificationPermission()

        setContent {
            EyeGymTheme {
                val navController = rememberNavController()
                NavHost(navController = navController, startDestination = "main_screen") {
                    composable("main_screen") {
                        MainScreen(
                            onStartWorkout = { complexId ->
                                navController.navigate("workout_screen/$complexId")
                            },
                            onNavigateToStatistics = {
                                navController.navigate("statistics_screen")
                            },
                            onNavigateToSettings = {
                                navController.navigate("settings_screen")
                            },
                            onPurchaseClicked = {
                                billingManager.launchPurchaseFlow(this@MainActivity)
                            }
                        )
                    }
                    composable("workout_screen/{complexId}") {
                        WorkoutScreen(
                            onWorkoutFinished = {
                                navController.popBackStack()
                            },
                            onNavigateBack = { navController.popBackStack() }
                        )
                    }
                    composable("statistics_screen") {
                        StatisticsScreen(onNavigateBack = { navController.popBackStack() })
                    }
                    composable("settings_screen") {
                        SettingsScreen(onNavigateBack = { navController.popBackStack() })
                    }
                }
            }
        }
    }
}