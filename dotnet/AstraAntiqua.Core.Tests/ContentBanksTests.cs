using System.Text.Json;
using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Tests;

/// <summary>The banks and reference files added for the iOS surface load whole and say what web says.</summary>
public class ContentBanksTests
{
    private static readonly ContentStore Store = ContentStore.Shared;

    [Fact]
    public void The_house_reading_is_web_s_sentence()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "TestData", "horizons.json");
        using var doc = JsonDocument.Parse(File.ReadAllText(path));
        var cases = doc.RootElement.GetProperty("houseReadings").EnumerateArray().ToList();
        Assert.NotEmpty(cases);
        foreach (var c in cases)
        {
            var culture = CultureIds.FromId(c.GetProperty("culture").GetString()!);
            var planet = PlanetInfo.FromId(c.GetProperty("planet").GetString()!);
            var house = c.GetProperty("house").GetInt32();
            var line = Store.Banks.HouseReading(Store.GetDeity(culture, planet).Name, planet, Store.GetHouse(house).Arena);
            Assert.Equal(c.GetProperty("line").GetString(), line);
        }
    }

    [Fact]
    public void The_glyphs_keep_the_status_tally_the_research_settled()
    {
        var all = CultureIds.Order.SelectMany(c => PlanetInfo.Order.Select(p => Store.GetGlyph(c, p))).ToList();
        Assert.Equal(50, all.Count);
        Assert.Equal(28, all.Count(g => g.Status == GlyphStatus.Attested));
        Assert.Equal(21, all.Count(g => g.Status == GlyphStatus.Composed));
        Assert.Equal(1, all.Count(g => g.Status == GlyphStatus.Invented));
        Assert.All(all, g => Assert.NotEmpty(g.Paths));
        Assert.All(all, g => Assert.Equal(Store.GetDeity(g.Culture, g.Planet).Name.Split(' ')[0], g.Deity.Split(' ')[0]));
    }

    [Fact]
    public void Every_culture_has_its_copy_palette_and_season_lines()
    {
        foreach (var culture in CultureIds.Order)
        {
            Assert.False(string.IsNullOrWhiteSpace(Store.GetCultureCopy(culture).Tagline));
            Assert.StartsWith("#", Store.GetPalette(culture).Accent);
            for (var house = 1; house <= 12; house++)
                Assert.StartsWith("The season sits in your", Store.Banks.SeasonHouseLine(culture, house));
        }
        Assert.NotEmpty(Store.Method.Sections);
        Assert.NotEmpty(Store.Method.Sources);
    }

    [Fact]
    public void Templates_fill_their_slots_and_capitalise_where_web_does()
    {
        Assert.Equal("Abc and def.", ReadingBanks.Fill("{A} and {b}.", ('a', "abc"), ('b', "def")));
        Assert.Equal("", ReadingBanks.Cap(""));
        Assert.Equal("Ra", ReadingBanks.Cap("ra"));
        var frame = Store.Banks.AspectFrame(Culture.Egypt, AspectKind.Trine, "the day's own course", "the count of the nights");
        Assert.Equal("The day's own course and the count of the nights sit level on the scale, and no hand needs to touch it.", frame);
    }

    [Fact]
    public void City_search_matches_web_s_search()
    {
        Assert.Equal(Store.Cities.Count(c => c.Popular), Store.SearchCities("").Count);
        Assert.Contains(Store.SearchCities("tor"), c => c.Name == "Toronto");
        Assert.True(Store.SearchCities("a").Count <= 8);
        Assert.Empty(Store.SearchCities("zzzz"));
    }

    [Fact]
    public void The_seven_learn_sections_arrive_with_their_tables()
    {
        Assert.Equal(7, Store.Learn.Sections.Count);
        Assert.All(Store.Learn.Sections, s => Assert.NotEmpty(s.Blocks));
        Assert.Equal(11, Store.Learn.PlanetVerbs.Count);
        Assert.Equal(3, Store.Learn.HouseSystems.Count);
        Assert.Single(Store.Learn.HouseSystems, h => h.Ours);
        Assert.Equal(25, Store.Learn.AspectRulings.Count);
        Assert.Equal(5, Store.Learn.AspectGeometry.Count);
        var tables = Store.Learn.Sections.Select(s => s.Table).Where(t => t is not null).ToHashSet();
        Assert.Equal(new HashSet<string?> { "PLANET_VERBS", "ZODIAC_SIGNS", "HOUSES", "HOUSE_SYSTEMS", "ASPECTS" }, tables);
    }

    /// <summary>
    /// Every glyph path reaches the renderers in explicit form: one command
    /// letter per segment, followed by exactly that command's count of
    /// separated numbers. Microsoft.Maui.Graphics drew nothing for SVG's
    /// implicit line-to ("M1 2 3 4"), which blanked Carthage's Mercury on iOS.
    /// </summary>
    [Fact]
    public void Every_glyph_path_is_in_explicit_form()
    {
        var arity = new Dictionary<char, int>
        {
            ['m'] = 2, ['l'] = 2, ['h'] = 1, ['v'] = 1, ['c'] = 6, ['s'] = 4,
            ['q'] = 4, ['t'] = 2, ['a'] = 7, ['z'] = 0,
        };
        var segment = new System.Text.RegularExpressions.Regex(
            @"^([MmLlHhVvCcSsQqTtAaZz])((?: ?-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)*)$");
        foreach (var culture in CultureIds.Order)
        foreach (var planet in PlanetInfo.Order)
        foreach (var path in Store.GetGlyph(culture, planet).Paths)
        {
            var segments = path.Data.Split(' ')
                .Aggregate(new List<string>(), (acc, token) =>
                {
                    if (token.Length > 0 && char.IsLetter(token[0])) acc.Add(token);
                    else acc[acc.Count - 1] += " " + token;
                    return acc;
                });
            foreach (var s in segments)
            {
                var m = segment.Match(s);
                Assert.True(m.Success, $"{culture}/{planet}: malformed segment '{s}'");
                var numbers = m.Groups[2].Value.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
                Assert.True(arity[char.ToLowerInvariant(m.Groups[1].Value[0])] == numbers,
                    $"{culture}/{planet}: '{s}' has {numbers} numbers");
            }
        }
    }
}
