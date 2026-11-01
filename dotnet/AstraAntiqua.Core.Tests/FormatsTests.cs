using System.Globalization;
using System.Reflection;
using System.Text.Json;
using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Tests;

/// <summary>
/// The C# port of web's fmt() against shared/goldens/formats.json, which
/// web/scripts/export-strings.mjs writes from web's own formatter. Each case
/// is one input and output pair; the month end, year end, local day and
/// count edges of the plan's Review Focus 1, 2 and 4 are among them.
/// </summary>
public class FormatsTests
{
    private static readonly Formats Formats = ContentStore.Load().Formats;

    private static JsonDocument ReadGoldens()
    {
        var assembly = typeof(FormatsTests).GetTypeInfo().Assembly;
        using var stream = assembly.GetManifestResourceStream("Goldens.formats.json")
            ?? throw new InvalidOperationException("Embedded test data Goldens.formats.json not found.");
        return JsonDocument.Parse(stream);
    }

    public static IEnumerable<object[]> Cases()
    {
        using var doc = ReadGoldens();
        var i = 0;
        foreach (var c in doc.RootElement.GetProperty("cases").EnumerateArray())
        {
            yield return new object[] { i++, c.GetProperty("name").GetString()!, c.GetRawText() };
        }
    }

    [Fact]
    public void The_goldens_cover_every_format_the_rules_name()
    {
        using var doc = ReadGoldens();
        var covered = doc.RootElement.GetProperty("cases").EnumerateArray()
            .Select(c => c.GetProperty("name").GetString()!)
            .ToHashSet();
        Assert.Equal(Formats.Names.OrderBy(n => n, StringComparer.Ordinal),
            covered.OrderBy(n => n, StringComparer.Ordinal));
    }

    [Fact]
    public void Every_golden_case_runs()
    {
        Assert.Equal(63, Cases().Count());
    }

    [Theory]
    [MemberData(nameof(Cases))]
    public void Each_case_prints_the_golden(int index, string name, string json)
    {
        using var doc = JsonDocument.Parse(json);
        var c = doc.RootElement;
        var zone = c.GetProperty("zone").GetString()!;
        var expected = c.GetProperty("out").GetString()!;
        var input = ToInput(name, c.GetProperty("input"));
        Assert.True(index >= 0);
        Assert.Equal(expected, Formats.Format(name, input, zone));
    }

    [Fact]
    public void An_unknown_format_name_throws()
    {
        Assert.Throws<ArgumentException>(() => Formats.Format("date.nope", 1.0, "UTC"));
    }

    [Fact]
    public void Typed_helpers_match_the_named_formats()
    {
        Assert.Equal("CAP", Formats.SignAbbr(ZodiacSign.Capricorn));
        Assert.Equal("FISHES", Formats.SignPhrase(ZodiacSign.Pisces));
        Assert.Equal("MERCURY", Formats.PlanetName(Planet.Mercury));
        Assert.Equal("TENSION", Formats.ToneWord(AspectKind.Square));
        Assert.Equal("EASE", Formats.SpanToneWord("ease"));
        Assert.Equal(" · ", Formats.Dot);
        Assert.Equal(" → ", Formats.Arrow);
    }

    private static object ToInput(string name, JsonElement input)
    {
        switch (input.ValueKind)
        {
            case JsonValueKind.Array:
                var parts = input.EnumerateArray().Select(e => ParseInstant(e.GetString()!)).ToArray();
                return (parts[0], parts[1]);
            case JsonValueKind.Number:
                return input.GetDouble();
            case JsonValueKind.True:
                return true;
            case JsonValueKind.False:
                return false;
            case JsonValueKind.String:
                return name.StartsWith("date.", StringComparison.Ordinal) || name.StartsWith("time.", StringComparison.Ordinal)
                    ? ParseInstant(input.GetString()!)
                    : input.GetString()!;
            default:
                throw new InvalidOperationException($"Unexpected input kind {input.ValueKind} for {name}.");
        }
    }

    private static DateTimeOffset ParseInstant(string iso)
        => DateTimeOffset.Parse(iso, CultureInfo.InvariantCulture,
            DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal);
}
