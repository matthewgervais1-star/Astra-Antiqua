using AstraAntiqua.Core.Chart;
using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Forecast;
using AstraAntiqua.Core.Model;
using AstraAntiqua.Core.Reading;

namespace AstraAntiqua.App.Pages;

/// <summary>
/// The longer horizons behind the W / S / Y control the other surfaces carry:
/// the week in the culture's voice, the season the Sun's sign defines, and
/// the sky's year from the first of this month.
/// </summary>
public sealed class HorizonsPage : SkyPage
{
    public enum Horizon { Week, Season, Year }

    private Horizon _horizon;

    public HorizonsPage() : this(Horizon.Week) { }

    public HorizonsPage(Horizon horizon) : base("Horizons")
    {
        _horizon = horizon;
    }

    protected override async Task BuildAsync(VerticalStackLayout column)
    {
        column.Add(Switcher());
        switch (_horizon)
        {
            case Horizon.Week:
                await BuildWeekAsync(column);
                break;
            case Horizon.Season:
                await BuildSeasonAsync(column);
                break;
            default:
                await BuildYearAsync(column);
                break;
        }
    }

    private View Switcher()
    {
        var grid = new Grid
        {
            ColumnDefinitions =
            {
                new ColumnDefinition(GridLength.Star),
                new ColumnDefinition(GridLength.Star),
                new ColumnDefinition(GridLength.Star),
            },
            ColumnSpacing = 8,
            Padding = new Thickness(Ui.Gutter, 16, Ui.Gutter, 0),
        };
        var labels = new[] { ("W", "Week", Horizon.Week), ("S", "Season", Horizon.Season), ("Y", "Year", Horizon.Year) };
        for (var i = 0; i < labels.Length; i++)
        {
            var (letter, name, horizon) = labels[i];
            var on = horizon == _horizon;
            var button = new Button
            {
                Text = $"{letter} · {name.ToUpperInvariant()}",
                FontFamily = Ink.MonoStrong,
                FontSize = 11,
                CornerRadius = 0,
                BorderWidth = 1,
                BorderColor = on ? Ink.Accent() : Ink.Rule,
                TextColor = on ? Ink.Accent() : Ink.Dim,
                BackgroundColor = Colors.Transparent,
            };
            button.Clicked += async (_, _) =>
            {
                _horizon = horizon;
                await RebuildAsync();
            };
            grid.Add(button, i);
        }
        return grid;
    }

    private async Task BuildWeekAsync(VerticalStackLayout column)
    {
        var now = DateTime.UtcNow;
        var monday = WeekReading.MondayOf(Local(now).Date);
        var copy = Store.GetCultureCopy(Culture);
        column.Add(Ui.NaveHead($"{copy.Label} · the week", "The week",
            Format.EnDashRange(Format.DayMonth(monday), $"{Format.DayMonth(monday.AddDays(6))} {monday.AddDays(6).Year}")));

        var working = Ui.Working("Reading the week…");
        column.Add(working);
        var days = await Task.Run(() => WeekReading.Build(Culture, monday, Zone, now, Store));
        column.Remove(working);

        foreach (var day in days)
        {
            var row = Strips.DayLine(day);
            if (day.IsToday) column.Add(Ui.Panel(row, Ink.Accent()));
            else column.Add(Ui.Row(row));
        }
        if (Culture == Culture.Rome)
        {
            column.Add(new ContentView
            {
                Padding = Ui.Inset,
                Content = Ui.Caption("F fastus, lawful for public business · N nefastus · C comitialis"),
            });
        }
    }

