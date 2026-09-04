package com.astra.antiqua.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import com.astra.antiqua.domain.LexiconDictionary
import com.astra.antiqua.model.AncientCulture

val LocalLexicon = staticCompositionLocalOf { LexiconDictionary.Greek }

/**
 * The active culture's accent, for the places a Material role does not
 * express: a rule under a heading, a retrograde mark, the tick on a bar.
 * Provided alongside the lexicon so a composable can read either without
 * being handed the culture itself.
 */
val LocalAccent = staticCompositionLocalOf { AccentGreece }

/**
 * Every culture gets its own ground and accent. Four of the five used to
 * share one identical black-and-gold scheme, so the theming promise was only
 * a fifth kept; these are the five grounds and five accents the web surface
 * ships, so a reader moving between surfaces sees the same Egypt.
 */
private fun schemeFor(ground: Color, accent: Color) = darkColorScheme(
    primary = accent,
    onPrimary = ground,
    secondary = accent,
    onSecondary = ground,
    tertiary = Bone,
    onTertiary = ground,
    background = ground,
    onBackground = Bone,
    surface = ground,
    onSurface = Bone,
    surfaceVariant = ground,
    onSurfaceVariant = Dim,
    outline = Rule,
    outlineVariant = RuleRow,
    error = Conflict,
    onError = ground,
)

@Composable
fun AstraAntiquaTheme(
    selectedCulture: AncientCulture = AncientCulture.GREECE,
    content: @Composable () -> Unit
) {
    val accent = when (selectedCulture) {
        AncientCulture.EGYPT -> AccentEgypt
        AncientCulture.GREECE -> AccentGreece
        AncientCulture.CANAAN -> AccentCanaan
        AncientCulture.CARTHAGE -> AccentCarthage
        AncientCulture.ROME -> AccentRome
    }
    val ground = when (selectedCulture) {
        AncientCulture.EGYPT -> GroundEgypt
        AncientCulture.GREECE -> GroundGreece
        AncientCulture.CANAAN -> GroundCanaan
        AncientCulture.CARTHAGE -> GroundCarthage
        AncientCulture.ROME -> GroundRome
    }
    val lexicon = when (selectedCulture) {
        AncientCulture.GREECE -> LexiconDictionary.Greek
        AncientCulture.EGYPT -> LexiconDictionary.Egyptian
        AncientCulture.CANAAN -> LexiconDictionary.Canaanite
        AncientCulture.CARTHAGE -> LexiconDictionary.Carthaginian
        AncientCulture.ROME -> LexiconDictionary.Roman
    }

    // Under edge-to-edge (enforced from SDK 35) the app paints its own ground
    // behind the system bars and window.statusBarColor is a no-op, so the only
    // thing left to set is icon appearance. Every ground is dark.
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    CompositionLocalProvider(LocalLexicon provides lexicon, LocalAccent provides accent) {
        MaterialTheme(
            colorScheme = schemeFor(ground, accent),
            typography = Typography,
            content = content
        )
    }
}
