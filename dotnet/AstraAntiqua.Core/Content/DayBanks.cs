using System.Text.Json;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Content;

/// <summary>
/// The banks the day and the week speak with, read from
/// shared/content/day-banks.json (exported from web's decreeBanks.ts,
/// deityDomains.ts and lib/decree.ts). The composer in Reading/Decree.cs fills
/// them the way web's lib/decree.ts does. Only the parts the week reads are
/// loaded; the figure banks in the same file wait for the figure page.
/// </summary>
public sealed class DayBanks
{
    /// <summary>One culture's decree bank (web's DecreeBank), the parts the week reads.</summary>
    public sealed record Decree(
        IReadOnlyDictionary<(AspectKind, Planet), string> Headlines,
        IReadOnlyDictionary<AspectKind, IReadOnlyList<string>> Relations,
        IReadOnlyList<string> TightTails,
        IReadOnlyDictionary<(AspectKind, Planet), string> Consequences,
        string Holds);

    private readonly Dictionary<Culture, Decree> _decrees = new();
    private readonly Dictionary<Culture, string> _quietHeadlines = new();
    private readonly Dictionary<Culture, string> _quietLines = new();
    private readonly Dictionary<(Culture, Planet), string> _domains = new();

    private DayBanks() { }

    /// <summary>Fast bodies, fastest first: when both bodies of a figure are fast, the faster one headlines.</summary>
    public IReadOnlyList<Planet> FastOrder { get; private set; } = Array.Empty<Planet>();

    /// <summary>Under this orb a figure is tight (lib/decree.ts TIGHT_ORB).</summary>
    public double TightOrb { get; private set; }

    public Decree GetDecree(Culture culture) => _decrees[culture];

    public string QuietHeadline(Culture culture) => _quietHeadlines[culture];

    public string QuietLine(Culture culture) => _quietLines[culture];

    /// <summary>What a body governs in the reader's life, in the culture's nouns.</summary>
    public string Domain(Culture culture, Planet planet) => _domains[(culture, planet)];

    internal static DayBanks Parse(JsonElement root)
    {
        var banks = new DayBanks
        {
            FastOrder = root.GetProperty("fastOrder").EnumerateArray()
                .Select(e => PlanetInfo.FromId(Str(e))).ToList(),
            TightOrb = root.GetProperty("tightOrb").GetDouble(),
        };

        foreach (var c in root.GetProperty("decree").EnumerateObject())
        {
            var bank = c.Value;
            var relations = new Dictionary<AspectKind, IReadOnlyList<string>>();
            foreach (var k in bank.GetProperty("relations").EnumerateObject())
                relations[AspectKinds.FromId(k.Name)] = k.Value.EnumerateArray().Select(Str).ToList();
            banks._decrees[CultureIds.FromId(c.Name)] = new Decree(
                ReadKindPlanet(bank.GetProperty("headlines")),
                relations,
                bank.GetProperty("tightTails").EnumerateArray().Select(Str).ToList(),
                ReadKindPlanet(bank.GetProperty("consequences")),
                Str(bank.GetProperty("holds")));
        }
        foreach (var c in root.GetProperty("quietHeadlines").EnumerateObject())
            banks._quietHeadlines[CultureIds.FromId(c.Name)] = Str(c.Value);
        foreach (var c in root.GetProperty("quietLines").EnumerateObject())
            banks._quietLines[CultureIds.FromId(c.Name)] = Str(c.Value);
        foreach (var c in root.GetProperty("deityDomains").EnumerateObject())
            foreach (var p in c.Value.EnumerateObject())
                banks._domains[(CultureIds.FromId(c.Name), PlanetInfo.FromId(p.Name))] = Str(p.Value);

        banks.AssertComplete();
        return banks;
    }

    private void AssertComplete()
    {
        var missing = new List<string>();
        var fast = new[] { Planet.Moon, Planet.Sun, Planet.Mercury, Planet.Venus, Planet.Mars };
        if (FastOrder.Count != fast.Length || fast.Any(p => !FastOrder.Contains(p))) missing.Add("fast order");
        if (TightOrb <= 0) missing.Add("tight orb");

        foreach (var culture in CultureIds.Order)
        {
            if (_decrees.TryGetValue(culture, out var bank))
            {
                foreach (var kind in AspectKinds.Order)
                {
                    foreach (var planet in fast)
                        if (!bank.Headlines.ContainsKey((kind, planet))) missing.Add($"headline {culture}/{kind}/{planet}");
                    foreach (var planet in PlanetInfo.Order)
                        if (planet != Planet.Moon && !bank.Consequences.ContainsKey((kind, planet)))
                            missing.Add($"consequence {culture}/{kind}/{planet}");
                    if (!bank.Relations.TryGetValue(kind, out var relations) || relations.Count != 3)
                        missing.Add($"relations {culture}/{kind}");
                }
                if (bank.TightTails.Count != 3) missing.Add($"tight tails {culture}");
                if (bank.Holds.Length == 0) missing.Add($"holds {culture}");
            }
            else
            {
                missing.Add($"decree {culture}");
            }
            if (!_quietHeadlines.ContainsKey(culture)) missing.Add($"quiet headline {culture}");
            if (!_quietLines.ContainsKey(culture)) missing.Add($"quiet line {culture}");
            foreach (var planet in PlanetInfo.Order)
                if (!_domains.ContainsKey((culture, planet))) missing.Add($"domain {culture}/{planet}");
        }

        if (missing.Count > 0)
            throw new InvalidOperationException(
                $"day-banks.json is incomplete ({missing.Count} cells): {string.Join(", ", missing)}");
    }

    private static IReadOnlyDictionary<(AspectKind, Planet), string> ReadKindPlanet(JsonElement element)
    {
        var into = new Dictionary<(AspectKind, Planet), string>();
        foreach (var k in element.EnumerateObject())
            foreach (var p in k.Value.EnumerateObject())
                into[(AspectKinds.FromId(k.Name), PlanetInfo.FromId(p.Name))] = Str(p.Value);
        return into;
    }

    private static string Str(JsonElement element)
        => element.GetString() ?? throw new InvalidOperationException("Null string in day-banks.json.");
}
