using System.Text;

namespace AstraAntiqua.Core.Reading;

/// <summary>
/// Port of web/src/components/horizons/format.ts: the small date and word
/// helpers the horizon readings print with.
/// </summary>
public static class Format
{
    private static readonly string[] WeekdayAbbr = { "SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT" };

    private static readonly string[] MonthAbbr =
        { "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC" };

    private static readonly (int Amount, string Symbol)[] Roman =
    {
        (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
        (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
    };

    /// <summary>"MON" for a local calendar date.</summary>
    public static string Weekday(DateTime local) => WeekdayAbbr[(int)local.DayOfWeek];

    public static string Month(DateTime local) => MonthAbbr[local.Month - 1];

    /// <summary>"23 JUL"</summary>
    public static string DayMonth(DateTime local) => $"{local.Day} {Month(local)}";

    /// <summary>"MAY 2027"</summary>
    public static string MonthYear(DateTime local) => $"{Month(local)} {local.Year}";

    /// <summary>Joins two formatted strings with the house en dash (never an em dash).</summary>
    public static string EnDashRange(string a, string b) => $"{a} – {b}";

    public static string ToRoman(double value)
    {
        var n = Math.Max(1, (int)Math.Round(value, MidpointRounding.AwayFromZero));
        var output = new StringBuilder();
        foreach (var (amount, symbol) in Roman)
        {
            while (n >= amount)
            {
                output.Append(symbol);
                n -= amount;
            }
        }
        return output.ToString();
    }

    /// <summary>"WATER-BEARER" becomes "Water-Bearer", for dropping a capitals label into prose.</summary>
    public static string ProperCase(string s)
    {
        var lower = s.ToLowerInvariant();
        var output = new StringBuilder(lower.Length);
        var startOfPart = true;
        foreach (var ch in lower)
        {
            if (char.IsWhiteSpace(ch) || ch == '-')
            {
                output.Append(ch);
                startOfPart = true;
                continue;
            }
            output.Append(startOfPart ? char.ToUpperInvariant(ch) : ch);
            startOfPart = false;
        }
        return output.ToString();
    }

    /// <summary>"12°34′" for a degree within a sign.</summary>
    public static string Degree(double degreeInSign)
    {
        var whole = (int)Math.Floor(degreeInSign);
        var minutes = (int)Math.Floor((degreeInSign - whole) * 60);
        return $"{whole}°{minutes:00}′";
    }
}
