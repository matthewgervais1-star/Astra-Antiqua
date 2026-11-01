using System.Globalization;
using System.Text.Json;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Content;

/// <summary>
/// The C# port of web's fmt() (web/src/strings/formats.ts), the format rules
/// F1 to F14 of docs/design/shared-strings-table-2026-11.md. The rule names
/// and every word list (months, weekdays, counts, ordinals, signs, planets,
/// tones, separators) come from shared/strings/formats.json, embedded at
/// build time; the code here holds only the patterns. FormatsTests pins the
/// output to shared/goldens/formats.json.
///
/// Zone rule: a date format reads the calendar day in the zone the caller
/// names. "UTC" reads the UTC day (the Day screen); "local" reads the
/// runtime's own zone; any other value is an IANA zone ("Europe/Rome"),
/// resolved by TimeZoneInfo (IANA ids need .NET 6 or later at run time).
/// Formats that take no date ignore the zone.
///
/// Rounding follows JavaScript's Math.round (half up), never banker's rounding.
/// </summary>
public sealed class Formats
{
    private readonly IReadOnlyList<string> _monthAbbr;
    private readonly IReadOnlyList<string> _weekdayAbbr;
    private readonly IReadOnlyList<string> _countWords;
    private readonly IReadOnlyList<string> _ordinalWords;
    private readonly IReadOnlyDictionary<string, string> _signFull;
    private readonly IReadOnlyDictionary<string, string> _signAbbr;
    private readonly IReadOnlyDictionary<string, string> _signPhrases;
    private readonly IReadOnlyDictionary<string, string> _planetNames;
    private readonly IReadOnlyDictionary<string, string> _toneWords;
    private readonly IReadOnlyDictionary<string, string> _spanToneWords;
    private readonly string _retrogradeMark;
    private readonly Dictionary<string, TimeZoneInfo> _zones = new(StringComparer.Ordinal);

    /// <summary>The named formats formats.json lists ("date.day", "range.days", ...).</summary>
    public IReadOnlyList<string> Names { get; }

    /// <summary>F13: the middle dot with one space each side.</summary>
    public string Dot { get; }

    /// <summary>F13: the spaced arrow between dates.</summary>
    public string Arrow { get; }

    private Formats(JsonElement root)
    {
        Names = root.GetProperty("rules").EnumerateObject().Select(p => p.Name).ToList();
        var separators = root.GetProperty("separators");
        Dot = Text(separators, "dot");
        Arrow = Text(separators, "arrow");

        var words = root.GetProperty("words");
        _monthAbbr = List(words, "monthAbbr", 12);
        _weekdayAbbr = List(words, "weekdayAbbr", 7);
        _countWords = List(words, "countWords", 13);
        _ordinalWords = List(words, "ordinalWords", 13);
        var signNames = ((ZodiacSign[])Enum.GetValues(typeof(ZodiacSign))).Select(s => s.ToString()).ToList();
        var planetIds = PlanetInfo.Order.Select(PlanetInfo.Id).ToList();
        _signFull = Map(words, "signFull", signNames);
        _signAbbr = Map(words, "signAbbr", signNames);
        _signPhrases = Map(words, "signPhrases", signNames);
        _planetNames = Map(words, "planetNames", planetIds);
        _toneWords = Map(words, "toneWords", new[] { "conjunction", "sextile", "trine", "square", "opposition" });
        _spanToneWords = Map(words, "spanToneWords", new[] { "ease", "tension" });
        _retrogradeMark = Text(words, "retrogradeMark");
    }

    internal static Formats Load()
    {
        using var doc = Strings.ReadResource("AstraAntiqua.Core.Strings.formats.json");
        return new Formats(doc.RootElement);
    }

