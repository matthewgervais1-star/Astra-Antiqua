using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Model;
using CosineKitty;

namespace AstraAntiqua.Core.Astronomy;

/// <summary>
/// Geocentric ecliptic longitudes for the ten bodies — a port of
/// web/src/lib/ephemeris.ts against the same upstream engine.
///
/// Frame contract (the landmine Android hit and documented in
/// AstronomyEngine.kt): the library's <c>Astronomy.EclipticLongitude()</c>
/// helper is HELIOCENTRIC and throws for the Sun. It is never called here.
/// Sun and Moon come from their dedicated geocentric functions; planets come
/// from an aberration-corrected geocentric vector converted to ecliptic
/// coordinates.
/// </summary>
public static class Ephemeris
{
    public static double GeocentricLongitude(Planet planet, DateTime utc)
    {
        var time = new AstroTime(AsUtc(utc));
        return planet switch
        {
            Planet.Sun => ZodiacMath.Normalize(CosineKitty.Astronomy.SunPosition(time).elon),
            Planet.Moon => ZodiacMath.Normalize(CosineKitty.Astronomy.EclipticGeoMoon(time).lon),
            _ => ZodiacMath.Normalize(
                CosineKitty.Astronomy.EquatorialToEcliptic(
                    CosineKitty.Astronomy.GeoVector(BodyFor(planet), time, Aberration.Corrected)).elon),
        };
    }

    /// <summary>The longitude at a JavaScript-style millisecond instant (see <see cref="Instant"/>).</summary>
    public static double LongitudeAtMs(Planet planet, double ms)
        => GeocentricLongitude(planet, Instant.FromMs(ms));

    /// <summary>
    /// Signed motion in degrees per day, measured as web's planetVelocity
    /// does: the longitude an hour either side, unwrapped across 0°.
    /// Negative means retrograde.
    /// </summary>
    public static double Velocity(Planet planet, double ms)
    {
        var before = LongitudeAtMs(planet, ms - Instant.MsPerHour);
        var after = LongitudeAtMs(planet, ms + Instant.MsPerHour);
        var delta = after - before;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        return delta * (24.0 / 2.0);
    }

    public static double Velocity(Planet planet, DateTime utc) => Velocity(planet, Instant.ToMs(utc));

    /// <summary>All ten longitudes, keyed and iterated in canonical order.</summary>
    public static IReadOnlyDictionary<Planet, double> ComputeChart(DateTime utc)
    {
        var chart = new Dictionary<Planet, double>();
        foreach (var planet in PlanetInfo.Order)
            chart[planet] = GeocentricLongitude(planet, utc);
        return chart;
    }

    private static Body BodyFor(Planet planet) => planet switch
    {
        Planet.Mercury => Body.Mercury,
        Planet.Venus => Body.Venus,
        Planet.Mars => Body.Mars,
        Planet.Jupiter => Body.Jupiter,
        Planet.Saturn => Body.Saturn,
        Planet.Uranus => Body.Uranus,
        Planet.Neptune => Body.Neptune,
        Planet.Pluto => Body.Pluto,
        _ => throw new ArgumentOutOfRangeException(
            nameof(planet), planet, "Sun and Moon have dedicated geocentric functions."),
    };

    internal static DateTime AsUtc(DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
    };
}
