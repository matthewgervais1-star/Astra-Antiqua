using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Charting;

/// <summary>A contact between a body in one chart and a body in another.</summary>
public sealed record CrossAspect(Planet From, Planet To, AspectKind Kind, double ExactAngle, double Orb);

/// <summary>
/// Aspects between two charts: synastry (web/src/lib/synastry.ts) and the
/// day's sky against a natal chart (web/src/lib/transits.ts). Both directions
/// count, so the pair is ordered: your Sun on their Saturn is not their Sun
/// on yours. Each pair takes the first matching rule of the one orb table.
/// </summary>
public static class CrossAspects
{
    private static double Separation(double a, double b)
    {
        var raw = Math.Abs(a - b) % 360;
        return raw > 180 ? 360 - raw : raw;
    }

    /// <summary>Every body of <paramref name="from"/> against every body of <paramref name="to"/>.</summary>
    public static IReadOnlyList<CrossAspect> Compute(
        IReadOnlyDictionary<Planet, double> from,
        IReadOnlyDictionary<Planet, double> to,
        IReadOnlyList<AspectRule> rules)
    {
        var output = new List<CrossAspect>();
        foreach (var a in PlanetInfo.Order)
        {
            foreach (var b in PlanetInfo.Order)
            {
                var sep = Separation(from[a], to[b]);
                foreach (var rule in rules)
                {
                    var delta = Math.Abs(sep - rule.Angle);
                    if (delta <= rule.Orb)
                    {
                        output.Add(new CrossAspect(a, b, rule.Kind, sep, delta));
                        break;
                    }
                }
            }
        }
        return output;
    }

    /// <summary>The tightest <paramref name="count"/>, stable on ties (web's topSynastry).</summary>
    public static IReadOnlyList<CrossAspect> Tightest(IReadOnlyList<CrossAspect> aspects, int count)
        => aspects.OrderBy(a => a.Orb).Take(count).ToList();

    /// <summary>
    /// The day's headline transits: the tightest hits, by default leaving out
    /// a body against its own natal place (web's topTransits).
    /// </summary>
    public static IReadOnlyList<CrossAspect> TopTransits(
        IReadOnlyList<CrossAspect> transits, int count = 5, bool excludeSelfPairs = true)
        => (excludeSelfPairs ? transits.Where(t => t.From != t.To) : transits)
            .OrderBy(t => t.Orb)
            .Take(count)
            .ToList();

    /// <summary>How much a moving body's touch matters, slowest heaviest (web's transitPlanetWeight).</summary>
    public static double TransitWeight(Planet planet) => planet switch
    {
        Planet.Pluto => 5,
        Planet.Uranus or Planet.Neptune => 4.5,
        Planet.Saturn => 4,
        Planet.Jupiter => 3,
        Planet.Mars => 2,
        Planet.Venus or Planet.Mercury => 1.5,
        _ => 1,
    };
}
