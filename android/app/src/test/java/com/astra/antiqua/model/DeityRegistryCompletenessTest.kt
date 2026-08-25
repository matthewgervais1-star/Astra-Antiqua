package com.astra.antiqua.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * DeityRegistry used to be a `Map<AncientCulture, Map<ClassicalPlanet, Deity>>`
 * read via `getValue()`, so a missing (culture, planet) pair only failed at
 * runtime. Now that `getDeity` is a nested exhaustive `when`, a missing pair
 * is a compile error and can't reach this test at all -- what's left to check
 * is data completeness (every entry actually has real content).
 */
class DeityRegistryCompletenessTest {

    @Test
    fun `every culture by planet pair resolves to a non-blank name and epithet`() {
        for (culture in AncientCulture.values()) {
            for (planet in ClassicalPlanet.values()) {
                val deity = DeityRegistry.getDeity(culture, planet)

                assertTrue("Blank deity name for $culture/$planet", deity.name.isNotBlank())
                assertTrue("Blank deity epithet for $culture/$planet", deity.epithet.isNotBlank())
            }
        }
    }

    @Test
    fun `getDeitiesFor returns exactly one entry per planet for every culture`() {
        for (culture in AncientCulture.values()) {
            val deities = DeityRegistry.getDeitiesFor(culture)

            assertEquals(
                "Expected one Deity per ClassicalPlanet for $culture",
                ClassicalPlanet.values().toSet(),
                deities.keys
            )
        }
    }
}
