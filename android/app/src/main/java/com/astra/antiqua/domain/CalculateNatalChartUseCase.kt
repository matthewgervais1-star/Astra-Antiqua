package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.model.Planet
import io.github.cosinekitty.astronomy.Body
import java.util.Calendar
import java.util.Date
import java.util.TimeZone

class CalculateNatalChartUseCase(private val astronomyEngine: AstronomyEngine) {

    fun execute(userProfile: UserProfile): NatalChartData {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
        calendar.time = Date(userProfile.birthDateUtc)
        
        val jd = astronomyEngine.getJulianDay(calendar)

        // Whole-sign houses are the product's house system (docs/shared-content-model.md),
        // mirroring web/src/lib/houses.ts: the Ascendant's whole sign is the 1st house and
        // each following sign is the next house, so cusps land on 0 degrees of each sign.
        val ascendant = astronomyEngine.getAscendant(jd, userProfile.latitude, userProfile.longitude)
        val houseCusps = WholeSignHouses.cusps(ascendant)

        val planets = mutableMapOf<Planet, AccuratePlanetPosition>()
        
        Planet.values().forEach { planet ->
            val body = mapPlanetToBody(planet)
            val data = astronomyEngine.getPlanetPosition(jd, body)
            val sign = ZodiacUtils.getZodiacSign(data.longitude)
            val degreeInSign = ZodiacUtils.getDegreeInSign(data.longitude)
            val totalSeconds = (data.longitude % 1.0) * 3600.0
            val minuteInSign = (totalSeconds / 60.0).toInt()
            val secondInSign = (totalSeconds % 60.0).toInt()
            
            // Calculate house
            val house = WholeSignHouses.houseOf(data.longitude, houseCusps)
            
            planets[planet] = AccuratePlanetPosition(
                planet = planet,
                longitude = data.longitude,
                velocity = data.velocity,
                isRetrograde = data.isRetrograde,
                zodiacSign = sign,
                degreeInSign = degreeInSign,
                minuteInSign = minuteInSign,
                secondInSign = secondInSign,
                house = house
            )
        }

        val aspects = calculateAspects(planets)
        
        return NatalChartData(
            planets = planets,
            houseCusps = houseCusps,
            ascendant = ascendant,
            julianDay = jd,
            aspects = aspects
        )
    }

    private fun calculateAspects(planets: Map<Planet, AccuratePlanetPosition>): List<Aspect> =
        AspectDetector.detect(planets.mapValues { (_, position) -> position.longitude })

    private fun mapPlanetToBody(planet: Planet): Body {
        return when (planet) {
            Planet.SUN -> Body.Sun
            Planet.MOON -> Body.Moon
            Planet.MERCURY -> Body.Mercury
            Planet.VENUS -> Body.Venus
            Planet.MARS -> Body.Mars
            Planet.JUPITER -> Body.Jupiter
            Planet.SATURN -> Body.Saturn
            Planet.URANUS -> Body.Uranus
            Planet.NEPTUNE -> Body.Neptune
            Planet.PLUTO -> Body.Pluto
        }
    }
}
