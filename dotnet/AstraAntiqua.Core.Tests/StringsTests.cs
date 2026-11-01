using System.Reflection;
using System.Text.Json;
using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Tests;

/// <summary>
/// The embedded shared/strings/en.json catalog. Every key web exported must
/// load, every per-culture key must carry all five cultures (there is no
/// fallback string), and a missing key or slot must throw rather than print.
/// The counts come from shared/strings/manifest.json, which the same web
/// exporter writes.
/// </summary>
public class StringsTests
{
    private static readonly Strings Strings = ContentStore.Load().Strings;

    private static JsonElement ManifestCounts()
    {
        var assembly = typeof(StringsTests).GetTypeInfo().Assembly;
        using var stream = assembly.GetManifestResourceStream("Strings.manifest.json")
            ?? throw new InvalidOperationException("Embedded test data Strings.manifest.json not found.");
        using var doc = JsonDocument.Parse(stream);
        return doc.RootElement.GetProperty("counts").Clone();
    }

    public static IEnumerable<object[]> AllCultures()
        => Enum.GetValues<Culture>().Select(c => new object[] { c });

    [Fact]
    public void Every_exported_key_is_present()
    {
        var counts = ManifestCounts();
        Assert.Equal(counts.GetProperty("keys").GetInt32(), Strings.Keys.Count);
        Assert.Equal(counts.GetProperty("perCultureKeys").GetInt32(), Strings.Keys.Count(Strings.IsPerCulture));
        Assert.Equal(counts.GetProperty("cultures").GetInt32(), Enum.GetValues<Culture>().Length);
    }

    [Theory]
    [MemberData(nameof(AllCultures))]
    public void Every_key_resolves_in_every_culture(Culture culture)
    {
        foreach (var key in Strings.Keys)
        {
            Assert.False(string.IsNullOrEmpty(Strings.Template(key, culture)), $"{key} in {culture}");
        }
    }

    [Fact]
    public void Per_culture_keys_differ_by_culture_where_web_wrote_them()
    {
        var names = Enum.GetValues<Culture>().Select(c => Strings.Template("common.institution", c)).ToList();
        Assert.Equal(new[]
        {
            "THE HALL OF MA’AT",
            "THE DAY’S ORACLE",
            "THE COUNCIL OF EL",
            "THE DECREE OF THE TOPHET",
            "THE AUSPICES OF THE DAY",
        }, names);
    }

    [Fact]
    public void Get_fills_every_slot()
    {
        var kicker = Strings.Get("day.kicker", Culture.Egypt, new Dictionary<string, string>
        {
            ["date"] = "WED 21 OCT 2026",
            ["institution"] = Strings.Template("common.institution", Culture.Egypt),
        });
        Assert.Equal("WED 21 OCT 2026 · THE HALL OF MA’AT", kicker);
        Assert.Equal("THE SEASON OF THE SCALES",
            Strings.Get("season.title", Culture.Rome, new Dictionary<string, string> { ["signPhrase"] = "SCALES" }));
        Assert.Equal("THE SKY, COMPUTED", Strings.Get("day.sky.label", Culture.Canaan));
    }

    [Fact]
    public void A_missing_key_throws()
    {
        var ex = Assert.Throws<KeyNotFoundException>(() => Strings.Get("day.nope", Culture.Egypt));
        Assert.Contains("day.nope", ex.Message);
    }

    [Fact]
    public void A_missing_slot_throws()
    {
        var ex = Assert.Throws<ArgumentException>(() => Strings.Get("day.kicker", Culture.Egypt,
            new Dictionary<string, string> { ["date"] = "WED 21 OCT 2026" }));
        Assert.Contains("{institution}", ex.Message);
    }

    [Fact]
    public void A_catalog_with_four_cultures_fails_to_load()
    {
        const string json = "{\"x.title\": {\"egypt\": \"A\", \"greece\": \"B\", \"canaan\": \"C\", \"carthage\": \"D\"}}";
        var ex = Assert.Throws<InvalidOperationException>(() => Strings.Parse(json));
        Assert.Contains("x.title", ex.Message);
        Assert.Contains("rome", ex.Message);
    }

    [Fact]
    public void The_slot_names_of_a_template_come_back_in_order()
    {
        Assert.Equal(new[] { "days", "weighed", "quiet" }, Strings.SlotNames(Strings.Template("week.countLine", Culture.Greece)));
    }
}
