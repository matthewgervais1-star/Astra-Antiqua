package com.astra.antiqua.ui.nav

import org.junit.Assert.assertEquals
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

    @Test
    fun everySectionLeadsToADifferentRoute() {
        val routes = Section.entries.map { it.route }
        assertEquals(routes.size, routes.toSet().size)
    }
}
