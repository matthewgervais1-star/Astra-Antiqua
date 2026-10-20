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
    bool Exact = false,
    Planet? Planet = null,
    ZodiacSign? Sign = null);

/// <summary>One day of the week strip.</summary>
public sealed record WeekDay(
    DateTime Date,
    DateTime LocalDate,
    string Label,
    bool IsToday,
    string Line,
    WeekShorthand Shorthand,
    WeekTone Tone,
    RomeDayFlag? Flag);

/// <summary>
/// Port of buildWeekDays and composeAspectSentence in web/src/lib/weekReading.ts.
/// Each day's headline is the tightest sky aspect touching a fast mover,
/// inside 1.2°, marked exact under 0.35°; a pair that headlined earlier in
/// the week speaks again only when exact. Without one, an ingress that day;
/// without that, the culture's plain quiet line, and nothing invented.
/// </summary>
public static class WeekReading
{
    private const double EventOrb = 1.2;
    private const double ExactOrb = 0.35;

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

    /// <summary>"Hermes challenges Ares." A conjunction names the sign it happens in.</summary>
    public static string ComposeAspectSentence(
        Culture culture,
        Planet a,
        Planet b,
        AspectKind kind,
        bool exact,
        IReadOnlyDictionary<Planet, double> chart,
        ContentStore store,
        int variant = 0)
    {
        var banks = store.Banks;
        var deityA = store.GetDeity(culture, a).Name;
        var deityB = store.GetDeity(culture, b).Name;
        var signClause = kind == AspectKind.Conjunction
            ? $" in the {Format.ProperCase(banks.SignPhrase(ZodiacMath.LongitudeToSign(chart[a]).Sign))}"
            : "";
        var predicate = $"{banks.AspectVerb(culture, kind)} {deityB}{signClause}";
        return exact ? banks.ExactForm(culture, variant, deityA, predicate) : $"{deityA} {predicate}.";
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
        var usedPairs = new HashSet<(Planet, Planet)>();
        for (var i = 0; i < 7; i++)
        {
            var dateLocal = startLocal.AddDays(i);
            var noon = new DateTime(dateLocal.Year, dateLocal.Month, dateLocal.Day, 12, 0, 0, DateTimeKind.Utc);
            var chart = Ephemeris.ComputeChart(noon);

            var candidates = AspectDetector.Detect(chart, store.AspectRules)
                .Where(a => a.Orb < EventOrb && (FastBodies.Contains(a.A) || FastBodies.Contains(a.B)))
                .OrderBy(a => a.Orb)
                .ToList();
            Aspect? tightest = null;
            foreach (var aspect in candidates)
            {
                var pair = (aspect.A, aspect.B);
                if (usedPairs.Contains(pair) && aspect.Orb >= ExactOrb) continue;
                tightest = aspect;
                usedPairs.Add(pair);
                break;
            }

            var dayStart = LocalMidnightUtc(dateLocal, zone);
            var dayEnd = Instant.AddDays(dayStart, 1);
            var dayIngress = weekIngresses.FirstOrDefault(e => e.Date >= dayStart && e.Date < dayEnd);

            string line;
            WeekShorthand shorthand;
            WeekTone tone;
            var exact = false;

            if (tightest is not null)
            {
                exact = tightest.Orb < ExactOrb;
                tone = AspectKinds.IsHard(tightest.Kind) ? WeekTone.Tension : WeekTone.Harmony;
                var astro = ComposeAspectSentence(culture, tightest.A, tightest.B, tightest.Kind, exact, chart, store);
                var ruling = banks.AspectFrame(
                    culture,
                    tightest.Kind,
                    banks.DeityCharge(culture, tightest.A),
                    banks.DeityCharge(culture, tightest.B));
                line = $"{astro} {ruling}";
                shorthand = new WeekShorthand(ShorthandKind.Aspect, A: tightest.A, Aspect: tightest.Kind, B: tightest.B, Exact: exact);
            }
            else if (dayIngress is not null)
            {
                tone = WeekTone.Harmony;
                var deity = store.GetDeity(culture, dayIngress.Planet).Name;
                var signWord = Format.ProperCase(banks.SignPhrase(dayIngress.ToSign));
                line = $"{deity} {banks.IngressVerb(culture)} the {signWord}. " +
                       banks.IngressFrame(culture, banks.DeityCharge(culture, dayIngress.Planet));
                shorthand = new WeekShorthand(ShorthandKind.Ingress, Planet: dayIngress.Planet, Sign: dayIngress.ToSign);
            }
            else
            {
                tone = WeekTone.Quiet;
                line = banks.QuietLine(culture);
                shorthand = new WeekShorthand(ShorthandKind.Quiet);
            }

            RomeDayFlag? flag = culture == Culture.Rome
                ? tone == WeekTone.Tension ? (exact ? RomeDayFlag.N : RomeDayFlag.C) : RomeDayFlag.F
                : null;

            days.Add(new WeekDay(
                dayStart,
                dateLocal,
                $"{Format.Weekday(dateLocal)} {dateLocal.Day}",
                dateLocal == todayLocal,
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
