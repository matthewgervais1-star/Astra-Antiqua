using System.Globalization;
using System.Text.Json;
using AstraAntiqua.Core.Astronomy;
using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Tests;

/// <summary>
/// Parity with the web surface. TestData/goldens.json was produced by running
/// the WEB pipeline itself (web/scripts/export-goldens.mjs); these tests
/// assert the C# port reproduces it. When they pass, "the two surfaces
/// agree" is a machine-checked fact, not a code-review opinion.
/// </summary>
public class GoldenParityTests
{
    private sealed record GoldenCase(
        string Name,
        DateTime Utc,
        double Lat,
        double Lon,
        IReadOnlyDictionary<Planet, double> Longitudes,
        double Ascendant,
        double Midheaven,
        ZodiacSign AscendantSign,
        IReadOnlyDictionary<Planet, int> Houses,
        IReadOnlyList<(Planet A, Planet B, string Kind)> Aspects);

    private static readonly double Tolerance;
    private static readonly IReadOnlyList<GoldenCase> Cases;

    static GoldenParityTests()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "TestData", "goldens.json");
        using var doc = JsonDocument.Parse(File.ReadAllText(path));
        Tolerance = doc.RootElement.GetProperty("tolerance").GetDouble();
        Cases = doc.RootElement.GetProperty("cases").EnumerateArray().Select(c => new GoldenCase(
            c.GetProperty("name").GetString()!,
            DateTime.Parse(
                c.GetProperty("utc").GetString()!,
                CultureInfo.InvariantCulture,
                DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal),
            c.GetProperty("lat").GetDouble(),
            c.GetProperty("lon").GetDouble(),
            c.GetProperty("longitudes").EnumerateObject()
                .ToDictionary(p => PlanetInfo.FromId(p.Name), p => p.Value.GetDouble()),
            c.GetProperty("ascendant").GetDouble(),
            c.GetProperty("midheaven").GetDouble(),
            ZodiacSigns.FromName(c.GetProperty("ascendantSign").GetString()!),
            c.GetProperty("houses").EnumerateObject()
                .ToDictionary(p => PlanetInfo.FromId(p.Name), p => p.Value.GetInt32()),
            c.GetProperty("aspects").EnumerateArray()
                .Select(a => (
                    PlanetInfo.FromId(a.GetProperty("a").GetString()!),
                    PlanetInfo.FromId(a.GetProperty("b").GetString()!),
                    a.GetProperty("kind").GetString()!))
                .ToList())).ToList();
    }

    public static IEnumerable<object[]> CaseNames()
        => Cases.Select(c => new object[] { c.Name });

    private static GoldenCase CaseNamed(string name) => Cases.Single(c => c.Name == name);

    [Fact]
    public void The_fixture_has_the_expected_shape()
    {
        Assert.Equal(0.001, Tolerance);
        Assert.Equal(4, Cases.Count);
        Assert.All(Cases, c => Assert.Equal(10, c.Longitudes.Count));
    }

    [Theory]
    [MemberData(nameof(CaseNames))]
    public void All_ten_longitudes_match_web(string name)
    {
        var golden = CaseNamed(name);
        var chart = Ephemeris.ComputeChart(golden.Utc);
        foreach (var planet in PlanetInfo.Order)
        {
            var diff = Math.Abs(chart[planet] - golden.Longitudes[planet]);
            if (diff > 180) diff = 360 - diff; // seam-safe comparison
            Assert.True(
                diff <= Tolerance,
                $"{name}: {planet} differs by {diff:F6} deg (web {golden.Longitudes[planet]:F6}, core {chart[planet]:F6})");
        }
    }

    [Theory]
    [MemberData(nameof(CaseNames))]
    public void Angular_points_and_ascendant_sign_match_web(string name)
    {
        var golden = CaseNamed(name);
        var (asc, mc) = AscendantCalculator.Compute(golden.Utc, golden.Lat, golden.Lon);
        Assert.True(Math.Abs(asc - golden.Ascendant) <= Tolerance,
            $"{name}: ascendant differs (web {golden.Ascendant:F6}, core {asc:F6})");
        Assert.True(Math.Abs(mc - golden.Midheaven) <= Tolerance,
            $"{name}: midheaven differs (web {golden.Midheaven:F6}, core {mc:F6})");
        Assert.Equal(golden.AscendantSign, ZodiacMath.LongitudeToSign(asc).Sign);
    }

    [Theory]
    [MemberData(nameof(CaseNames))]
    public void Every_planet_lands_in_the_same_whole_sign_house(string name)
    {
        var golden = CaseNamed(name);
        var chart = Ephemeris.ComputeChart(golden.Utc);
        var (asc, _) = AscendantCalculator.Compute(golden.Utc, golden.Lat, golden.Lon);
        var ascSignIndex = (int)ZodiacMath.LongitudeToSign(asc).Sign;
        foreach (var planet in PlanetInfo.Order)
            Assert.Equal(golden.Houses[planet], WholeSignHouses.HouseOfLongitude(chart[planet], ascSignIndex));
    }

    [Theory]
    [MemberData(nameof(CaseNames))]
    public void The_detected_aspect_set_matches_web_exactly(string name)
    {
        var golden = CaseNamed(name);
        var chart = Ephemeris.ComputeChart(golden.Utc);
        var detected = AspectDetector.Detect(chart, ContentStore.Load().AspectRules)
            .Select(a => (a.A, a.B, a.Kind.ToString().ToLowerInvariant()))
            .ToHashSet();
        var expected = golden.Aspects.Select(a => (a.A, a.B, a.Kind)).ToHashSet();
        Assert.Equal(expected, detected);
    }
}