    /// <summary>
    /// Formats <paramref name="value"/> under the named rule, as web's fmt()
    /// does. Dates take a DateTimeOffset (or a UTC DateTime); ranges take a
    /// (DateTimeOffset, DateTimeOffset) tuple; numbers take any numeric type;
    /// signs take a ZodiacSign or web's name ("Capricorn"); planets a Planet
    /// or its id ("mercury"); tones an AspectKind or its id; motion a bool.
    /// </summary>
    public string Format(string name, object value, string zone = "UTC") => name switch
    {
        "date.day" => DateDay(Instant(value), zone),
        "date.dayMonth" => DateDayMonth(Instant(value), zone),
        "date.dayMonthYear" => DateDayMonthYear(Instant(value), zone),
        "date.monthYear" => DateMonthYear(Instant(value), zone),
        "date.weekday" => DateWeekday(Instant(value), zone),
        "date.dayOfMonth" => DateDayOfMonth(Instant(value), zone),
        "date.year" => DateYear(Instant(value), zone),
        "time.hm" => TimeHm(Instant(value), zone),
        "range.days" => RangeDays(Range(value).From, Range(value).To, zone),
        "range.months" => RangeMonths(Range(value).From, Range(value).To, zone),
        "angle.degMin" => AngleDegMin(Number(value)),
        "angle.orbDecimal" => AngleOrbDecimal(Number(value)),
        "percent" => Percent(Number(value)),
        "count.word" => CountWord(Number(value)),
        "count.digits" => CountDigits(Number(value)),
        "ordinal.word" => OrdinalWord(Number(value)),
        "ordinal.wordUpper" => OrdinalWordUpper(Number(value)),
        "ordinal.wordTitle" => OrdinalWordTitle(Number(value)),
        "house.roman" => Roman(Number(value)),
        "year.roman" => Roman(Number(value)),
        "sign.full" => Lookup(_signFull, SignName(value), name),
        "sign.abbr" => Lookup(_signAbbr, SignName(value), name),
        "sign.phrase" => Lookup(_signPhrases, SignName(value), name),
        "planet.name" => Lookup(_planetNames, PlanetId(value), name),
        "tone.word" => Lookup(_toneWords, AspectId(value), name),
        "motion.mark" => MotionMark(value is bool b ? b : throw new ArgumentException($"{name} takes a bool.", nameof(value))),
        _ => throw new ArgumentException($"Unknown format '{name}'.", nameof(name)),
    };

    // ---- Dates (F1 to F4) ----

    /// <summary>F1 date.day: "WED 21 OCT 2026".</summary>
    public string DateDay(DateTimeOffset instant, string zone)
    {
        var p = Parts(instant, zone);
        return $"{_weekdayAbbr[(int)p.DayOfWeek]} {p.Day} {_monthAbbr[p.Month - 1]} {p.Year}";
    }

    /// <summary>F3 date.dayMonth: "23 SEP".</summary>
    public string DateDayMonth(DateTimeOffset instant, string zone)
    {
        var p = Parts(instant, zone);
        return $"{p.Day} {_monthAbbr[p.Month - 1]}";
    }

    /// <summary>F3 date.dayMonthYear: "26 OCT 2026".</summary>
    public string DateDayMonthYear(DateTimeOffset instant, string zone)
    {
        var p = Parts(instant, zone);
        return $"{p.Day} {_monthAbbr[p.Month - 1]} {p.Year}";
    }

    /// <summary>F3 date.monthYear: "JUN 2027".</summary>
    public string DateMonthYear(DateTimeOffset instant, string zone)
    {
        var p = Parts(instant, zone);
        return $"{_monthAbbr[p.Month - 1]} {p.Year}";
    }

    /// <summary>F1 date.weekday: "MON".</summary>
    public string DateWeekday(DateTimeOffset instant, string zone) => _weekdayAbbr[(int)Parts(instant, zone).DayOfWeek];

    /// <summary>F3 date.dayOfMonth: "19".</summary>
    public string DateDayOfMonth(DateTimeOffset instant, string zone)
        => Parts(instant, zone).Day.ToString(CultureInfo.InvariantCulture);

    /// <summary>F3 date.year: "2026".</summary>
    public string DateYear(DateTimeOffset instant, string zone)
        => Parts(instant, zone).Year.ToString(CultureInfo.InvariantCulture);

    /// <summary>F3 time.hm: "05:30", 24 hour.</summary>
    public string TimeHm(DateTimeOffset instant, string zone)
    {
        var p = Parts(instant, zone);
        return $"{p.Hour:00}:{p.Minute:00}";
    }

    /// <summary>
    /// F2 range.days, the three shapes: "19 → 25 OCT 2026" in one month,
    /// "29 SEP → 5 OCT 2026" across months, "28 DEC 2026 → 3 JAN 2027" across
    /// years. Days are counted in the zone.
    /// </summary>
    public string RangeDays(DateTimeOffset from, DateTimeOffset to, string zone)
    {
        var a = Parts(from, zone);
        var b = Parts(to, zone);
        if (a.Year != b.Year)
            return $"{a.Day} {_monthAbbr[a.Month - 1]} {a.Year}{Arrow}{b.Day} {_monthAbbr[b.Month - 1]} {b.Year}";
        if (a.Month != b.Month)
            return $"{a.Day} {_monthAbbr[a.Month - 1]}{Arrow}{b.Day} {_monthAbbr[b.Month - 1]} {b.Year}";
        return $"{a.Day}{Arrow}{b.Day} {_monthAbbr[b.Month - 1]} {b.Year}";
    }

