package com.astra.antiqua.ui.nav

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test
import java.lang.reflect.Modifier

class RouteTest {

    /**
     * Two routes with one name collapse into one destination in the NavHost,
     * and the one registered last wins. TODAY and the birth form shared
     * "reading" this way, so TODAY opened the form.
     */
    @Test
    fun everyRouteHasItsOwnName() {
        val routes = Route::class.java.declaredFields
            .filter { Modifier.isStatic(it.modifiers) && it.type == String::class.java }
            .associate { it.name to it.get(null) as String }
        val shared = routes.entries.groupBy({ it.value }, { it.key }).filterValues { it.size > 1 }
        assertEquals(emptyMap<String, List<String>>(), shared)
    }

    /**
     * A dated day is web's /?date=YYYY-MM-DD, the day the figure page read. It
     * shares no name with the live day, and a figure's own route, which starts
     * the same way, is longer, so neither shadows the other.
     */
    @Test
    fun aDatedDayHasItsOwnRoute() {
        assertEquals("day/2026-09-29", Route.day("2026-09-29"))
        assertEquals("day/{date}", Route.DATED_DAY)
        assertEquals("day/2026-09-29/figure/sun-trine-saturn", Route.figure("2026-09-29", "sun-trine-saturn"))
        assertNotEquals(Route.DAY, Route.DATED_DAY)
    }

    /** web's FigureDetail Links: today and anything that is no day go to the live day. */
    @Test
    fun aFigureOfTodayOrOfNoDayLeadsToTheLiveDay() {
        assertEquals(Route.DAY, Route.dayOfFigure("2026-10-26", today = "2026-10-26"))
        assertEquals(Route.DAY, Route.dayOfFigure("garbage", today = "2026-10-26"))
        assertEquals(Route.DAY, Route.dayOfFigure("2026-02-30", today = "2026-10-26"))
        assertEquals(Route.DAY, Route.dayOfFigure("1850-01-01", today = "2026-10-26"))
    }

    @Test
    fun aFigureOfAnotherDayLeadsToThatDay() {
        assertEquals("day/2026-10-27", Route.dayOfFigure("2026-10-27", today = "2026-10-26"))
        assertEquals("day/2026-09-29", Route.dayOfFigure("2026-09-29", today = "2026-10-26"))
    }

    @Test
    fun everySectionLeadsToADifferentRoute() {
        val routes = Section.entries.map { it.route }
        assertEquals(routes.size, routes.toSet().size)
    }
}
