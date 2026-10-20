using AstraAntiqua.Core.Astronomy;
using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Model;
using CosineKitty;

namespace AstraAntiqua.Core.Forecast;

/// <summary>A body crossing from one sign into the next.</summary>
public sealed record IngressEvent(Planet Planet, DateTime Date, ZodiacSign FromSign, ZodiacSign ToSign);

public enum StationKind { Retrograde, Direct }

/// <summary>A body turning retrograde or direct.</summary>
public sealed record StationEvent(Planet Planet, StationKind Kind, DateTime Date, ZodiacSign Sign, double Degree);

/// <summary>One of the Moon's four quarters.</summary>
public sealed record MoonQuarterEvent(string Name, DateTime Date, ZodiacSign Sign, double Degree);

public enum EclipseScope { Lunar, Solar }

/// <summary>An eclipse at its peak.</summary>
public sealed record EclipseEvent(
    DateTime Date,
    EclipseScope Scope,
    string Kind,
    double Obscuration,
    ZodiacSign Sign,
    double Degree);

/// <summary>The moment the Sun returns to its natal degree.</summary>
public sealed record SolarReturnEvent(DateTime Date, double NatalSunLongitude, ZodiacSign Sign, double Degree);

/// <summary>
/// What the sky does on its own, apart from any chart. A port of the finders
/// in web/src/lib/yearForecast.ts, step for step: each body is sampled at
/// web's cadence, because the cadence decides whether a fast body's ingress
/// is found at all, and each crossing is narrowed by web's bisection.
/// </summary>
public static class SkyEvents
{
    private static readonly string[] QuarterNames = { "New Moon", "First Quarter", "Full Moon", "Last Quarter" };

    private static readonly Planet[] RetrogradePlanets =
    {
        Planet.Mercury, Planet.Venus, Planet.Mars, Planet.Jupiter,
        Planet.Saturn, Planet.Uranus, Planet.Neptune, Planet.Pluto,
    };

    /// <summary>The five bodies slow enough that a transit reads as a span.</summary>
    public static readonly IReadOnlyList<Planet> SlowBodies = new[]
    {
        Planet.Jupiter, Planet.Saturn, Planet.Uranus, Planet.Neptune, Planet.Pluto,
    };

    private static int SignIndex(double longitude)
        => (int)Math.Floor((((longitude % 360) + 360) % 360) / 30);

    private static int IngressSampleDays(Planet planet) => planet switch
    {
        Planet.Moon => 1,
        Planet.Sun or Planet.Mercury or Planet.Venus => 2,
        Planet.Mars => 5,
        Planet.Uranus or Planet.Neptune or Planet.Pluto => 20,
        _ => 14,
    };

    private static double FindIngressBetween(Planet planet, double lo, double hi)
    {
        var loTime = lo;
        var hiTime = hi;
        var loIdx = SignIndex(Ephemeris.LongitudeAtMs(planet, lo));
        for (var i = 0; i < 40; i++)
        {
            var mid = (loTime + hiTime) / 2;
            if (SignIndex(Ephemeris.LongitudeAtMs(planet, mid)) == loIdx) loTime = mid;
            else hiTime = mid;
            if (hiTime - loTime < 30 * 60 * 1000) break;
        }
        return hiTime;
    }

    /// <summary>Every sign change in the window, for the bodies asked about (web's findYearIngresses).</summary>
    public static IReadOnlyList<IngressEvent> Ingresses(DateTime start, int days, IEnumerable<Planet>? planets = null)
    {
        var startMs = Instant.ToMs(start);
        var output = new List<IngressEvent>();
        foreach (var planet in planets ?? PlanetInfo.Order)
        {
            var step = IngressSampleDays(planet);
            var prev = startMs;
            var prevIdx = SignIndex(Ephemeris.LongitudeAtMs(planet, prev));
            for (var d = step; d <= days; d += step)
            {
                var next = startMs + d * Instant.MsPerDay;
                var nextIdx = SignIndex(Ephemeris.LongitudeAtMs(planet, next));
                if (nextIdx != prevIdx)
                {
                    var exact = FindIngressBetween(planet, prev, next);
                    output.Add(new IngressEvent(
                        planet,
                        Instant.FromMs(exact),
                        ZodiacMath.LongitudeToSign(Ephemeris.LongitudeAtMs(planet, prev)).Sign,
                        ZodiacMath.LongitudeToSign(Ephemeris.LongitudeAtMs(planet, next)).Sign));
                }
                prev = next;
                prevIdx = nextIdx;
            }
        }
        return output.OrderBy(e => e.Date).ToList();
    }

    private static double BinarySearchStation(Planet planet, double lo, double hi)
    {
        var loT = lo;
        var hiT = hi;
        var loV = Ephemeris.Velocity(planet, Math.Truncate(lo));
        for (var i = 0; i < 32; i++)
        {
            var midT = (loT + hiT) / 2;
            var midV = Ephemeris.Velocity(planet, Math.Truncate(midT));
            if (loV * midV <= 0)
            {
                hiT = midT;
            }
            else
            {
                loT = midT;
                loV = midV;
            }
            if (hiT - loT < 60 * 1000) break;
        }
        return (loT + hiT) / 2;
    }

