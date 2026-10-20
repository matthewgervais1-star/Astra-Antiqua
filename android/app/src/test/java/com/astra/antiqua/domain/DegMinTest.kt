package com.astra.antiqua.domain

import org.junit.Assert.assertEquals
import org.junit.Test

/** The placements table reads as web's formatDegMin reads. */
class DegMinTest {

    @Test
    fun roundsTheMinuteAsWebDoes() {
        // Athens 1982-08-14 06:10: web prints the Sun at 21°01′ LEO.
        assertEquals("21°01′", formatDegMin(120.0 + 21.0 + 0.6 / 60.0))
        assertEquals("21°00′", formatDegMin(120.0 + 21.0 + 0.4 / 60.0))
    }

    @Test
    fun carriesSixtyMinutesIntoTheDegree() {
        assertEquals("14°00′", formatDegMin(30.0 + 13.0 + 59.7 / 60.0))
    }

    @Test
    fun staysUnderThirtyAtTheEndOfASign() {
        assertEquals("29°59′", formatDegMin(59.9999))
    }

    @Test
    fun readsTheDegreeWithinTheSign() {
        assertEquals("00°57′", formatDegMin(0.95))
        assertEquals("16°05′", formatDegMin(60.0 + 16.0 + 5.0 / 60.0))
    }
}
