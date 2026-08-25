package com.astra.antiqua.domain

import com.astra.antiqua.model.ClassicalPlanet

data class NatalChartData(
    val planets: Map<ClassicalPlanet, AccuratePlanetPosition>,
    val houseCusps: DoubleArray,
    val julianDay: Double,
    val aspects: List<Aspect> = emptyList()
)

data class AccuratePlanetPosition(
    val planet: ClassicalPlanet,
    val longitude: Double,
    val velocity: Double,
    val isRetrograde: Boolean,
    val zodiacSign: ZodiacSign,
    val degreeInSign: Int,
    val minuteInSign: Int,
    val secondInSign: Int,
    val house: Int
)

// The one documented orb table (docs/shared-content-model.md, the web
// /method page), mirrored from ASPECT_RULES in web/src/data/sampleChart.ts:
// conjunction 8, sextile 5, square 7, trine 7, opposition 8. Every aspect
// detector on this surface should read THESE values so the numbers the
// method page publishes are the numbers the app runs.
enum class AspectType(val degree: Double, val orb: Double) {
    CONJUNCTION(0.0, 8.0),
    SEXTILE(60.0, 5.0),
    SQUARE(90.0, 7.0),
    TRINE(120.0, 7.0),
    OPPOSITION(180.0, 8.0)
}

data class Aspect(
    val p1: ClassicalPlanet,
    val p2: ClassicalPlanet,
    val type: AspectType,
    val exactness: Double // 0.0 (exact) to 1.0 (at orb limit)
)
