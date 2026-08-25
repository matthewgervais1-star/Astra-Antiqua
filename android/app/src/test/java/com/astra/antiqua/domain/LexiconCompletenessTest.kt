package com.astra.antiqua.domain

import com.astra.antiqua.model.ClassicalPlanet
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * `CulturalLexicon.getOfficerName` used to fall back to "The Servant" when a
 * planet was missing from a culture's `culturalVoices` map, silently
 * producing wrong copy. `culturalVoices` is now a function backed by an
 * exhaustive `when` per culture (see LexiconDictionary), so a missing planet
 * is a compile error; this test is the data-completeness check for what's
 * left, that every culture's copy is real (non-blank) text.
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
    fun `every culture's culturalVoices covers every planet with non-blank copy`() {
        for ((name, lexicon) in lexiconsByName) {
            for (planet in ClassicalPlanet.values()) {
                val voice = lexicon.culturalVoices(planet)
                assertTrue("$name has blank cultural-voice copy for $planet", voice.isNotBlank())
            }
        }
    }

    @Test
    fun `getOfficerName never falls back to the old Servant placeholder`() {
        for ((name, lexicon) in lexiconsByName) {
            for (planet in ClassicalPlanet.values()) {
                val officerName = lexicon.getOfficerName(planet, "Deity")
                assertTrue(
                    "$name/$planet produced the old fallback copy",
                    !officerName.startsWith("The Servant")
                )
            }
        }
    }
}
