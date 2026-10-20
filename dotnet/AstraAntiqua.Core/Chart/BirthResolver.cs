namespace AstraAntiqua.Core.Chart;

/// <summary>A birth as a person states it: wall-clock date and time, and where.</summary>
public sealed record BirthInput(
    int Year,
    int Month,
    int Day,
    int Hour,
    int Minute,
    double Latitude,
    double Longitude);

/// <summary>The birth as an instant, with the zone and offset that produced it.</summary>
public sealed record ResolvedBirth(DateTime Utc, string TimeZone, int OffsetMinutes);

/// <summary>
/// Port of resolveBirth in web/src/lib/birthDateTime.ts. Web finds the zone
/// from the coordinates with tz-lookup; this surface is handed the zone (from
/// the offline city list, which carries tz-lookup's answer, or from the
/// platform's geocoder) and applies web's two-pass offset rule, so a birth in
/// the hour a clock springs forward resolves to the instant web gives it.
/// </summary>
public static class BirthResolver
{
    public static ResolvedBirth Resolve(BirthInput input, TimeZoneInfo zone)
    {
        var naive = new DateTime(input.Year, input.Month, input.Day, input.Hour, input.Minute, 0, DateTimeKind.Utc);

        // First pass: read the wall clock as if it were UTC and take the
        // zone's offset at that moment. Second pass: if a DST boundary sits
        // between, the offset at the first candidate is the one that holds.
        var offset1 = OffsetMinutes(naive, zone);
        var candidate = naive.AddMinutes(-offset1);
        var offset2 = OffsetMinutes(candidate, zone);
        var utc = naive.AddMinutes(-offset2);
        return new ResolvedBirth(utc, zone.Id, (int)Math.Round(offset2));
    }

    /// <summary>Looks a zone up by IANA id, the form the city list and web use.</summary>
    public static TimeZoneInfo FindZone(string ianaId)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(ianaId);
        }
        catch (TimeZoneNotFoundException)
        {
#if NET6_0_OR_GREATER
            if (TimeZoneInfo.TryConvertIanaIdToWindowsId(ianaId, out var windowsId))
                return TimeZoneInfo.FindSystemTimeZoneById(windowsId);
#endif
            throw;
        }
    }

    /// <summary>
    /// A standard-time zone estimated from longitude alone, for a birthplace
    /// whose real zone could not be found: round(longitude / 15) hours, which
    /// is right for most of the globe and never reflects daylight saving.
    /// The same stand-in Android uses (domain/BirthInstant.kt).
    /// </summary>
    public static TimeZoneInfo EstimateZoneForLongitude(double longitude)
    {
        var clamped = Math.Max(-180, Math.Min(180, longitude));
        var hours = (int)Math.Max(-12, Math.Min(14, Math.Round(clamped / 15.0, MidpointRounding.AwayFromZero)));
        var id = hours == 0 ? "Etc/GMT" : $"Etc/GMT{(hours > 0 ? "-" : "+")}{Math.Abs(hours)}";
        var name = $"UTC{(hours >= 0 ? "+" : "-")}{Math.Abs(hours):00}:00 (estimated from longitude)";
        return TimeZoneInfo.CreateCustomTimeZone(id, TimeSpan.FromHours(hours), name, name);
    }

    /// <summary>"UTC+05:30" (web's formatOffset).</summary>
    public static string FormatOffset(int offsetMinutes)
    {
        var sign = offsetMinutes >= 0 ? "+" : "-";
        var abs = Math.Abs(offsetMinutes);
        return $"UTC{sign}{abs / 60:00}:{abs % 60:00}";
    }

    private static double OffsetMinutes(DateTime utc, TimeZoneInfo zone)
        => zone.GetUtcOffset(DateTime.SpecifyKind(utc, DateTimeKind.Utc)).TotalMinutes;
}
