package com.astra.antiqua.domain

import com.astra.antiqua.model.ClassicalPlanet

/**
 * Aspect detection over raw ecliptic longitudes, split out of
 * [CalculateNatalChartUseCase] so a JVM test can exercise it directly with a
 * synthetic set of bodies instead of a full ephemeris-backed chart. Behavior
 * is unchanged from the original private methods on the use case.
 *
 * NOTE: for each pair, [AspectType.values] is checked in full with no early
 * exit ("break") once a match is found — unlike web's `computeAspects`
 * (`web/src/lib/transits.ts`), which stops at the first match. See
 * AspectDetectionTest for whether this can double-count a pair under the
 * current orb table.
 */
object AspectDetector {
    fun detect(longitudes: Map<ClassicalPlanet, Double>): List<Aspect> {
        val aspects = mutableListOf<Aspect>()
        val planetList = longitudes.keys.toList()

        for (i in planetList.indices) {
            for (j in i + 1 until planetList.size) {
                val p1 = planetList[i]
                val p2 = planetList[j]
                val pos1 = longitudes.getValue(p1)
                val pos2 = longitudes.getValue(p2)

                val diff = angularSeparation(pos1, pos2)

                AspectType.values().forEach { type ->
                    val orbDiff = Math.abs(diff - type.degree)
                    if (orbDiff <= type.orb) {
                        aspects.add(
                            Aspect(
                                p1 = p1,
                                p2 = p2,
                                type = type,
                                exactness = orbDiff / type.orb
                            )
                        )
                    }
                }
            }
        }
        return aspects
    }

    /** Minimal angular separation between two ecliptic longitudes, in [0, 180]. */
    fun angularSeparation(d1: Double, d2: Double): Double {
        val diff = Math.abs(d1 - d2)
        return if (diff > 180) 360 - diff else diff
    }
}
