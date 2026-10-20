namespace AstraAntiqua.Core.Astronomy;

/// <summary>
/// Web's time arithmetic, reproduced. JavaScript holds an instant as a double
/// count of milliseconds since 1970 and truncates to a whole millisecond
/// whenever it builds a Date. The searches below bisect on those doubles and
/// evaluate the sky at the truncated instant, exactly as web's do, so a pass
/// found here lands on the millisecond web's lands on.
/// </summary>
public static class Instant
{
    public const double MsPerDay = 86_400_000.0;
    public const double MsPerHour = 3_600_000.0;

    private static readonly DateTime Epoch = new(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    /// <summary>Unix milliseconds of a UTC instant (sub-millisecond ticks dropped).</summary>
    public static double ToMs(DateTime utc)
        => Math.Floor((Ephemeris.AsUtc(utc) - Epoch).Ticks / 10_000.0);

    /// <summary>The Date JavaScript builds from a double: truncated toward zero.</summary>
    public static DateTime FromMs(double ms)
        => Epoch.AddTicks((long)Math.Truncate(ms) * 10_000);

    public static DateTime AddDays(DateTime utc, double days) => FromMs(ToMs(utc) + days * MsPerDay);
}
