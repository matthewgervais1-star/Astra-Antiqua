using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Reading;

/// <summary>One body's placement, masked by the culture in force.</summary>
public sealed record PlanetPlacement(
    Planet Planet,
    double Longitude,
    ZodiacSign Sign,
    double DegreeInSign,
    string DeityName,
    string DeityEpithet,
    string Domain,
    string CulturalLine,
    string SignReading);

/// <summary>One aspect of the chart, voiced by the two deities it joins.</summary>
public sealed record AspectReading(
    Aspect Aspect,
    string DeityA,
    string DeityB,
    string VerbLine,
    string PairTheme,
    string CulturalReflection);

/// <summary>A natal reading in one culture's voice (web lib/reading.ts Reading).</summary>
public sealed record NatalReading(
    Culture Culture,
    IReadOnlyList<PlanetPlacement> Placements,
    IReadOnlyList<AspectReading> Aspects,
    string Summary);

/// <summary>
/// Port of buildReading in web/src/lib/reading.ts: the universal placement
/// text with the culture laid over it as a render-time mask (deity names, the
/// myth line, the aspect verbs and reflections), plus the one-paragraph
/// summary. Every fragment comes from the shared corpus.
/// </summary>
public static class NatalReadingBuilder
{
    public static NatalReading Build(Culture culture, IReadOnlyDictionary<Planet, double> chart, ContentStore store)
    {
        var banks = store.Banks;

        var placements = PlanetInfo.Order.Select(planet =>
        {
            var longitude = chart[planet];
            var (sign, degree) = ZodiacMath.LongitudeToSign(longitude);
            var deity = store.GetDeity(culture, planet);
            return new PlanetPlacement(
                planet,
                longitude,
                sign,
                degree,
                deity.Name,
                deity.Epithet,
                banks.PlanetDomain(planet),
                banks.Inscription(culture, planet),
                store.GetPlacementText(planet, sign));
        }).ToList();

        var aspects = AspectDetector.Detect(chart, store.AspectRules).Select(a =>
        {
            var deityA = store.GetDeity(culture, a.A).Name;
            var deityB = store.GetDeity(culture, a.B).Name;
            return new AspectReading(
                a,
                deityA,
                deityB,
                $"{deityA} {banks.AspectVerb(culture, a.Kind)} {deityB}.",
                banks.PairTheme(a.A, a.B),
                banks.AspectReflection(culture, a.Kind));
        }).ToList();

        var harmony = aspects.Count(a => AspectKinds.IsSoft(a.Aspect.Kind));
        var tension = aspects.Count(a => AspectKinds.IsHard(a.Aspect.Kind));
        var fused = aspects.Count(a => a.Aspect.Kind == AspectKind.Conjunction);
        var tone = tension > harmony
            ? banks.SummaryTone("tension")
            : harmony > tension
                ? banks.SummaryTone("harmony")
                : banks.SummaryTone("even");
        var summary = $"{banks.SummaryIntro(culture)} {tone}{banks.SummaryFused(fused)}";

        return new NatalReading(culture, placements, aspects, summary);
    }
}
