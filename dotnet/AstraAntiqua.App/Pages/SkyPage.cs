using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Model;
using AstraAntiqua.Core.Reading;

namespace AstraAntiqua.App.Pages;

/// <summary>
/// The base every screen shares: the culture's ground, a scrolling column,
/// and a rebuild each time the page appears, so a change of culture or of
/// the birth record reaches every screen without any of them listening.
/// </summary>
public abstract class SkyPage : ContentPage
{
    private readonly ScrollView _scroll = new();
    private int _generation;

    protected SkyPage(string title)
    {
        Title = title;
        Content = _scroll;
    }

    protected AppState State => AppState.Current;
    protected ContentStore Store => AppState.Current.Store;
    protected Culture Culture => AppState.Current.CultureOrDefault;
    protected TimeZoneInfo Zone => AppState.Current.LocalZone;

    /// <summary>
    /// False for a page that holds input across appearances (a form), which
    /// is built once and kept.
    /// </summary>
    protected virtual bool RebuildOnAppear => true;

    protected override void OnAppearing()
    {
        base.OnAppearing();
        if (!RebuildOnAppear && _generation > 0) return;
        _ = RebuildAsync();
    }

    /// <summary>Builds the page. A later rebuild supersedes one still computing.</summary>
    protected async Task RebuildAsync()
    {
        var generation = ++_generation;
        BackgroundColor = Ink.Ground();
        var column = Ui.Column();
        _scroll.Content = column;
        try
        {
            await BuildAsync(column);
        }
        catch (Exception e)
        {
            if (generation != _generation) return;
            // Clear any "Reading the sky…" placeholder and say what failed.
            foreach (var spinner in column.Children.OfType<VerticalStackLayout>()
                         .Where(v => v.Children.OfType<ActivityIndicator>().Any()).ToList())
                column.Remove(spinner);
            column.Add(Ui.Failure(e));
        }
        if (generation != _generation) return;
        column.Add(new BoxView { HeightRequest = Ui.Chapter, Color = Colors.Transparent });
    }

    /// <summary>Appends the page's views. Long work belongs in Task.Run, awaited here.</summary>
    protected abstract Task BuildAsync(VerticalStackLayout column);

    protected string Deity(Planet planet) => Store.GetDeity(Culture, planet).Name;

    protected string Symbol(Planet planet) => Store.GetPlanetCopy(planet).Symbol;

    protected string PlanetLabel(Planet planet) => Store.GetPlanetCopy(planet).Label;

    protected DateTime Local(DateTime utc) => TimeZoneInfo.ConvertTimeFromUtc(utc, Zone);

    /// <summary>"23 JUL 2026"</summary>
    protected string DayMonthYear(DateTime utc)
    {
        var local = Local(utc);
        return $"{Format.DayMonth(local)} {local.Year}";
    }

    protected string MonthYear(DateTime utc) => Format.MonthYear(Local(utc));

    /// <summary>How a natal point is named in the culture: its deity, or "your rising".</summary>
    protected string NatalPointLabel(string key) => key switch
    {
        "sun" => Deity(Planet.Sun),
        "moon" => Deity(Planet.Moon),
        "asc" => "your rising",
        "mc" => "your midheaven",
        _ => key,
    };

    protected static Task Push(Page page) => Shell.Current is { } shell
        ? shell.Navigation.PushAsync(page)
        : Application.Current!.Windows[0].Page!.Navigation.PushAsync(page);

    /// <summary>The screen shown in place of a reading when no chart is on the device.</summary>
    protected void AddNeedsChart(VerticalStackLayout column, string why)
    {
        column.Add(Ui.Panel(Ui.Prose(why)));
        column.Add(Ui.Action("Cast your chart", () => Push(new BirthPage(BirthPage.Mode.Own))));
    }
}
