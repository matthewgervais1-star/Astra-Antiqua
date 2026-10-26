package com.astra.antiqua.ui.nav

import com.astra.antiqua.domain.FigureReadingComposer
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet

/**
 * Every place this app can be, and the one place their names are written.
 *
 * The routes match the web surface's paths, so the two products can be talked
 * about in one vocabulary: the day, the week, the season, the year, the long
 * transits, the voices, the matrix, the placements and the method.
 */
object Route {
    const val DAY = "reading"
    /** The day for one date, web's /?date=YYYY-MM-DD: date is YYYY-MM-DD (UTC), read at 00:00 UTC. [DAY] is the live day. */
    const val DATED_DAY = "day/{date}"
    const val WEEK = "week"
    const val SEASON = "season"
    const val YEAR = "year"
    const val TRANSITS = "transits"
    const val TRANSIT_DETAIL = "transits/{id}"
    /** One day's figure, web's /day/[date]/figure/[id]: date is YYYY-MM-DD (UTC). */
    const val FIGURE = "day/{date}/figure/{id}"
    const val VOICES = "voices"
    const val VOICE = "voices/{culture}"
    const val MATRIX = "matrix"
    const val PLACEMENTS = "placements"
    const val PLACEMENT = "placements/{body}"
    /**
     * Casting a chart again, the counterpart of web's birth form. Its route
     * must differ from [DAY]'s: when it shared "reading", the NavHost kept
     * the form under both names and TODAY opened the birth form.
     */
    const val READING = "cast"
    const val FORECAST = "forecast"
    const val SYNASTRY = "synastry"
    const val METHOD = "method"

    /** The open-source licences the app carries, reached from the account and the method page. */
    const val LICENCES = "licences"

    /** The account, web's /account. Signed out, it sends the reader to [SIGN_IN]. */
    const val ACCOUNT = "account"

    /** THE RECORD, web's /signin: sign in or a first entry. */
    const val SIGN_IN = "signin"

    /** THE ROLL, web's /waitlist. */
    const val WAIT_LIST = "waitlist"

    /**
     * The Learn sections. Their web hrefs are "/learn" and "/learn/<slug>";
     * a Compose route cannot hold a slash in an argument, so the slug travels
     * on its own and the hub takes the reserved word "index".
     */
    const val LEARN = "learn/{slug}"

    fun transitDetail(id: String) = "transits/$id"
    fun day(date: String) = "day/$date"

    /**
     * Where "← The day" goes from a figure of [date], as web's FigureDetail
     * does: the dated day, or the live day when [date] is [today] or is no day.
     * Both are UTC dates, YYYY-MM-DD.
     */
    fun dayOfFigure(date: String, today: String): String =
        if (date == today || FigureReadingComposer.parseIsoDate(date) == null) DAY else day(date)
    fun figure(date: String, id: String) = "day/$date/figure/$id"
    fun voice(culture: AncientCulture) = "voices/${culture.name.lowercase()}"

    fun placement(body: Planet) = "placements/${body.name.lowercase()}"

    fun learn(href: String): String {
        val slug = href.removePrefix("/learn").removePrefix("/")
        return "learn/${slug.ifEmpty { LEARN_INDEX }}"
    }

    fun learnHref(slug: String): String =
        if (slug == LEARN_INDEX) "/learn" else "/learn/$slug"

    const val LEARN_INDEX = "index"
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
    TRANSITS("TRANSITS", Route.TRANSITS),
    LEARN("LEARN", "learn/${Route.LEARN_INDEX}"),
    MATRIX("MATRIX", Route.MATRIX),
    CHART("CHART", Route.PLACEMENTS),

    /**
     * Web's lintel sets ACCOUNT apart, at the right end. The lintel here
     * does the same: it sits beside the wordmark, not in the row of sections.
     */
    ACCOUNT("ACCOUNT", Route.ACCOUNT),
}
