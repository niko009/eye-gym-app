package com.niko.eyegym.ui.screens.statistics

import androidx.annotation.StringRes
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.niko.eyegym.ui.theme.EyeGymTheme
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Icon
import androidx.compose.material.icons.Icons
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Scaffold
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import com.niko.eyegym.R
import com.niko.eyegym.ui.components.DefaultTopAppBar

@Composable
fun StatisticsScreen(
    viewModel: StatisticsViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    Scaffold(
        topBar = {
            // <-- ИЗМЕНЕНИЕ: Используем строковый ресурс для заголовка
            DefaultTopAppBar(title = stringResource(R.string.statistics_screen_title), onBackClicked = onNavigateBack)
        }
    ) { paddingValues ->
        StatisticsScreenContent(
            modifier = Modifier.padding(paddingValues),
            state = state
        )
    }
}

@Composable
fun StatisticsScreenContent(modifier: Modifier = Modifier, state: StatisticsUiState) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            // <-- ИЗМЕНЕНИЕ: Используем строковый ресурс
            text = stringResource(R.string.statistics_your_progress),
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(bottom = 40.dp)
        )
        StatisticCard(
            value = state.streakDays.toString(),
            // <-- ИЗМЕНЕНИЕ: Передаем ID ресурса вместо строки
            labelRes = R.string.statistics_streak_days,
            icon = Icons.Default.LocalFireDepartment
        )
        Spacer(modifier = Modifier.height(24.dp))
        StatisticCard(
            value = state.totalTimeFormatted,
            // <-- ИЗМЕНЕНИЕ: Передаем ID ресурса вместо строки
            labelRes = R.string.statistics_total_time,
            icon = Icons.Default.Timer
        )
    }
}

@Composable
fun StatisticCard(value: String, @StringRes labelRes: Int, icon: ImageVector) {
    val labelText = stringResource(id = labelRes) // <-- ИЗМЕНЕНИЕ: Получаем строку из ID
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(160.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = labelText, // <-- ИЗМЕНЕНИЕ: Используем полученную строку
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(36.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.displaySmall,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = labelText, // <-- ИЗМЕНЕНИЕ: Используем полученную строку
                style = MaterialTheme.typography.bodyLarge,
                // Используем onSurfaceVariant для менее важного текста
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun StatisticsScreenPreview() {
    EyeGymTheme {
        StatisticsScreenContent(state = StatisticsUiState(streakDays = 7, totalTimeFormatted = "42:15"))
    }
}

// Примечание: Эта функция больше не используется. Можете ее удалить для чистоты кода.
@Composable
fun StatisticItem(value: String, label: String) {
    Text(text = value, fontSize = 48.sp, fontWeight = FontWeight.Bold)
    Text(text = label, fontSize = 18.sp)
}