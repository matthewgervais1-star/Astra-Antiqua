using AstraAntiqua.Core.Forecast;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.App.Pages;

/// <summary>
/// Every long-transit span: the five slow bodies against the Sun, the Moon
/// and the rising degree, from a year back to roughly two years ahead.
/// </summary>
public sealed class TransitsPage : SkyPage
{
    public TransitsPage() : base("Transits") { }

    protected override async Task BuildAsync(VerticalStackLayout column)
    {
        column.Add(Ui.NaveHead("Read against your own sky", "The long transits"));
        if (State.Chart is null)
        {
            AddNeedsChart(column,
                "A long transit is scored against your own sky, the chart cast once at the hour of your birth and kept. There is no chart on this device.");
            return;
        }

        var working = Ui.Working("Computing the sky…");
        column.Add(working);
        var spans = await State.SpansAsync();
        column.Remove(working);

        var now = DateTime.UtcNow;
        AddGroup(column, "Open now", spans.Where(s => s.Start <= now && s.End >= now).ToList(), now);
        AddGroup(column, "Ahead", spans.Where(s => s.Start > now).ToList(), now);
        AddGroup(column, "Behind", spans.Where(s => s.End < now).OrderByDescending(s => s.End).ToList(), now);

        column.Add(Ui.Panel(Ui.Caption(
            $"A span holds while the slow body stays within {TransitSpans.SpanOrb:0}° of exact. " +
            "A slow body crosses a degree three times where it retrogrades; those passes belong to one transit.")));
    }

    private void AddGroup(VerticalStackLayout column, string label, IReadOnlyList<TransitSpan> spans, DateTime now)
    {
        if (spans.Count == 0) return;
        column.Add(Ui.Divider(label));
        foreach (var span in spans)
        {
            var tone = TransitSpans.Tone(span);
            var ahead = span.Passes.Count(p => p > now);
            var text = Ui.Column(4);
            text.Add(Ui.Title($"{Deity(span.TransitPlanet)} {Store.Banks.AspectVerb(Culture, span.Kind)} {NatalPointLabel(span.NatalKey)}", 17));
            text.Add(Ui.Caption(
                $"{MonthYear(span.Start)} → {MonthYear(span.End)} · {span.Passes.Count} exact · {ahead} ahead · {(tone == SpanTone.Ease ? "ease" : "tension")}",
                color: tone == SpanTone.Ease ? Ink.Harmony : Ink.Conflict));
            var picked = span;
            column.Add(Ui.Row(text, () => Push(new TransitDetailPage(picked))));
        }
    }
}

/// <summary>One long transit: what meets what, from when to when, and every exact pass.</summary>
public sealed class TransitDetailPage : SkyPage
{
    private readonly TransitSpan _span;

    public TransitDetailPage(TransitSpan span) : base("A long transit")
    {
        _span = span;
    }

    protected override Task BuildAsync(VerticalStackLayout column)
    {
        var span = _span;
        var deity = Store.GetDeity(Culture, span.TransitPlanet);
        var natal = NatalPointLabel(span.NatalKey);
        var verb = Store.Banks.AspectVerb(Culture, span.Kind);
        var now = DateTime.UtcNow;

        column.Add(Ui.NaveHead(
            $"{Store.GetCultureCopy(Culture).Label} · a long transit",
            $"{deity.Name} {verb} {natal}",
            emblem: new GlyphView(Culture, span.TransitPlanet, 44, Ink.Accent())));

        column.Add(Progress(span, now));

        column.Add(Ui.Divider("What is meeting what"));
        column.Add(new ContentView
        {
            Padding = Ui.Inset,
            Content = Ui.Prose(
                $"{deity.Name}, {deity.Epithet}, holds within {TransitSpans.SpanOrb:0} degrees of exact against {natal} " +
                $"from {MonthYear(span.Start)} to {MonthYear(span.End)}. Nothing here is forecast: the dates are the ephemeris read forward."),
        });

        if (span.NatalKey is "sun" or "moon")
        {
            var natalPlanet = span.NatalKey == "sun" ? Planet.Sun : Planet.Moon;
            var banks = Store.Banks;
            column.Add(new ContentView
            {
                Padding = Ui.Inset,
                Content = Ui.Prose(
                    banks.AspectFrame(Culture, span.Kind, banks.DeityCharge(Culture, span.TransitPlanet), banks.DeityCharge(Culture, natalPlanet)),
                    italic: true),
            });
        }

        column.Add(Ui.Divider("The exact passes"));
        foreach (var pass in span.Passes)
        {
            var row = new Grid
            {
                ColumnDefinitions = { new ColumnDefinition(GridLength.Star), new ColumnDefinition(GridLength.Auto) },
            };
            row.Add(Ui.Title(DayMonthYear(pass), 17), 0);
            row.Add(Ui.Caption(pass <= now ? "Passed" : "Ahead", color: pass <= now ? Ink.Dim : Ink.Accent()), 1);
            column.Add(Ui.Row(row));
        }

        column.Add(new ContentView
        {
            Padding = Ui.Inset,
            Content = Ui.Caption($"At first pass: {span.TransitSign} {Core.Reading.Format.Degree(span.TransitDegree)}"),
        });
        return Task.CompletedTask;
    }

    /// <summary>Where today sits inside the stretch, as a bar with a square marker.</summary>
    private static View Progress(TransitSpan span, DateTime now)
    {
        var total = (span.End - span.Start).TotalSeconds;
        var done = total <= 0 ? 1 : Math.Max(0, Math.Min(1, (now - span.Start).TotalSeconds / total));
        var bar = new Grid
        {
            HeightRequest = 10,
            Margin = new Thickness(Ui.Gutter, 8),
            ColumnDefinitions =
            {
                new ColumnDefinition(new GridLength(Math.Max(done, 0.0001), GridUnitType.Star)),
                new ColumnDefinition(GridLength.Auto),
                new ColumnDefinition(new GridLength(Math.Max(1 - done, 0.0001), GridUnitType.Star)),
            },
        };
        var left = Ui.Rule();
        left.Color = Ink.Accent();
        left.VerticalOptions = LayoutOptions.Center;
        var right = Ui.Rule();
        right.VerticalOptions = LayoutOptions.Center;
        bar.Add(left, 0);
        bar.Add(new BoxView { WidthRequest = 8, HeightRequest = 8, Color = Ink.Accent(), VerticalOptions = LayoutOptions.Center }, 1);
        bar.Add(right, 2);
        return bar;
    }
}