    /// <summary>F4 range.months: "OCT 2026 → JUN 2027".</summary>
    public string RangeMonths(DateTimeOffset from, DateTimeOffset to, string zone)
    {
        var a = Parts(from, zone);
        var b = Parts(to, zone);
        return $"{_monthAbbr[a.Month - 1]} {a.Year}{Arrow}{_monthAbbr[b.Month - 1]} {b.Year}";
    }

    // ---- Numbers (F5 to F7, F12) ----

    /// <summary>
    /// F5 angle.degMin: degree unpadded, minutes two digits and rounded, "°"
    /// and "′" (U+2032). A degree-in-sign under 30 that rounds up to 30°00′
    /// prints 29°59′, so a body never reads as standing in the next sign.
    /// </summary>
    public string AngleDegMin(double degrees)
    {
        var v = Math.Max(0, degrees);
        var total = JsRound(v * 60);
        var deg = (long)Math.Floor(total / 60);
        var min = (long)(total - deg * 60);
        if (v < 30 && deg >= 30)
        {
            deg = 29;
            min = 59;
        }
        return $"{deg}°{min:00}′";
    }

    /// <summary>F6 angle.orbDecimal: one decimal with "°": "3.0°".</summary>
    public string AngleOrbDecimal(double degrees)
        => (JsRound(Math.Abs(degrees) * 10) / 10).ToString("0.0", CultureInfo.InvariantCulture) + "°";

    /// <summary>F6 percent: a 0 to 1 fraction as a whole percent, no space: "74%".</summary>
    public string Percent(double fraction) => Digits(JsRound(fraction * 100)) + "%";

    /// <summary>F7 count.word: NONE, ONE to TWELVE, digits above twelve.</summary>
    public string CountWord(double n)
    {
        var i = JsRound(n);
        return i >= 0 && i < _countWords.Count ? _countWords[(int)i] : Digits(i);
    }

    /// <summary>F7 count.digits: digits, for data lines.</summary>
    public string CountDigits(double n) => Digits(JsRound(n));

    /// <summary>F12 ordinal.word: "eleventh"; digits outside 1 to 12.</summary>
    public string OrdinalWord(double n)
    {
        var i = JsRound(n);
        return i >= 1 && i <= 12 ? _ordinalWords[(int)i] : Digits(i);
    }

    /// <summary>F12 ordinal.wordUpper: "SECOND".</summary>
    public string OrdinalWordUpper(double n) => OrdinalWord(n).ToUpperInvariant();

    /// <summary>F12 ordinal.wordTitle: "Eleventh".</summary>
    public string OrdinalWordTitle(double n)
    {
        var w = OrdinalWord(n);
        return w.Length == 0 ? w : char.ToUpperInvariant(w[0]) + w.Substring(1);
    }

    /// <summary>F12 house.roman and year.roman: "II", "XII", "MMXXVI".</summary>
    public string Roman(double value)
    {
        var n = (long)Math.Max(1, JsRound(value));
        var sb = new System.Text.StringBuilder();
        foreach (var (amount, symbol) in RomanTable)
        {
            while (n >= amount)
            {
                sb.Append(symbol);
                n -= amount;
            }
        }
        return sb.ToString();
    }

    // ---- Words (F8, F9, F11) ----

    /// <summary>F8 sign.full: "CAPRICORN".</summary>
    public string SignFull(ZodiacSign sign) => _signFull[sign.ToString()];

    /// <summary>F8 sign.abbr: "CAP" (web's desktop table only).</summary>
    public string SignAbbr(ZodiacSign sign) => _signAbbr[sign.ToString()];

    /// <summary>F8 sign.phrase: the sign's figure, "FISHES".</summary>
    public string SignPhrase(ZodiacSign sign) => _signPhrases[sign.ToString()];

    /// <summary>F8 planet.name: "MERCURY".</summary>
    public string PlanetName(Planet planet) => _planetNames[PlanetInfo.Id(planet)];

    /// <summary>F9 tone.word: EASE, TENSION or UNION for an aspect kind.</summary>
    public string ToneWord(AspectKind kind) => _toneWords[AspectId(kind)];

    /// <summary>F9: a span's tone word ("ease" or "tension").</summary>
    public string SpanToneWord(string tone) => Lookup(_spanToneWords, tone, "spanToneWords");

