using AstraAntiqua.Core.Forecast;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.App.Pages;

/// <summary>
/// The method: the numbers the app runs, which are the numbers it publishes,
/// and the sources and interpretive notes behind the five pantheons.
/// </summary>
public sealed class MethodPage : SkyPage
{
    public MethodPage() : base("The method") { }

    protected override Task BuildAsync(VerticalStackLayout column)
    {
        column.Add(Ui.NaveHead("What is computed, and how", "The method"));

        column.Add(Ui.Divider("The orb table"));
        foreach (var rule in Store.AspectRules)
        {
            var row = new Grid
            {
                ColumnDefinitions =
                {
                    new ColumnDefinition(new GridLength(36)),
                    new ColumnDefinition(GridLength.Star),
                    new ColumnDefinition(GridLength.Auto),
                },
            };
            row.Add(Ui.Symbol(Store.Banks.AspectGlyph(rule.Kind)), 0);
            row.Add(Ui.Title(rule.Kind.ToString(), 17), 1);
            row.Add(Ui.Caption($"{rule.Angle:0}° within {rule.Orb:0}°"), 2);
            column.Add(Ui.Row(row));
        }
        column.Add(new ContentView
        {
            Padding = Ui.Inset,
            Content = Ui.Caption(
                $"Tighter is louder · whole-sign houses · a long transit holds within {TransitSpans.SpanOrb:0}° of exact · " +
                "positions from the same ephemeris web and Android use"),
        });

        foreach (var section in Store.Method.Sections)
        {
            column.Add(Ui.Divider(section.Heading));
            foreach (var paragraph in section.Paragraphs)
                column.Add(new ContentView { Padding = Ui.Inset, Content = Ui.Prose(paragraph) });
        }

        column.Add(Ui.Divider("Notes on the five"));
        foreach (var note in Store.Method.Notes)
        {
            var text = Ui.Column(4);
            text.Add(Ui.Caption(string.Join(" · ", note.Cultures.Select(c => Store.GetCultureCopy(c).Label)), color: Ink.Accent()));
            text.Add(Ui.Title(note.Title, 17));
            text.Add(Ui.Prose(note.Body));
            column.Add(Ui.Row(text));
        }

        column.Add(Ui.Divider("Sources"));
        foreach (var source in Store.Method.Sources)
        {
            var text = Ui.Column(2);
            text.Add(Ui.Title($"{source.Author}, {source.Title}", 16));
            text.Add(Ui.Caption(source.Detail));
            column.Add(Ui.Row(text));
        }
        return Task.CompletedTask;
    }
}
