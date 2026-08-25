package com.astra.antiqua.domain

import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Locks down AspectType's degree/orb table so it can never drift silently
 * again -- any future change to these numbers now has to touch this test.
 *
 * Phase 2: moved onto the one documented, canonical orb table (published on
 * the web /method page, docs/shared-content-model.md, and mirrored from
 * ASPECT_RULES in web/src/data/sampleChart.ts): conjunction 8, sextile 5,
 * square 7, trine 7, opposition 8. This replaces the old, divergent
 * 4/3/4/4/5 table Android carried before this phase.
 */
class AspectOrbTest {

    @Test
    fun `current aspect degree and orb values`() {
        assertEquals(0.0, AspectType.CONJUNCTION.degree, 0.0)
        assertEquals(8.0, AspectType.CONJUNCTION.orb, 0.0)

        assertEquals(60.0, AspectType.SEXTILE.degree, 0.0)
        assertEquals(5.0, AspectType.SEXTILE.orb, 0.0)

        assertEquals(90.0, AspectType.SQUARE.degree, 0.0)
        assertEquals(7.0, AspectType.SQUARE.orb, 0.0)

        assertEquals(120.0, AspectType.TRINE.degree, 0.0)
        assertEquals(7.0, AspectType.TRINE.orb, 0.0)

        assertEquals(180.0, AspectType.OPPOSITION.degree, 0.0)
        assertEquals(8.0, AspectType.OPPOSITION.orb, 0.0)
    }
}
