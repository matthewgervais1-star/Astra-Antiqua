package com.astra.antiqua.ui.screens

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

class LicencesTest {

    private val fontDir = File("src/main/res/font")
    private val rawDir = File("src/main/res/raw")

    /**
     * The OFL asks for the notice to travel with the fonts. A font file added
     * to res/font without an entry in the list ships unattributed, so the
     * families are derived from the file names, not from the list.
     */
    @Test
    fun everyFontFamilyInTheAppHasALicenceEntry() {
        val files = fontDir.listFiles { f -> f.extension == "ttf" }.orEmpty()
        assertTrue("no fonts found at ${fontDir.absolutePath}", files.isNotEmpty())
        val shipped = files.map { fontFamilyKey(it.nameWithoutExtension) }.toSet()
        val listed = FontLicences.map { it.key }.toSet()
        assertEquals("fonts with no licence entry", emptySet<String>(), shipped - listed)
        assertEquals("entries with no font", emptySet<String>(), listed - shipped)
    }

    @Test
    fun weightsOfOneFamilyShareOneKey() {
        assertEquals("cinzel", fontFamilyKey("cinzel_semibold"))
        assertEquals("spectral", fontFamilyKey("spectral_light_italic"))
        assertEquals("spectral_sc", fontFamilyKey("spectral_sc_medium"))
        assertEquals("ibm_plex_mono", fontFamilyKey("ibm_plex_mono_regular"))
        assertEquals("noto_sans_symbols", fontFamilyKey("noto_sans_symbols"))
    }

    @Test
    fun theOflTextIsPresentAndOpensWithItsTitle() {
        val file = File(rawDir, "ofl_1_1.txt")
        assertTrue("missing ${file.absolutePath}", file.isFile)
        val text = file.readText()
        assertEquals("SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007", text.lineSequence().first())
        assertTrue(text.contains("PERMISSION & CONDITIONS"))
        assertTrue(text.contains("DISCLAIMER"))
    }

    @Test
    fun theMitTextCarriesItsCopyrightNotice() {
        val text = File(rawDir, "mit_astronomy_engine.txt").readText()
        assertEquals("MIT License", text.lineSequence().first())
        assertTrue(text.contains("Copyright (c) 2019-2023 Don Cross"))
    }
}
