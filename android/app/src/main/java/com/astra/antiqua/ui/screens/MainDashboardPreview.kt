package com.astra.antiqua.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.astra.antiqua.domain.AccuratePlanetPosition
import com.astra.antiqua.domain.NatalChartData
import com.astra.antiqua.domain.OracleContent
import com.astra.antiqua.domain.ZodiacSign
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.ClassicalPlanet
import com.astra.antiqua.ui.theme.AstraAntiquaTheme

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
                    )
                ),
                houseCusps = DoubleArray(13) { it * 30.0 },
                julianDay = 2451545.0
            )
            
            Column {
                NatalWheel(chartData = sampleChart)
                OracleDecreeCard(
                    content = OracleContent(
                        deity_name = "Sebegu",
                        epitheton = "The Erratic Set-God",
                        decree = "The scribe's ink runs thin as the storm approaches.",
                        planetPosition = sampleChart.planets[ClassicalPlanet.MERCURY]
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
                    )
                ),
                houseCusps = DoubleArray(13) { it * 30.0 },
                julianDay = 2451545.0
            )
            
            Column {
                NatalWheel(chartData = sampleChart)
                OracleDecreeCard(
                    content = OracleContent(
                        deity_name = "Tanit",
                        epitheton = "The Face of Baal",
                        decree = "A sacrifice of spirit is demanded to secure the city's gates.",
                        planetPosition = sampleChart.planets[ClassicalPlanet.MOON]
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
                    )
                ),
                houseCusps = DoubleArray(13) { it * 30.0 },
                julianDay = 2451545.0
            )
            
            Column {
                NatalWheel(chartData = sampleChart)
                OracleDecreeCard(
                    content = OracleContent(
                        deity_name = "Apollo",
                        epitheton = "The Radiant King",
                        decree = "Know thyself, for the golden chariot rises to illuminate the hidden path.",
                        planetPosition = sampleChart.planets[ClassicalPlanet.SUN]
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
                    )
                ),
                houseCusps = DoubleArray(13) { it * 30.0 },
                julianDay = 2451545.0
            )
            
            Column {
                NatalWheel(chartData = sampleChart)
                OracleDecreeCard(
                    content = OracleContent(
                        deity_name = "Resheph",
                        epitheton = "Lord of the Arrow",
                        decree = "The fortress is strong, but the pestilence of doubt creeps through the stones.",
                        planetPosition = sampleChart.planets[ClassicalPlanet.MARS]
                    )
                )
            }
        }
    }
}
