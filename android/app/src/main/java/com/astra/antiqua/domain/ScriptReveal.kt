package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import java.util.Locale

/**
 * The pure half of the script reveal (docs/superpowers/specs/2026-10-20-script-reveal.md),
 * the Android mirror of web/src/lib/scriptName.ts: which form a name takes,
 * which Latin form the reader gets, and when a name sits in the middle band.
 * The swap itself lives in ui/components/ScriptName.kt.
 */

/** A deity seat, or one of the two headings the spec allows (rule 2). */
sealed interface ScriptNameKey {
    data class Deity(val planet: Planet) : ScriptNameKey
    data object CultureName : ScriptNameKey
    data object Institution : ScriptNameKey
}

enum class ReaderLanguage { EN, FR }

object ScriptReveal {
    /** The band's top and bottom edges, as fractions of the window height (spec rule 5). */
    const val BAND_TOP = 0.3f
    const val BAND_BOTTOM = 0.7f

    /** The cross-fade, in milliseconds. */
    const val FADE_MILLIS = 400

    /** How long a name near the top holds its script form before it resolves (web's CULTURE_NAME_INTRO_MS). */
    const val INTRO_HOLD_MILLIS = 1200L

    /** The step between the picker's names, so they resolve in turn. */
    const val INTRO_STAGGER_MILLIS = 200L

    /** The fade MainActivity runs between app phases; the picker composes when it starts. */
    const val PHASE_FADE_MILLIS = 400

    /**
     * French when the device locale's language is French (fr, fr-CA); English
     * otherwise. Matches the language subtag exactly, so "fro" (Old French)
     * and "frr" (North Frisian) stay English, as web's pickLanguage does.
     */
    fun pickLanguage(language: String?): ReaderLanguage =
        if (language?.trim()?.lowercase(Locale.ROOT) == "fr") ReaderLanguage.FR else ReaderLanguage.EN

    fun formFor(culture: AncientCulture, key: ScriptNameKey): ScriptForm = when (key) {
        is ScriptNameKey.Deity -> ScriptForms.deity(culture, key.planet)
        ScriptNameKey.CultureName -> ScriptForms.cultureName(culture)
        ScriptNameKey.Institution -> ScriptForms.institution(culture)
    }

    /** The readable form: the accessible name and the text a reader copies. */
    fun latinFor(form: ScriptForm, language: ReaderLanguage, upper: Boolean = false): String {
        val text = if (language == ReaderLanguage.FR) form.fr else form.en
        if (!upper) return text
        return text.uppercase(if (language == ReaderLanguage.FR) Locale.FRENCH else Locale.ENGLISH)
    }

    /** The script layer to set, or null when the name has no attested script form. */
    fun scriptFor(form: ScriptForm): String? = form.script?.takeIf { it.isNotEmpty() }

    /**
     * True while a box from [top] to [bottom] (window pixels) overlaps the band
     * between 30% and 70% of a window [windowHeight] pixels tall. A box that
     * only touches an edge is outside; a box taller than the band is inside.
     */
    fun inBand(top: Float, bottom: Float, windowHeight: Float): Boolean {
        if (windowHeight <= 0f || bottom <= top) return false
        return bottom > windowHeight * BAND_TOP && top < windowHeight * BAND_BOTTOM
    }

    /** The picker's hold for the name at [index]: 1.2 s, then 200 ms apart. */
    fun introDelayFor(index: Int): Long = INTRO_HOLD_MILLIS + INTRO_STAGGER_MILLIS * index

    /**
     * When the picker's name at [index] resolves, counted from the picker's first
     * composition: the phase fade runs first, so the hold starts on a full-opacity name.
     */
    fun pickerDelayFor(index: Int): Long = PHASE_FADE_MILLIS + introDelayFor(index)

    /**
     * The form a name shows: true for Latin, false for script, null while nothing
     * has been measured and no intro runs, when the name draws neither. The intro
     * shows script and a tap holds Latin; otherwise the band decides ([inBand]).
     */
    fun showsLatin(introRunning: Boolean, held: Boolean, inBand: Boolean?): Boolean? = when {
        introRunning -> false
        held -> true
        else -> inBand
    }

    /**
     * The Latin layer's alpha. Until [settled] the first form shows at once, so it
     * is never faded in from the wrong one; after that [animated] carries the fade.
     */
    fun latinAlpha(shows: Boolean?, settled: Boolean, animated: Float): Float = when {
        shows == null -> 0f
        !settled -> if (shows) 1f else 0f
        else -> animated
    }

    /** The script layer's alpha: whatever the Latin layer leaves, and nothing before a form is known. */
    fun scriptAlpha(shows: Boolean?, settled: Boolean, animated: Float): Float =
        if (shows == null) 0f else 1f - latinAlpha(shows, settled, animated)
}
