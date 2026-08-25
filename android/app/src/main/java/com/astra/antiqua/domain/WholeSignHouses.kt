package com.astra.antiqua.domain

/**
 * Whole-sign house math, split out of [CalculateNatalChartUseCase] so a JVM
 * test can assert house assignment (including the sign-wraparound case, e.g.
 * Ascendant in Pisces with a body in Aries) without a full ephemeris-backed
 * chart. Behavior is unchanged from the original private methods on the use
 * case.
 */
object WholeSignHouses {
    /**
     * Builds whole-sign house cusps (index 0 unused, 1..12 hold each house's cusp
     * degree) from the Ascendant longitude: the Ascendant's whole sign is the 1st
     * house, and each following sign is the next house in zodiacal order. Cusp i
     * sits at ((ascendantSignIndex + i - 1) % 12) * 30 degrees, so a planet's house
     * depends only on its sign relative to the Ascendant's sign.
     */
    fun cusps(ascendantLongitude: Double): DoubleArray {
        val ascendantSignIndex = ZodiacUtils.getZodiacSign(ascendantLongitude).ordinal
        val cusps = DoubleArray(13)
        for (house in 1..12) {
            val signIndex = (ascendantSignIndex + house - 1) % 12
            cusps[house] = signIndex * 30.0
        }
        return cusps
    }

    fun houseOf(longitude: Double, cusps: DoubleArray): Int {
        for (i in 1..11) {
            val start = cusps[i]
            val end = cusps[i + 1]
            if (isBetween(longitude, start, end)) return i
        }
        return 12
    }

    private fun isBetween(deg: Double, start: Double, end: Double): Boolean {
        return if (start < end) {
            deg >= start && deg < end
        } else {
            deg >= start || deg < end
        }
    }
}