    /// <summary>F11 motion.mark: "R" when retrograde, nothing when direct.</summary>
    public string MotionMark(bool retrograde) => retrograde ? _retrogradeMark : "";

    // ---- Helpers ----

    private static readonly (long Amount, string Symbol)[] RomanTable =
    {
        (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
        (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
    };

    /// <summary>JavaScript's Math.round: half rounds toward positive infinity.</summary>
    private static double JsRound(double x) => Math.Floor(x + 0.5);

    private static string Digits(double whole) => ((long)whole).ToString(CultureInfo.InvariantCulture);

    private DateTimeOffset Parts(DateTimeOffset instant, string zone)
    {
        if (zone == "UTC") return instant.ToUniversalTime();
        return TimeZoneInfo.ConvertTime(instant, Zone(zone));
    }

    private TimeZoneInfo Zone(string zone)
    {
        if (zone == "local") return TimeZoneInfo.Local;
        lock (_zones)
        {
            if (!_zones.TryGetValue(zone, out var tz))
            {
                tz = TimeZoneInfo.FindSystemTimeZoneById(zone);
                _zones[zone] = tz;
            }
            return tz;
        }
    }

    private static DateTimeOffset Instant(object value) => value switch
    {
        DateTimeOffset dto => dto,
        DateTime dt => new DateTimeOffset(DateTime.SpecifyKind(dt, dt.Kind == DateTimeKind.Unspecified ? DateTimeKind.Utc : dt.Kind)),
        _ => throw new ArgumentException($"A date format takes a DateTimeOffset, not {value?.GetType().Name ?? "null"}.", nameof(value)),
    };

    private static (DateTimeOffset From, DateTimeOffset To) Range(object value) => value switch
    {
        ValueTuple<DateTimeOffset, DateTimeOffset> t => (t.Item1, t.Item2),
        DateTimeOffset[] { Length: 2 } a => (a[0], a[1]),
        _ => throw new ArgumentException("A range format takes a (DateTimeOffset, DateTimeOffset) pair.", nameof(value)),
    };

    private static double Number(object value) => value switch
    {
        double d => d,
        float f => f,
        int i => i,
        long l => l,
        decimal m => (double)m,
        _ => throw new ArgumentException($"A number format takes a number, not {value?.GetType().Name ?? "null"}.", nameof(value)),
    };

    private static string SignName(object value) => value switch
    {
        ZodiacSign sign => sign.ToString(),
        string name => name,
        _ => throw new ArgumentException("A sign format takes a ZodiacSign or its name.", nameof(value)),
    };

    private static string PlanetId(object value) => value switch
    {
        Planet planet => PlanetInfo.Id(planet),
        string id => id,
        _ => throw new ArgumentException("planet.name takes a Planet or its id.", nameof(value)),
    };

    private static string AspectId(object value) => value switch
    {
        AspectKind kind => AspectId(kind),
        string id => id,
        _ => throw new ArgumentException("tone.word takes an AspectKind or its id.", nameof(value)),
    };

    private static string AspectId(AspectKind kind) => kind switch
    {
        AspectKind.Conjunction => "conjunction",
        AspectKind.Sextile => "sextile",
        AspectKind.Square => "square",
        AspectKind.Trine => "trine",
        AspectKind.Opposition => "opposition",
        _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, null),
    };

    private static string Lookup(IReadOnlyDictionary<string, string> map, string key, string name)
        => map.TryGetValue(key, out var word)
            ? word
            : throw new ArgumentException($"{name}: no word for '{key}' in shared/strings/formats.json.", nameof(key));

    private static string Text(JsonElement parent, string property)
        => parent.GetProperty(property).GetString()
           ?? throw new InvalidOperationException($"formats.json: '{property}' is null.");

    private static IReadOnlyList<string> List(JsonElement parent, string property, int count)
    {
        var list = parent.GetProperty(property).EnumerateArray().Select(e => e.GetString() ?? "").ToList();
        if (list.Count != count)
            throw new InvalidOperationException($"formats.json: {property} has {list.Count} entries, not {count}.");
        return list;
    }

    private static IReadOnlyDictionary<string, string> Map(JsonElement parent, string property, IEnumerable<string> required)
    {
        var map = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var p in parent.GetProperty(property).EnumerateObject())
            map[p.Name] = p.Value.GetString() ?? "";
        var missing = required.Where(k => !map.ContainsKey(k)).ToList();
        if (missing.Count > 0)
            throw new InvalidOperationException($"formats.json: {property} lacks {string.Join(", ", missing)}.");
        return map;
    }
}
