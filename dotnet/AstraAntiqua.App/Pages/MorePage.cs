using AstraAntiqua.Core.Chart;

namespace AstraAntiqua.App.Pages;

/// <summary>
/// Everything past the four tabs: the readings that need a second chart or a
/// year, the reference pages, and the record itself, which can be changed or
/// deleted from here.
/// </summary>
public sealed class MorePage : SkyPage
{
    private bool _confirmDelete;

    public MorePage() : base("More") { }

    protected override void OnDisappearing()
    {
        base.OnDisappearing();
        // A confirmation is for this visit only.
        _confirmDelete = false;
    }

    protected override Task BuildAsync(VerticalStackLayout column)
    {
        column.Add(Ui.NaveHead("Astra Antiqua", "More"));

        column.Add(Ui.Divider("Readings"));
        AddLink(column, "The year ahead", "Your solar return, long transits and stations", () => new ForecastPage());
        AddLink(column, "Synastry", "Two charts read against each other", () => new SynastryPage());

        column.Add(Ui.Divider("Reference"));
        AddLink(column, "Learn", "How the sky becomes a chart, in seven sections", () => new LearnPage());
        AddLink(column, "The five voices", "One sky, five theologies", () => new VoicesPage());
        AddLink(column, "The matrix", "Ten bodies across five pantheons", () => new MatrixPage());
        AddLink(column, "The method", "The numbers the app runs, and its sources", () => new MethodPage());
        AddLink(column, "The sky right now", "The ten bodies over Carthage, this minute", () => new MainPage());

        column.Add(Ui.Divider("Your record"));
        var birth = State.Birth;
        if (birth is not null)
        {
            var resolved = birth.Resolve();
            var text = Ui.Column(4);
            text.Add(Ui.Title(birth.Name));
            text.Add(Ui.Caption(
                $"{birth.Year:0000}-{birth.Month:00}-{birth.Day:00} {birth.Hour:00}:{birth.Minute:00} · {birth.PlaceName}"));
            text.Add(Ui.Caption(
                $"Read as {resolved.Utc:yyyy-MM-dd HH:mm} UTC · {BirthResolver.FormatOffset(resolved.OffsetMinutes)}" +
                (birth.ZoneEstimated ? " · zone estimated from longitude" : $" · {birth.TimeZone}"),
                color: birth.ZoneEstimated ? Ink.Conflict : Ink.Dim));
            column.Add(new ContentView { Padding = Ui.Inset, Content = text });
        }
        column.Add(Ui.Action("Change the culture", () => Push(new CulturePage(onboarding: false))));
        column.Add(Ui.Action(birth is null ? "Cast your chart" : "Edit the birth", () => Push(new BirthPage(BirthPage.Mode.Own))));

        if (birth is not null)
        {
            column.Add(new ContentView
            {
                Padding = Ui.Inset,
                Content = Ui.Caption("The record is kept on this device only. Nothing is sent anywhere, and deleting it here deletes the only copy."),
            });
            if (!_confirmDelete)
            {
                column.Add(Ui.Action("Delete the record", async () =>
                {
                    _confirmDelete = true;
                    await RebuildAsync();
                }, destructive: true));
            }
            else
            {
                column.Add(Ui.Action("Yes, delete it from this device", () =>
                {
                    _confirmDelete = false;
                    State.Forget();
                    App.ShowOnboarding();
                    return Task.CompletedTask;
                }, destructive: true));
                column.Add(Ui.Action("Keep it", async () =>
                {
                    _confirmDelete = false;
                    await RebuildAsync();
                }));
            }
        }
        return Task.CompletedTask;
    }

    private void AddLink(VerticalStackLayout column, string title, string sub, Func<Page> make)
    {
        var text = Ui.Column(2);
        text.Add(Ui.Title(title, 18));
        text.Add(Ui.Caption(sub));
        column.Add(Ui.Row(text, () => Push(make())));
    }
}
