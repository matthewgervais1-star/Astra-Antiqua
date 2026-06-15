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

enum class AspectType(val degree: Double, val orb: Double) {
    CONJUNCTION(0.0, 8.0),
    SEXTILE(60.0, 6.0),
    SQUARE(90.0, 7.0),
    TRINE(120.0, 8.0),
    OPPOSITION(180.0, 8.0)
}

data class Aspect(
    val p1: ClassicalPlanet,
    val p2: ClassicalPlanet,
    val type: AspectType,
    val exactness: Double // 0.0 (exact) to 1.0 (at orb limit)
)
