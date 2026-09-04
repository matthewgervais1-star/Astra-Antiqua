package com.astra.antiqua.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import com.astra.antiqua.R

/**
 * The identity's three real typefaces, shipped in res/font by
 * `node scripts/fetch-fonts.mjs --android` (the same pipeline that fetches
 * the web woff2, so both surfaces stay on one cut).
 *
 * These used to be `FontFamily.Serif` and `FontFamily.Monospace` aliased to
 * the names of a previous identity's fonts. They are now the fonts they say
 * they are.
 */
val Cinzel = FontFamily(
    Font(R.font.cinzel_regular, FontWeight.Normal),
    Font(R.font.cinzel_medium, FontWeight.Medium),
    Font(R.font.cinzel_semibold, FontWeight.SemiBold),
)

val Spectral = FontFamily(
    Font(R.font.spectral_light, FontWeight.Light),
    Font(R.font.spectral_regular, FontWeight.Normal),
    Font(R.font.spectral_light_italic, FontWeight.Light, FontStyle.Italic),
    Font(R.font.spectral_regular_italic, FontWeight.Normal, FontStyle.Italic),
)

val PlexMono = FontFamily(
    Font(R.font.ibm_plex_mono_regular, FontWeight.Normal),
    Font(R.font.ibm_plex_mono_medium, FontWeight.Medium),
)

/**
 * The FULL Material3 scale, not the four slots that used to be defined here.
 * The other eleven silently fell back to Roboto, which is why the app's
 * typography was inconsistent by accident rather than by design.
 *
 * Cinzel carries display and titles, in caps with wide tracking. Spectral
 * carries prose at generous line height. Plex Mono carries data and
 * microcopy, and never goes below 11sp.
 */
val Typography = Typography(
    displayLarge = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Medium, fontSize = 40.sp, lineHeight = 50.sp, letterSpacing = 0.1.em),
    displayMedium = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Medium, fontSize = 32.sp, lineHeight = 40.sp, letterSpacing = 0.1.em),
    displaySmall = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Medium, fontSize = 26.sp, lineHeight = 34.sp, letterSpacing = 0.1.em),

    headlineLarge = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Normal, fontSize = 24.sp, lineHeight = 32.sp, letterSpacing = 0.08.em),
    headlineMedium = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Normal, fontSize = 20.sp, lineHeight = 28.sp, letterSpacing = 0.08.em),
    headlineSmall = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Normal, fontSize = 17.sp, lineHeight = 24.sp, letterSpacing = 0.14.em),

    titleLarge = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Medium, fontSize = 16.sp, lineHeight = 22.sp, letterSpacing = 0.14.em),
    titleMedium = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 20.sp, letterSpacing = 0.14.em),
    titleSmall = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Normal, fontSize = 12.sp, lineHeight = 18.sp, letterSpacing = 0.2.em),

    bodyLarge = TextStyle(fontFamily = Spectral, fontWeight = FontWeight.Light, fontSize = 17.sp, lineHeight = 29.sp),
    bodyMedium = TextStyle(fontFamily = Spectral, fontWeight = FontWeight.Light, fontSize = 15.sp, lineHeight = 26.sp),
    bodySmall = TextStyle(fontFamily = Spectral, fontWeight = FontWeight.Light, fontSize = 13.sp, lineHeight = 22.sp),

    labelLarge = TextStyle(fontFamily = PlexMono, fontWeight = FontWeight.Medium, fontSize = 12.sp, lineHeight = 18.sp, letterSpacing = 0.14.em),
    labelMedium = TextStyle(fontFamily = PlexMono, fontWeight = FontWeight.Normal, fontSize = 11.sp, lineHeight = 17.sp, letterSpacing = 0.16.em),
    labelSmall = TextStyle(fontFamily = PlexMono, fontWeight = FontWeight.Normal, fontSize = 11.sp, lineHeight = 16.sp, letterSpacing = 0.2.em),
)