    private async Task BuildSeasonAsync(VerticalStackLayout column)
    {
        var now = DateTime.UtcNow;
        var working = Ui.Working("Reading the season…");
        column.Add(working);
        var (window, sky) = await Task.Run(() =>
        {
            var w = Season.Current(now, Zone);
            return (w, Season.SkyEventsIn(w));
        });
        column.Remove(working);

        var copy = Store.GetCultureCopy(Culture);
        var signInfo = Store.GetSignInfo(window.Sign);
        column.Add(Ui.NaveHead(
            $"{copy.Label} · the season",
            $"The Sun in {window.Sign}",
            $"Day {window.DayOfSeason} of {window.TotalDays} · {DayMonthYear(window.Start)} to {DayMonthYear(window.End)}"));
        column.Add(new ContentView { Padding = Ui.Inset, Content = Ui.Prose(signInfo.Blurb) });

        if (State.Chart is { } chart)
        {
            var house = WholeSignHouses.HouseOfSign(window.Sign, (int)chart.AscendantSign);
            var meaning = Store.GetHouse(house);
            column.Add(Ui.Divider("Through your chart"));
            var text = Ui.Column(4);
            text.Add(Ui.Title($"The {meaning.Ordinal} house · {meaning.Title}"));
            text.Add(Ui.Prose(Store.Banks.SeasonHouseLine(Culture, house)));
            column.Add(new ContentView { Padding = Ui.Inset, Content = text });
        }

        column.Add(Ui.Divider("The season's sky"));
        var lines = new List<(DateTime Date, string Head, string Text, Color Color)>();
        foreach (var q in sky.MoonQuarters)
            lines.Add((q.Date, $"{q.Name} · {q.Sign}", $"{Deity(Planet.Moon)} at {Format.Degree(q.Degree)} {q.Sign}.", Ink.Dim));
        foreach (var e in sky.Eclipses)
            lines.Add((e.Date, $"{(e.Scope == EclipseScope.Solar ? "Solar" : "Lunar")} eclipse · {e.Kind}",
                $"At {Format.Degree(e.Degree)} {e.Sign}.", Ink.Accent()));
        foreach (var s in sky.Stations)
            lines.Add((s.Date, $"{PlanetLabel(s.Planet)} turns {(s.Kind == StationKind.Retrograde ? "retrograde" : "direct")}",
                $"{Deity(s.Planet)} stands still at {Format.Degree(s.Degree)} {s.Sign}.",
                s.Kind == StationKind.Retrograde ? Ink.Conflict : Ink.Harmony));
        foreach (var i in sky.Ingresses)
            lines.Add((i.Date, $"{PlanetLabel(i.Planet)} into {i.ToSign}", IngressLine(i), Ink.Harmony));
        AddEvents(column, lines);
    }

    private async Task BuildYearAsync(VerticalStackLayout column)
    {
        var now = DateTime.UtcNow;
        var working = Ui.Working("Reading the year…");
        column.Add(working);
        var year = await Task.Run(() => Horizons.Year(now, Zone));
        column.Remove(working);

        var lines = new List<(DateTime Date, string Head, string Text, Color Color)>();
        foreach (var i in year.Ingresses)
            lines.Add((i.Date, $"{PlanetLabel(i.Planet)} into {i.ToSign}", IngressLine(i), Ink.Harmony));
        foreach (var s in year.Stations)
            lines.Add((s.Date, $"{PlanetLabel(s.Planet)} turns {(s.Kind == StationKind.Retrograde ? "retrograde" : "direct")}",
                $"{Deity(s.Planet)} stands still at {Format.Degree(s.Degree)} {s.Sign}.",
                s.Kind == StationKind.Retrograde ? Ink.Conflict : Ink.Harmony));
        foreach (var e in year.Eclipses)
            lines.Add((e.Date, $"{(e.Scope == EclipseScope.Solar ? "Solar" : "Lunar")} eclipse · {e.Kind}",
                $"At {Format.Degree(e.Degree)} {e.Sign}.", Ink.Accent()));

        var copy = Store.GetCultureCopy(Culture);
        column.Add(Ui.NaveHead($"{copy.Label} · the year", "The year ahead",
            $"{DayMonthYear(year.Start)} onward · {lines.Count} turnings"));

        var byMonth = lines.OrderBy(l => l.Date).GroupBy(l => (Local(l.Date).Year, Local(l.Date).Month));
        foreach (var month in byMonth)
        {
            column.Add(Ui.Divider(Format.MonthYear(new DateTime(month.Key.Year, month.Key.Month, 1))));
            AddEvents(column, month.ToList(), sort: false);
        }
    }

    /// <summary>"Hermes goes on to the shrine of the Scorpion. {ruling}" (web's ingress line).</summary>
    private string IngressLine(IngressEvent i)
    {
        var banks = Store.Banks;
        return $"{Deity(i.Planet)} {banks.IngressVerb(Culture)} the {Format.ProperCase(banks.SignPhrase(i.ToSign))}. " +
               banks.IngressFrame(Culture, banks.DeityCharge(Culture, i.Planet));
    }

    private void AddEvents(VerticalStackLayout column, List<(DateTime Date, string Head, string Text, Color Color)> lines, bool sort = true)
    {
        if (lines.Count == 0)
        {
            column.Add(new ContentView { Padding = Ui.Inset, Content = Ui.Prose(Store.Banks.QuietLine(Culture)) });
            return;
        }
        foreach (var line in sort ? lines.OrderBy(l => l.Date).ToList() : lines)
        {
            var text = Ui.Column(4);
            text.Add(Ui.Caption($"{DayMonthYear(line.Date)} · {line.Head}", color: line.Color));
            text.Add(Ui.Prose(line.Text));
            column.Add(Ui.Row(text));
        }
    }
}
