using AstraAntiqua.Core.Chart;
using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.App.Pages;

/// <summary>
/// Two charts read against each other. This surface keeps one birth record,
/// so the second party is entered for the reading and never stored: the
/// bond lives only as long as the screen does.
/// </summary>
public sealed class SynastryPage : SkyPage
{
    private BirthEntry? _theirs;

    public SynastryPage() : base("Synastry") { }

    protected override async Task BuildAsync(VerticalStackLayout column)
    {
        column.Add(Ui.NaveHead("The bond between two skies", "Synastry"));
        var mine = State.Chart;
        var birth = State.Birth;
        if (mine is null || birth is null)
        {
            AddNeedsChart(column, "A synastry is read between two charts. There is none on this device yet.");
            return;
        }

        if (_theirs is null)
        {
            column.Add(new ContentView
            {
                Padding = Ui.Inset,
                Content = Ui.Prose(
                    $"Your chart is on this device as {birth.Name}. Enter the second person's birth to read the bond. Nothing about them is saved."),
            });
            column.Add(Ui.Action("Enter the second birth", () => Push(new BirthPage(BirthPage.Mode.Other, entry =>
            {
                _theirs = entry;
                return Task.CompletedTask;
            }))));
            return;
        }

        var theirs = _theirs;
        var working = Ui.Working("Reading the bond…");
        column.Add(working);
        var bonds = await Task.Run(() =>
        {
            var chart = NatalChart.Cast(theirs.Resolve().Utc, theirs.Input.Latitude, theirs.Input.Longitude, Store.AspectRules);
            return CrossAspects.Compute(mine.Longitudes, chart.Longitudes, Store.AspectRules)
                .OrderBy(b => b.Orb)
                .ToList();
        });
        column.Remove(working);

        column.Add(new ContentView
        {
            Padding = Ui.Inset,
            Content = Ui.Caption($"{birth.Name} and {theirs.Name} · {bonds.Count} contacts in orb", center: true),
        });
        if (theirs.Estimated)
        {
            column.Add(new ContentView
            {
                Padding = Ui.Inset,
                Content = Ui.Caption("The birth zone is estimated from the place's longitude · a transition date may be off by up to an hour",
                    color: Ink.Conflict),
            });
        }

        if (bonds.Count == 0)
            column.Add(Ui.Panel(Ui.Caption("Nothing between these two charts is in orb")));

        for (var i = 0; i < bonds.Count; i++)
        {
            if (i == 0) column.Add(Ui.Divider("The tightest five"));
            if (i == 5) column.Add(Ui.Divider("Every other contact"));
            var bond = bonds[i];
            var text = Ui.Column(4);
            text.Add(Ui.Caption(
                $"{Symbol(bond.From)} {Store.Banks.AspectGlyph(bond.Kind)} {Symbol(bond.To)} · {bond.Kind} · {bond.Orb:F1}°",
                color: AspectKinds.IsHard(bond.Kind) ? Ink.Conflict : Ink.Harmony));
            text.Add(Ui.Title($"Your {Deity(bond.From)} {Store.Banks.AspectVerb(Culture, bond.Kind)} their {Deity(bond.To)}.", 17));
            text.Add(Ui.Prose(Store.Banks.PairTheme(bond.From, bond.To)));
            column.Add(Ui.Row(text));
        }

        column.Add(Ui.Panel(Ui.Caption("Nothing about the second person is saved · this reading lives only as long as the screen does")));
        column.Add(Ui.Action("Read another bond", async () =>
        {
            _theirs = null;
            await RebuildAsync();
        }));
    }
}
