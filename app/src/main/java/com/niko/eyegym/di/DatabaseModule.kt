// Файл: app/src/main/java/com/niko/eyegym/di/DatabaseModule.kt

package com.niko.eyegym.di

import android.content.Context
import androidx.room.Room
import com.niko.eyegym.data.db.AppDatabase
import com.niko.eyegym.data.db.WorkoutHistoryDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "eye_gym_database"
        ).build()
    }

    @Provides
    fun provideWorkoutHistoryDao(appDatabase: AppDatabase): WorkoutHistoryDao {
        return appDatabase.workoutHistoryDao()
    }
}