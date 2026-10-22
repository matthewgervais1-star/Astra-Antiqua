package com.astra.antiqua.data

import io.github.cosinekitty.astronomy.*
import java.util.Calendar
import java.util.TimeZone
import kotlin.math.*

/**
 * AstronomyEngine handles high-precision celestial calculations using the 'astronomy' library.
 */
class AstronomyEngine {

    /**
     * Geocentric apparent ecliptic longitude, mirroring the web ephemeris
     * (web/src/lib/ephemeris.ts) per docs/shared-content-model.md: the Sun via
     * sunPosition, the Moon via eclipticGeoMoon, the five classical planets via
     * an aberration-corrected geocentric vector. The library's
     * eclipticLongitude() must NOT be used here: it is HELIOcentric, which is
     * the wrong frame for astrology and throws InvalidBodyException for the Sun.
     */
    private fun geocentricLongitude(body: Body, time: Time): Double = when (body) {
        Body.Sun -> sunPosition(time).elon
        Body.Moon -> eclipticGeoMoon(time).lon
        else -> equatorialToEcliptic(geoVector(body, time, Aberration.Corrected)).elon
    }

    /**
     * Every body this app asks for returns a position at every date it is
     * asked about. Pluto is the one usually described as range-limited, so it
     * was probed directly against this library version at 1000, 1500, 1600,
     * 1700, 2000, 2200, 2400 and 3000 CE: it answered at all eight and threw
     * at none. There is therefore no out-of-range branch to write here, and a
     * guard that returned null outside some assumed span would remove a body
     * the library is willing to compute.
     */
    fun getPlanetPosition(julianDay: Double, body: Body): PlanetData {
        val time = Time(julianDay - 2451545.0)
        val longitude = normDeg(geocentricLongitude(body, time))

        // Velocity via finite difference (~1.44 minutes)
        val dt = 0.001
        val longitude2 = normDeg(geocentricLongitude(body, Time(time.ut + dt)))
        var dLon = longitude2 - longitude
        if (dLon > 180.0) dLon -= 360.0
        if (dLon < -180.0) dLon += 360.0
        val velocity = dLon / dt

        return PlanetData(
            longitude = longitude,
            velocity = velocity,
            isRetrograde = velocity < 0.0
        )
    }

    fun getJulianDay(calendar: Calendar): Double {
        val utcCal = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
        utcCal.timeInMillis = calendar.timeInMillis
        
        val time = Time(
            utcCal.get(Calendar.YEAR),
            utcCal.get(Calendar.MONTH) + 1,
            utcCal.get(Calendar.DAY_OF_MONTH),
            utcCal.get(Calendar.HOUR_OF_DAY),
            utcCal.get(Calendar.MINUTE),
            utcCal.get(Calendar.SECOND).toDouble()
        )
        return time.ut + 2451545.0
    }

    /**
     * Ascendant-only calculation for whole-sign houses, the product's house system
     * (docs/shared-content-model.md, mirrors web/src/lib/houses.ts): only the rising
     * degree is needed to place all twelve whole-sign cusps, unlike the quadrant
     * cusps below.
     */
    fun getAscendant(julianDay: Double, lat: Double, lon: Double): Double {
        val time = Time(julianDay - 2451545.0)
        val gmstHours = siderealTime(time)
        val ramcDeg = ((gmstHours * 15.0 + lon) % 360.0 + 360.0) % 360.0

        // Web's fixed mean obliquity (MEAN_OBLIQUITY_DEG, web/src/lib/ascendant.ts),
        // not the obliquity of date: web is canonical, and the two print a
        // different minute or sign for a few charts in a hundred far from J2000.
        val ramc = Math.toRadians(ramcDeg)
        val eps = Math.toRadians(MEAN_OBLIQUITY_DEG)
        val latRad = Math.toRadians(lat)

        val asc = Math.toDegrees(atan2(cos(ramc), -(sin(eps) * tan(latRad) + cos(eps) * sin(ramc))))
        return normDeg(asc)
    }

