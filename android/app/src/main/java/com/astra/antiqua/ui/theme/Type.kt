package com.astra.antiqua.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.TextUnit
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
 * The symbols face, for the zodiac and planet notation the Learn pages set as
 * text. It is the design system's --font-symbols, vendored here for the same
 * reason web vendors it: none of the three product faces carries those
 * codepoints, and without this the platform falls through to the colour emoji
 * font and paints them as orange pictographs.
 *
 * Notation only, never copy. Nothing in this app may set a sentence in it.
 */
val NotoSymbols = FontFamily(Font(R.font.noto_sans_symbols, FontWeight.Normal))

/**
 * THE TYPE SCALE, from docs/design/system/tokens/typography.css, which is
 * canonical for both surfaces. Ten sizes, four tracking values, three
 * leadings, the same ten web binds in web/src/app/globals.css.
 *
 * They are named rather than inlined so the mapping onto Material's fifteen
 * slots can be read instead of inferred, and so a screen can reach a step by
 * name on the rare occasion it must. No call site may set a literal sp size.
 */
object TypeScale {
    /** display: Cinzel, caps, wide tracking. Never lowercase, never running text. */
    val DisplayXl = 52.sp
    val DisplayL = 40.sp
    val DisplayM = 26.sp
    val DisplayS = 22.sp

    /** prose: Spectral. */
    val ProseL = 19.sp
    val ProseM = 17.sp
    val ProseS = 15.sp

    /** data and microcopy: IBM Plex Mono. */
    val DataM = 15.sp
    val DataS = 12.sp
    val DataXs = 11.sp

    val TrackDisplay = 0.16.em
    val TrackData = 0.04.em
    val TrackLabel = 0.14.em
    val TrackMicrocopy = 0.18.em

    /** Leadings, as multiples of the size. */
    const val LeadingDisplay = 1.1f
    const val LeadingProse = 1.65f
    const val LeadingData = 2f
}

private fun display(size: TextUnit, weight: FontWeight) = TextStyle(
    fontFamily = Cinzel,
    fontWeight = weight,
    fontSize = size,
    lineHeight = size * TypeScale.LeadingDisplay,
    letterSpacing = TypeScale.TrackDisplay,
)

private fun prose(size: TextUnit) = TextStyle(
    fontFamily = Spectral,
    fontWeight = FontWeight.Light,
    fontSize = size,
    lineHeight = size * TypeScale.LeadingProse,
)

private fun data(
    size: TextUnit,
    tracking: TextUnit,
    weight: FontWeight = FontWeight.Normal,
    lineHeight: TextUnit = TextUnit.Unspecified,
) = TextStyle(
    fontFamily = PlexMono,
    fontWeight = weight,
    fontSize = size,
    lineHeight = lineHeight,
    letterSpacing = tracking,
)

/**
 * Material's fifteen slots on the system's ten sizes.
 *
 * The three prose slots take the three prose steps and the three label slots
 * take the three data steps, one for one. Display has four steps against
 * Material's six slots above title, so headlineMedium and headlineSmall
 * borrow display-s rather than inventing a step between.
 *
 * Leading follows the family: display at 1.1, prose at 1.65, and the data
 * leading of 2 on labelLarge, which is the slot that stacks into ephemeris
 * rows. The two smaller label slots are single-line chips and kickers, so
 * they take the font's own metrics instead of a number invented for them.
 *
 * The three title slots are the one place a literal size survives. Cinzel
 * sets list names and section labels at 12 to 16sp here and the display
 * scale stops at 22sp; mapping them up would break those rows, and
 * tokens/typography.css says not to add a size to fit one screen. Web left
 * the same sixty sites literal for the same reason, so both surfaces carry
 * the gap identically rather than each inventing its own fix. A display step
 * below 22, or a move to mono, is a design decision, recorded in
 * docs/design/IMPLEMENTATION.md.
 */
val Typography = Typography(
    displayLarge = display(TypeScale.DisplayXl, FontWeight.Medium),
    displayMedium = display(TypeScale.DisplayL, FontWeight.Medium),
    displaySmall = display(TypeScale.DisplayM, FontWeight.Medium),

    headlineLarge = display(TypeScale.DisplayS, FontWeight.Normal),
    headlineMedium = display(TypeScale.DisplayS, FontWeight.Normal),
    headlineSmall = display(TypeScale.DisplayS, FontWeight.Normal),

    titleLarge = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Medium, fontSize = 16.sp, lineHeight = 22.sp, letterSpacing = TypeScale.TrackLabel),
    titleMedium = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 20.sp, letterSpacing = TypeScale.TrackLabel),
    titleSmall = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Normal, fontSize = 12.sp, lineHeight = 18.sp, letterSpacing = TypeScale.TrackMicrocopy),

    bodyLarge = prose(TypeScale.ProseL),
    bodyMedium = prose(TypeScale.ProseM),
    bodySmall = prose(TypeScale.ProseS),

    labelLarge = data(
        TypeScale.DataM,
        TypeScale.TrackData,
        FontWeight.Medium,
        TypeScale.DataM * TypeScale.LeadingData,
    ),
    labelMedium = data(TypeScale.DataS, TypeScale.TrackLabel),
    labelSmall = data(TypeScale.DataXs, TypeScale.TrackMicrocopy),
)
