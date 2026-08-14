// Файл: app/src/main/java/com/niko/eyegym/ui/components/WorkoutAnimation.kt
package com.niko.eyegym.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import com.niko.eyegym.data.repository.models.AnimationType
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun WorkoutAnimation(
    animationType: AnimationType?,
    isPaused: Boolean,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "workout_animation_transition")
    val color = MaterialTheme.colorScheme.primary

    val progress by if (!isPaused) {
        infiniteTransition.animateFloat(
            initialValue = 0f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = tween(3000, easing = LinearEasing),
                repeatMode = RepeatMode.Restart
            ), label = "animation_progress"
        )
    } else {
        // Если на паузе, "замораживаем" анимацию на её текущем значении
        remember { mutableFloatStateOf(0.5f) }
    }


    Canvas(modifier = modifier) {
        val (width, height) = size
        val centerX = width / 2
        val centerY = height / 2
        val radius = size.minDimension / 3

        val targetOffset = when (animationType) {
            AnimationType.UP_DOWN -> {
                val y = cos(progress * 2 * Math.PI).toFloat()
                Offset(centerX, centerY + y * radius)
            }
            AnimationType.LEFT_RIGHT -> {
                val x = sin(progress * 2 * Math.PI).toFloat()
                Offset(centerX + x * radius, centerY)
            }
            AnimationType.CIRCLE -> {
                val angle = progress * 2 * Math.PI
                Offset(
                    centerX + radius * cos(angle).toFloat(),
                    centerY + radius * sin(angle).toFloat()
                )
            }
            AnimationType.DIAGONAL -> {
                val p = (progress * 2) % 2
                val x = if (p < 1) -radius + 2 * radius * p else radius - 2 * radius * (p - 1)
                val y = if (p < 1) -radius + 2 * radius * p else -radius + 2 * radius * (p - 1)
                Offset(centerX + x, centerY + y)
            }
            AnimationType.BLINK -> {
                val alpha = if ((progress * 10).toInt() % 2 == 0) 1f else 0f
                // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
                drawCircle(color, radius = 30f, center = Offset(centerX, centerY), alpha = alpha)
                return@Canvas
            }
            AnimationType.FOCUS -> {
                val scale = 0.5f + (0.5f * sin(progress * 2 * Math.PI).toFloat())
                // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
                drawCircle(color, radius = 15f + 30f * scale, center = Offset(centerX, centerY))
                return@Canvas
            }
            else -> Offset(centerX, centerY)
        }
        // --- И ГЛАВНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ ---
        drawCircle(color, radius = 30f, center = targetOffset)
    }
}