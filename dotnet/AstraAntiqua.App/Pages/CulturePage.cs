using AstraAntiqua.Core.Model;

namespace AstraAntiqua.App.Pages;

/// <summary>
/// The five doorways. One sky is computed; the culture chosen here is the
/// voice every screen speaks in until it is changed.
/// </summary>
public sealed class CulturePage : SkyPage
{
    private readonly bool _onboarding;

    public CulturePage(bool onboarding) : base("Choose your doorway")
    {
        _onboarding = onboarding;
    }

    protected override Task BuildAsync(VerticalStackLayout column)
    {
        column.Add(Ui.NaveHead("Astra Antiqua", "Choose your doorway"));
        column.Add(new ContentView
        {
            Padding = Ui.Inset,
            Content = Ui.Prose(
                "One sky is computed. Five ancient cultures read it, each in its own theology. " +
                "Choose yours: the app renders in that culture's voice until you change it."),
        });
        column.Add(Ui.Rule());

        foreach (var culture in CultureIds.Order)
        {
            var copy = Store.GetCultureCopy(culture);
            var accent = Ink.Accent(culture);
            var chosen = State.Culture == culture;

            var text = Ui.Column(4);
            text.Add(Ui.Title(copy.Label, 22, chosen ? accent : Ink.Bone));
            text.Add(Ui.Caption(copy.Tagline, color: accent));
            text.Add(Ui.Prose(copy.Subtitle, italic: true, color: Ink.Dim));

            var grid = new Grid
            {
                ColumnDefinitions = { new ColumnDefinition(GridLength.Auto), new ColumnDefinition(GridLength.Star) },
                ColumnSpacing = 16,
            };
            grid.Add(new GlyphView(culture, Planet.Sun, 36, accent), 0);
            grid.Add(text, 1);

            column.Add(Ui.Row(grid, async () =>
            {
                State.ChooseCulture(culture);
                if (_onboarding && State.Birth is null)
                    await Navigation.PushAsync(new BirthPage(BirthPage.Mode.Own));
                else
                    App.ShowMain();
            }));
        }
        return Task.CompletedTask;
    }
}
