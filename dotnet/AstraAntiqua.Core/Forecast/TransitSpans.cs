using AstraAntiqua.Core.Astronomy;
using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Forecast;

/// <summary>A natal point a transit can be measured against ("sun", "moon", "asc", "mc").</summary>
public sealed record NatalPoint(string Key, double Longitude);

/// <summary>One exact pass of a transiting body over an angle to a natal point.</summary>
public sealed record TransitPeak(
    Planet TransitPlanet,
    string NatalKey,
    double NatalLongitude,
    AspectKind Kind,
    DateTime Date,
    ZodiacSign TransitSign,
    double TransitDegree);

/// <summary>
/// A long transit as a span, not a moment: the stretch during which the
/// transiting body holds within <see cref="TransitSpans.SpanOrb"/> degrees of
/// exact, with every exact pass, retrograde returns included, inside it.
/// </summary>
public sealed record TransitSpan(
    string Id,
    Planet TransitPlanet,
    string NatalKey,
    double NatalLongitude,
    AspectKind Kind,
    DateTime Start,
    DateTime End,
    IReadOnlyList<DateTime> Passes,
    ZodiacSign TransitSign,
    double TransitDegree);

public enum SpanTone { Ease, Tension }

/// <summary>
/// Port of web/src/lib/transitSpans.ts and findMajorTransits in
/// web/src/lib/yearForecast.ts, rule for rule. The three-degree rule is the
/// one the method page publishes.
/// </summary>
public static class TransitSpans
{
    /// <summary>Degrees either side of exact that a span still counts inside.</summary>
    public const double SpanOrb = 3;

    private const int WalkStepDays = 5;
    private const int WalkCapDays = 700;

    private static double Separation(double a, double b)
    {
        var raw = Math.Abs(a - b) % 360;
        return raw > 180 ? 360 - raw : raw;
    }

    private static double SignedDiff(double longitude, double target)
    {
        var diff = longitude - target;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        return diff;
    }

    private static double BinarySearchLongitudeTarget(Planet planet, double target, double lo, double hi)
    {
        var loTime = lo;
        var hiTime = hi;
        var loDiff = SignedDiff(Ephemeris.LongitudeAtMs(planet, lo), target);
        for (var i = 0; i < 32; i++)
        {
            var mid = (loTime + hiTime) / 2;
            var midDiff = SignedDiff(Ephemeris.LongitudeAtMs(planet, mid), target);
            if (loDiff * midDiff <= 0) hiTime = mid;
            else loTime = mid;
            if (hiTime - loTime < 60 * 1000) break;
        }
        return (loTime + hiTime) / 2;
    }

    /// <summary>
    /// Every exact pass of each transit planet over each angle to each natal
    /// point in the window, confirmed to half a degree (web's findMajorTransits).
    /// </summary>
    public static IReadOnlyList<TransitPeak> FindExactPasses(
        IReadOnlyList<NatalPoint> natalPoints,
        IReadOnlyList<Planet> transitPlanets,
        DateTime start,
        int days)
    {
        var startMs = Instant.ToMs(start);
        var output = new List<TransitPeak>();
        foreach (var planet in transitPlanets)
        {
            var sampleDays = PlanetInfo.IsReceived(planet) ? 8 : 2;
            foreach (var point in natalPoints)
            {
                foreach (var kind in AspectKinds.Order)
                {
                    var angle = AspectKinds.Angle(kind);
                    var targets = angle is 0 or 180
                        ? new[] { ZodiacMath.Normalize(point.Longitude + angle) }
                        : new[]
                        {
                            ZodiacMath.Normalize(point.Longitude + angle),
                            ZodiacMath.Normalize(point.Longitude - angle),
                        };
                    foreach (var target in targets)
                    {
                        var prev = startMs;
                        var prevDiff = SignedDiff(Ephemeris.LongitudeAtMs(planet, prev), target);
                        for (var d = sampleDays; d <= days; d += sampleDays)
                        {
                            var date = startMs + d * Instant.MsPerDay;
                            var diff = SignedDiff(Ephemeris.LongitudeAtMs(planet, date), target);
                            if (prevDiff * diff < 0 && Math.Abs(prevDiff - diff) < 30)
                            {
                                var exact = Instant.FromMs(BinarySearchLongitudeTarget(planet, target, prev, date));
                                var lonAtExact = Ephemeris.GeocentricLongitude(planet, exact);
                                if (Math.Abs(Separation(lonAtExact, point.Longitude) - angle) < 0.5)
                                {
                                    var (sign, degree) = ZodiacMath.LongitudeToSign(lonAtExact);
                                    output.Add(new TransitPeak(
                                        planet, point.Key, point.Longitude, kind, exact, sign, degree));
                                }
                            }
                            prev = date;
                            prevDiff = diff;
                        }
                    }
                }
            }
        }
        return output.OrderBy(p => p.Date).ToList();
    }

