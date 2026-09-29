package com.astra.antiqua.domain

import com.astra.antiqua.model.Planet

/**
 * Aspect detection over raw ecliptic longitudes, split out of
 * [CalculateNatalChartUseCase] so a JVM test can exercise it directly with a
 * synthetic set of bodies instead of a full ephemeris-backed chart. Behavior
 * is unchanged from the original private methods on the use case, except
 * that (Phase 2) it now stops at the first matching [AspectType] per pair,
 * matching web's `computeAspects` (`web/src/data/sampleChart.ts`) exactly.
 * See AspectDetectionTest: under the current, wider orb table this `break`
 * cannot actually change any result (no two orb bands overlap for any
 * separation in [0, 180]), but it removes the latent double-counting risk
 * the missing `break` used to carry.
 */
object AspectDetector {
    fun detect(longitudes: Map<Planet, Double>): List<Aspect> {
        val aspects = mutableListOf<Aspect>()
        val planetList = longitudes.keys.toList()

        for (i in planetList.indices) {
            for (j in i + 1 until planetList.size) {
                val p1 = planetList[i]
                val p2 = planetList[j]
                val pos1 = longitudes.getValue(p1)
                val pos2 = longitudes.getValue(p2)

                val diff = angularSeparation(pos1, pos2)

                for (type in AspectType.values()) {
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
                        break
                    }
                }
            }
        }
        return aspects
    }

    /**
     * Minimal angular separation between two ecliptic longitudes, in [0, 180].
     * The `% 360` matches web's fold (sampleChart.ts computeAspects), so the
     * function stays correct even for callers that pass unnormalized
     * longitudes (future synastry/transit deltas), not just the [0, 360)
     * values the natal path feeds it today.
     */
    fun angularSeparation(d1: Double, d2: Double): Double {
        val diff = Math.abs(d1 - d2) % 360
        return if (diff > 180) 360 - diff else diff
    }
}
