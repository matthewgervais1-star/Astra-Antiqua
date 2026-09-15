package com.astra.antiqua.ui.nav

import com.astra.antiqua.model.AncientCulture

/**
 * Every place this app can be, and the one place their names are written.
 *
 * The routes match the web surface's paths, so the two products can be talked
 * about in one vocabulary: the day, the week, the season, the year, the long
 * transits, the voices, the matrix, the placements and the method.
 */
object Route {
    const val DAY = "reading"
    const val WEEK = "week"
    const val SEASON = "season"
    const val YEAR = "year"
    const val TRANSITS = "transits"
    const val TRANSIT_DETAIL = "transits/{id}"
    const val VOICES = "voices"
    const val VOICE = "voices/{culture}"
    const val MATRIX = "matrix"
    const val PLACEMENTS = "placements"
    const val METHOD = "method"

    fun transitDetail(id: String) = "transits/$id"
    fun voice(culture: AncientCulture) = "voices/${culture.name.lowercase()}"
}

/**
 * The four horizons, the D / W / S / Y control the web surface carries in its
 * sub bar. A screen says which one it is and the control marks it.
 */
enum class Horizon(val label: String, val route: String) {
    DAY("D", Route.DAY),
    WEEK("W", Route.WEEK),
    SEASON("S", Route.SEASON),
    YEAR("Y", Route.YEAR),
}

/**
 * The sections the top bar names. A section is listed here only once its
 * destination is in the graph: a tab that navigates to a route NavHost does
 * not know throws, so this enum is the list of places that exist, not the
 * list of places intended.
 */
enum class Section(val label: String, val route: String) {
    TODAY("TODAY", Route.DAY),
    VOICES("VOICES", Route.VOICES),
    MATRIX("MATRIX", Route.MATRIX),
    CHART("CHART", Route.PLACEMENTS),
}
