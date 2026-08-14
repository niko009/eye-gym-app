// Файл: app/src/main/java/com/niko/eyegym/util/ReminderReceiver.kt

package com.niko.eyegym.util

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.niko.eyegym.R // Android Studio создаст этот R-файл после добавления иконки

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Простое уведомление
        val notification = NotificationCompat.Builder(context, "eye_gym_reminder_channel")
            .setSmallIcon(R.mipmap.ic_launcher_foreground) // Иконка, которую мы создадим
            .setContentTitle("Время для гимнастики!")
            .setContentText("Ваши глаза заслужили отдых. Нажмите, чтобы начать.")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(1, notification)
    }
}