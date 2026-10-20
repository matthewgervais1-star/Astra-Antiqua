using AstraAntiqua.Core.Model;
using AstraAntiqua.Core.Reading;

namespace AstraAntiqua.App.Pages;

/// <summary>
/// One placement: the deity the culture names it by, the line of myth under
/// the name, the body's domain, the universal sign reading, the house it
/// stands in, and the aspects it makes.
/// </summary>
public sealed class PlacementPage : SkyPage
{
    private readonly Planet _planet;

    public PlacementPage(Planet planet) : base(planet.ToString())
    {
        _planet = planet;
    }

    protected override Task BuildAsync(VerticalStackLayout column)
    {
        var chart = State.Chart;
        var reading = State.Reading;
        if (chart is null || reading is null)
        {
            AddNeedsChart(column, "There is no chart on this device yet.");
            return Task.CompletedTask;
        }

        var p = reading.Placements[(int)_planet];
        var body = chart[_planet];
        var glyph = Store.GetGlyph(Culture, _planet);
        var received = PlanetInfo.IsReceived(_planet);

        column.Add(Ui.NaveHead(
            $"{PlanetLabel(_planet)} in {p.Sign} · House {Format.ToRoman(body.House)}",
            p.DeityName,
            p.DeityEpithet,
            new GlyphView(Culture, _planet, 56, received ? Ink.Accent() : Ink.Bone)));
        column.Add(new ContentView
        {
            Padding = Ui.Inset,
            Content = Ui.Caption(
                $"{p.Sign} {Format.Degree(p.DegreeInSign)}{(body.Retrograde ? " · retrograde" : "")} · glyph {glyph.Status.ToString().ToLowerInvariant()}" +
                (received ? " · received" : ""),
                center: true),
        });

        column.Add(new ContentView { Padding = Ui.Inset, Content = Ui.Prose(p.CulturalLine, italic: true) });

        column.Add(Ui.Divider("What the body governs"));
        column.Add(new ContentView { Padding = Ui.Inset, Content = Ui.Prose(p.Domain) });

        column.Add(Ui.Divider($"In {p.Sign}"));
        column.Add(new ContentView { Padding = Ui.Inset, Content = Ui.Prose(p.SignReading) });

        var house = Store.GetHouse(body.House);
        column.Add(Ui.Divider($"In the {house.Ordinal} house"));
        var houseText = Ui.Column(4);
        houseText.Add(Ui.Title(house.Title));
        houseText.Add(Ui.Prose(Store.Banks.HouseReading(p.DeityName, _planet, house.Arena)));
        houseText.Add(Ui.Prose(house.Domain, color: Ink.Dim));
        column.Add(new ContentView { Padding = Ui.Inset, Content = houseText });

        var aspects = reading.Aspects.Where(a => a.Aspect.A == _planet || a.Aspect.B == _planet).ToList();
        if (aspects.Count > 0)
        {
            column.Add(Ui.Divider("The aspects it makes"));
            foreach (var a in aspects)
            {
                var text = Ui.Column(4);
                text.Add(Ui.Caption($"{a.Aspect.Kind} · {a.Aspect.Orb:F1}° from exact",
                    color: AspectKinds.IsHard(a.Aspect.Kind) ? Ink.Conflict : Ink.Harmony));
                text.Add(Ui.Title(a.VerbLine, 17));
                text.Add(Ui.Prose(a.PairTheme));
                column.Add(Ui.Row(text));
            }
        }

        // The deity's own note: the sources, any contest over the seat, and,
        // for a received body, the statement that the reception is modern work.
        var deity = Store.GetDeity(Culture, _planet);
        column.Add(Ui.Divider(deity.Contested ? "The record · contested" : "The record"));
        column.Add(new ContentView { Padding = Ui.Inset, Content = Ui.Prose(deity.Note, color: Ink.Dim) });
        return Task.CompletedTask;
    }
}
