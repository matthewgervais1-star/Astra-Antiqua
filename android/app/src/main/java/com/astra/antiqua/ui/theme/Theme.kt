package com.astra.antiqua.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import com.astra.antiqua.domain.LexiconDictionary
import com.astra.antiqua.model.AncientCulture

val LocalLexicon = staticCompositionLocalOf { LexiconDictionary.Greek }

private val DarkColorScheme = darkColorScheme(
    primary = White,
    secondary = Gold,
    tertiary = White,
    background = Black,
    surface = Black,
    onPrimary = Black,
    onSecondary = Black,
    onTertiary = Black,
    onBackground = White,
    onSurface = White
)

@Composable
fun AstraAntiquaTheme(
    selectedCulture: AncientCulture = AncientCulture.GREECE,
    content: @Composable () -> Unit
) {
    val colorScheme = DarkColorScheme
    val lexicon = when (selectedCulture) {
        AncientCulture.GREECE -> LexiconDictionary.Greek
        AncientCulture.EGYPT -> LexiconDictionary.Egyptian
        AncientCulture.CANAAN -> LexiconDictionary.Canaanite
        AncientCulture.CARTHAGE -> LexiconDictionary.Carthaginian
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    CompositionLocalProvider(LocalLexicon provides lexicon) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}
