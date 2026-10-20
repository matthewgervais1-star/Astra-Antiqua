using AstraAntiqua.Core.Model;

namespace AstraAntiqua.App.Pages;

/// <summary>The seven Learn sections, as web lists them.</summary>
public sealed class LearnPage : SkyPage
{
    public LearnPage() : base("Learn") { }

    protected override Task BuildAsync(VerticalStackLayout column)
    {
        column.Add(Ui.NaveHead("How the reading is made", "Learn"));
        foreach (var section in Store.Learn.Sections.OrderBy(s => s.N))
        {
            var text = Ui.Column(4);
            text.Add(Ui.Caption($"{Core.Reading.Format.ToRoman(section.N)}", color: Ink.Accent()));
            text.Add(Ui.Title(section.Title, 19));
            text.Add(Ui.Prose(section.Blurb, color: Ink.Dim));
            var picked = section;
            column.Add(Ui.Row(text, () => Push(new LearnSectionPage(picked))));
        }
        return Task.CompletedTask;
    }
}

/// <summary>
/// One Learn section: web's own prose, block for block, then the reference
/// table the section is built around.
/// </summary>
public sealed class LearnSectionPage : SkyPage
{
    private readonly LearnSection _section;

    public LearnSectionPage(LearnSection section) : base(section.Title)
    {
        _section = section;
    }

    protected override Task BuildAsync(VerticalStackLayout column)
    {
        var label = Store.GetCultureCopy(Culture).Label;
        foreach (var block in _section.Blocks)
        {
            switch (block.Kind)
            {
                case "head":
                    column.Add(Ui.NaveHead((block.Kicker ?? "").Replace("%s", label), block.Text));
                    break;
                case "divider":
                    column.Add(Ui.Divider(block.Text));
                    break;
                case "heading":
                    column.Add(new ContentView { Padding = new Thickness(Ui.Gutter, 16, Ui.Gutter, 4), Content = Ui.Title(block.Text, 20) });
                    break;
                default:
                    column.Add(new ContentView { Padding = Ui.Inset, Content = Ui.Prose(block.Text) });
                    break;
            }
        }

        switch (_section.Table)
        {
            case "PLANET_VERBS":
                column.Add(Ui.Divider("The bodies as verbs"));
                foreach (var v in Store.Learn.PlanetVerbs)
                    column.Add(Ui.Row(Line(v.Symbol, v.Name, v.Verb)));
                break;
            case "ZODIAC_SIGNS":
                column.Add(Ui.Divider("The twelve signs"));
                foreach (var sign in ZodiacSigns.Order)
                {
                    var s = Store.GetSignInfo(sign);
                    var text = Ui.Column(4);
                    text.Add(Ui.Caption($"{s.Dates} · {s.Element} · {s.Modality}", color: Ink.Accent()));
                    text.Add(Ui.Title($"{s.Symbol} {s.Sign}", 19));
                    text.Add(Ui.Caption(s.Traits));
                    text.Add(Ui.Prose(s.Blurb));
                    column.Add(Ui.Row(text));
                }
                break;
            case "HOUSES":
                column.Add(Ui.Divider("The twelve houses"));
                for (var h = 1; h <= 12; h++)
                {
                    var house = Store.GetHouse(h);
                    var text = Ui.Column(4);
                    text.Add(Ui.Caption($"{house.Ordinal} house · {Store.Banks.HouseGroupName(Culture, h)}", color: Ink.Accent()));
                    text.Add(Ui.Title(house.Title, 18));
                    text.Add(Ui.Prose(house.Domain));
                    column.Add(Ui.Row(text));
                }
                break;
            case "HOUSE_SYSTEMS":
                column.Add(Ui.Divider("Three systems"));
                foreach (var system in Store.Learn.HouseSystems)
                {
                    var text = Ui.Column(4);
                    text.Add(Ui.Caption(system.Ours ? $"{system.Age} · the one this app uses" : system.Age,
                        color: system.Ours ? Ink.Accent() : Ink.Dim));
                    text.Add(Ui.Title(system.Name, 18));
                    text.Add(Ui.Prose(system.Body));
                    column.Add(Ui.Row(text));
                }
                break;
            case "ASPECTS":
                column.Add(Ui.Divider($"The five, as {label} rules them"));
                foreach (var rule in Store.AspectRules)
                {
                    var text = Ui.Column(4);
                    text.Add(Ui.Caption($"{Store.Banks.AspectGlyph(rule.Kind)} {rule.Kind} · {rule.Angle:0}° within {rule.Orb:0}°",
                        color: AspectKinds.IsHard(rule.Kind) ? Ink.Conflict : Ink.Harmony));
                    text.Add(Ui.Prose(Store.Learn.AspectGeometry[rule.Kind]));
                    text.Add(Ui.Prose(Store.Learn.AspectRulings[(Culture, rule.Kind)], italic: true));
                    column.Add(Ui.Row(text));
                }
                break;
        }
        return Task.CompletedTask;
    }

    private static View Line(string symbol, string name, string verb)
    {
        var grid = new Grid
        {
            ColumnDefinitions =
            {
                new ColumnDefinition(new GridLength(36)),
                new ColumnDefinition(new GridLength(110)),
                new ColumnDefinition(GridLength.Star),
            },
        };
        grid.Add(Ui.Symbol(symbol), 0);
        grid.Add(Ui.Title(name, 17), 1);
        grid.Add(Ui.Prose(verb, italic: true), 2);
        return grid;
    }
}
