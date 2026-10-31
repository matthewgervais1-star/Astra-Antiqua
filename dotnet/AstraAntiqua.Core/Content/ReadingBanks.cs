using System.Text.Json;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Content;

/// <summary>
/// The authored fragments the readings are composed from, read from
/// shared/content/reading-banks.json. Web writes several of them as
/// functions; the exporter turns each into a template with named slots,
/// where "{a}" takes the argument as given and "{A}" takes it with its first
/// letter capitalised (web's cap()). Filling a slot here reproduces web's
/// sentence byte for byte, which the horizon goldens check.
/// </summary>
public sealed class ReadingBanks
{
    private readonly Dictionary<(Culture, AspectKind), string> _aspectVerbs = new();
    private readonly Dictionary<AspectKind, string> _plainAspectVerbs = new();
    private readonly Dictionary<Culture, string> _placementVerbs = new();
    private readonly Dictionary<(Culture, Planet), string> _charges = new();
    private readonly Dictionary<(Culture, Planet), string> _inscriptions = new();
    private readonly Dictionary<Culture, string> _ingressFrames = new();
    private readonly Dictionary<Culture, string> _ingressVerbs = new();
    private readonly Dictionary<Culture, string> _quietLines = new();
    private readonly Dictionary<Culture, string> _summaryIntros = new();
    private readonly Dictionary<string, string> _summaryTones = new();
    private string _summaryFusedOne = "";
    private string _summaryFusedMany = "";
    private readonly Dictionary<Planet, string> _planetDomains = new();
    private readonly Dictionary<(Culture, AspectKind), string> _aspectReflections = new();
    private readonly Dictionary<string, string> _pairThemes = new(StringComparer.Ordinal);
    private string _pairThemeFallback = "";
    private readonly Dictionary<ZodiacSign, string> _signRegisters = new();
    private readonly Dictionary<ZodiacSign, string> _signPhrases = new();
    private readonly Dictionary<ZodiacSign, string> _signAbbreviations = new();
    private readonly Dictionary<AspectKind, string> _aspectGlyphs = new();
    private readonly Dictionary<Planet, string> _planetConcerns = new();
    private readonly Dictionary<(Culture, int), string> _houseGroupNames = new();
    private readonly Dictionary<(Culture, int), string> _seasonHouseLines = new();

    private ReadingBanks() { }

    /// <summary>"{charge}" with its first letter raised, as web's cap() does.</summary>
    public static string Cap(string s)
        => s.Length == 0 ? s : char.ToUpperInvariant(s[0]) + s.Substring(1);

    /// <summary>Fills a template's named slots; see the class summary for the slot rules.</summary>
    public static string Fill(string template, params (char Slot, string Value)[] values)
    {
        var result = template;
        foreach (var (slot, value) in values)
        {
            result = result
                .Replace("{" + char.ToUpperInvariant(slot) + "}", Cap(value))
                .Replace("{" + slot + "}", value);
        }
        return result;
    }

    public string AspectVerb(Culture culture, AspectKind kind) => _aspectVerbs[(culture, kind)];

    public string PlainAspectVerb(AspectKind kind) => _plainAspectVerbs[kind];

    public string PlacementVerb(Culture culture) => _placementVerbs[culture];

    /// <summary>What a god brings before its institution: lowercase, written to sit mid-sentence.</summary>
    public string DeityCharge(Culture culture, Planet planet) => _charges[(culture, planet)];

    /// <summary>The line of myth that sits under a deity's name in a natal reading.</summary>
    public string Inscription(Culture culture, Planet planet) => _inscriptions[(culture, planet)];

    public string IngressFrame(Culture culture, string charge)
        => Fill(_ingressFrames[culture], ('c', charge));

    public string IngressVerb(Culture culture) => _ingressVerbs[culture];

    public string QuietLine(Culture culture) => _quietLines[culture];

    public string SummaryIntro(Culture culture) => _summaryIntros[culture];

    /// <summary>"tension", "harmony" or "even".</summary>
    public string SummaryTone(string key) => _summaryTones[key];

    public string SummaryFused(int count) => count switch
    {
        <= 0 => "",
        1 => _summaryFusedOne,
        _ => Fill(_summaryFusedMany, ('n', count.ToString(System.Globalization.CultureInfo.InvariantCulture))),
    };

    public string PlanetDomain(Planet planet) => _planetDomains[planet];

    public string AspectReflection(Culture culture, AspectKind kind) => _aspectReflections[(culture, kind)];