    // Whole-sign houses are the product's house system (docs/shared-content-model.md);
    // the Placidus quadrant-cusp routines below are retained for reference/future use
    // but are no longer called by CalculateNatalChartUseCase.
    fun getHouseCusp(julianDay: Double, lat: Double, lon: Double, @Suppress("UNUSED_PARAMETER") hsys: Char): DoubleArray {
        val time = Time(julianDay - 2451545.0)
        val gmstHours = siderealTime(time)
        val ramcDeg = ((gmstHours * 15.0 + lon) % 360.0 + 360.0) % 360.0

        // Approximate obliquity of the ecliptic
        val t = (julianDay - 2451545.0) / 36525.0
        val epsDeg = 23.4392911 - 0.013004167 * t

        return computePlacidusHouseCusps(ramcDeg, epsDeg, lat)
    }

    private fun computePlacidusHouseCusps(ramcDeg: Double, epsDeg: Double, latDeg: Double): DoubleArray {
        val ramc = Math.toRadians(ramcDeg)
        val eps  = Math.toRadians(epsDeg)
        val lat  = Math.toRadians(latDeg)
        val cusps = DoubleArray(13)

        // MC (House 10)
        cusps[10] = normDeg(Math.toDegrees(atan2(sin(ramc), cos(ramc) * cos(eps))))
        // IC (House 4)
        cusps[4]  = normDeg(cusps[10] + 180.0)

        // ASC (House 1)
        val asc = Math.toDegrees(atan2(cos(ramc), -(sin(eps) * tan(lat) + cos(eps) * sin(ramc))))
        cusps[1]  = normDeg(asc)
        // DSC (House 7)
        cusps[7]  = normDeg(cusps[1] + 180.0)

        val mcLambda = Math.toRadians(cusps[10])

        // Intermediate Placidus cusps (iterative)
        cusps[11] = placidusIterate(ramc, eps, lat, { dsa -> ramc + dsa / 3.0 }, mcLambda + PI/6.0)
        cusps[12] = placidusIterate(ramc, eps, lat, { dsa -> ramc + 2.0 * dsa / 3.0 }, mcLambda + PI/3.0)
        cusps[2]  = placidusIterate(ramc, eps, lat, { dsa -> ramc + PI / 3.0 + 2.0 * dsa / 3.0 }, mcLambda + 2.0*PI/3.0)
        cusps[3]  = placidusIterate(ramc, eps, lat, { dsa -> ramc + 2.0 * PI / 3.0 + dsa / 3.0 }, mcLambda + 5.0*PI/6.0)

        // Opposite houses
        cusps[5] = normDeg(cusps[11] + 180.0)
        cusps[6] = normDeg(cusps[12] + 180.0)
        cusps[8] = normDeg(cusps[2]  + 180.0)
        cusps[9] = normDeg(cusps[3]  + 180.0)

        return cusps
    }

    private fun placidusIterate(
        ramc: Double, eps: Double, lat: Double,
        targetFn: (Double) -> Double,
        initLambda: Double
    ): Double {
        var lambda = initLambda
        repeat(50) {
            val decl = asin((sin(eps) * sin(lambda)).coerceIn(-1.0, 1.0))
            val dsaVal = -tan(decl) * tan(lat)
            val dsa = acos(dsaVal.coerceIn(-1.0, 1.0))
            val ra = atan2(cos(eps) * sin(lambda), cos(lambda))
            val diff = ((ra - targetFn(dsa) + 3 * PI) % (2 * PI)) - PI
            if (abs(diff) < 1e-10) return@repeat
            lambda = (lambda - diff * 0.8) % (2 * PI)
        }
        return normDeg(Math.toDegrees(lambda))
    }

    private fun normDeg(d: Double) = ((d % 360.0) + 360.0) % 360.0

    private companion object {
        /** web/src/lib/ascendant.ts MEAN_OBLIQUITY_DEG, the J2000 mean obliquity. */
        const val MEAN_OBLIQUITY_DEG = 23.4392911
    }
}

data class PlanetData(
    val longitude: Double,
    val velocity: Double,
    val isRetrograde: Boolean
)
