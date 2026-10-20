using AstraAntiqua.Core.Astronomy;
using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Model;
using CosineKitty;

namespace AstraAntiqua.Core.Forecast;

/// <summary>
/// The zodiac season: the window during which the Sun transits one whole
/// sign, bounded by the exact solar ingresses either side.
/// </summary>
public sealed record SeasonWindow(
    ZodiacSign Sign,
    DateTime Start,
    DateTime End,
    int DayOfSeason,
    int TotalDays,
    int DaysRemaining);

/// <summary>The culture- and chart-independent beats of a season.</summary>
public sealed record SeasonSkyEvents(
    IReadOnlyList<MoonQuarterEvent> MoonQuarters,
    IReadOnlyList<EclipseEvent> Eclipses,
    IReadOnlyList<StationEvent> Stations,
    IReadOnlyList<IngressEvent> Ingresses);

/// <summary>Port of getCurrentSeason and getSeasonSkyEvents in web/src/lib/season.ts.</summary>
public static class Season
{
    /// <summary>Over a season these are the bodies whose sign changes are worth naming.</summary>
    public static readonly IReadOnlyList<Planet> IngressPlanets = new[] { Planet.Mercury, Planet.Venus, Planet.Mars };

    /// <summary>
    /// Days past the window every finder scans, so the coarsest sampling step
    /// (Mars, five days) still lands beyond the end. The overshoot is trimmed.
    /// </summary>
    private const int SamplingPadDays = 6;

    /// <summary>
    /// The season <paramref name="utc"/> falls in. Day counting uses LOCAL
    /// calendar days in <paramref name="zone"/>, because the screen prints the
    /// counter beside local dates: day one is the calendar day the ingress
    /// renders as, not the first twenty-four hours after it.
    /// </summary>
    public static SeasonWindow Current(DateTime utc, TimeZoneInfo zone)
    {
        var ms = Instant.ToMs(utc);
        var (sign, _) = ZodiacMath.LongitudeToSign(Ephemeris.LongitudeAtMs(Planet.Sun, ms));
        var signIdx = (int)sign;
        var startTarget = signIdx * 30.0;
        var endTarget = ((signIdx + 1) % 12) * 30.0;

        var searchFrom = Instant.FromMs(ms - 40 * Instant.MsPerDay);
        var startHit = CosineKitty.Astronomy.SearchSunLongitude(startTarget, new AstroTime(searchFrom), 45);
        var endHit = CosineKitty.Astronomy.SearchSunLongitude(endTarget, new AstroTime(Instant.FromMs(ms)), 45);

        var start = startHit is null ? Instant.FromMs(ms - 15 * Instant.MsPerDay) : SkyEvents.JsDate(startHit);
        var end = endHit is null ? Instant.FromMs(ms + 15 * Instant.MsPerDay) : SkyEvents.JsDate(endHit);
        var at = Instant.FromMs(ms);

        var totalDays = Math.Max(1, LocalDayIndex(start, end, zone) + 1);
        var dayOfSeason = Math.Min(totalDays, Math.Max(1, LocalDayIndex(start, at, zone) + 1));
        return new SeasonWindow(sign, start, end, dayOfSeason, totalDays, Math.Max(0, totalDays - dayOfSeason));
    }

    /// <summary>Whole local calendar days from one instant's date to another's.</summary>
    public static int LocalDayIndex(DateTime fromUtc, DateTime toUtc, TimeZoneInfo zone)
    {
        var a = TimeZoneInfo.ConvertTimeFromUtc(Ephemeris.AsUtc(fromUtc), zone).Date;
        var b = TimeZoneInfo.ConvertTimeFromUtc(Ephemeris.AsUtc(toUtc), zone).Date;
        return (int)Math.Round((b - a).TotalDays);
    }

    /// <summary>One scan of the sky across the window, trimmed to its end.</summary>
    public static SeasonSkyEvents SkyEventsIn(SeasonWindow window)
    {
        var days = (int)Math.Ceiling((Instant.ToMs(window.End) - Instant.ToMs(window.Start)) / Instant.MsPerDay)
                   + SamplingPadDays;
        return new SeasonSkyEvents(
            SkyEvents.MoonQuarters(window.Start, days).Where(e => e.Date <= window.End).ToList(),
            SkyEvents.Eclipses(window.Start, days).Where(e => e.Date <= window.End).ToList(),
            SkyEvents.Stations(window.Start, days).Where(e => e.Date <= window.End).ToList(),
            SkyEvents.Ingresses(window.Start, days, IngressPlanets).Where(e => e.Date <= window.End).ToList());
    }
}
