package com.astra.antiqua.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The system carries ten bodies, not the classical seven. Uranus, Neptune and
 * Pluto are received: no ancient culture knew them, so each is admitted under
 * a native name, and every surface that shows one has to be able to say so.
 * Web holds the same ten in shared/content and states the extension on its
 * method page; these tests hold Android to that spine.
 */
class ReceivedBodiesTest {

    @Test
    fun `the spine carries ten bodies`() {
        assertEquals(10, Planet.values().size)
    }

    @Test
    fun `the three received bodies are the outer planets, in order`() {
        assertEquals(
            listOf(Planet.URANUS, Planet.NEPTUNE, Planet.PLUTO),
            Planet.values().filter { it.isReceived }
        )
    }

    @Test
    fun `the classical seven are not marked as received`() {
        val classical = Planet.values().filterNot { it.isReceived }

        assertEquals(7, classical.size)
        assertFalse("The Sun is not a reception", Planet.SUN.isReceived)
    }

    @Test
    fun `every received body resolves a deity in every culture`() {
        for (culture in AncientCulture.values()) {
            for (planet in Planet.values().filter { it.isReceived }) {
                val deity = DeityRegistry.getDeity(culture, planet)

                assertTrue("Blank name for $culture/$planet", deity.name.isNotBlank())
                assertTrue("Blank epithet for $culture/$planet", deity.epithet.isNotBlank())
            }
        }
    }

    @Test
    fun `no culture reuses one name across two received bodies`() {
        for (culture in AncientCulture.values()) {
            val names = Planet.values()
                .filter { it.isReceived }
                .map { DeityRegistry.getDeity(culture, it).name }

            assertEquals("Duplicate reception name in $culture: $names", names.size, names.toSet().size)
        }
    }
}
