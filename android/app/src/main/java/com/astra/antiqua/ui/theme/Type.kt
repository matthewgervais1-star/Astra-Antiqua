package com.astra.antiqua.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
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

/**
 * Spectral SC, the display face on the four non-Roman surfaces (Egypt,
 * Greece, Canaan, Carthage). Rome and the app shell keep Cinzel. It is the
 * design system's --font-display-sc, and web makes the same switch in
 * globals.css.
 *
 * The family draws its small capitals on the LOWERCASE codepoints and has no
 * c2sc or smcp feature, so a capital stays a full capital. Display text must
 * reach it lowercased; [displayCase] does that.
 */
val SpectralSc = FontFamily(
    Font(R.font.spectral_sc_regular, FontWeight.Normal),
    Font(R.font.spectral_sc_medium, FontWeight.Medium),
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
 * The script-reveal faces (docs/superpowers/specs/2026-10-20-script-reveal.md),
 * the design system's epigraphic faces: they set the attested names in
 * domain/ScriptForms.kt and nothing else. GFS Didot's single TTF carries both
 * Greek and Greek Extended, so polytonic names need no fallback family.
 * ScriptFontCoverageTest checks every script code point against these files.
 */
val NotoHieroglyphs = FontFamily(Font(R.font.noto_sans_egyptian_hieroglyphs, FontWeight.Normal))
val NotoUgaritic = FontFamily(Font(R.font.noto_sans_ugaritic, FontWeight.Normal))
val NotoPhoenician = FontFamily(Font(R.font.noto_sans_phoenician, FontWeight.Normal))
val GfsDidot = FontFamily(Font(R.font.gfs_didot, FontWeight.Normal))

/**
 * THE TYPE SCALE, from docs/design/system/tokens/typography.css, which is
 * canonical for both surfaces. Eleven sizes, five tracking values, three
 * leadings, the same eleven web binds in web/src/app/globals.css.
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
    /** Added 2026-09-29 for the small labels: 22 / (26 / 22) = 18.6, held to 18. */
    val DisplayXs = 18.sp

    /** prose: Spectral. */
    val ProseL = 19.sp
    val ProseM = 17.sp
    val ProseS = 15.sp

    /** data and microcopy: IBM Plex Mono. */
    val DataM = 15.sp
    val DataS = 12.sp
    val DataXs = 11.sp

    val TrackDisplay = 0.16.em
    /** Spectral SC sits closer than Cinzel: small caps need less air. */
    val TrackDisplaySc = 0.06.em
    val TrackData = 0.04.em
    val TrackLabel = 0.14.em
    val TrackMicrocopy = 0.18.em

    /** Leadings, as multiples of the size. */
    const val LeadingDisplay = 1.1f
    const val LeadingProse = 1.65f
    const val LeadingData = 2f
}

private fun display(size: TextUnit, weight: FontWeight, smallCaps: Boolean = false) = TextStyle(
    fontFamily = if (smallCaps) SpectralSc else Cinzel,
    fontWeight = weight,
    fontSize = size,
    lineHeight = size * TypeScale.LeadingDisplay,
    letterSpacing = if (smallCaps) TypeScale.TrackDisplaySc else TypeScale.TrackDisplay,
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

/** display-xs: the smallest Cinzel step, for list names and small heads. */
val displayXs: TextStyle = display(TypeScale.DisplayXs, FontWeight.Normal)

/** display-xs in Spectral SC, for the four non-Roman surfaces. */
val displaySc: TextStyle = display(TypeScale.DisplayXs, FontWeight.Normal, smallCaps = true)

/**
 * True when the active surface sets display in Spectral SC. AstraAntiquaTheme
 * provides it from the culture; [ShellType] turns it off for the app shell.
 */
val LocalSmallCapsDisplay = staticCompositionLocalOf { false }

/**
 * Display text as the active display face needs it. Spectral SC draws small
 * capitals only on lowercase codepoints, and most call sites pass display
 * text uppercased for Cinzel, so on the small-caps surfaces this lowercases
 * it. The glyphs are drawn small capitals, so nothing reads as lowercase on
 * screen. On Rome and the shell the text passes through unchanged.
 *
 * Web does the same with `text-transform: lowercase` in globals.css.
 */
@Composable
@ReadOnlyComposable
fun displayCase(text: String): String =
    if (LocalSmallCapsDisplay.current) text.lowercase() else text

/**
 * Material's fifteen slots on the system's eleven sizes.
 *
 * The three prose slots take the three prose steps and the three label slots
 * take the three data steps, one for one. Display has four steps from 22 up
 * against Material's six slots above title, so headlineMedium and
 * headlineSmall borrow display-s rather than inventing a step between.
 *
 * Leading follows the family: display at 1.1, prose at 1.65, and the data
 * leading of 2 on labelLarge, which is the slot that stacks into ephemeris
 * rows. The two smaller label slots are single-line chips and kickers, so
 * they take the font's own metrics instead of a number invented for them.
 *
 * The three title slots carry the labels Cinzel used to set at 12 to 16sp.
 * The two larger ones take display-xs, the step the owner added under 22 on
 * 2026-09-29; titleSmall held section captions and the day's permission
 * labels, which are microcopy, so it moves to the mono data scale. Web made
 * the same split: 14 to 17px onto display-xs, 11 to 13px onto mono. The
 * decision is recorded in docs/design/IMPLEMENTATION.md.
 */
val Typography = typographyFor(smallCaps = false)

/**
 * The four non-Roman surfaces: every display slot (display, headline and the
 * two display-xs titles) moves to Spectral SC at 0.06em, on the same sizes.
 * These are the slots web's prototype switched, since web rebinds
 * --font-display for every heading and every `font-display` class.
 */
val SmallCapsTypography = typographyFor(smallCaps = true)

private fun typographyFor(smallCaps: Boolean) = Typography(
    displayLarge = display(TypeScale.DisplayXl, FontWeight.Medium, smallCaps),
    displayMedium = display(TypeScale.DisplayL, FontWeight.Medium, smallCaps),
    displaySmall = display(TypeScale.DisplayM, FontWeight.Medium, smallCaps),

    headlineLarge = display(TypeScale.DisplayS, FontWeight.Normal, smallCaps),
    headlineMedium = display(TypeScale.DisplayS, FontWeight.Normal, smallCaps),
    headlineSmall = display(TypeScale.DisplayS, FontWeight.Normal, smallCaps),

    titleLarge = display(TypeScale.DisplayXs, FontWeight.Medium, smallCaps),
    titleMedium = if (smallCaps) displaySc else displayXs,
    titleSmall = data(TypeScale.DataS, TypeScale.TrackMicrocopy),

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