    /// <summary>Web's getPairTheme: the pair keyed in sorted id order, with web's fallback.</summary>
    public string PairTheme(Planet a, Planet b)
    {
        var ids = new[] { PlanetInfo.Id(a), PlanetInfo.Id(b) };
        Array.Sort(ids, StringComparer.Ordinal);
        return _pairThemes.TryGetValue($"{ids[0]}|{ids[1]}", out var theme) ? theme : _pairThemeFallback;
    }

    public string SignRegister(ZodiacSign sign) => _signRegisters[sign];

    /// <summary>The sign's culture-neutral noun, in capitals as web stores it ("WATER-BEARER").</summary>
    public string SignPhrase(ZodiacSign sign) => _signPhrases[sign];

    public string SignAbbreviation(ZodiacSign sign) => _signAbbreviations[sign];

    public string AspectGlyph(AspectKind kind) => _aspectGlyphs[kind];

    /// <summary>What a body brings into whatever house it lands in (web lib/houseReading.ts).</summary>
    public string PlanetConcern(Planet planet) => _planetConcerns[planet];

    /// <summary>
    /// Web's houseReading: "{deity} turns {concern} toward {arena}.", one
    /// sentence that reads beneath a header already naming the house.
    /// </summary>
    public string HouseReading(string deityName, Planet planet, string arena)
        => $"{deityName} turns {PlanetConcern(planet)} toward {arena}.";

    /// <summary>The name a culture keeps a house's group under ("the ferry", "FORUM").</summary>
    public string HouseGroupName(Culture culture, int house) => _houseGroupNames[(culture, house)];

    /// <summary>Web's line for the house the season's sign occupies in a chart.</summary>
    public string SeasonHouseLine(Culture culture, int house) => _seasonHouseLines[(culture, house)];

    internal static ReadingBanks Parse(JsonElement root)
    {
        var banks = new ReadingBanks();

        foreach (var c in root.GetProperty("aspectVerbs").EnumerateObject())
            foreach (var k in c.Value.EnumerateObject())
                banks._aspectVerbs[(CultureIds.FromId(c.Name), AspectKinds.FromId(k.Name))] = Str(k.Value);
        foreach (var k in root.GetProperty("plainAspectVerbs").EnumerateObject())
            banks._plainAspectVerbs[AspectKinds.FromId(k.Name)] = Str(k.Value);
        foreach (var c in root.GetProperty("placementVerbs").EnumerateObject())
            banks._placementVerbs[CultureIds.FromId(c.Name)] = Str(c.Value);
        ReadCulturePlanet(root.GetProperty("deityCharges"), banks._charges);
        ReadCulturePlanet(root.GetProperty("deityInscriptions"), banks._inscriptions);
        foreach (var c in root.GetProperty("ingressFrames").EnumerateObject())
            banks._ingressFrames[CultureIds.FromId(c.Name)] = Str(c.Value);
        foreach (var c in root.GetProperty("ingressVerbs").EnumerateObject())
            banks._ingressVerbs[CultureIds.FromId(c.Name)] = Str(c.Value);
        foreach (var c in root.GetProperty("quietLines").EnumerateObject())
            banks._quietLines[CultureIds.FromId(c.Name)] = Str(c.Value);
        foreach (var c in root.GetProperty("summaryIntros").EnumerateObject())
            banks._summaryIntros[CultureIds.FromId(c.Name)] = Str(c.Value);
        foreach (var t in root.GetProperty("summaryTones").EnumerateObject())
            banks._summaryTones[t.Name] = Str(t.Value);
        var fused = root.GetProperty("summaryFused");
        banks._summaryFusedOne = Str(fused.GetProperty("one"));
        banks._summaryFusedMany = Str(fused.GetProperty("many"));
        foreach (var p in root.GetProperty("planetDomains").EnumerateObject())
            banks._planetDomains[PlanetInfo.FromId(p.Name)] = Str(p.Value);
        ReadCultureKind(root.GetProperty("aspectReflections"), banks._aspectReflections);
        foreach (var p in root.GetProperty("pairThemes").EnumerateObject())
            banks._pairThemes[p.Name] = Str(p.Value);
        banks._pairThemeFallback = Str(root.GetProperty("pairThemeFallback"));
        ReadSign(root.GetProperty("signRegisters"), banks._signRegisters);
        ReadSign(root.GetProperty("signPhrases"), banks._signPhrases);
        ReadSign(root.GetProperty("signAbbreviations"), banks._signAbbreviations);
        foreach (var k in root.GetProperty("aspectGlyphs").EnumerateObject())
            banks._aspectGlyphs[AspectKinds.FromId(k.Name)] = Str(k.Value);

        foreach (var p in root.GetProperty("planetConcerns").EnumerateObject())
            banks._planetConcerns[PlanetInfo.FromId(p.Name)] = Str(p.Value);
        foreach (var c in root.GetProperty("houseGroupNames").EnumerateObject())
            foreach (var h in c.Value.EnumerateObject())
                banks._houseGroupNames[(CultureIds.FromId(c.Name), int.Parse(h.Name, System.Globalization.CultureInfo.InvariantCulture))] = Str(h.Value);
        foreach (var c in root.GetProperty("seasonHouseLines").EnumerateObject())
            foreach (var h in c.Value.EnumerateObject())
                banks._seasonHouseLines[(CultureIds.FromId(c.Name), int.Parse(h.Name, System.Globalization.CultureInfo.InvariantCulture))] = Str(h.Value);

        banks.AssertComplete();
        return banks;
    }

