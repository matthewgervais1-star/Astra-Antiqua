using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Tests;

/// <summary>
/// Behavioral tests for the chart math, pinned to the web surface's exact
/// semantics (web/src/data/sampleChart.ts, web/src/lib/houses.ts).
/// </summary>
public class ChartingTests
{
    private static readonly IReadOnlyList<AspectRule> Rules = ContentStore.Load().AspectRules;

    [Fact]
    public void Longitude_just_under_360_is_late_Pisces()
    {
        var (sign, degree) = ZodiacMath.LongitudeToSign(359.9);
        Assert.Equal(ZodiacSign.Pisces, sign);
        Assert.Equal(29.9, degree, precision: 9);
    }

    [Fact]
    public void Longitude_wraps_past_360_into_Aries()
    {
        var (sign, degree) = ZodiacMath.LongitudeToSign(360.1);
        Assert.Equal(ZodiacSign.Aries, sign);
        Assert.Equal(0.1, degree, precision: 9);
    }

    [Fact]
    public void Negative_longitude_normalizes_like_web()
    {
        // ((-10 % 360) + 360) % 360 = 350 -> Pisces 20.
        var (sign, degree) = ZodiacMath.LongitudeToSign(-10);
        Assert.Equal(ZodiacSign.Pisces, sign);
        Assert.Equal(20.0, degree, precision: 9);
    }

    [Theory]
    [InlineData(double.NaN)]
    [InlineData(double.PositiveInfinity)]
    [InlineData(double.NegativeInfinity)]
    public void Non_finite_longitude_throws_rather_than_fabricating_Aries(double longitude)
    {
        // Mirrors web's longitudeToSign fail-loudly contract.
        Assert.Throws<ArgumentException>(() => ZodiacMath.LongitudeToSign(longitude));
    }

    [Fact]
    public void Pisces_ascendant_wraps_the_houses_back_through_Aries()
    {
        var houses = WholeSignHouses.FromAscendant(345.0); // 15 Pisces rising
        Assert.Equal(12, houses.Count);
        Assert.Equal((1, ZodiacSign.Pisces), houses[0]);
        Assert.Equal((2, ZodiacSign.Aries), houses[1]);
        Assert.Equal((12, ZodiacSign.Aquarius), houses[11]);

        // A body at 5 Aries sits in house 2 of this chart.
        Assert.Equal(2, WholeSignHouses.HouseOfLongitude(5.0, ascSignIndex: 11));
    }

    [Fact]
    public void A_tight_pair_emits_exactly_one_aspect()
    {
        // 4 degrees apart: inside the conjunction orb (8). The detector must
        // break on the first matching rule, not go on to test wider bands.
        var chart = new Dictionary<Planet, double>
        {
            [Planet.Sun] = 10.0,
            [Planet.Moon] = 14.0,
        };
        var aspects = AspectDetector.Detect(chart, Rules);
        var aspect = Assert.Single(aspects);
        Assert.Equal(Planet.Sun, aspect.A);
        Assert.Equal(Planet.Moon, aspect.B);
        Assert.Equal(AspectKind.Conjunction, aspect.Kind);
        Assert.Equal(4.0, aspect.ExactAngle, precision: 9);
        Assert.Equal(4.0, aspect.Orb, precision: 9);
    }

    [Fact]
    public void A_separation_outside_every_orb_is_quiet()
    {
        // 66 degrees: sextile is 60 with orb 5, so 66 is out; nothing else is near.
        var chart = new Dictionary<Planet, double>
        {
            [Planet.Sun] = 0.0,
            [Planet.Moon] = 66.0,
        };
        Assert.Empty(AspectDetector.Detect(chart, Rules));
    }

    [Fact]
    public void Separation_uses_the_shorter_arc()
    {
        // 350 and 10 are 20 degrees apart across the 0-degree seam, not 340.
        var chart = new Dictionary<Planet, double>
        {
            [Planet.Sun] = 350.0,
            [Planet.Moon] = 10.0,
        };
        Assert.Empty(AspectDetector.Detect(chart, Rules)); // 20 deg: no aspect
    }

    [Fact]
    public void Pairs_are_emitted_in_canonical_planet_order()
    {
        // A trine grand pattern across three bodies given out of order: every
        // emitted pair must have A earlier than B in PlanetInfo.Order.
        var chart = new Dictionary<Planet, double>
        {
            [Planet.Jupiter] = 240.0,
            [Planet.Sun] = 0.0,
            [Planet.Mars] = 120.0,
        };
        var aspects = AspectDetector.Detect(chart, Rules);
        Assert.Equal(3, aspects.Count);
        foreach (var aspect in aspects)
        {
            var ia = PlanetInfo.Order.ToList().IndexOf(aspect.A);
            var ib = PlanetInfo.Order.ToList().IndexOf(aspect.B);
            Assert.True(ia < ib, $"{aspect.A} should precede {aspect.B}");
            Assert.Equal(AspectKind.Trine, aspect.Kind);
        }
    }
}
