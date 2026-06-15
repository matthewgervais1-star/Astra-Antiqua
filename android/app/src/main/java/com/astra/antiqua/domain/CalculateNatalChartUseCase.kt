package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.model.ClassicalPlanet
import io.github.cosinekitty.astronomy.Body
import java.util.Calendar
import java.util.Date
import java.util.TimeZone

class CalculateNatalChartUseCase(private val astronomyEngine: AstronomyEngine) {

    fun execute(userProfile: UserProfile): NatalChartData {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
        calendar.time = Date(userProfile.birthDateUtc)
        
        val jd = astronomyEngine.getJulianDay(calendar)
        
        val houseCusps = astronomyEngine.getHouseCusp(jd, userProfile.latitude, userProfile.longitude, 'P') // Placidus
        
        val planets = mutableMapOf<ClassicalPlanet, AccuratePlanetPosition>()
        
        ClassicalPlanet.values().forEach { planet ->
            val body = mapPlanetToBody(planet)
            val data = astronomyEngine.getPlanetPosition(jd, body)
            val sign = ZodiacUtils.getZodiacSign(data.longitude)
            val degreeInSign = ZodiacUtils.getDegreeInSign(data.longitude)
            val totalSeconds = (data.longitude % 1.0) * 3600.0
            val minuteInSign = (totalSeconds / 60.0).toInt()
            val secondInSign = (totalSeconds % 60.0).toInt()
            
            // Calculate house
            val house = calculateHouse(data.longitude, houseCusps)
            
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
            julianDay = jd,
            aspects = aspects
        )
    }

    private fun calculateAspects(planets: Map<ClassicalPlanet, AccuratePlanetPosition>): List<Aspect> {
        val aspects = mutableListOf<Aspect>()
        val planetList = planets.keys.toList()
        
        for (i in planetList.indices) {
            for (j in i + 1 until planetList.size) {
                val p1 = planetList[i]
                val p2 = planetList[j]
                val pos1 = planets[p1]!!.longitude
                val pos2 = planets[p2]!!.longitude
                
                val diff = calculateDistance(pos1, pos2)
                
                AspectType.values().forEach { type ->
                    val orbDiff = Math.abs(diff - type.degree)
                    if (orbDiff <= type.orb) {
                        aspects.add(Aspect(
                            p1 = p1,
                            p2 = p2,
                            type = type,
                            exactness = orbDiff / type.orb
                        ))
                    }
                }
            }
        }
        return aspects
    }

    private fun calculateDistance(d1: Double, d2: Double): Double {
        val diff = Math.abs(d1 - d2)
        return if (diff > 180) 360 - diff else diff
    }

    private fun calculateHouse(longitude: Double, cusps: DoubleArray): Int {
        for (i in 1..11) {
            val start = cusps[i]
            val end = cusps[i + 1]
            if (isBetween(longitude, start, end)) return i
        }
        return 12
    }

    private fun isBetween(deg: Double, start: Double, end: Double): Boolean {
        return if (start < end) {
            deg >= start && deg < end
        } else {
            deg >= start || deg < end
        }
    }

    private fun mapPlanetToBody(planet: ClassicalPlanet): Body {
        return when (planet) {
            ClassicalPlanet.SUN -> Body.Sun
            ClassicalPlanet.MOON -> Body.Moon
            ClassicalPlanet.MERCURY -> Body.Mercury
            ClassicalPlanet.VENUS -> Body.Venus
            ClassicalPlanet.MARS -> Body.Mars
            ClassicalPlanet.JUPITER -> Body.Jupiter
            ClassicalPlanet.SATURN -> Body.Saturn
        }
    }
}
