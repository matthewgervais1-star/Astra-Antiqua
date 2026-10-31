using AstraAntiqua.Core.Astronomy;
using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Reading;

/// <summary>
/// The pieces of web's lib/decree.ts the week reads: which body headlines a
/// figure, the headline, the meaning sentence and the consequence sentence.
/// The UTC day number picks among each bank's three variants.
/// </summary>
public static class Decree
{
    /// <summary>The UTC day number of an instant (epoch milliseconds over one day, floored).</summary>
    public static long UtcDayNumber(DateTime utc)
        => (long)Math.Floor(Instant.ToMs(utc) / Instant.MsPerDay);

    /// <summary>Which of a bank's three variants a day uses; the remainder is made non-negative.</summary>
    public static int Variant(long day) => (int)(((day % 3) + 3) % 3);

    /// <summary>
    /// The headline body of a figure (its fast body, the faster when both are
    /// fast) and the partner. Null when neither body is fast.
    /// </summary>
    public static (Planet Body, Planet Partner)? HeadlineBody(Planet a, Planet b, ContentStore store)
    {
        foreach (var fast in store.Day.FastOrder)
        {
            if (a == fast) return (fast, b);
            if (b == fast) return (fast, a);
        }
        return null;
    }

    /// <summary>The unpunctuated meaning clause: two domains and the day's relation.</summary>
    public static string MeaningClause(Culture culture, Planet a, Planet b, AspectKind kind, long day, ContentStore store)
    {
        var banks = store.Day;
        var relation = banks.GetDecree(culture).Relations[kind][Variant(day)];
        return $"{banks.Domain(culture, a)} and {banks.Domain(culture, b)} {relation}";
    }

    /// <summary>Sentence one: the meaning, with the tight tail under half a degree.</summary>
    public static string Meaning(Culture culture, Planet a, Planet b, AspectKind kind, double orb, long day, ContentStore store)
    {
        var tail = orb < store.Day.TightOrb ? store.Day.GetDecree(culture).TightTails[Variant(day)] : "";
        return $"{ReadingBanks.Cap(MeaningClause(culture, a, b, kind, day, store))}{tail}.";
    }

    /// <summary>Sentence two: the consequence, keyed by kind and partner body.</summary>
    public static string Consequence(Culture culture, Planet a, Planet b, AspectKind kind, ContentStore store)
    {
        var partner = HeadlineBody(a, b, store)!.Value.Partner;
        return store.Day.GetDecree(culture).Consequences[(kind, partner)];
    }

    /// <summary>The headline for a figure, keyed by culture, kind and headline body.</summary>
    public static string Headline(Culture culture, Planet a, Planet b, AspectKind kind, ContentStore store)
    {
        var body = HeadlineBody(a, b, store)!.Value.Body;
        return store.Day.GetDecree(culture).Headlines[(kind, body)];
    }
}
