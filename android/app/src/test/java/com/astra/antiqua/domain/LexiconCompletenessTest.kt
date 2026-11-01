package com.astra.antiqua.domain

import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The Android-only vocabulary left in LexiconDictionary after the shared
 * strings table dropped the rest (culturalVoices and getOfficerName went
 * with it on 2026-11-01): every culture's remaining copy is real, non-blank
 * text.
 */
class LexiconCompletenessTest {

    private val lexiconsByName = mapOf(
        "Greek" to LexiconDictionary.Greek,
        "Egyptian" to LexiconDictionary.Egyptian,
        "Canaanite" to LexiconDictionary.Canaanite,
        "Carthaginian" to LexiconDictionary.Carthaginian,
        "Roman" to LexiconDictionary.Roman
    )

    @Test
    fun `every culture's remaining lexicon copy is non-blank`() {
        for ((name, lexicon) in lexiconsByName) {
            assertTrue("$name has a blank officer role", lexicon.officerRole.isNotBlank())
            assertTrue("$name has a blank summary title", lexicon.highPriestSummaryTitle.isNotBlank())
            assertTrue("$name has a blank decree line", lexicon.decreeLine("Deity", "Aries").isNotBlank())
            assertTrue("$name has a blank summary", lexicon.highPriestSummary("Aries", "Taurus").isNotBlank())
        }
    }
}
