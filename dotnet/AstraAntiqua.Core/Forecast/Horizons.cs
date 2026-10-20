using AstraAntiqua.Core.Astronomy;
using AstraAntiqua.Core.Chart;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Forecast;

/// <summary>One line of the sky's own calendar, whatever kind of event it is.</summary>
public sealed record SkyLine(DateTime Date, string Kind, Planet Body, ZodiacSign Sign, string Text);

/// <summary>The year ahead read against one chart (web's /forecast).</summary>
public sealed record ForecastYear(
    DateTime Now,
    SolarReturnEvent? SolarReturn,
    IReadOnlyList<TransitSpan> Spans,
    IReadOnlyList<StationEvent> Stations);

/// <summary>
/// The windows each horizon reads, in one place. They are the windows the
/// Android surface and web's hooks use, so the three surfaces list the same
/// events for the same day.
/// </summary>
public static class Horizons
{
    /// <summary>Long transits start this far behind today, so a span already under way is found.</summary>
    public const int SpanLookbackDays = 420;

    /// <summary>And cover this many days from there (web's useSpans window).</summary>
    public const int SpanWindowDays = 1200;

    public const int YearDays = 365;

    /// <summary>Every long-transit span: the five slow bodies against Sun, Moon and Ascendant.</summary>
    public static IReadOnlyList<TransitSpan> Spans(NatalChart chart, DateTime nowUtc)
        => TransitSpans.Compute(
            chart.TransitPoints,
            SkyEvents.SlowBodies,
            Instant.AddDays(nowUtc, -SpanLookbackDays),
            SpanWindowDays);

    /// <summary>
    /// The year ahead: spans open at any point in the next twelve months,
    /// the stations inside them, and the solar return that opens the year.
    /// </summary>
    public static ForecastYear Forecast(NatalChart chart, DateTime nowUtc)
    {
        var yearEnd = Instant.AddDays(nowUtc, YearDays);
        var spans = Spans(chart, nowUtc).Where(s => s.End >= nowUtc && s.Start <= yearEnd).ToList();
        return new ForecastYear(
            nowUtc,
            SkyEvents.SolarReturn(chart.Longitudes[Planet.Sun], nowUtc),
            spans,
            SkyEvents.Stations(nowUtc, YearDays));
    }

    /// <summary>
    /// The sky's year from the first of this local month: every sign change but
    /// the Moon's (thirteen a year would bury the rest) and every station.
    /// </summary>
    public static (DateTime Start, IReadOnlyList<IngressEvent> Ingresses, IReadOnlyList<StationEvent> Stations,
        IReadOnlyList<EclipseEvent> Eclipses) Year(DateTime nowUtc, TimeZoneInfo zone)
    {
        var local = TimeZoneInfo.ConvertTimeFromUtc(Ephemeris.AsUtc(nowUtc), zone);
        var start = Reading.WeekReading.LocalMidnightUtc(new DateTime(local.Year, local.Month, 1), zone);
        var bodies = PlanetInfo.Order.Where(p => p != Planet.Moon).ToList();
        return (
            start,
            SkyEvents.Ingresses(start, YearDays, bodies),
            SkyEvents.Stations(start, YearDays),
            SkyEvents.Eclipses(start, YearDays));
    }
}
