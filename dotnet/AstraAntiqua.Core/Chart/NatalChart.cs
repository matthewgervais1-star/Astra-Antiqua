using AstraAntiqua.Core.Astronomy;
using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Forecast;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Chart;

/// <summary>One body in a cast chart.</summary>
public sealed record BodyPosition(
    Planet Planet,
    double Longitude,
    ZodiacSign Sign,
    double DegreeInSign,
    int House,
    bool Retrograde);

/// <summary>
/// A chart cast for an instant and a place: the ten longitudes, the angles,
/// whole-sign houses and the aspects, every rule the one web documents.
/// </summary>
public sealed class NatalChart
{
    private NatalChart(
        DateTime utc,
        double latitude,
        double longitude,
        IReadOnlyDictionary<Planet, double> longitudes,
        double ascendant,
        double midheaven,
        IReadOnlyList<BodyPosition> bodies,
        IReadOnlyList<Aspect> aspects)
    {
        Utc = utc;
        Latitude = latitude;
        Longitude = longitude;
        Longitudes = longitudes;
        Ascendant = ascendant;
        Midheaven = midheaven;
        Bodies = bodies;
        Aspects = aspects;
    }

    public DateTime Utc { get; }
    public double Latitude { get; }
    public double Longitude { get; }
    public IReadOnlyDictionary<Planet, double> Longitudes { get; }
    public double Ascendant { get; }
    public double Midheaven { get; }
    public IReadOnlyList<BodyPosition> Bodies { get; }
    public IReadOnlyList<Aspect> Aspects { get; }

    public ZodiacSign AscendantSign => ZodiacMath.LongitudeToSign(Ascendant).Sign;

    public BodyPosition this[Planet planet] => Bodies[(int)planet];

    /// <summary>The houses 1..12 and the sign each holds.</summary>
    public IReadOnlyList<(int House, ZodiacSign Sign)> Houses => WholeSignHouses.FromAscendant(Ascendant);

    /// <summary>The points long transits are read against: Sun, Moon, Ascendant.</summary>
    public IReadOnlyList<NatalPoint> TransitPoints => new[]
    {
        new NatalPoint("sun", Longitudes[Planet.Sun]),
        new NatalPoint("moon", Longitudes[Planet.Moon]),
        new NatalPoint("asc", Ascendant),
    };

    public static NatalChart Cast(DateTime utc, double latitude, double longitude, IReadOnlyList<AspectRule> rules)
    {
        var at = Ephemeris.AsUtc(utc);
        var longitudes = Ephemeris.ComputeChart(at);
        var (asc, mc) = AscendantCalculator.Compute(at, latitude, longitude);
        var ascIndex = (int)ZodiacMath.LongitudeToSign(asc).Sign;
        var ms = Instant.ToMs(at);
        var bodies = PlanetInfo.Order.Select(planet =>
        {
            var lon = longitudes[planet];
            var (sign, degree) = ZodiacMath.LongitudeToSign(lon);
            var retrograde = planet is not (Planet.Sun or Planet.Moon) && Ephemeris.Velocity(planet, ms) < 0;
            return new BodyPosition(planet, lon, sign, degree, WholeSignHouses.HouseOfLongitude(lon, ascIndex), retrograde);
        }).ToList();
        return new NatalChart(at, latitude, longitude, longitudes, asc, mc, bodies, AspectDetector.Detect(longitudes, rules));
    }
}
