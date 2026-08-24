namespace AstraAntiqua.Core.Model;

/// <summary>The five ancient cultures. Ids mirror web's lowercase strings.</summary>
public enum Culture
{
    Egypt,
    Greece,
    Canaan,
    Carthage,
    Rome,
}

/// <summary>
/// The ten bodies: the classical seven plus Uranus, Neptune, and Pluto as
/// received bodies (see shared-content-model.md). Order is canonical and
/// drives both chart iteration and aspect-pair emission.
/// </summary>
public enum Planet
{
    Sun,
    Moon,
    Mercury,
    Venus,
    Mars,
    Jupiter,
    Saturn,
    Uranus,
    Neptune,
    Pluto,
}

/// <summary>The twelve signs, in zodiacal order from 0° Aries.</summary>
public enum ZodiacSign
{
    Aries,
    Taurus,
    Gemini,
    Cancer,
    Leo,
    Virgo,
    Libra,
    Scorpio,
    Sagittarius,
    Capricorn,
    Aquarius,
    Pisces,
}

/// <summary>The five aspect kinds, in the documented orb-table order.</summary>
public enum AspectKind
{
    Conjunction,
    Sextile,
    Square,
    Trine,
    Opposition,
}

public static class PlanetInfo
{
    /// <summary>Canonical planet order (web's PLANETS array).</summary>
    public static readonly IReadOnlyList<Planet> Order = new[]
    {
        Planet.Sun, Planet.Moon, Planet.Mercury, Planet.Venus, Planet.Mars,
        Planet.Jupiter, Planet.Saturn, Planet.Uranus, Planet.Neptune, Planet.Pluto,
    };

    /// <summary>Web's RECEIVED_BODIES: the three modern bodies each culture
    /// receives into its own mythic register.</summary>
    public static bool IsReceived(Planet planet)
        => planet is Planet.Uranus or Planet.Neptune or Planet.Pluto;

    /// <summary>The web-canonical lowercase id ("sun" … "pluto").</summary>
    public static string Id(Planet planet) => planet switch
    {
        Planet.Sun => "sun",
        Planet.Moon => "moon",
        Planet.Mercury => "mercury",
        Planet.Venus => "venus",
        Planet.Mars => "mars",
        Planet.Jupiter => "jupiter",
        Planet.Saturn => "saturn",
        Planet.Uranus => "uranus",
        Planet.Neptune => "neptune",
        Planet.Pluto => "pluto",
        _ => throw new ArgumentOutOfRangeException(nameof(planet), planet, null),
    };

    public static Planet FromId(string id) => id switch
    {
        "sun" => Planet.Sun,
        "moon" => Planet.Moon,
        "mercury" => Planet.Mercury,
        "venus" => Planet.Venus,
        "mars" => Planet.Mars,
        "jupiter" => Planet.Jupiter,
        "saturn" => Planet.Saturn,
        "uranus" => Planet.Uranus,
        "neptune" => Planet.Neptune,
        "pluto" => Planet.Pluto,
        _ => throw new ArgumentException($"Unknown planet id: '{id}'", nameof(id)),
    };
}

public static class CultureIds
{
    /// <summary>The web-canonical lowercase id ("egypt" … "rome").</summary>
    public static string Id(Culture culture) => culture switch
    {
        Culture.Egypt => "egypt",
        Culture.Greece => "greece",
        Culture.Canaan => "canaan",
        Culture.Carthage => "carthage",
        Culture.Rome => "rome",
        _ => throw new ArgumentOutOfRangeException(nameof(culture), culture, null),
    };

    public static Culture FromId(string id) => id switch
    {
        "egypt" => Culture.Egypt,
        "greece" => Culture.Greece,
        "canaan" => Culture.Canaan,
        "carthage" => Culture.Carthage,
        "rome" => Culture.Rome,
        _ => throw new ArgumentException($"Unknown culture id: '{id}'", nameof(id)),
    };
}

public static class ZodiacSigns
{
    /// <summary>Parses web's capitalized sign name ("Aries" … "Pisces").</summary>
    public static ZodiacSign FromName(string name)
        => Enum.TryParse<ZodiacSign>(name, ignoreCase: false, out var sign)
            ? sign
            : throw new ArgumentException($"Unknown zodiac sign: '{name}'", nameof(name));
}
