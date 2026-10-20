using AstraAntiqua.Core.Model;

namespace AstraAntiqua.App.Pages;

/// <summary>The five voices: one computed sky, five theologies it passes through.</summary>
public sealed class VoicesPage : SkyPage
{
    public VoicesPage() : base("The five voices") { }

    protected override Task BuildAsync(VerticalStackLayout column)
    {
        column.Add(Ui.NaveHead("One sky · five theologies", "The five voices"));
        column.Add(new ContentView
        {
            Padding = Ui.Inset,
            Content = Ui.Prose("Every culture reads the same computed sky. What changes is the theology it must pass through."),
        });
        foreach (var culture in CultureIds.Order)
        {
            var copy = Store.GetCultureCopy(culture);
            var accent = Ink.Accent(culture);
            var grid = new Grid
            {
                ColumnDefinitions = { new ColumnDefinition(GridLength.Auto), new ColumnDefinition(GridLength.Star) },
                ColumnSpacing = 16,
            };
            grid.Add(new GlyphView(culture, Planet.Jupiter, 34, accent), 0);
            var text = Ui.Column(4);
            text.Add(Ui.Title(copy.Label, 21, accent));
            text.Add(Ui.Prose(copy.Tagline, italic: true));
            grid.Add(text, 1);
            var picked = culture;
            column.Add(Ui.Row(grid, () => Push(new VoicePage(picked))));
        }
        return Task.CompletedTask;
    }
}

/// <summary>One culture: its subtitle and the ten gods it seats, each with its glyph, epithet and line of myth.</summary>
public sealed class VoicePage : SkyPage
{
    private readonly Culture _culture;

    public VoicePage(Culture culture) : base(culture.ToString())
    {
        _culture = culture;
    }

    protected override Task BuildAsync(VerticalStackLayout column)
    {
        var copy = Store.GetCultureCopy(_culture);
        var accent = Ink.Accent(_culture);
        column.Add(Ui.NaveHead(copy.Tagline, copy.Label, copy.Subtitle));

        foreach (var planet in PlanetInfo.Order)
        {
            if (planet == Planet.Uranus) column.Add(Ui.Divider("Received"));
            var deity = Store.GetDeity(_culture, planet);
            var glyph = Store.GetGlyph(_culture, planet);
            var grid = new Grid
            {
                ColumnDefinitions = { new ColumnDefinition(new GridLength(44)), new ColumnDefinition(GridLength.Star) },
                ColumnSpacing = 12,
            };
            grid.Add(new GlyphView(_culture, planet, 34, PlanetInfo.IsReceived(planet) ? accent : Ink.Bone), 0);
            var text = Ui.Column(4);
            text.Add(Ui.Caption($"{PlanetLabel(planet)} · glyph {glyph.Status.ToString().ToLowerInvariant()}{(deity.Contested ? " · contested" : "")}",
                color: accent));
            text.Add(Ui.Title($"{deity.Name}, {deity.Epithet}", 17));
            text.Add(Ui.Prose(Store.Banks.Inscription(_culture, planet), italic: true));
            grid.Add(text, 1);
            column.Add(Ui.Row(grid));
        }

        if (State.Culture != _culture)
        {
            column.Add(Ui.Action($"Read in the voice of {copy.Label}", () =>
            {
                State.ChooseCulture(_culture);
                App.ShowMain();
                return Task.CompletedTask;
            }));
        }
        return Task.CompletedTask;
    }
}

/// <summary>The translation matrix: ten bodies across five pantheons.</summary>
public sealed class MatrixPage : SkyPage
{
    public MatrixPage() : base("The matrix") { }

    protected override Task BuildAsync(VerticalStackLayout column)
    {
        column.Add(Ui.NaveHead("One sky · ten bodies · five theologies", "The matrix"));
        foreach (var planet in PlanetInfo.Order)
        {
            if (planet == Planet.Uranus)
            {
                column.Add(Ui.Rule());
                column.Add(new ContentView
                {
                    Padding = Ui.Inset,
                    Content = Ui.Caption("The three below the rule are received: no ancient culture named them, and each is admitted under a native name."),
                });
            }
            var stack = Ui.Column(6);
            stack.Add(Ui.Caption($"{Symbol(planet)} {PlanetLabel(planet)}", color: Ink.Bone));
            foreach (var culture in CultureIds.Order)
            {
                var row = new Grid
                {
                    ColumnDefinitions =
                    {
                        new ColumnDefinition(new GridLength(30)),
                        new ColumnDefinition(new GridLength(92)),
                        new ColumnDefinition(GridLength.Star),
                    },
                    ColumnSpacing = 8,
                };
                row.Add(new GlyphView(culture, planet, 22, Ink.Accent(culture)), 0);
                row.Add(Ui.Caption(Store.GetCultureCopy(culture).Label, color: Ink.Accent(culture)), 1);
                row.Add(Ui.Title(Store.GetDeity(culture, planet).Name, 16), 2);
                stack.Add(row);
            }
            column.Add(Ui.Row(stack));
        }
        return Task.CompletedTask;
    }
}
