package com.niko.eyegym.ui.screens.workout

import android.app.Activity
import android.view.WindowManager
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.niko.eyegym.R
import com.niko.eyegym.data.repository.models.AnimationType
import com.niko.eyegym.data.repository.models.Exercise
import com.niko.eyegym.ui.components.BannerAd
import com.niko.eyegym.ui.components.DefaultTopAppBar
import com.niko.eyegym.ui.components.WorkoutAnimation
import com.niko.eyegym.ui.theme.EyeGymTheme
import com.niko.eyegym.util.InterstitialAdManager

@Composable
fun WorkoutScreen(
    viewModel: WorkoutViewModel = hiltViewModel(),
    onWorkoutFinished: () -> Unit,
    onNavigateBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    DisposableEffect(Unit) {
        val window = (context as? Activity)?.window
        window?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        onDispose {
            window?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        }
    }

    val interstitialAdManager = remember {
        InterstitialAdManager(context as Activity)
    }

    LaunchedEffect(state.isFinished) {
        if (state.isFinished) {
            onWorkoutFinished()
        }
    }

    LaunchedEffect(state.shouldShowAd) {
        if (state.shouldShowAd) {
            interstitialAdManager.showAd {
                viewModel.onAdDismissed()
            }
        }
    }

    WorkoutScreenContent(
        state = state,
        onPlayPauseClicked = viewModel::onPlayPauseClicked,
        onNavigateBack = onNavigateBack
    )
}

@Composable
fun WorkoutScreenContent(
    state: WorkoutUiState,
    onPlayPauseClicked: () -> Unit,
    onNavigateBack: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Scaffold(
            bottomBar = {
                if (!state.isProUser) {
                    BannerAd()
                }
            },
            topBar = {
                DefaultTopAppBar(
                    title = stringResource(state.currentExercise?.nameResId ?: R.string.workout_title),
                    onBackClicked = onNavigateBack
                )
            },
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.SpaceAround
            ) {
                // <-- ИЗМЕНЕНИЕ: Заголовок теперь тоже берется из ресурсов ---
                val titleText = when {
                    state.isFinished -> stringResource(R.string.workout_complete)
                    state.isResting -> stringResource(R.string.rest_period)
                    state.currentExercise != null -> stringResource(id = state.currentExercise.nameResId)
                    else -> stringResource(R.string.loading) // <-- ИЗМЕНЕНИЕ
                }
                Text(
                    text = titleText,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )

                Timer(progress = state.progress, timeLeft = state.timeLeft)

                Box(
                    modifier = Modifier
                        .height(150.dp)
                        .fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    WorkoutAnimation(
                        animationType = state.currentExercise?.animationType,
                        isPaused = state.isPaused,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                IconButton(onClick = onPlayPauseClicked) {
                    Icon(
                        imageVector = if (state.isPaused) Icons.Rounded.PlayArrow else Icons.Rounded.Pause,
                        // <-- ИЗМЕНЕНИЕ: Описание для людей с ограниченными возможностями тоже берется из ресурсов
                        contentDescription = stringResource(if (state.isPaused) R.string.resume else R.string.pause),
                        modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.onBackground
                    )
                }
            }
        }
    }
}

@Composable
fun Timer(progress: Float, timeLeft: Int) {
    Box(contentAlignment = Alignment.Center) {
        CircularProgressIndicator(
            progress = progress,
            modifier = Modifier.size(200.dp),
            color = MaterialTheme.colorScheme.primary,
            strokeWidth = 16.dp,
            strokeCap = StrokeCap.Round
        )
        Text(
            text = "$timeLeft",
            fontSize = 60.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground
        )
    }
}


// <-- ИЗМЕНЕНИЕ: Я раскомментировал и исправил Preview ---
@Preview(showBackground = true)
@Composable
private fun WorkoutScreenPreview() {
    EyeGymTheme {
        WorkoutScreenContent(
            state = WorkoutUiState(
                currentExercise = Exercise(
                    nameResId = R.string.exercise_name_circle,
                    instructionResId = R.string.exercise_instruction_circle,
                    animationType = AnimationType.CIRCLE
                ),
                timeLeft = 25,
                progress = 0.83f,
                isResting = false,
                isPaused = false
            ),
            onPlayPauseClicked = {},
            onNavigateBack = {}
        )
    }
}