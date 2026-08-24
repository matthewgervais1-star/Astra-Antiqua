using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Charting;

/// <summary>
/// Port of web/src/data/sampleChart.ts computeAspects. Pairs iterate in
/// canonical planet order; each pair takes the FIRST matching rule and stops
/// (web's `break`), so a separation inside two orb bands emits one aspect,
/// never two — the double-count bug Android had is deliberately not ported.
/// </summary>
public static class AspectDetector
{
    public static IReadOnlyList<Aspect> Detect(
        IReadOnlyDictionary<Planet, double> chart,
        IReadOnlyList<AspectRule> rules)
    {
        var planets = PlanetInfo.Order.Where(chart.ContainsKey).ToArray();
        var aspects = new List<Aspect>();
        for (var i = 0; i < planets.Length; i++)
        {
            for (var j = i + 1; j < planets.Length; j++)
            {
                var a = planets[i];
                var b = planets[j];
                var raw = Math.Abs(chart[a] - chart[b]) % 360.0;
                var angle = raw > 180.0 ? 360.0 - raw : raw;
                foreach (var rule in rules)
                {
                    var delta = Math.Abs(angle - rule.Angle);
                    if (delta <= rule.Orb)
                    {
                        aspects.Add(new Aspect(a, b, rule.Kind, angle, delta));
                        break;
                    }
                }
            }
        }
        return aspects;
    }
}
