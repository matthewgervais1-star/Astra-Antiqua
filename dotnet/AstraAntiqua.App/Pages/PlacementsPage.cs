using AstraAntiqua.Core.Model;
using AstraAntiqua.Core.Reading;

namespace AstraAntiqua.App.Pages;

/// <summary>The ten placements, fixed at the hour of birth, and the chart's aspects.</summary>
public sealed class PlacementsPage : SkyPage
{
    public PlacementsPage() : base("Your chart") { }

    protected override Task BuildAsync(VerticalStackLayout column)
    {
        column.Add(Ui.NaveHead("Fixed at the hour of your birth", "The placements"));
        var chart = State.Chart;
        var reading = State.Reading;
        if (chart is null || reading is null)
        {
            AddNeedsChart(column, "The placements are read from a chart cast at the hour of a birth. There is none on this device yet.");
            return Task.CompletedTask;
        }

        var birth = State.Birth!;
        column.Add(new ContentView
        {
            Padding = Ui.Inset,
            Content = Ui.Caption(
                $"{birth.Name} · {birth.PlaceName} · rising {chart.AscendantSign} {Format.Degree(Core.Charting.ZodiacMath.LongitudeToSign(chart.Ascendant).Degree)}",
                center: true),
        });
        column.Add(new ContentView { Padding = Ui.Inset, Content = Ui.Prose(reading.Summary, italic: true) });

        column.Add(Ui.Divider("Ten bodies"));
        foreach (var p in reading.Placements)
        {
            var body = chart[p.Planet];
            var grid = new Grid
            {
                ColumnDefinitions =
                {
                    new ColumnDefinition(new GridLength(44)),
                    new ColumnDefinition(GridLength.Star),
                    new ColumnDefinition(GridLength.Auto),
                },
                ColumnSpacing = 12,
            };
            var tint = PlanetInfo.IsReceived(p.Planet) ? Ink.Accent() : Ink.Bone;
            grid.Add(new GlyphView(Culture, p.Planet, 34, tint), 0);
            var text = Ui.Column(2);
            text.Add(Ui.Title(p.DeityName, 18));
            text.Add(Ui.Caption($"{PlanetLabel(p.Planet)} · {p.Sign} {Format.Degree(p.DegreeInSign)}{(body.Retrograde ? " · R" : "")}",
                color: body.Retrograde ? Ink.Conflict : Ink.Dim));
            grid.Add(text, 1);
            grid.Add(Ui.Caption($"House {Format.ToRoman(body.House)}"), 2);
            var planet = p.Planet;
            column.Add(Ui.Row(grid, () => Push(new PlacementPage(planet))));
        }
        column.Add(new ContentView
        {
            Padding = Ui.Inset,
            Content = Ui.Caption("Whole-sign houses · R is retrograde, read from the body's own velocity · nothing here is estimated"),
        });

        column.Add(Ui.Divider($"{reading.Aspects.Count} aspects"));
        foreach (var a in reading.Aspects)
        {
            var text = Ui.Column(4);
            text.Add(Ui.Caption(
                $"{Symbol(a.Aspect.A)} {Store.Banks.AspectGlyph(a.Aspect.Kind)} {Symbol(a.Aspect.B)} · {a.Aspect.Kind} · {a.Aspect.Orb:F1}°",
                color: AspectKinds.IsHard(a.Aspect.Kind) ? Ink.Conflict : Ink.Harmony));
            text.Add(Ui.Title(a.VerbLine, 17));
            text.Add(Ui.Prose(a.PairTheme));
            text.Add(Ui.Prose(a.CulturalReflection, italic: true, color: Ink.Dim));
            column.Add(Ui.Row(text));
        }
        return Task.CompletedTask;
    }
}
