package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import kotlin.math.abs

/** The day's Do and Don't lists, in the culture's own pair (PermissionPairs). */
data class DayPermissions(val proceed: List<String>, val refrain: List<String>)

/**
 * The day's permissions, ported from web/src/lib/permissions.ts: four items a
 * column, drawn from the bodies of the day's figures (PermissionsRegister).
 * A reader with a chart gets the day's transits to it; a reader without one
 * gets the sky figures the decree reads. DayDecreeParityTest pins both to web.
 */
object DayPermissionsComposer {
    private const val PER_COLUMN = 4

    /** A quiet sky names no bodies; the Sun and Moon give and Saturn and Mars withhold. */
    private val QUIET_PROCEED = listOf(Planet.SUN, Planet.MOON)
    private val QUIET_REFRAIN = listOf(Planet.SATURN, Planet.MARS)

    /**
     * Fill one column from groups of bodies, a figure's two bodies to a group:
     * the first item of each body in the group, then the second, then the
     * third, moving to the next group only when the column still has room. A
     * body already used in the column is skipped. The day turns which of a
     * body's three items comes first.
     */
    private fun column(culture: AncientCulture, groups: List<List<Planet>>, proceed: Boolean, day: Long): List<String> {
        val out = mutableListOf<String>()
        val used = mutableSetOf<Planet>()
        val offset = Math.floorMod(day, 3L).toInt()
        for (group in groups) {
            val bodies = group.filter { it !in used }
            used += bodies
            for (rank in 0 until 3) {
                for (body in bodies) {
                    val items = if (proceed) PermissionsRegister.proceed(culture, body) else PermissionsRegister.refrain(culture, body)
                    val item = items.getOrNull((rank + offset) % 3)
                    if (item != null && out.size < PER_COLUMN && item !in out) out += item
                }
            }
            if (out.size >= PER_COLUMN) break
        }
        return out
    }

    /**
     * The lists from figures in the decree's order: the headline figure, the
     * second figure, then the rest. On a day of favor or union the headline
     * figure's bodies fill the proceed column and the second figure's the
     * refrain column; on a day of trial the two swap.
     */
    fun forFigures(culture: AncientCulture, figures: List<SkyFigure>, day: Long): DayPermissions {
        val top = figures.firstOrNull()
            ?: return DayPermissions(column(culture, listOf(QUIET_PROCEED), true, day), column(culture, listOf(QUIET_REFRAIN), false, day))
        val second = figures.getOrNull(1)
        val tail = figures.drop(2).map { listOf(it.a, it.b) }
        val lead = listOf(listOf(top.a, top.b)) + tail
        val follow = listOfNotNull(second?.let { listOf(it.a, it.b) }) + tail
        val trial = DayDecreeComposer.toneFor(top.aspect) == DayTone.TENSION
        return DayPermissions(
            proceed = column(culture, if (trial) follow else lead, true, day),
            refrain = column(culture, if (trial) lead else follow, false, day),
        )
    }

    /**
     * Every transit to a natal planet, the transiting body first, in web's
     * computeTransits order: transiting body by body, natal point by point,
     * the first kind in orb.
     */
    fun transits(sky: Map<Planet, Double>, natal: Map<Planet, Double>): List<SkyFigure> {
        val out = mutableListOf<SkyFigure>()
        for (transit in Planet.entries) {
            for (point in Planet.entries) {
                val raw = abs(sky.getValue(transit) - natal.getValue(point)) % 360.0
                val angle = if (raw > 180.0) 360.0 - raw else raw
                AspectType.entries.firstOrNull { abs(angle - it.degree) <= it.orb }
                    ?.let { out += SkyFigure(transit, point, it, abs(angle - it.degree)) }
            }
        }
        return out
    }

    /**
     * The day's transits to a chart in the decree's order: the tightest
     * contact, the tightest of another kind, then the rest by orb. Only the
     * bodies that move daily are read while one of them touches the chart: a
     * slow body's contact holds for months and belongs to the long transits.
     * A body against its own natal place is left out.
     */
    fun natalFigures(sky: Map<Planet, Double>, natal: Map<Planet, Double>): List<SkyFigure> {
        val all = transits(sky, natal).filter { it.a != it.b }.sortedBy { it.orb }
        val fast = all.filter { it.a in DayDecreeComposer.FAST_ORDER }
        val contacts = fast.ifEmpty { all }
        val top = contacts.firstOrNull() ?: return emptyList()
        val second = contacts.firstOrNull { it.aspect != top.aspect }
        return listOf(top) + listOfNotNull(second) + contacts.filter { it !== top && it !== second }
    }

    /** The lists for a reader with a chart, or null when nothing touches it. */
    fun forNatal(culture: AncientCulture, sky: Map<Planet, Double>, natal: Map<Planet, Double>, day: Long): DayPermissions? {
        val figures = natalFigures(sky, natal)
        return if (figures.isEmpty()) null else forFigures(culture, figures, day)
    }
}
