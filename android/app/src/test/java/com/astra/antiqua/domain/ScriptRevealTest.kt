package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** The pure rules of the script reveal: language, lookup, null fallback, the band. */
class ScriptRevealTest {

    @Test
    fun frenchOnlyForTheFrenchLanguageSubtag() {
        assertEquals(ReaderLanguage.FR, ScriptReveal.pickLanguage("fr"))
        assertEquals(ReaderLanguage.FR, ScriptReveal.pickLanguage("FR"))
        assertEquals(ReaderLanguage.EN, ScriptReveal.pickLanguage("en"))
        assertEquals(ReaderLanguage.EN, ScriptReveal.pickLanguage("fro"))
        assertEquals(ReaderLanguage.EN, ScriptReveal.pickLanguage("frr"))
        assertEquals(ReaderLanguage.EN, ScriptReveal.pickLanguage(""))
        assertEquals(ReaderLanguage.EN, ScriptReveal.pickLanguage(null))
    }

    @Test
    fun lookupFindsTheDeityTheCultureNameAndTheInstitution() {
        val ra = ScriptReveal.formFor(AncientCulture.EGYPT, ScriptNameKey.Deity(Planet.SUN))
        assertEquals("Ra", ra.en)
        assertEquals("Rê", ra.fr)
        assertEquals("ROMA", ScriptReveal.formFor(AncientCulture.ROME, ScriptNameKey.CultureName).script)
        assertEquals("AVSPICIA", ScriptReveal.formFor(AncientCulture.ROME, ScriptNameKey.Institution).script)
    }

    @Test
    fun latinFollowsTheLanguageAndTheCase() {
        val form = ScriptForms.deity(AncientCulture.GREECE, Planet.MERCURY)
        assertEquals("Hermes", ScriptReveal.latinFor(form, ReaderLanguage.EN))
        assertEquals("Hermès", ScriptReveal.latinFor(form, ReaderLanguage.FR))
        assertEquals("HERMÈS", ScriptReveal.latinFor(form, ReaderLanguage.FR, upper = true))
        assertEquals("ÉGYPTE", ScriptReveal.latinFor(ScriptForms.cultureName(AncientCulture.EGYPT), ReaderLanguage.FR, upper = true))
    }

    @Test
    fun aNameWithNoAttestedSpellingHasNoScriptLayer() {
        assertNull(ScriptReveal.scriptFor(ScriptForms.deity(AncientCulture.EGYPT, Planet.MERCURY)))
        assertNull(ScriptReveal.scriptFor(ScriptForms.cultureName(AncientCulture.CANAAN)))
        assertNull(ScriptReveal.scriptFor(ScriptForms.institution(AncientCulture.CARTHAGE)))
        assertNull(ScriptReveal.scriptFor(ScriptForm("", "x", "x")))
        assertEquals("𓂋𓂝𓇳", ScriptReveal.scriptFor(ScriptForms.deity(AncientCulture.EGYPT, Planet.SUN)))
    }

    @Test
    fun theBandRunsFromThirtyToSeventyPercentOfTheWindow() {
        val h = 1000f
        // Wholly above or below the band.
        assertFalse(ScriptReveal.inBand(100f, 200f, h))
        assertFalse(ScriptReveal.inBand(800f, 900f, h))
        // Touching an edge is not overlapping.
        assertFalse(ScriptReveal.inBand(250f, 300f, h))
        assertFalse(ScriptReveal.inBand(700f, 750f, h))
        // Crossing an edge, inside, and taller than the band.
        assertTrue(ScriptReveal.inBand(250f, 301f, h))
        assertTrue(ScriptReveal.inBand(699f, 750f, h))
        assertTrue(ScriptReveal.inBand(450f, 500f, h))
        assertTrue(ScriptReveal.inBand(0f, 1000f, h))
        // A box clipped to nothing, or a window not yet measured.
        assertFalse(ScriptReveal.inBand(500f, 500f, h))
        assertFalse(ScriptReveal.inBand(450f, 500f, 0f))
    }

    @Test
    fun thePickerResolvesInTurn() {
        assertEquals(1200L, ScriptReveal.introDelayFor(0))
        assertEquals(1400L, ScriptReveal.introDelayFor(1))
        assertEquals(2000L, ScriptReveal.introDelayFor(4))
        assertEquals(400, ScriptReveal.FADE_MILLIS)
    }
}
