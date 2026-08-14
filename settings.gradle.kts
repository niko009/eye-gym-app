// Файл: settings.gradle.kts

pluginManagement {
    repositories {
        // Здесь мы говорим Gradle, чтобы он искал плагины в репозиториях Google и Maven Central
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        // А здесь — где искать библиотеки (зависимости)
        google()
        mavenCentral()
    }
}

rootProject.name = "EyeGym"
include(":app")