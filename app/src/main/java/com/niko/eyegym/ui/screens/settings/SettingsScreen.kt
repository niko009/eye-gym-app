package com.niko.eyegym.ui.screens.settings

import android.app.TimePickerDialog
import androidx.annotation.StringRes
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.WorkspacePremium
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.niko.eyegym.R
import com.niko.eyegym.data.repository.Reminder
import com.niko.eyegym.ui.components.DefaultTopAppBar
import com.niko.eyegym.ui.theme.EyeGymTheme

@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    Scaffold(
        topBar = {
            // <-- ИЗМЕНЕНИЕ: Используем ресурс
            DefaultTopAppBar(title = stringResource(R.string.settings_title), onBackClicked = onNavigateBack)
        }
    ) { paddingValues ->
        SettingsScreenContent(
            modifier = Modifier.padding(paddingValues),
            state = state,
            onVoiceCoachToggle = viewModel::onVoiceCoachToggle,
            onReminderSet = viewModel::onReminderSet,
            onReminderToggle = viewModel::onReminderToggle,
            onPurchasePro = viewModel::onPurchasePro
        )
    }
}

@Composable
fun SettingsScreenContent(
    modifier: Modifier = Modifier,
    state: SettingsUiState,
    onVoiceCoachToggle: (Boolean) -> Unit,
    onReminderSet: (Int, Int) -> Unit,
    onReminderToggle: (Boolean) -> Unit,
    onPurchasePro: () -> Unit
) {
    val context = LocalContext.current
    val timePickerDialog = TimePickerDialog(
        context,
        { _, hour, minute -> onReminderSet(hour, minute) },
        state.reminder.hour, state.reminder.minute, true
    )

    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        SettingsToggleItem(
            // <-- ИЗМЕНЕНИЕ: Используем ресурс
            titleRes = R.string.settings_voice_coach,
            isChecked = state.isVoiceCoachEnabled,
            onCheckedChange = onVoiceCoachToggle
        )

        Divider(modifier = Modifier.padding(vertical = 8.dp))

        SettingsToggleItem(
            // <-- ИЗМЕНЕНИЕ: Используем ресурс
            titleRes = R.string.settings_reminders,
            isChecked = state.reminder.isEnabled,
            onCheckedChange = onReminderToggle
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(enabled = state.reminder.isEnabled) { timePickerDialog.show() }
                .padding(start = 16.dp, top = 8.dp, bottom = 8.dp)
        ) {
            Text(
                text = String.format("%02d:%02d", state.reminder.hour, state.reminder.minute),
                color = if (state.reminder.isEnabled) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
            )
        }

        Divider(modifier = Modifier.padding(vertical = 8.dp))

        Spacer(modifier = Modifier.height(16.dp))
        Card(
            modifier = Modifier.fillMaxWidth().clickable(onClick = onPurchasePro),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f))
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Rounded.WorkspacePremium,
                    // <-- ИЗМЕНЕНИЕ: Используем ресурс
                    contentDescription = stringResource(R.string.settings_pro_version_cd),
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    // <-- ИЗМЕНЕНИЕ: Используем ресурсы
                    Text(stringResource(R.string.settings_pro_version_title), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    Text(stringResource(R.string.settings_pro_version_description), fontSize = 14.sp)
                }
            }
        }
    }
}

@Composable
fun SettingsToggleItem(@StringRes titleRes: Int, isChecked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        // <-- ИЗМЕНЕНИЕ: Используем ресурс
        Text(stringResource(id = titleRes), fontSize = 18.sp)
        Switch(checked = isChecked, onCheckedChange = onCheckedChange)
    }
}

@Preview(showBackground = true)
@Composable
private fun SettingsScreenPreview() {
    EyeGymTheme {
        SettingsScreenContent(
            state = SettingsUiState(isVoiceCoachEnabled = true, reminder = Reminder(true, 18, 0)),
            onVoiceCoachToggle = {},
            onReminderSet = { _, _ -> },
            onReminderToggle = {},
            onPurchasePro = {}
        )
    }
}