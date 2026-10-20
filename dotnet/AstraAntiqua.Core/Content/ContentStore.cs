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

    private ContentStore(
        IReadOnlyDictionary<(Culture, Planet), Deity> deities,
        IReadOnlyDictionary<(Planet, ZodiacSign), string> placements,
        IReadOnlyDictionary<int, HouseMeaning> houses,
        IReadOnlyDictionary<ZodiacSign, ZodiacSignRecord> signs,
        IReadOnlyList<AspectRule> aspectRules)
    {
        _deities = deities;
        _placements = placements;
        _houses = houses;
        _signs = signs;
        AspectRules = aspectRules;
    }

    public Deity GetDeity(Culture culture, Planet planet) => _deities[(culture, planet)];

    public string GetPlacementText(Planet planet, ZodiacSign sign) => _placements[(planet, sign)];

    public HouseMeaning GetHouse(int house) =>
        house is >= 1 and <= 12
            ? _houses[house]
            : throw new ArgumentOutOfRangeException(nameof(house), house, "House must be 1..12.");

    public ZodiacSignRecord GetSignInfo(ZodiacSign sign) => _signs[sign];

    /// <summary>The fragments every composed reading is built from.</summary>
    public ReadingBanks Banks { get; private set; } = null!;

    /// <summary>The offline birthplace list, each city with its IANA zone.</summary>
    public IReadOnlyList<City> Cities { get; private set; } = Array.Empty<City>();

    /// <summary>The seven Learn sections and their tables.</summary>
    public LearnContent Learn { get; private set; } = null!;

    /// <summary>The method page.</summary>
    public MethodContent Method { get; private set; } = null!;

    /// <summary>The ground and accent shown before any culture is chosen.</summary>
    public Palette NeutralPalette { get; private set; } = null!;

    private IReadOnlyDictionary<Culture, CultureCopy> _cultureCopy = new Dictionary<Culture, CultureCopy>();
    private IReadOnlyDictionary<Planet, PlanetCopy> _planetCopy = new Dictionary<Planet, PlanetCopy>();
    private IReadOnlyDictionary<Culture, Palette> _palettes = new Dictionary<Culture, Palette>();

    public CultureCopy GetCultureCopy(Culture culture) => _cultureCopy[culture];

    public PlanetCopy GetPlanetCopy(Planet planet) => _planetCopy[planet];

    public Palette GetPalette(Culture culture) => _palettes[culture];

    private IReadOnlyDictionary<(Culture, Planet), DeityGlyph> _glyphs = new Dictionary<(Culture, Planet), DeityGlyph>();

    /// <summary>The drawn glyph <paramref name="culture"/> gives <paramref name="planet"/>.</summary>
    public DeityGlyph GetGlyph(Culture culture, Planet planet) => _glyphs[(culture, planet)];

    private static readonly Lazy<ContentStore> SharedInstance = new(Load, isThreadSafe: true);

    /// <summary>The process-wide store: parsed once, on first use.</summary>
    public static ContentStore Shared => SharedInstance.Value;

    /// <summary>
    /// The cities whose name or country contains <paramref name="query"/>, or
    /// every popular city when the query is empty. Web's searchCities.
    /// </summary>
    public IReadOnlyList<City> SearchCities(string query, int limit = 8)
    {
        var q = query.Trim();
        if (q.Length == 0)
            return Cities.Where(c => c.Popular).ToList();
        return Cities
            .Where(c => c.Name.IndexOf(q, StringComparison.OrdinalIgnoreCase) >= 0
                        || c.Country.IndexOf(q, StringComparison.OrdinalIgnoreCase) >= 0)
            .Take(limit)
            .ToList();
    }

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
        var store = new ContentStore(deities, placements, houses, signs, rules);

        using (var doc = ReadResource("reading-banks.json"))
            store.Banks = ReadingBanks.Parse(doc.RootElement);

        using (var doc = ReadResource("cultures.json"))
        {
            store._cultureCopy = doc.RootElement.GetProperty("cultures").EnumerateArray()
                .Select(e => new CultureCopy(
                    CultureIds.FromId(GetString(e, "id")),
                    GetString(e, "label"),
                    GetString(e, "tagline"),
                    GetString(e, "subtitle")))
                .ToDictionary(c => c.Culture);
            store._planetCopy = doc.RootElement.GetProperty("planets").EnumerateArray()
                .Select(e => new PlanetCopy(
                    PlanetInfo.FromId(GetString(e, "id")),
                    GetString(e, "label"),
                    GetString(e, "symbol"),
                    e.GetProperty("received").GetBoolean()))
                .ToDictionary(p => p.Planet);
        }

        using (var doc = ReadResource("cities.json"))
        {
            store.Cities = doc.RootElement.EnumerateArray()
                .Select(e => new City(
                    GetString(e, "name"),
                    GetString(e, "country"),
                    e.GetProperty("latitude").GetDouble(),
                    e.GetProperty("longitude").GetDouble(),
                    e.GetProperty("popular").GetBoolean(),
                    GetString(e, "timeZone")))
                .ToList();
        }

        using (var doc = ReadResource("palettes.json"))
        {
            var neutral = doc.RootElement.GetProperty("neutral");
            store.NeutralPalette = new Palette(GetString(neutral, "ground"), GetString(neutral, "accent"));
            store._palettes = doc.RootElement.GetProperty("cultures").EnumerateObject()
                .ToDictionary(
                    p => CultureIds.FromId(p.Name),
                    p => new Palette(GetString(p.Value, "ground"), GetString(p.Value, "accent")));
        }

        using (var doc = ReadResource("method.json"))
        {
            var root = doc.RootElement;
            store.Method = new MethodContent(
                root.GetProperty("sections").EnumerateArray()
                    .Select(s => new MethodSection(
                        GetString(s, "heading"),
                        s.GetProperty("paragraphs").EnumerateArray().Select(p => p.GetString() ?? "").ToList()))
                    .ToList(),
                root.GetProperty("notes").EnumerateArray()
                    .Select(n => new InterpretiveNote(
                        GetString(n, "id"),
                        n.GetProperty("cultures").EnumerateArray()
                            .Select(c => CultureIds.FromId(c.GetString() ?? "")).ToList(),
                        GetString(n, "title"),
                        GetString(n, "body")))
                    .ToList(),
                root.GetProperty("sources").EnumerateArray()
                    .Select(s => new SourceReference(
                        GetString(s, "author"), GetString(s, "title"), GetString(s, "detail")))
                    .ToList());
        }

        using (var doc = ReadResource("glyphs.json"))
        {
            store._glyphs = doc.RootElement.EnumerateArray()
                .Select(g => new DeityGlyph(
                    CultureIds.FromId(GetString(g, "culture")),
                    PlanetInfo.FromId(GetString(g, "planet")),
                    GetString(g, "deity"),
                    GetString(g, "status") switch
                    {
                        "attested" => GlyphStatus.Attested,
                        "composed" => GlyphStatus.Composed,
                        "invented" => GlyphStatus.Invented,
                        var other => throw new InvalidOperationException($"Unknown glyph status '{other}'."),
                    },
                    g.GetProperty("paths").EnumerateArray()
                        .Select(p => new GlyphPath(
                            GetString(p, "d"),
                            p.GetProperty("fill").GetBoolean(),
                            p.GetProperty("stroke").GetBoolean(),
                            p.GetProperty("strokeWidth").GetDouble(),
                            GetString(p, "lineCap"),
                            GetString(p, "lineJoin")))
                        .ToList()))
                .ToDictionary(g => (g.Culture, g.Planet));
        }

        using (var doc = ReadResource("learn.json"))
        {
            var root = doc.RootElement;
            var rulings = new Dictionary<(Culture, AspectKind), string>();
            foreach (var c in root.GetProperty("aspectRulings").EnumerateObject())
                foreach (var k in c.Value.EnumerateObject())
                    rulings[(CultureIds.FromId(c.Name), ParseAspectKind(k.Name))] = k.Value.GetString() ?? "";
            store.Learn = new LearnContent(
                root.GetProperty("sections").EnumerateArray()
                    .Select(s => new LearnSection(
                        s.GetProperty("n").GetInt32(),
                        GetString(s, "title"),
                        GetString(s, "href"),
                        GetString(s, "blurb"),
                        s.GetProperty("table").ValueKind == JsonValueKind.Null ? null : s.GetProperty("table").GetString(),
                        s.GetProperty("blocks").EnumerateArray()
                            .Select(b => new LearnBlock(
                                GetString(b, "kind"),
                                GetString(b, "text"),
                                b.TryGetProperty("kicker", out var k) ? k.GetString() : null))
                            .ToList()))
                    .ToList(),
                root.GetProperty("planetVerbs").EnumerateArray()
                    .Select(v => new PlanetVerb(GetString(v, "symbol"), GetString(v, "name"), GetString(v, "verb")))
                    .ToList(),
                root.GetProperty("houseSystems").EnumerateArray()
                    .Select(h => new HouseSystem(GetString(h, "name"), GetString(h, "age"), GetString(h, "body"), h.GetProperty("ours").GetBoolean()))
                    .ToList(),
                rulings,
                root.GetProperty("aspectGeometry").EnumerateObject()
                    .ToDictionary(g => ParseAspectKind(g.Name), g => g.Value.GetString() ?? ""));
        }

        var gaps = new List<string>();
        foreach (var culture in CultureIds.Order)
        {
            if (!store._cultureCopy.ContainsKey(culture)) gaps.Add($"culture copy {culture}");
            if (!store._palettes.ContainsKey(culture)) gaps.Add($"palette {culture}");
            foreach (var planet in PlanetInfo.Order)
                if (!store._glyphs.ContainsKey((culture, planet))) gaps.Add($"glyph {culture}/{planet}");
        }
        foreach (var planet in PlanetInfo.Order)
            if (!store._planetCopy.ContainsKey(planet)) gaps.Add($"planet copy {planet}");
        if (store.Cities.Count == 0) gaps.Add("cities");
        if (store.Method.Sections.Count == 0) gaps.Add("method sections");
        if (store.Learn.Sections.Count != 7) gaps.Add($"learn sections: expected 7, got {store.Learn.Sections.Count}");
        if (store.Learn.AspectRulings.Count != 25) gaps.Add("aspect rulings");
        if (gaps.Count > 0)
            throw new InvalidOperationException(
                $"Shared content is incomplete ({gaps.Count} cells): {string.Join(", ", gaps)}");

        return store;
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
