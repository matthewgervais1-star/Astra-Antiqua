package com.astra.antiqua.domain

import com.astra.antiqua.model.Planet

data class NatalChartData(
    val planets: Map<Planet, AccuratePlanetPosition>,
    val houseCusps: DoubleArray,
    val julianDay: Double,
    val aspects: List<Aspect> = emptyList()
)

data class AccuratePlanetPosition(
    val planet: Planet,
    val longitude: Double,
    val velocity: Double,
    val isRetrograde: Boolean,
    val zodiacSign: ZodiacSign,
    val degreeInSign: Int,
    val minuteInSign: Int,
    val secondInSign: Int,
    val house: Int
) {
    /**
     * "13°22′", the minute rounded as web's formatDegMin rounds it
     * (web/src/components/charts/chartFormat.ts). [minuteInSign] truncates,
     * so a table built from it read a minute short of web's.
     */
    val degMin: String get() = formatDegMin(longitude)
}

/** Web's formatDegMin: minutes rounded half up, held under 30°. */
fun formatDegMin(longitude: Double): String {
    val inSign = ((longitude % 30.0) + 30.0) % 30.0
    val totalMinutes = kotlin.math.floor(inSign * 60.0 + 0.5).toInt()
    val deg = minOf(29, totalMinutes / 60)
    val min = minOf(59, totalMinutes - deg * 60)
    return "%02d°%02d′".format(java.util.Locale.ROOT, deg, min)
}

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
    val p1: Planet,
    val p2: Planet,
    val type: AspectType,
    val exactness: Double // 0.0 (exact) to 1.0 (at orb limit)
)
