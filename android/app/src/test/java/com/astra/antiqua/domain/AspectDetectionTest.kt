package com.astra.antiqua.domain

import com.astra.antiqua.model.ClassicalPlanet
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Exercises [AspectDetector.detect] (the algorithm formerly private to
 * `CalculateNatalChartUseCase.calculateAspects`) directly against synthetic
 * longitudes, so these assertions don't depend on a real ephemeris.
 */
class AspectDetectionTest {

    @Test
    fun `bodies 90 degrees apart register exactly one square aspect`() {
        val aspects = AspectDetector.detect(
            mapOf(ClassicalPlanet.SUN to 10.0, ClassicalPlanet.MARS to 100.0)
        )

        assertEquals(1, aspects.size)
        val aspect = aspects.single()
        assertEquals(AspectType.SQUARE, aspect.type)
        assertEquals(0.0, aspect.exactness, 1e-9)
    }

    @Test
    fun `separation at the exact outer orb edge is still inclusively matched`() {
        // TRINE is 120 degrees, orb 4 -> its outer edge is 124 degrees.
        val aspects = AspectDetector.detect(
            mapOf(ClassicalPlanet.VENUS to 0.0, ClassicalPlanet.JUPITER to 124.0)
        )

        assertEquals(1, aspects.size)
        assertEquals(AspectType.TRINE, aspects.single().type)
        assertEquals(1.0, aspects.single().exactness, 1e-9)
    }

    /**
     * `AspectDetector.detect` (like the private method it was extracted from)
     * checks every AspectType for a pair with no early exit ("break"), unlike
     * web's `computeAspects` (web/src/lib/transits.ts), which stops at the
     * first match. The task here is to find a separation that falls inside
     * two orb bands and observe whether that produces two Aspect entries for
     * the same pair (a double-count).
     *
     * With the CURRENT AspectType table (angles 0/60/90/120/180 degrees,
     * orbs 4/3/4/4/5 degrees) that separation does not exist: adjacent aspect
     * angles are at least 30 degrees apart, and the tightest gap between two
     * orb bands -- SQUARE's [86, 94] and TRINE's [116, 124] -- is 22 degrees,
     * comfortably wider than their combined 8-degree orb. So today,
     * AspectDetector.detect cannot double-count a pair; this test locks in
     * that zero-aspect result at the midpoint of the tightest gap as the
     * current, verified behavior.
     *
     * It does NOT mean the missing `break` is safe to ignore: nothing in the
     * algorithm itself prevents double-counting, and it would start
     * happening again for any pair of adjacent aspect types whose combined
     * orb grows past the gap between their angles (this stays true even
     * after the Phase 2 orb change in AspectOrbTest's TODO: 8/8/7/7/5 has the
     * same 22/30-degree gaps and a max combined orb of 15, still short of
     * closing any of them). A future fix (a `break`, or "closest aspect
     * wins") should still be made deliberately, not left to depend on the
     * numbers never crossing that line.
     */
    @Test
    fun `no separation currently falls inside two orb bands`() {
        val aspects = AspectDetector.detect(
            mapOf(ClassicalPlanet.SUN to 0.0, ClassicalPlanet.MOON to 105.0)
        )

        assertTrue(
            "Expected no aspect in the square/trine gap, got $aspects",
            aspects.isEmpty()
        )
    }
}
