package com.astra.antiqua.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
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

// Rome: imperial purple (Tyrian purple, deepened for dark backgrounds/surfaces) and gold,
// visually distinct from Carthage's black-and-gold field.
private val RomanColorScheme = darkColorScheme(
    primary = Gold,
    secondary = TyrianPurple,
    tertiary = Gold,
    background = TyrianPurpleDeep,
    surface = TyrianPurpleDeep,
    onPrimary = Black,
    onSecondary = White,
    onTertiary = Black,
    onBackground = White,
    onSurface = White
)

@Composable
fun AstraAntiquaTheme(
    selectedCulture: AncientCulture = AncientCulture.GREECE,
    content: @Composable () -> Unit
) {
    val colorScheme = when (selectedCulture) {
        AncientCulture.ROME -> RomanColorScheme
        AncientCulture.GREECE,
        AncientCulture.EGYPT,
        AncientCulture.CANAAN,
        AncientCulture.CARTHAGE -> DarkColorScheme
    }
    val lexicon = when (selectedCulture) {
        AncientCulture.GREECE -> LexiconDictionary.Greek
        AncientCulture.EGYPT -> LexiconDictionary.Egyptian
        AncientCulture.CANAAN -> LexiconDictionary.Canaanite
        AncientCulture.CARTHAGE -> LexiconDictionary.Carthaginian
        AncientCulture.ROME -> LexiconDictionary.Roman
    }

    // Under edge-to-edge (enforced from SDK 35) the system bars are drawn by
    // the app and window.statusBarColor is a no-op, so the only thing left to
    // set is the icon appearance: these are dark grounds in every culture, so
    // the bar icons stay light.
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
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
