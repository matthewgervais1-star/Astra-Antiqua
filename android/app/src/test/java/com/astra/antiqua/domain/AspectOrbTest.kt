package com.astra.antiqua.domain

import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Locks down AspectType's degree/orb table so it can never drift silently
 * again -- any future change to these numbers now has to touch this test.
 *
 * TODO(Phase 2): docs/shared-content-model.md documents the canonical,
 * published orb table (mirrored from web's `ASPECT_RULES` in
 * `web/src/lib/transits.ts`) as conjunction 8, opposition 8, square 7,
 * trine 7, sextile 5 -- Android's table below is still the old, divergent
 * one. When Android's `AspectType` is updated to match, this test must move
 * with it (deliberately, as a visible diff), not be deleted.
 */
class AspectOrbTest {

    @Test
    fun `current aspect degree and orb values`() {
        assertEquals(0.0, AspectType.CONJUNCTION.degree, 0.0)
        assertEquals(4.0, AspectType.CONJUNCTION.orb, 0.0)

        assertEquals(60.0, AspectType.SEXTILE.degree, 0.0)
        assertEquals(3.0, AspectType.SEXTILE.orb, 0.0)

        assertEquals(90.0, AspectType.SQUARE.degree, 0.0)
        assertEquals(4.0, AspectType.SQUARE.orb, 0.0)

        assertEquals(120.0, AspectType.TRINE.degree, 0.0)
        assertEquals(4.0, AspectType.TRINE.orb, 0.0)

        assertEquals(180.0, AspectType.OPPOSITION.degree, 0.0)
        assertEquals(5.0, AspectType.OPPOSITION.orb, 0.0)
    }
}
