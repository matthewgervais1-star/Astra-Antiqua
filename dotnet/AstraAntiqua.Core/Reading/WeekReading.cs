using AstraAntiqua.Core.Astronomy;
using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Forecast;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Reading;

public enum WeekTone { Harmony, Tension, Quiet }

/// <summary>Rome alone flags its days: fastus, nefastus, comitialis.</summary>
public enum RomeDayFlag { F, N, C }

public enum ShorthandKind { Aspect, Ingress, Quiet }

/// <summary>
/// The day's shorthand as data, for the screen to draw: an aspect's two bodies
/// and its glyph, an ingress's body and sign, or nothing on a quiet day.
/// </summary>
public sealed record WeekShorthand(
    ShorthandKind Kind,
    Planet? A = null,
    AspectKind? Aspect = null,
    Planet? B = null,
    bool Tight = false,
    Planet? Planet = null,
    ZodiacSign? Sign = null);

/// <summary>One day of the week strip.</summary>
public sealed record WeekDay(
    DateTime Date,
    DateTime LocalDate,
    string Label,
    bool IsToday,
    string? Headline,
    string Line,
    WeekShorthand Shorthand,
    WeekTone Tone,
    RomeDayFlag? Flag);

/// <summary>
/// Port of buildWeekDays in web/src/lib/weekReading.ts. Each row reads the
/// sky at 00:00 UTC on its calendar date, the instant the day page reads. The
/// day's figure is the tightest aspect touching a fast mover inside 1.2°,
/// flagged tight under half a degree; a figure that holds from the row above
/// prints the culture's holds line in place of a second headline. The line is
/// the decree's meaning and consequence. Without a figure, an ingress that
/// day; without that, the culture's quiet headline and line.
/// </summary>
public static class WeekReading
{
    private const double EventOrb = 1.2;

    /// <summary>One ingress scan for the week, buffered past its end for the coarsest step.</summary>
    private const int IngressScanDays = 9;

    private static readonly HashSet<Planet> FastBodies = new()
    {
        Planet.Sun, Planet.Moon, Planet.Mercury, Planet.Venus, Planet.Mars,
    };

    /// <summary>The Monday, local calendar, of the week a local date falls in (web's mondayOf).</summary>
    public static DateTime MondayOf(DateTime localDate)
    {
        var day = (int)localDate.DayOfWeek;
        var diff = day == 0 ? -6 : 1 - day;
        return localDate.Date.AddDays(diff);
    }

    /// <summary>
    /// The seven days from <paramref name="weekStartLocal"/>, a local calendar
    /// date in <paramref name="zone"/> (normally a Monday).
    /// </summary>
    public static IReadOnlyList<WeekDay> Build(
        Culture culture,
        DateTime weekStartLocal,
        TimeZoneInfo zone,
        DateTime nowUtc,
        ContentStore store)
    {
        var banks = store.Banks;
        var startLocal = weekStartLocal.Date;
        var todayLocal = TimeZoneInfo.ConvertTimeFromUtc(Ephemeris.AsUtc(nowUtc), zone).Date;
        var weekIngresses = SkyEvents.Ingresses(LocalMidnightUtc(startLocal, zone), IngressScanDays);

        var days = new List<WeekDay>();
        Aspect? previous = null;
        for (var i = 0; i < 7; i++)
        {
            var dateLocal = startLocal.AddDays(i);
            // 00:00 UTC on the row's calendar date, the instant the day page reads.
            var instant = new DateTime(dateLocal.Year, dateLocal.Month, dateLocal.Day, 0, 0, 0, DateTimeKind.Utc);
            var chart = Ephemeris.ComputeChart(instant);

            // OrderBy is stable, so equal orbs keep detection order.
            var tightest = AspectDetector.Detect(chart, store.AspectRules)
                .Where(a => a.Orb < EventOrb && (FastBodies.Contains(a.A) || FastBodies.Contains(a.B)))
                .OrderBy(a => a.Orb)
                .FirstOrDefault();
            var holds = tightest is not null && previous is not null
                && tightest.A == previous.A && tightest.B == previous.B && tightest.Kind == previous.Kind;
            previous = tightest;

            var dayStart = LocalMidnightUtc(dateLocal, zone);
            var dayEnd = Instant.AddDays(dayStart, 1);
            var dayIngress = weekIngresses.FirstOrDefault(e => e.Date >= dayStart && e.Date < dayEnd);

            string? headline;
            string line;
            WeekShorthand shorthand;
            WeekTone tone;
            var tight = false;

            if (tightest is not null)
            {
                tight = tightest.Orb < store.Day.TightOrb;
                tone = AspectKinds.IsHard(tightest.Kind) ? WeekTone.Tension : WeekTone.Harmony;
                headline = holds
                    ? store.Day.GetDecree(culture).Holds
                    : Decree.Headline(culture, tightest.A, tightest.B, tightest.Kind, store);
                var dayNumber = Decree.UtcDayNumber(instant);
                line = Decree.Meaning(culture, tightest.A, tightest.B, tightest.Kind, tightest.Orb, dayNumber, store)
                       + " " + Decree.Consequence(culture, tightest.A, tightest.B, tightest.Kind, store);
                shorthand = new WeekShorthand(ShorthandKind.Aspect, A: tightest.A, Aspect: tightest.Kind, B: tightest.B, Tight: tight);
            }
            else if (dayIngress is not null)
            {
                tone = WeekTone.Harmony;
                headline = null;
                var deity = store.GetDeity(culture, dayIngress.Planet).Name;
                var signWord = Format.ProperCase(banks.SignPhrase(dayIngress.ToSign));
                line = $"{deity} {banks.IngressVerb(culture)} the {signWord}. " +
                       banks.IngressFrame(culture, banks.DeityCharge(culture, dayIngress.Planet));
                shorthand = new WeekShorthand(ShorthandKind.Ingress, Planet: dayIngress.Planet, Sign: dayIngress.ToSign);
            }
            else
            {
                tone = WeekTone.Quiet;
                headline = store.Day.QuietHeadline(culture);
                line = store.Day.QuietLine(culture);
                shorthand = new WeekShorthand(ShorthandKind.Quiet);
            }

            RomeDayFlag? flag = culture == Culture.Rome
                ? tone == WeekTone.Tension ? (tight ? RomeDayFlag.N : RomeDayFlag.C) : RomeDayFlag.F
                : null;

            days.Add(new WeekDay(
                dayStart,
                dateLocal,
                $"{Format.Weekday(dateLocal)} {dateLocal.Day}",
                dateLocal == todayLocal,
                headline,
                line,
                shorthand,
                tone,
                flag));
        }
        return days;
    }

    /// <summary>The UTC instant of local midnight on a calendar date in a zone.</summary>
    public static DateTime LocalMidnightUtc(DateTime localDate, TimeZoneInfo zone)
    {
        var local = DateTime.SpecifyKind(localDate.Date, DateTimeKind.Unspecified);
        // A midnight skipped by a DST change does not exist; JavaScript's Date
        // then moves forward to the first valid instant, and so does this.
        while (zone.IsInvalidTime(local)) local = local.AddMinutes(30);
        return TimeZoneInfo.ConvertTimeToUtc(local, zone);
    }
}
