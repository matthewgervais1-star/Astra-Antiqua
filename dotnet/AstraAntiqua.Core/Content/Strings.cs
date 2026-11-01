using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Content;

/// <summary>
/// The shared strings catalog, read from shared/strings/en.json (embedded at
/// build time; web/scripts/export-strings.mjs writes it from web/src/strings).
/// A key is "screen.slot"; a value is one string, or one string per culture.
/// Every per-culture value must carry all five cultures: the load throws
/// otherwise, listing each gap, because there is no fallback string. A
/// missing key or an unfilled slot throws at lookup, so a screen never prints
/// a raw key or brace. The catalog stores the case the reader sees; callers
/// never transform it.
/// </summary>
public sealed class Strings
{
    private static readonly Regex SlotPattern = new(@"\{([A-Za-z][A-Za-z0-9]*)\}", RegexOptions.CultureInvariant);

    private static readonly Culture[] AllCultures = (Culture[])Enum.GetValues(typeof(Culture));

    private readonly IReadOnlyDictionary<string, string> _plain;
    private readonly IReadOnlyDictionary<string, IReadOnlyDictionary<Culture, string>> _perCulture;

    /// <summary>Every key, in the order the catalog file lists them.</summary>
    public IReadOnlyList<string> Keys { get; }

    private Strings(
        IReadOnlyList<string> keys,
        IReadOnlyDictionary<string, string> plain,
        IReadOnlyDictionary<string, IReadOnlyDictionary<Culture, string>> perCulture)
    {
        Keys = keys;
        _plain = plain;
        _perCulture = perCulture;
    }

    /// <summary>True when the key carries one string per culture.</summary>
    public bool IsPerCulture(string key) => _perCulture.ContainsKey(key);

    /// <summary>True when the catalog holds the key.</summary>
    public bool Contains(string key) => _plain.ContainsKey(key) || _perCulture.ContainsKey(key);

    /// <summary>The raw template for the key in the culture, slots unfilled. Throws on a missing key.</summary>
    public string Template(string key, Culture culture)
    {
        if (_plain.TryGetValue(key, out var plain)) return plain;
        if (_perCulture.TryGetValue(key, out var byCulture)) return byCulture[culture];
        throw new KeyNotFoundException($"Shared strings: no key '{key}' in shared/strings/en.json.");
    }

    /// <summary>
    /// The printed string for the key in the culture, each {slot} filled from
    /// <paramref name="slots"/>. A slot the template names and the map leaves
    /// out throws, as web's str() does.
    /// </summary>
    public string Get(string key, Culture culture, IReadOnlyDictionary<string, string>? slots = null)
    {
        var template = Template(key, culture);
        return SlotPattern.Replace(template, match =>
        {
            var name = match.Groups[1].Value;
            if (slots is not null && slots.TryGetValue(name, out var value)) return value;
            throw new ArgumentException($"Shared strings: {key} needs slot {{{name}}}.", nameof(slots));
        });
    }

    /// <summary>The slot names a template uses, in order of first appearance.</summary>
    public static IReadOnlyList<string> SlotNames(string template)
    {
        var names = new List<string>();
        foreach (Match match in SlotPattern.Matches(template))
        {
            var name = match.Groups[1].Value;
            if (!names.Contains(name)) names.Add(name);
        }
        return names;
    }

    /// <summary>Parses a catalog file. Throws, listing every gap, when a per-culture value lacks a culture.</summary>
    public static Strings Parse(string json)
    {
        using var doc = JsonDocument.Parse(json);
        return FromDocument(doc);
    }

    internal static Strings Load()
    {
        using var doc = ReadResource("AstraAntiqua.Core.Strings.en.json");
        return FromDocument(doc);
    }

    private static Strings FromDocument(JsonDocument doc)
    {
        var keys = new List<string>();
        var plain = new Dictionary<string, string>(StringComparer.Ordinal);
        var perCulture = new Dictionary<string, IReadOnlyDictionary<Culture, string>>(StringComparer.Ordinal);
        var problems = new List<string>();

        foreach (var prop in doc.RootElement.EnumerateObject())
        {
            keys.Add(prop.Name);
            switch (prop.Value.ValueKind)
            {
                case JsonValueKind.String:
                    plain[prop.Name] = prop.Value.GetString() ?? "";
                    break;
                case JsonValueKind.Object:
                    var byCulture = new Dictionary<Culture, string>();
                    foreach (var entry in prop.Value.EnumerateObject())
                    {
                        Culture culture;
                        try
                        {
                            culture = CultureIds.FromId(entry.Name);
                        }
                        catch (ArgumentException)
                        {
                            problems.Add($"{prop.Name} names an unknown culture '{entry.Name}'");
                            continue;
                        }
                        if (entry.Value.ValueKind != JsonValueKind.String)
                        {
                            problems.Add($"{prop.Name}.{entry.Name} is not a string");
                            continue;
                        }
                        byCulture[culture] = entry.Value.GetString() ?? "";
                    }
                    foreach (var culture in AllCultures)
                        if (!byCulture.ContainsKey(culture))
                            problems.Add($"{prop.Name} lacks {CultureIds.Id(culture)}");
                    perCulture[prop.Name] = byCulture;
                    break;
                default:
                    problems.Add($"{prop.Name} is neither a string nor a per-culture object");
                    break;
            }
        }

        if (problems.Count > 0)
            throw new InvalidOperationException(
                $"Shared strings are incomplete ({problems.Count}): {string.Join(", ", problems)}");
        return new Strings(keys, plain, perCulture);
    }

    internal static JsonDocument ReadResource(string resourceName)
    {
        var assembly = typeof(Strings).GetTypeInfo().Assembly;
        using var stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException(
                $"Embedded resource '{resourceName}' not found. Available: " +
                string.Join(", ", assembly.GetManifestResourceNames()));
        using var reader = new StreamReader(stream, Encoding.UTF8);
        return JsonDocument.Parse(reader.ReadToEnd());
    }
}
