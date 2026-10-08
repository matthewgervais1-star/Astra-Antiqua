package com.astra.antiqua.domain

import java.time.Instant
import java.util.Date
import java.util.Locale
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * The short-window timeline labels its ticks with ASCII digits whatever the
 * device locale, as web does. A Persian locale formats `%02d` with
 * Extended Arabic-Indic digits unless the format names [Locale.ROOT].
 */
class RecurrenceTimelineTest {
    private val saved = Locale.getDefault()

    @After
    fun restore() = Locale.setDefault(saved)

    @Test
    fun `a short window labels its hours in ASCII digits under a Persian locale`() {
        Locale.setDefault(Locale.forLanguageTag("fa-IR"))
        val start = Date.from(Instant.parse("2026-03-01T06:00:00Z"))
        val end = Date.from(Instant.parse("2026-03-02T12:00:00Z"))

        val timeline = Recurrence.timeline(OrbWindow(start, end), start, start)

        assertEquals(listOf("06:00", "16:00", "02:00", "12:00"), timeline.ticks.map { it.sub })
    }
}
