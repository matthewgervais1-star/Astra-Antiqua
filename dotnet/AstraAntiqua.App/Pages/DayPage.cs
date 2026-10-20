using AstraAntiqua.Core.Astronomy;
using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Forecast;
using AstraAntiqua.Core.Model;
using AstraAntiqua.Core.Reading;

namespace AstraAntiqua.App.Pages;

/// <summary>
/// The day: today's line from the week reading, the Moon's phase, where the
/// season stands, today's sky against the natal chart, and the chart's own
/// summary with its two lights.
/// </summary>
public sealed class DayPage : SkyPage
{
    public DayPage() : base("Today") { }

    protected override async Task BuildAsync(VerticalStackLayout column)
    {
        var now = DateTime.UtcNow;
        var todayLocal = Local(now).Date;
        var copy = Store.GetCultureCopy(Culture);

        column.Add(Ui.NaveHead(
            $"{copy.Label} · {Format.Weekday(todayLocal)} {Format.DayMonth(todayLocal)} {todayLocal.Year}",
            "The day",
            emblem: new GlyphView(Culture, Planet.Sun, 40, Ink.Accent())));

        var working = Ui.Working("Reading the sky…");
        column.Add(working);
        var (week, moon, season) = await Task.Run(() => (
            WeekReading.Build(Culture, WeekReading.MondayOf(todayLocal), Zone, now, Store),
            MoonPhaseCalculator.Compute(now),
            Season.Current(now, Zone)));
        column.Remove(working);

        var today = week.FirstOrDefault(d => d.IsToday) ?? week[0];
        column.Add(Ui.Panel(Strips.DayLine(today), Ink.Accent()));

        column.Add(Ui.Divider("The Moon"));
        var moonText = Ui.Column(4);
        moonText.Add(Ui.Title($"{moon.Name} · {Math.Round(moon.IlluminationFraction * 100)}% lit"));
        moonText.Add(Ui.Caption($"{moon.NextQuarterName} on {DayMonthYear(moon.NextQuarterDate)}"));
        column.Add(new ContentView { Padding = Ui.Inset, Content = moonText });

        column.Add(Ui.Divider("The season"));
        var seasonText = Ui.Column(4);
        seasonText.Add(Ui.Title($"The Sun in {season.Sign}"));
        seasonText.Add(Ui.Caption($"Day {season.DayOfSeason} of {season.TotalDays} · {season.DaysRemaining} to go"));
        column.Add(Ui.Row(seasonText, () => Push(new HorizonsPage(HorizonsPage.Horizon.Season))));

        var chart = State.Chart;
        if (chart is null)
        {
            column.Add(Ui.Divider("Your sky"));
            AddNeedsChart(column,
                "The day above is the sky's own. Read against a birth, it becomes yours: the transits to your chart and your two lights.");
            return;
        }

        column.Add(Ui.Divider("The sky on your chart today"));
        var transits = CrossAspects.TopTransits(
            CrossAspects.Compute(Ephemeris.ComputeChart(now), chart.Longitudes, Store.AspectRules));
        if (transits.Count == 0)
        {
            column.Add(new ContentView { Padding = Ui.Inset, Content = Ui.Prose(Store.Banks.QuietLine(Culture)) });
        }
        foreach (var t in transits)
        {
            var text = Ui.Column(2);
            text.Add(Ui.Prose($"{Deity(t.From)} {Store.Banks.AspectVerb(Culture, t.Kind)} your {Deity(t.To)}."));
            text.Add(Ui.Caption(
                $"{PlanetLabel(t.From)} {Store.Banks.AspectGlyph(t.Kind)} natal {PlanetLabel(t.To)} · {t.Orb:F1}° from exact",
                color: AspectKinds.IsHard(t.Kind) ? Ink.Conflict : Ink.Dim));
            column.Add(Ui.Row(text));
        }

        var reading = State.Reading!;
        column.Add(Ui.Divider("Your chart"));
        column.Add(new ContentView { Padding = Ui.Inset, Content = Ui.Prose(reading.Summary, italic: true) });
        foreach (var planet in new[] { Planet.Sun, Planet.Moon })
        {
            var p = reading.Placements[(int)planet];
            var text = Ui.Column(4);
            text.Add(Ui.Kicker($"{PlanetLabel(planet)} in {p.Sign} · House {chart[planet].House}").Also(k => k.HorizontalTextAlignment = TextAlignment.Start));
            text.Add(Ui.Title($"{p.DeityName}, {p.DeityEpithet}"));
            text.Add(Ui.Prose(p.SignReading));
            column.Add(Ui.Row(text, () => Push(new PlacementPage(planet))));
        }
        column.Add(Ui.Action("All ten placements", () => Push(new PlacementsPage())));
    }
}

internal static class ViewExtensions
{
    /// <summary>Configures a view inline and returns it.</summary>
    public static T Also<T>(this T view, Action<T> configure)
    {
        configure(view);
        return view;
    }
}
