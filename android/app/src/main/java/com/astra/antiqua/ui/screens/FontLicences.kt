package com.astra.antiqua.ui.screens

import androidx.annotation.StringRes
import com.astra.antiqua.R

/**
 * One font family the app ships and the notice its licence asks to travel
 * with it. [key] is the file-name stem of the family with the weight removed
 * (see [fontFamilyKey]), so a font added to res/font with no entry here is
 * caught by a test. The copyright line is the one in the font's own name
 * table (nameID 0), kept in strings.xml.
 */
data class FontLicence(
    val key: String,
    val family: String,
    @param:StringRes val copyright: Int,
)

/** All five families are under the SIL Open Font License 1.1. */
val FontLicences: List<FontLicence> = listOf(
    FontLicence("cinzel", "Cinzel", R.string.licences_font_cinzel),
    FontLicence("spectral", "Spectral", R.string.licences_font_spectral),
    FontLicence("spectral_sc", "Spectral SC", R.string.licences_font_spectral_sc),
    FontLicence("ibm_plex_mono", "IBM Plex Mono", R.string.licences_font_ibm_plex_mono),
    FontLicence("noto_sans_symbols", "Noto Sans Symbols", R.string.licences_font_noto_sans_symbols),
)

private val WeightWords = setOf("regular", "light", "medium", "semibold", "bold", "italic")

/** "spectral_sc_medium" and "spectral_sc_regular" are one family: "spectral_sc". */
fun fontFamilyKey(fileStem: String): String =
    fileStem.split('_').dropLastWhile { it in WeightWords }.joinToString("_")
