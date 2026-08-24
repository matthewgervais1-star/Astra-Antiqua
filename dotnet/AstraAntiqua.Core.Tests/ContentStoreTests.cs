using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Tests;

/// <summary>
/// Completeness tests over the embedded shared/content JSON: the same
/// discipline as web's buildMatrix() throw and the Android rollout plan's
/// Phase 1 completeness tests. A missing (culture x planet) cell must fail
/// a test, never fall back silently.
/// </summary>
public class ContentStoreTests
{
    private static readonly ContentStore Store = ContentStore.Load();

    public static IEnumerable<object[]> AllCultures()
        => Enum.GetValues<Culture>().Select(c => new object[] { c });

    [Theory]
    [MemberData(nameof(AllCultures))]
    public void Every_culture_planet_pair_resolves_to_a_full_deity(Culture culture)
    {
        foreach (var planet in PlanetInfo.Order)
        {
            var deity = Store.GetDeity(culture, planet);
            Assert.False(string.IsNullOrWhiteSpace(deity.Name), $"{culture}/{planet} name");
            Assert.False(string.IsNullOrWhiteSpace(deity.Epithet), $"{culture}/{planet} epithet");
            Assert.False(string.IsNullOrWhiteSpace(deity.Note), $"{culture}/{planet} note");
        }
    }

    [Fact]
    public void Every_planet_sign_pair_has_a_placement_paragraph()
    {
        var count = 0;
        foreach (var planet in PlanetInfo.Order)
        {
            foreach (var sign in Enum.GetValues<ZodiacSign>())
            {
                var text = Store.GetPlacementText(planet, sign);
                Assert.False(string.IsNullOrWhiteSpace(text), $"{planet} in {sign}");
                count++;
            }
        }
        Assert.Equal(120, count);
    }

    [Fact]
    public void All_twelve_houses_are_present_with_all_text_fields()
    {
        for (var house = 1; house <= 12; house++)
        {
            var meaning = Store.GetHouse(house);
            Assert.Equal(house, meaning.House);
            Assert.False(string.IsNullOrWhiteSpace(meaning.Ordinal), $"house {house} ordinal");
            Assert.False(string.IsNullOrWhiteSpace(meaning.Title), $"house {house} title");
            Assert.False(string.IsNullOrWhiteSpace(meaning.Domain), $"house {house} domain");
            Assert.False(string.IsNullOrWhiteSpace(meaning.Arena), $"house {house} arena");
        }
    }

    [Fact]
    public void All_twelve_sign_records_are_present()
    {
        foreach (var sign in Enum.GetValues<ZodiacSign>())
        {
            var info = Store.GetSignInfo(sign);
            Assert.Equal(sign, info.Sign);
            Assert.False(string.IsNullOrWhiteSpace(info.Symbol));
            Assert.False(string.IsNullOrWhiteSpace(info.Element));
            Assert.False(string.IsNullOrWhiteSpace(info.Modality));
        }
    }

    [Fact]
    public void The_aspect_rules_are_the_one_documented_orb_table_in_order()
    {
        var expected = new (AspectKind Kind, double Angle, double Orb)[]
        {
            (AspectKind.Conjunction, 0, 8),
            (AspectKind.Sextile, 60, 5),
            (AspectKind.Square, 90, 7),
            (AspectKind.Trine, 120, 7),
            (AspectKind.Opposition, 180, 8),
        };
        Assert.Equal(expected.Length, Store.AspectRules.Count);
        for (var i = 0; i < expected.Length; i++)
        {
            Assert.Equal(expected[i].Kind, Store.AspectRules[i].Kind);
            Assert.Equal(expected[i].Angle, Store.AspectRules[i].Angle);
            Assert.Equal(expected[i].Orb, Store.AspectRules[i].Orb);
        }
    }

    [Fact]
    public void The_received_bodies_are_exactly_the_three_outer_planets()
    {
        var received = PlanetInfo.Order.Where(PlanetInfo.IsReceived).ToArray();
        Assert.Equal(
            new[] { Planet.Uranus, Planet.Neptune, Planet.Pluto },
            received);
    }

    [Fact]
    public void Planet_ids_round_trip_through_the_web_lowercase_names()
    {
        foreach (var planet in PlanetInfo.Order)
        {
            var id = PlanetInfo.Id(planet);
            Assert.Equal(id, id.ToLowerInvariant());
            Assert.Equal(planet, PlanetInfo.FromId(id));
        }
    }
}
