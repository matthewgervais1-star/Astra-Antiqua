package com.astra.antiqua.domain

object ZodiacUtils {
    /**
     * Maps a raw celestial degree (0-360) to one of the 12 Zodiac signs.
     * Each sign occupies exactly 30 degrees of the ecliptic.
     */
    fun getZodiacSign(rawDegree: Double): ZodiacSign {
        // Normalize degree to 0-359.999...
        val normalizedDegree = ((rawDegree % 360.0) + 360.0) % 360.0
        val signIndex = (normalizedDegree / 30.0).toInt() % 12
        return ZodiacSign.values()[signIndex]
    }

    /**
     * Returns the degree of a planet within its current Zodiac sign (0-29).
     */
    fun getDegreeInSign(rawDegree: Double): Int {
        val normalizedDegree = ((rawDegree % 360.0) + 360.0) % 360.0
        return (normalizedDegree % 30.0).toInt()
    }

    /**
     * Returns a formatted placement string (e.g., "15° Aries").
     */
    fun formatPlacement(rawDegree: Double): String {
        val sign = getZodiacSign(rawDegree)
        val degree = getDegreeInSign(rawDegree)
        return "$degree° ${sign.signName}"
    }
}
