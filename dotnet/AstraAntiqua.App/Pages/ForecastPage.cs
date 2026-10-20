using AstraAntiqua.Core.Forecast;
using AstraAntiqua.Core.Reading;

namespace AstraAntiqua.App.Pages;

/// <summary>
/// The year ahead read against the reader's own chart: the solar return that
/// opens the personal year, the long transits open in the next twelve
/// months, and the stations inside them.
/// </summary>
public sealed class ForecastPage : SkyPage
{
    public ForecastPage() : base("The year ahead") { }

    protected override async Task BuildAsync(VerticalStackLayout column)
    {
        column.Add(Ui.NaveHead("Read against your own sky", "The year ahead"));
        var chart = State.Chart;
        if (chart is null)
        {
            AddNeedsChart(column,
                "A forecast is scored against your own sky, the chart cast once at the hour of your birth and kept. There is no chart on this device.");
            return;
        }

        var working = Ui.Working("Reading the year…");
        column.Add(working);
        var now = DateTime.UtcNow;
        var spans = await State.SpansAsync();
        var (solarReturn, stations) = await Task.Run(() =>
            (SkyEvents.SolarReturn(chart.Longitudes[Core.Model.Planet.Sun], now), SkyEvents.Stations(now, Horizons.YearDays)));
        column.Remove(working);

        if (solarReturn is not null)
        {
            column.Add(Ui.Divider("The solar return"));
            var text = Ui.Column(4);
            text.Add(Ui.Title(DayMonthYear(solarReturn.Date)));
            text.Add(Ui.Prose(
                $"The Sun stands again at {Format.Degree(solarReturn.Degree)} {solarReturn.Sign}, the degree it held at your birth. " +
                "Computed, not counted from the calendar: the return drifts against the date."));
            column.Add(new ContentView { Padding = Ui.Inset, Content = text });
        }

        var yearEnd = now.AddDays(Horizons.YearDays);
        var open = spans.Where(s => s.End >= now && s.Start <= yearEnd).ToList();
        column.Add(Ui.Divider($"{open.Count} long transits this year"));
        foreach (var span in open)
        {
            var tone = TransitSpans.Tone(span);
            var text = Ui.Column(4);
            text.Add(Ui.Title($"{Deity(span.TransitPlanet)} {Store.Banks.AspectVerb(Culture, span.Kind)} {NatalPointLabel(span.NatalKey)}", 17));
            text.Add(Ui.Caption($"{MonthYear(span.Start)} → {MonthYear(span.End)} · {span.Passes.Count} exact",
                color: tone == SpanTone.Ease ? Ink.Harmony : Ink.Conflict));
            var picked = span;
            column.Add(Ui.Row(text, () => Push(new TransitDetailPage(picked))));
        }

        column.Add(Ui.Divider("The stations"));
        foreach (var s in stations)
        {
            var text = Ui.Column(4);
            text.Add(Ui.Caption($"{DayMonthYear(s.Date)} · {PlanetLabel(s.Planet)} turns {(s.Kind == StationKind.Retrograde ? "retrograde" : "direct")}",
                color: s.Kind == StationKind.Retrograde ? Ink.Conflict : Ink.Harmony));
            text.Add(Ui.Prose($"{Deity(s.Planet)} stands still at {Format.Degree(s.Degree)} {s.Sign}."));
            column.Add(Ui.Row(text));
        }
    }
}
