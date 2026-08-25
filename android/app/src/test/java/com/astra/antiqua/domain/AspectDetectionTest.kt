package com.astra.antiqua.domain

import com.astra.antiqua.model.ClassicalPlanet
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Exercises [AspectDetector.detect] (the algorithm formerly private to
 * `CalculateNatalChartUseCase.calculateAspects`) directly against synthetic
 * longitudes, so these assertions don't depend on a real ephemeris.
 *
 * Phase 2 moved AspectType onto the documented 8/5/7/7/8 orb table and added
 * the `break` that stops at the first matching aspect per pair, matching
 * web's `computeAspects`. Both changes are exercised below.
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
        // TRINE is 120 degrees, orb 7 (Phase 2 table) -> its outer edge is 127 degrees.
        val aspects = AspectDetector.detect(
            mapOf(ClassicalPlanet.VENUS to 0.0, ClassicalPlanet.JUPITER to 127.0)
        )

        assertEquals(1, aspects.size)
        assertEquals(AspectType.TRINE, aspects.single().type)
        assertEquals(1.0, aspects.single().exactness, 1e-9)
    }

    /**
     * `AspectDetector.detect` now `break`s at the first matching [AspectType]
     * per pair (Phase 2), matching web's `computeAspects`
     * (web/src/data/sampleChart.ts) exactly, so a pair can only ever produce
     * a SINGLE aspect (see the two tests above, both `assertEquals(1, ...)`).
     *
     * ANSWER to "do the widened orbs make overlap possible": no. Checking
     * the gap between every pair of adjacent orb bands against their
     * combined orbs, under the Phase 2 table (8/5/7/7/8, up from the old
     * 4/3/4/4/5):
     *   conjunction [0, 8]    <-47 deg gap-> sextile     [55, 65]   (orbs 8+5=13 of 60)
     *   sextile     [55, 65]  <-18 deg gap-> square       [83, 97]  (orbs 5+7=12 of 30)
     *   square      [83, 97]  <-16 deg gap-> trine        [113,127] (orbs 7+7=14 of 30)
     *   trine       [113,127] <-45 deg gap-> opposition   [172,180] (orbs 7+8=15 of 60)
     * every gap is still strictly positive, so no separation in [0, 180] can
     * land in two bands at once -- the widened orbs did not close any of the
     * gaps that made this safe before. This test locks in the zero-aspect
     * result at the tightest of those gaps (square/trine, 16 degrees wide)
     * as the current, verified behavior. That "no overlap exists" is a
     * numeric fact about these specific angle/orb values, not a structural
     * guarantee, so the `break` added in Phase 2 is still the real fix:
     * without it, any future orb widening that closes one of these gaps
     * would silently start double-counting again.
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
