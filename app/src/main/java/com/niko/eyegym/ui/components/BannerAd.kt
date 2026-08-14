// Файл: app/src/main/java/com/niko/eyegym/ui/components/BannerAd.kt
package com.niko.eyegym.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.niko.eyegym.BuildConfig
@Composable
fun BannerAd(modifier: Modifier = Modifier) {
    // Используем тестовый ID для баннера
    val adUnitId = BuildConfig.BANNER_AD_UNIT_ID

    AndroidView(
        modifier = modifier.fillMaxWidth(),
        factory = { context ->
            AdView(context).apply {
                setAdSize(AdSize.BANNER)
                this.adUnitId = adUnitId
                loadAd(AdRequest.Builder().build())
            }
        }
    )
}