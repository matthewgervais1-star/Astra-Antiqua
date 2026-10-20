namespace AstraAntiqua.Core.Model;

/// <summary>What a culture's doorway prints under its name (shared/content/cultures.json).</summary>
public sealed record CultureCopy(Culture Culture, string Label, string Tagline, string Subtitle);

/// <summary>A body's printed name and glyph (shared/content/cultures.json).</summary>
public sealed record PlanetCopy(Planet Planet, string Label, string Symbol, bool Received);

/// <summary>
/// One city of the offline birthplace list (shared/content/cities.json). The
/// zone is resolved at export time by the same tz-lookup web uses at runtime,
/// so a birth picked from this list resolves to UTC without a network.
/// </summary>
public sealed record City(
    string Name,
    string Country,
    double Latitude,
    double Longitude,
    bool Popular,
    string TimeZone);

/// <summary>One culture's flat ground and muted accent (web data/palettes.ts).</summary>
public sealed record Palette(string Ground, string Accent);

/// <summary>One section of the method page (web data/methodologyContent.ts).</summary>
public sealed record MethodSection(string Heading, IReadOnlyList<string> Paragraphs);

/// <summary>A note on how one tradition was read (web data/methodologyContent.ts).</summary>
public sealed record InterpretiveNote(
    string Id,
    IReadOnlyList<Culture> Cultures,
    string Title,
    string Body);

/// <summary>A source the method page cites (web data/methodologyContent.ts).</summary>
public sealed record SourceReference(string Author, string Title, string Detail);

/// <summary>The method page as data.</summary>
public sealed record MethodContent(
    IReadOnlyList<MethodSection> Sections,
    IReadOnlyList<InterpretiveNote> Notes,
    IReadOnlyList<SourceReference> Sources);

public static class AspectKinds
{
    /// <summary>Canonical order, the documented orb table's.</summary>
    public static readonly IReadOnlyList<AspectKind> Order = new[]
    {
        AspectKind.Conjunction, AspectKind.Sextile, AspectKind.Square,
        AspectKind.Trine, AspectKind.Opposition,
    };

    /// <summary>The web-canonical lowercase id ("conjunction" … "opposition").</summary>
    public static string Id(AspectKind kind) => kind switch
    {
        AspectKind.Conjunction => "conjunction",
        AspectKind.Sextile => "sextile",
        AspectKind.Square => "square",
        AspectKind.Trine => "trine",
        AspectKind.Opposition => "opposition",
        _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, null),
    };

    public static AspectKind FromId(string id) => id switch
    {
        "conjunction" => AspectKind.Conjunction,
        "sextile" => AspectKind.Sextile,
        "square" => AspectKind.Square,
        "trine" => AspectKind.Trine,
        "opposition" => AspectKind.Opposition,
        _ => throw new ArgumentException($"Unknown aspect kind: '{id}'", nameof(id)),
    };

    /// <summary>The exact angle of each kind.</summary>
    public static double Angle(AspectKind kind) => kind switch
    {
        AspectKind.Conjunction => 0,
        AspectKind.Sextile => 60,
        AspectKind.Square => 90,
        AspectKind.Trine => 120,
        AspectKind.Opposition => 180,
        _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, null),
    };

    /// <summary>Trine and sextile read soft; square and opposition hard.</summary>
    public static bool IsHard(AspectKind kind) => kind is AspectKind.Square or AspectKind.Opposition;

    public static bool IsSoft(AspectKind kind) => kind is AspectKind.Trine or AspectKind.Sextile;
}

public enum GlyphStatus { Attested, Composed, Invented }

/// <summary>One drawn stroke or fill of a glyph, on the 24-unit grid it was drawn on.</summary>
public sealed record GlyphPath(
    string Data,
    bool Fill,
    bool Stroke,
    double StrokeWidth,
    string LineCap,
    string LineJoin);

/// <summary>
/// The glyph a culture draws for a body (docs/design/system/assets/glyphs),
/// with the honesty status the research settled. Nothing may present a
/// composed or invented mark as attested.
/// </summary>
public sealed record DeityGlyph(
    Culture Culture,
    Planet Planet,
    string Deity,
    GlyphStatus Status,
    IReadOnlyList<GlyphPath> Paths);

/// <summary>One block of a Learn section: "head", "divider", "heading" or "para".</summary>
public sealed record LearnBlock(string Kind, string Text, string? Kicker);

/// <summary>
/// One of the seven Learn sections, read out of web's pages by
/// web/scripts/gen-android-learn.mjs. <see cref="Table"/> names the reference
/// table the section renders after its prose, if any.
/// </summary>
public sealed record LearnSection(int N, string Title, string Href, string Blurb, string? Table, IReadOnlyList<LearnBlock> Blocks);

public sealed record PlanetVerb(string Symbol, string Name, string Verb);

public sealed record HouseSystem(string Name, string Age, string Body, bool Ours);

/// <summary>The Learn sections and the tables they render.</summary>
public sealed record LearnContent(
    IReadOnlyList<LearnSection> Sections,
    IReadOnlyList<PlanetVerb> PlanetVerbs,
    IReadOnlyList<HouseSystem> HouseSystems,
    IReadOnlyDictionary<(Culture, AspectKind), string> AspectRulings,
    IReadOnlyDictionary<AspectKind, string> AspectGeometry);