    private static DateTime WalkEdge(Planet planet, double natalLongitude, AspectKind kind, DateTime from, int direction)
    {
        var fromMs = Instant.ToMs(from);
        var angle = AspectKinds.Angle(kind);
        var edge = from;
        for (var step = 1; step * WalkStepDays <= WalkCapDays; step++)
        {
            var probe = Instant.FromMs(fromMs + direction * step * WalkStepDays * Instant.MsPerDay);
            var distance = Math.Abs(Separation(Ephemeris.GeocentricLongitude(planet, probe), natalLongitude) - angle);
            if (distance > SpanOrb) break;
            edge = probe;
        }
        return edge;
    }

    /// <summary>Groups the exact passes into spans (web's computeTransitSpans).</summary>
    public static IReadOnlyList<TransitSpan> Compute(
        IReadOnlyList<NatalPoint> natalPoints,
        IReadOnlyList<Planet> transitPlanets,
        DateTime start,
        int days)
    {
        var peaks = FindExactPasses(natalPoints, transitPlanets, start, days);
        var groups = new List<(string Id, List<TransitPeak> Peaks)>();
        var index = new Dictionary<string, int>(StringComparer.Ordinal);
        foreach (var peak in peaks)
        {
            var id = $"{PlanetInfo.Id(peak.TransitPlanet)}-{AspectKinds.Id(peak.Kind)}-{peak.NatalKey}";
            if (index.TryGetValue(id, out var at)) groups[at].Peaks.Add(peak);
            else
            {
                index[id] = groups.Count;
                groups.Add((id, new List<TransitPeak> { peak }));
            }
        }

        var spans = new List<TransitSpan>();
        foreach (var (id, group) in groups)
        {
            var ordered = group.OrderBy(p => p.Date).ToList();
            var first = ordered[0];
            var last = ordered[ordered.Count - 1];
            spans.Add(new TransitSpan(
                id,
                first.TransitPlanet,
                first.NatalKey,
                first.NatalLongitude,
                first.Kind,
                WalkEdge(first.TransitPlanet, first.NatalLongitude, first.Kind, first.Date, -1),
                WalkEdge(last.TransitPlanet, last.NatalLongitude, last.Kind, last.Date, 1),
                ordered.Select(p => p.Date).ToList(),
                first.TransitSign,
                first.TransitDegree));
        }
        return spans.OrderBy(s => s.Start).ToList();
    }

    /// <summary>
    /// Trine and sextile read as ease, square and opposition as tension. A
    /// conjunction is ease only for Jupiter (web's spanTone).
    /// </summary>
    public static SpanTone Tone(TransitSpan span) => span.Kind switch
    {
        AspectKind.Trine or AspectKind.Sextile => SpanTone.Ease,
        AspectKind.Square or AspectKind.Opposition => SpanTone.Tension,
        _ => span.TransitPlanet == Planet.Jupiter ? SpanTone.Ease : SpanTone.Tension,
    };
}