    /// <summary>Every turn retrograde or direct in the window (web's findRetrogradeStations).</summary>
    public static IReadOnlyList<StationEvent> Stations(DateTime start, int days)
    {
        var startMs = Instant.ToMs(start);
        var output = new List<StationEvent>();
        foreach (var planet in RetrogradePlanets)
        {
            var step = planet switch
            {
                Planet.Uranus or Planet.Neptune or Planet.Pluto => 5,
                Planet.Saturn or Planet.Jupiter => 3,
                _ => 1,
            };
            var prev = startMs;
            var prevVel = Ephemeris.Velocity(planet, prev);
            for (var d = step; d <= days; d += step)
            {
                var date = startMs + d * Instant.MsPerDay;
                var vel = Ephemeris.Velocity(planet, date);
                if (prevVel * vel < 0)
                {
                    var exact = Instant.FromMs(BinarySearchStation(planet, prev, date));
                    var (sign, degree) = ZodiacMath.LongitudeToSign(Ephemeris.GeocentricLongitude(planet, exact));
                    output.Add(new StationEvent(
                        planet,
                        prevVel > 0 ? StationKind.Retrograde : StationKind.Direct,
                        exact,
                        sign,
                        degree));
                }
                prev = date;
                prevVel = vel;
            }
        }
        return output.OrderBy(e => e.Date).ToList();
    }

    /// <summary>The Moon's quarters in the window, from the library's own search (web's findMoonPhases).</summary>
    public static IReadOnlyList<MoonQuarterEvent> MoonQuarters(DateTime start, int days)
    {
        var end = Instant.AddDays(start, days);
        var output = new List<MoonQuarterEvent>();
        var q = CosineKitty.Astronomy.SearchMoonQuarter(new AstroTime(Ephemeris.AsUtc(start)));
        var maxIter = (int)Math.Ceiling(days / 7.0) + 4;
        for (var i = 0; i < maxIter; i++)
        {
            var date = JsDate(q.time);
            if (date >= end) break;
            var (sign, degree) = ZodiacMath.LongitudeToSign(Ephemeris.GeocentricLongitude(Planet.Moon, date));
            var name = q.quarter >= 0 && q.quarter < QuarterNames.Length ? QuarterNames[q.quarter] : "New Moon";
            output.Add(new MoonQuarterEvent(name, date, sign, degree));
            q = CosineKitty.Astronomy.NextMoonQuarter(q);
        }
        return output;
    }

    private static string EclipseKindName(EclipseKind kind) => kind switch
    {
        EclipseKind.Penumbral => "penumbral",
        EclipseKind.Partial => "partial",
        EclipseKind.Annular => "annular",
        EclipseKind.Total => "total",
        _ => "partial",
    };

    /// <summary>Lunar and global solar eclipses in the window (web's findEclipses).</summary>
    public static IReadOnlyList<EclipseEvent> Eclipses(DateTime start, int days)
    {
        var end = Instant.AddDays(start, days);
        var output = new List<EclipseEvent>();
        var startTime = new AstroTime(Ephemeris.AsUtc(start));

        var lunar = CosineKitty.Astronomy.SearchLunarEclipse(startTime);
        for (var i = 0; i < 12; i++)
        {
            var date = JsDate(lunar.peak);
            if (date >= end) break;
            var (sign, degree) = ZodiacMath.LongitudeToSign(Ephemeris.GeocentricLongitude(Planet.Moon, date));
            output.Add(new EclipseEvent(date, EclipseScope.Lunar, EclipseKindName(lunar.kind),
                Finite(lunar.obscuration), sign, degree));
            lunar = CosineKitty.Astronomy.NextLunarEclipse(lunar.peak);
        }

        var solar = CosineKitty.Astronomy.SearchGlobalSolarEclipse(startTime);
        for (var i = 0; i < 12; i++)
        {
            var date = JsDate(solar.peak);
            if (date >= end) break;
            var (sign, degree) = ZodiacMath.LongitudeToSign(Ephemeris.GeocentricLongitude(Planet.Sun, date));
            output.Add(new EclipseEvent(date, EclipseScope.Solar, EclipseKindName(solar.kind),
                Finite(solar.obscuration), sign, degree));
            solar = CosineKitty.Astronomy.NextGlobalSolarEclipse(solar.peak);
        }

        return output.OrderBy(e => e.Date).ToList();
    }

    /// <summary>The next time the Sun stands at the natal degree (web's findSolarReturn).</summary>
    public static SolarReturnEvent? SolarReturn(double natalSunLongitude, DateTime from, double limitDays = 400)
    {
        var target = ZodiacMath.Normalize(natalSunLongitude);
        var hit = CosineKitty.Astronomy.SearchSunLongitude(target, new AstroTime(Ephemeris.AsUtc(from)), limitDays);
        if (hit is null) return null;
        var (sign, degree) = ZodiacMath.LongitudeToSign(target);
        return new SolarReturnEvent(JsDate(hit), target, sign, degree);
    }

    /// <summary>
    /// The instant JavaScript's AstroTime.date carries: J2000 plus ut days,
    /// truncated to a whole millisecond.
    /// </summary>
    internal static DateTime JsDate(AstroTime time)
    {
        const double j2000Ms = 946_728_000_000.0; // 2000-01-01T12:00:00Z
        return Instant.FromMs(j2000Ms + time.ut * Instant.MsPerDay);
    }

    private static double Finite(double value) => double.IsNaN(value) || double.IsInfinity(value) ? 0 : value;
}