    private void AssertComplete()
    {
        var missing = new List<string>();
        foreach (var culture in CultureIds.Order)
        {
            foreach (var planet in PlanetInfo.Order)
            {
                if (!_charges.ContainsKey((culture, planet))) missing.Add($"charge {culture}/{planet}");
                if (!_inscriptions.ContainsKey((culture, planet))) missing.Add($"inscription {culture}/{planet}");
            }
            foreach (var kind in AspectKinds.Order)
            {
                if (!_aspectVerbs.ContainsKey((culture, kind))) missing.Add($"verb {culture}/{kind}");
                if (!_aspectReflections.ContainsKey((culture, kind))) missing.Add($"reflection {culture}/{kind}");
            }
            if (!_ingressFrames.ContainsKey(culture)) missing.Add($"ingress frame {culture}");
            if (!_ingressVerbs.ContainsKey(culture)) missing.Add($"ingress verb {culture}");
            if (!_quietLines.ContainsKey(culture)) missing.Add($"quiet line {culture}");
            if (!_summaryIntros.ContainsKey(culture)) missing.Add($"summary intro {culture}");
            if (!_placementVerbs.ContainsKey(culture)) missing.Add($"placement verb {culture}");
        }
        foreach (var planet in PlanetInfo.Order)
        {
            if (!_planetDomains.ContainsKey(planet)) missing.Add($"domain {planet}");
            if (!_planetConcerns.ContainsKey(planet)) missing.Add($"concern {planet}");
        }
        foreach (var culture in CultureIds.Order)
            for (var house = 1; house <= 12; house++)
            {
                if (!_houseGroupNames.ContainsKey((culture, house))) missing.Add($"house group {culture}/{house}");
                if (!_seasonHouseLines.ContainsKey((culture, house))) missing.Add($"season line {culture}/{house}");
            }
        foreach (var sign in ZodiacSigns.Order)
        {
            if (!_signPhrases.ContainsKey(sign)) missing.Add($"sign phrase {sign}");
            if (!_signAbbreviations.ContainsKey(sign)) missing.Add($"sign abbreviation {sign}");
            if (!_signRegisters.ContainsKey(sign)) missing.Add($"sign register {sign}");
        }
        foreach (var key in new[] { "tension", "harmony", "even" })
            if (!_summaryTones.ContainsKey(key)) missing.Add($"summary tone {key}");
        if (_pairThemes.Count != 45) missing.Add($"pair themes: expected 45, got {_pairThemes.Count}");

        if (missing.Count > 0)
            throw new InvalidOperationException(
                $"reading-banks.json is incomplete ({missing.Count} cells): {string.Join(", ", missing)}");
    }

    private static void ReadCulturePlanet(JsonElement element, Dictionary<(Culture, Planet), string> into)
    {
        foreach (var c in element.EnumerateObject())
            foreach (var p in c.Value.EnumerateObject())
                into[(CultureIds.FromId(c.Name), PlanetInfo.FromId(p.Name))] = Str(p.Value);
    }

    private static void ReadCultureKind(JsonElement element, Dictionary<(Culture, AspectKind), string> into)
    {
        foreach (var c in element.EnumerateObject())
            foreach (var k in c.Value.EnumerateObject())
                into[(CultureIds.FromId(c.Name), AspectKinds.FromId(k.Name))] = Str(k.Value);
    }

    private static void ReadSign(JsonElement element, Dictionary<ZodiacSign, string> into)
    {
        foreach (var s in element.EnumerateObject())
            into[ZodiacSigns.FromName(s.Name)] = Str(s.Value);
    }

    private static string Str(JsonElement element)
        => element.GetString() ?? throw new InvalidOperationException("Null string in reading-banks.json.");
}
