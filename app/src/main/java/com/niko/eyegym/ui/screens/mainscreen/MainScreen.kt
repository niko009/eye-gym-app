package com.niko.eyegym.ui.screens.mainscreen

import android.content.res.Configuration.UI_MODE_NIGHT_YES
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.QueryStats
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.WorkspacePremium
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.niko.eyegym.R
import com.niko.eyegym.data.repository.models.ExerciseComplex
import com.niko.eyegym.ui.theme.EyeGymTheme

@Composable
fun MainScreen(
    viewModel: MainScreenViewModel = hiltViewModel(),
    onStartWorkout: (Int) -> Unit,
    onNavigateToStatistics: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onPurchaseClicked: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    val onComplexClicked = { complex: ExerciseComplex ->
        if (complex.isPremium && !state.isProUser) {
            onPurchaseClicked()
        } else {
            viewModel.onComplexSelected(complex.id)
        }
    }

    MainScreenContent(
        state = state,
        onComplexClicked = onComplexClicked,
        onStartClicked = {
            state.selectedComplexId?.let { onStartWorkout(it) }
        },
        onStatisticsClicked = onNavigateToStatistics,
        onSettingsClicked = onNavigateToSettings
    )
}

@Composable
fun MainScreenContent(
    state: MainScreenState,
    onComplexClicked: (ExerciseComplex) -> Unit,
    onStartClicked: () -> Unit,
    onStatisticsClicked: () -> Unit,
    onSettingsClicked: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        IconButton(
            onClick = onStatisticsClicked,
            modifier = Modifier.align(Alignment.TopEnd).padding(8.dp)
        ) {
            Icon(
                imageVector = Icons.Rounded.QueryStats,
                // <-- ИЗМЕНЕНИЕ
                contentDescription = stringResource(R.string.main_screen_statistics_cd),
                tint = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
            )
        }
        IconButton(
            onClick = onSettingsClicked,
            modifier = Modifier.align(Alignment.TopStart).padding(8.dp)
        ) {
            Icon(
                imageVector = Icons.Rounded.Settings,
                // <-- ИЗМЕНЕНИЕ
                contentDescription = stringResource(R.string.main_screen_settings_cd),
                tint = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(32.dp))
            Text(
                text = stringResource(id = R.string.app_name),
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(40.dp))

            Text(
                // <-- ИЗМЕНЕНИЕ
                text = stringResource(R.string.main_screen_select_complex),
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(16.dp))

            Column(
                modifier = Modifier.align(Alignment.Start),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                state.complexes.forEach { complex ->
                    ComplexRow(
                        complex = complex,
                        isSelected = state.selectedComplexId == complex.id,
                        onSelected = { onComplexClicked(complex) },
                        isProUser = state.isProUser
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = onStartClicked,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                // <-- ИЗМЕНЕНИЕ
                Text(text = stringResource(R.string.main_screen_start_button), style = MaterialTheme.typography.titleLarge)
            }
        }
    }
}

@Composable
private fun ComplexRow(
    complex: ExerciseComplex,
    isSelected: Boolean,
    onSelected: (ExerciseComplex) -> Unit,
    isProUser: Boolean
) {
    val alpha = if (complex.isPremium && !isProUser) 0.5f else 1f

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onSelected(complex) },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
            else MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
        ),
        border = if (isSelected) BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else null
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp, horizontal = 20.dp)
                .graphicsLayer(alpha = alpha),
            verticalAlignment = Alignment.CenterVertically
        ) {
            RadioButton(
                selected = isSelected,
                onClick = { onSelected(complex) },
                colors = RadioButtonDefaults.colors(
                    selectedColor = MaterialTheme.colorScheme.primary,
                    unselectedColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = stringResource(id = complex.nameResId), fontWeight = FontWeight.Medium)
                    if (complex.isPremium) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            imageVector = Icons.Rounded.WorkspacePremium,
                            // <-- ИЗМЕНЕНИЕ
                            contentDescription = stringResource(R.string.main_screen_pro_complex_cd),
                            modifier = Modifier.size(18.dp),
                            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.8f)
                        )
                    }
                }
                Text(text = stringResource(id = complex.descriptionResId), fontSize = 12.sp)
            }
        }
    }
}

@Preview(name = "Dark Mode", showBackground = true, uiMode = UI_MODE_NIGHT_YES)
@Composable
private fun MainScreenPreview() {
    val previewState = MainScreenState(
        complexes = listOf(
            ExerciseComplex(id = 1, nameResId = R.string.complex_name_quick_start, descriptionResId = R.string.complex_desc_quick_start),
            ExerciseComplex(id = 2, nameResId = R.string.complex_name_work_break, descriptionResId = R.string.complex_desc_work_break),
            ExerciseComplex(id = 3, nameResId = R.string.complex_name_full_recovery, descriptionResId = R.string.complex_desc_full_recovery, isPremium = true),
        ),
        selectedComplexId = 1
    )
    EyeGymTheme {
        Surface {
            MainScreenContent(
                state = previewState,
                onComplexClicked = {},
                onStartClicked = {},
                onStatisticsClicked = {},
                onSettingsClicked = {}
            )
        }
    }
}