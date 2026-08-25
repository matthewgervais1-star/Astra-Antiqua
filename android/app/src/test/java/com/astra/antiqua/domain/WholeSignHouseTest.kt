package com.astra.antiqua.domain

import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Exercises [WholeSignHouses] (formerly private to
 * `CalculateNatalChartUseCase`) directly, including the case where the
 * Ascendant's own sign is the last of the zodiac (Pisces) and a body's whole
 * sign (Aries) comes numerically "before" it -- houses must still wrap
 * forward around the 360/0 degree boundary rather than backward.
 */
class WholeSignHouseTest {

    @Test
    fun `ascendant in Leo assigns whole-sign houses in zodiacal order`() {
        // 5 degrees Leo (sign index 4, 120-150 degree range).
        val cusps = WholeSignHouses.cusps(125.0)

        assertEquals(120.0, cusps[1], 0.0) // Leo
        assertEquals(150.0, cusps[2], 0.0) // Virgo
        assertEquals(90.0, cusps[12], 0.0) // Cancer, the sign just before the Ascendant

        assertEquals(1, WholeSignHouses.houseOf(140.0, cusps))  // Leo body -> 1st house
        assertEquals(2, WholeSignHouses.houseOf(160.0, cusps))  // Virgo body -> 2nd house
        assertEquals(12, WholeSignHouses.houseOf(100.0, cusps)) // Cancer body -> 12th house
    }

    @Test
    fun `ascendant in Pisces wraps a body in Aries to the 2nd house`() {
        // 10 degrees Pisces (sign index 11, the last sign): the 1st house's
        // own cusp pair straddles the 360/0 discontinuity.
        val cusps = WholeSignHouses.cusps(340.0)

        assertEquals(330.0, cusps[1], 0.0) // Pisces
        assertEquals(0.0, cusps[2], 0.0)   // Aries

        // A body still within the Ascendant's own sign exercises the
        // wraparound comparison directly (its cusp pair is 330 -> 0).
        assertEquals(1, WholeSignHouses.houseOf(350.0, cusps))

        // Aries is numerically "before" Pisces (15 < 330), but as the whole
        // sign right after the Ascendant's, a body there must land in the
        // 2nd house, not the 1st or 12th.
        assertEquals(2, WholeSignHouses.houseOf(15.0, cusps))
    }
}
