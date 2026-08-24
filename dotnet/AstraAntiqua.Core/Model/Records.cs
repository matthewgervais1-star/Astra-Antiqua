namespace AstraAntiqua.Core.Model;

/// <summary>One deity: the cultural mask for a planet (web types/deity.ts).</summary>
public sealed record Deity(
    Planet Planet,
    Culture Culture,
    string Name,
    string Epithet,
    string Note,
    bool Contested);

/// <summary>One of the twelve houses (web data/houses.ts HouseMeaning).</summary>
public sealed record HouseMeaning(
    int House,
    string Ordinal,
    string Title,
    string Domain,
    string Arena);

/// <summary>Reference data for one sign (web data/zodiacSigns.ts ZodiacSignInfo).</summary>
public sealed record ZodiacSignRecord(
    ZodiacSign Sign,
    string Symbol,
    string Dates,
    string Element,
    string Modality,
    string Traits,
    string Blurb);

/// <summary>One row of the documented orb table (web ASPECT_RULES).</summary>
public sealed record AspectRule(AspectKind Kind, double Angle, double Orb);

/// <summary>A detected aspect between two bodies (web data/sampleChart.ts Aspect).
/// <paramref name="Orb"/> is the deviation from exactness, as on web.</summary>
public sealed record Aspect(
    Planet A,
    Planet B,
    AspectKind Kind,
    double ExactAngle,
    double Orb);
