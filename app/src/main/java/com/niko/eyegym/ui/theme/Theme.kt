// Файл: app/src/main/java/com/niko/eyegym/ui/theme/Theme.kt

package com.niko.eyegym.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Определяем нашу темную цветовую схему
private val DarkColorScheme = darkColorScheme(
    primary = DarkPrimary, // Бирюзовый акцент
    background = DarkBackground, // Глубокий темно-синий
    surface = DarkSurface,   // Чуть светлее для карточек
    onPrimary = Color.Black, // Текст на бирюзовом
    onBackground = DarkOnBackground, // Основной текст на фоне
    onSurface = DarkOnSurface,   // Основной текст на поверхности
    secondary = DarkSecondaryText // Второстепенный текст
)

@Composable
fun EyeGymTheme(
    content: @Composable () -> Unit
) {
    // В данном приложении мы всегда используем темную тему,
    // но MaterialTheme позволяет легко переключаться, если нужно
    val colorScheme = DarkColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography, // Используем нашу новую типографику
        content = content
    )
}