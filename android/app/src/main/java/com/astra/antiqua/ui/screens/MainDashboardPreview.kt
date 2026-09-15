package com.astra.antiqua.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.astra.antiqua.domain.AccuratePlanetPosition
import com.astra.antiqua.domain.HouseMeanings
import com.astra.antiqua.domain.NatalChartData
import com.astra.antiqua.domain.NatalPlacementReading
import com.astra.antiqua.domain.ZodiacSign
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.ClassicalPlanet
import com.astra.antiqua.ui.theme.AstraAntiquaTheme

/** Preview-only helper: builds the composed reading the same way
 *  NatalReadingComposer would, without needing a Context to load
 *  planet-in-sign.json. */
private fun previewReading(
    position: AccuratePlanetPosition,
    deityName: String,
    deityEpithet: String,
    decreeLine: String,
    placementText: String,
): NatalPlacementReading = NatalPlacementReading(
    deityName = deityName,
    deityEpithet = deityEpithet,
    decreeLine = decreeLine,
    placementText = placementText,
    houseMeaning = HouseMeanings.get(position.house),
    planetPosition = position,
)

@Preview(showBackground = true, backgroundColor = 0xFF000000, name = "Egypt - Hall of Ma'at")
@Composable
fun EgyptDashboardPreview() {
    AstraAntiquaTheme(selectedCulture = AncientCulture.EGYPT) {
        Box(modifier = Modifier.fillMaxSize()) {
            val sampleChart = NatalChartData(
                planets = mapOf(
                    ClassicalPlanet.SUN to AccuratePlanetPosition(
                        planet = ClassicalPlanet.SUN,
                        longitude = 125.0,
                        velocity = 1.0,
                        isRetrograde = false,
                        zodiacSign = ZodiacSign.LEO,
                        degreeInSign = 5,
                        minuteInSign = 0,
                        secondInSign = 0,
                        house = 10
                    ),
                    ClassicalPlanet.MERCURY to AccuratePlanetPosition(
                        planet = ClassicalPlanet.MERCURY,
                        longitude = 135.0,
                        velocity = -0.5,
                        isRetrograde = true,
                        zodiacSign = ZodiacSign.LEO,
                        degreeInSign = 15,
                        minuteInSign = 30,
                        secondInSign = 45,
                        house = 10
                    ),
                    // A received body in the sample so this preview also
                    // exercises the wheel's reception ring and the shared
                    // accent, and its glyph.
                    ClassicalPlanet.URANUS to AccuratePlanetPosition(
                        planet = ClassicalPlanet.URANUS,
                        longitude = 220.0,
                        velocity = 0.05,
                        isRetrograde = false,
                        zodiacSign = ZodiacSign.SCORPIO,
                        degreeInSign = 10,
                        minuteInSign = 0,
                        secondInSign = 0,
                        house = 3
                    )
                ),
                houseCusps = DoubleArray(13) { it * 30.0 },
                julianDay = 2451545.0
            )

            Column {
                NatalWheel(chartData = sampleChart, culture = AncientCulture.EGYPT)
                OracleDecreeCard(
                    culture = AncientCulture.EGYPT,
                    reading = previewReading(
                        position = sampleChart.planets.getValue(ClassicalPlanet.MERCURY),
                        deityName = "Sebegu",
                        deityEpithet = "Aspect of Set",
                        decreeLine = "The scribe's ink runs thin as the storm approaches.",
                        placementText = "Speech is performance. You think toward the room, and the room's face edits the sentence. The cost is winning the delivery and losing the argument."
                    )
                )
            }
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF000000, name = "Carthage - Decree of the Tophet")
@Composable
fun CarthageDashboardPreview() {
    AstraAntiquaTheme(selectedCulture = AncientCulture.CARTHAGE) {
        Box(modifier = Modifier.fillMaxSize()) {
            val sampleChart = NatalChartData(
                planets = mapOf(
                    ClassicalPlanet.MOON to AccuratePlanetPosition(
                        planet = ClassicalPlanet.MOON,
                        longitude = 45.0,
                        velocity = 13.0,
                        isRetrograde = false,
                        zodiacSign = ZodiacSign.TAURUS,
                        degreeInSign = 15,
                        minuteInSign = 10,
                        secondInSign = 22,
                        house = 2
                    ),
                    ClassicalPlanet.NEPTUNE to AccuratePlanetPosition(
                        planet = ClassicalPlanet.NEPTUNE,
                        longitude = 300.0,
                        velocity = 0.02,
                        isRetrograde = true,
                        zodiacSign = ZodiacSign.AQUARIUS,
                        degreeInSign = 0,
                        minuteInSign = 0,
                        secondInSign = 0,
                        house = 11
                    )
                ),
                houseCusps = DoubleArray(13) { it * 30.0 },
                julianDay = 2451545.0
            )
            
            Column {
                NatalWheel(chartData = sampleChart, culture = AncientCulture.CARTHAGE)
                OracleDecreeCard(
                    culture = AncientCulture.CARTHAGE,
                    reading = previewReading(
                        position = sampleChart.planets.getValue(ClassicalPlanet.MOON),
                        deityName = "Tanit",
                        deityEpithet = "Dea Caelestis",
                        decreeLine = "A sacrifice of spirit is demanded to secure the city's gates.",
                        placementText = "The body holds its mood. You change slowly and root deep; the cost is staying past when staying served."
                    )
                )
            }
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF000000, name = "Greece - Oracle of Delphi")
@Composable
fun GreeceDashboardPreview() {
    AstraAntiquaTheme(selectedCulture = AncientCulture.GREECE) {
        Box(modifier = Modifier.fillMaxSize()) {
            val sampleChart = NatalChartData(
                planets = mapOf(
                    ClassicalPlanet.SUN to AccuratePlanetPosition(
                        planet = ClassicalPlanet.SUN,
                        longitude = 10.0,
                        velocity = 1.0,
                        isRetrograde = false,
                        zodiacSign = ZodiacSign.ARIES,
                        degreeInSign = 10,
                        minuteInSign = 0,
                        secondInSign = 0,
                        house = 1
                    ),
                    ClassicalPlanet.PLUTO to AccuratePlanetPosition(
                        planet = ClassicalPlanet.PLUTO,
                        longitude = 190.0,
                        velocity = 0.01,
                        isRetrograde = false,
                        zodiacSign = ZodiacSign.LIBRA,
                        degreeInSign = 10,
                        minuteInSign = 0,
                        secondInSign = 0,
                        house = 7
                    )
                ),
                houseCusps = DoubleArray(13) { it * 30.0 },
                julianDay = 2451545.0
            )
            
            Column {
                NatalWheel(chartData = sampleChart, culture = AncientCulture.GREECE)
                OracleDecreeCard(
                    culture = AncientCulture.GREECE,
                    reading = previewReading(
                        position = sampleChart.planets.getValue(ClassicalPlanet.SUN),
                        deityName = "Helios",
                        deityEpithet = "Who Sees All Things",
                        decreeLine = "I see all things from my height, and the golden chariot rises to illuminate the hidden path.",
                        placementText = "Identity built for first moves. You reach for what you want before deliberation; the cost is starting things that should have been considered, the gift is acting when others freeze."
                    )
                )
            }
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF000000, name = "Canaan - Divine Council")
@Composable
fun CanaanDashboardPreview() {
    AstraAntiquaTheme(selectedCulture = AncientCulture.CANAAN) {
        Box(modifier = Modifier.fillMaxSize()) {
            val sampleChart = NatalChartData(
                planets = mapOf(
                    ClassicalPlanet.MARS to AccuratePlanetPosition(
                        planet = ClassicalPlanet.MARS,
                        longitude = 285.0,
                        velocity = 0.6,
                        isRetrograde = false,
                        zodiacSign = ZodiacSign.CAPRICORN,
                        degreeInSign = 15,
                        minuteInSign = 0,
                        secondInSign = 0,
                        house = 10
                    ),
                    ClassicalPlanet.URANUS to AccuratePlanetPosition(
                        planet = ClassicalPlanet.URANUS,
                        longitude = 60.0,
                        velocity = 0.05,
                        isRetrograde = false,
                        zodiacSign = ZodiacSign.GEMINI,
                        degreeInSign = 0,
                        minuteInSign = 0,
                        secondInSign = 0,
                        house = 3
                    )
                ),
                houseCusps = DoubleArray(13) { it * 30.0 },
                julianDay = 2451545.0
            )

            Column {
                NatalWheel(chartData = sampleChart, culture = AncientCulture.CANAAN)
                OracleDecreeCard(
                    culture = AncientCulture.CANAAN,
                    reading = previewReading(
                        position = sampleChart.planets.getValue(ClassicalPlanet.MARS),
                        deityName = "Resheph",
                        deityEpithet = "Lord of the Arrow",
                        decreeLine = "The fortress is strong, but the pestilence of doubt creeps through the stones.",
                        placementText = "Effort is sustained. You push by enduring; the cost is the body that ran out before the project did."
                    )
                )
            }
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF000000, name = "Rome - Auspices of the Capitoline")
@Composable
fun RomeDashboardPreview() {
    AstraAntiquaTheme(selectedCulture = AncientCulture.ROME) {
        Box(modifier = Modifier.fillMaxSize()) {
            val sampleChart = NatalChartData(
                planets = mapOf(
                    ClassicalPlanet.JUPITER to AccuratePlanetPosition(
                        planet = ClassicalPlanet.JUPITER,
                        longitude = 95.0,
                        velocity = 0.2,
                        isRetrograde = false,
                        zodiacSign = ZodiacSign.CANCER,
                        degreeInSign = 5,
                        minuteInSign = 0,
                        secondInSign = 0,
                        house = 4
                    ),
                    ClassicalPlanet.NEPTUNE to AccuratePlanetPosition(
                        planet = ClassicalPlanet.NEPTUNE,
                        longitude = 340.0,
                        velocity = 0.02,
                        isRetrograde = false,
                        zodiacSign = ZodiacSign.PISCES,
                        degreeInSign = 10,
                        minuteInSign = 0,
                        secondInSign = 0,
                        house = 12
                    )
                ),
                houseCusps = DoubleArray(13) { it * 30.0 },
                julianDay = 2451545.0
            )

            Column {
                NatalWheel(chartData = sampleChart, culture = AncientCulture.ROME)
                OracleDecreeCard(
                    culture = AncientCulture.ROME,
                    reading = previewReading(
                        position = sampleChart.planets.getValue(ClassicalPlanet.JUPITER),
                        deityName = "Iuppiter",
                        deityEpithet = "Optimus Maximus, Best and Greatest",
                        decreeLine = "The Capitoline stands firm; the augur reads favor in the flight of the eagle.",
                        placementText = "Increase comes through care. You take people in and the household widens. The cost is the family you outgrew and kept anyway."
                    )
                )
            }
        }
    }
}
