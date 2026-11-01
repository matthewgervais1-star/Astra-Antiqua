using System.Reflection;
using System.Text.Json;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Content;

/// <summary>
/// Loads the shared/content JSON (embedded at build time) and exposes typed
/// lookups. Every invariant is checked at load — a missing (culture x planet)
/// deity or (planet x sign) paragraph throws here, at startup, listing every
/// missing cell, rather than failing silently at lookup time. This is the
/// same discipline as web's buildMatrix() throw.
/// </summary>
public sealed class ContentStore
{
    private readonly IReadOnlyDictionary<(Culture, Planet), Deity> _deities;
    private readonly IReadOnlyDictionary<(Planet, ZodiacSign), string> _placements;
    private readonly IReadOnlyDictionary<int, HouseMeaning> _houses;
    private readonly IReadOnlyDictionary<ZodiacSign, ZodiacSignRecord> _signs;

    public IReadOnlyList<AspectRule> AspectRules { get; }

    /// <summary>The shared strings catalog (shared/strings/en.json), five cultures per per-culture key.</summary>
    public Strings Strings { get; }

    /// <summary>The named formats of shared/strings/formats.json, ported from web's fmt().</summary>
    public Formats Formats { get; }

    private ContentStore(
        IReadOnlyDictionary<(Culture, Planet), Deity> deities,
        IReadOnlyDictionary<(Planet, ZodiacSign), string> placements,
        IReadOnlyDictionary<int, HouseMeaning> houses,
        IReadOnlyDictionary<ZodiacSign, ZodiacSignRecord> signs,
        IReadOnlyList<AspectRule> aspectRules,
        Strings strings,
        Formats formats)
    {
        _deities = deities;
        _placements = placements;
        _houses = houses;
        _signs = signs;
        AspectRules = aspectRules;
        Strings = strings;
        Formats = formats;
    }

    public Deity GetDeity(Culture culture, Planet planet) => _deities[(culture, planet)];

    public string GetPlacementText(Planet planet, ZodiacSign sign) => _placements[(planet, sign)];

    public HouseMeaning GetHouse(int house) =>
        house is >= 1 and <= 12
            ? _houses[house]
            : throw new ArgumentOutOfRangeException(nameof(house), house, "House must be 1..12.");

    public ZodiacSignRecord GetSignInfo(ZodiacSign sign) => _signs[sign];

    public static ContentStore Load()
    {
        var deities = new Dictionary<(Culture, Planet), Deity>();
        using (var doc = ReadResource("deities.json"))
        {
            foreach (var element in doc.RootElement.EnumerateArray())
            {
                var deity = new Deity(
                    PlanetInfo.FromId(GetString(element, "planet")),
                    CultureIds.FromId(GetString(element, "culture")),
                    GetString(element, "name"),
                    GetString(element, "epithet"),
                    GetString(element, "note"),
                    element.TryGetProperty("contested", out var c) && c.GetBoolean());
                deities[(deity.Culture, deity.Planet)] = deity;
            }
        }

        var placements = new Dictionary<(Planet, ZodiacSign), string>();
        using (var doc = ReadResource("planet-in-sign.json"))
        {
            foreach (var planetProp in doc.RootElement.EnumerateObject())
            {
                var planet = PlanetInfo.FromId(planetProp.Name);
                foreach (var signProp in planetProp.Value.EnumerateObject())
                {
                    placements[(planet, ZodiacSigns.FromName(signProp.Name))] =
                        signProp.Value.GetString() ?? "";
                }
            }
        }

        var houses = new Dictionary<int, HouseMeaning>();
        using (var doc = ReadResource("houses.json"))
        {
            foreach (var element in doc.RootElement.EnumerateArray())
            {
                var meaning = new HouseMeaning(
                    element.GetProperty("house").GetInt32(),
                    GetString(element, "ordinal"),
                    GetString(element, "title"),
                    GetString(element, "domain"),
                    GetString(element, "arena"));
                houses[meaning.House] = meaning;
            }
        }

        var signs = new Dictionary<ZodiacSign, ZodiacSignRecord>();
        using (var doc = ReadResource("zodiac-signs.json"))
        {
            foreach (var element in doc.RootElement.EnumerateArray())
            {
                var record = new ZodiacSignRecord(
                    ZodiacSigns.FromName(GetString(element, "sign")),
                    GetString(element, "symbol"),
                    GetString(element, "dates"),
                    GetString(element, "element"),
                    GetString(element, "modality"),
                    GetString(element, "traits"),
                    GetString(element, "blurb"));
                signs[record.Sign] = record;
            }
        }

        var rules = new List<AspectRule>();
        using (var doc = ReadResource("aspect-rules.json"))
        {
            foreach (var element in doc.RootElement.EnumerateArray())
            {
                rules.Add(new AspectRule(
                    ParseAspectKind(GetString(element, "kind")),
                    element.GetProperty("angle").GetDouble(),
                    element.GetProperty("orb").GetDouble()));
            }
        }

        AssertComplete(deities, placements, houses, signs, rules);
        return new ContentStore(deities, placements, houses, signs, rules, Strings.Load(), Formats.Load());
    }

    private static void AssertComplete(
        Dictionary<(Culture, Planet), Deity> deities,
        Dictionary<(Planet, ZodiacSign), string> placements,
        Dictionary<int, HouseMeaning> houses,
        Dictionary<ZodiacSign, ZodiacSignRecord> signs,
        List<AspectRule> rules)
    {
        var missing = new List<string>();
        foreach (var culture in (Culture[])Enum.GetValues(typeof(Culture)))
            foreach (var planet in PlanetInfo.Order)
                if (!deities.ContainsKey((culture, planet)))
                    missing.Add($"deity {culture}/{planet}");
        foreach (var planet in PlanetInfo.Order)
            foreach (var sign in (ZodiacSign[])Enum.GetValues(typeof(ZodiacSign)))
                if (!placements.ContainsKey((planet, sign)))
                    missing.Add($"placement {planet} in {sign}");
        for (var h = 1; h <= 12; h++)
            if (!houses.ContainsKey(h))
                missing.Add($"house {h}");
        foreach (var sign in (ZodiacSign[])Enum.GetValues(typeof(ZodiacSign)))
            if (!signs.ContainsKey(sign))
                missing.Add($"sign record {sign}");
        if (rules.Count != 5)
            missing.Add($"aspect rules: expected 5, got {rules.Count}");

        if (missing.Count > 0)
            throw new InvalidOperationException(
                $"Shared content is incomplete ({missing.Count} cells): {string.Join(", ", missing)}");
    }

    private static AspectKind ParseAspectKind(string id) => id switch
    {
        "conjunction" => AspectKind.Conjunction,
        "sextile" => AspectKind.Sextile,
        "square" => AspectKind.Square,
        "trine" => AspectKind.Trine,
        "opposition" => AspectKind.Opposition,
        _ => throw new ArgumentException($"Unknown aspect kind: '{id}'", nameof(id)),
    };

    private static string GetString(JsonElement element, string property)
        => element.GetProperty(property).GetString()
           ?? throw new InvalidOperationException($"Property '{property}' is null.");

    private static JsonDocument ReadResource(string fileName)
    {
        var assembly = typeof(ContentStore).GetTypeInfo().Assembly;
        var resourceName = $"AstraAntiqua.Core.Content.{fileName}";
        using var stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException(
                $"Embedded resource '{resourceName}' not found. Available: " +
                string.Join(", ", assembly.GetManifestResourceNames()));
        return JsonDocument.Parse(stream);
    }
}
