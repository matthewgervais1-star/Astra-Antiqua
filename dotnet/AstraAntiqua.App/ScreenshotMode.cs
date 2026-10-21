using AstraAntiqua.App.Pages;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.App;

/// <summary>
/// Opens one named screen at launch, for the CI smoke run that boots an iOS
/// simulator and photographs every screen (.github/workflows/ios.yml). The
/// simulator passes ASTRA_SCREEN to the app through
/// `SIMCTL_CHILD_ASTRA_SCREEN=… xcrun simctl launch`. Nothing on a phone can
/// set it, so outside that run this does nothing.
/// </summary>
public static class ScreenshotMode
{
    public static string? Requested => Environment.GetEnvironmentVariable("ASTRA_SCREEN");

    /// <summary>The page a screen name opens over the tabs, or null for the tab root.</summary>
    public static Page? PageFor(string screen) => screen switch
    {
        "week" => new HorizonsPage(HorizonsPage.Horizon.Week),
        "season" => new HorizonsPage(HorizonsPage.Horizon.Season),
        "year" => new HorizonsPage(HorizonsPage.Horizon.Year),
        "transits" => new TransitsPage(),
        "chart" => new PlacementsPage(),
        "placement-sun" => new PlacementPage(Planet.Sun),
        "voices" => new VoicesPage(),
        "voice-egypt" => new VoicePage(Culture.Egypt),
        "voice-canaan" => new VoicePage(Culture.Canaan),
        "voice-carthage" => new VoicePage(Culture.Carthage),
        "matrix" => new MatrixPage(),
        "method" => new MethodPage(),
        "learn" => new LearnPage(),
        "learn-aspects" => AppState.Current.Store.Learn.Sections
            .Where(s => s.Table == "ASPECTS")
            .Select(s => (Page)new LearnSectionPage(s))
            .FirstOrDefault(),
        "forecast" => new ForecastPage(),
        "synastry" => new SynastryPage(),
        "more" => new MorePage(),
        _ => null,
    };

    /// <summary>Pushes the requested screen once the shell is on screen.</summary>
    public static void Apply(Shell shell)
    {
        if (Requested is not { Length: > 0 } screen || PageFor(screen) is not { } page) return;
        shell.Loaded += async (_, _) =>
        {
            try
            {
                await shell.Navigation.PushAsync(page, animated: false);
            }
            catch (Exception)
            {
                // A failed push leaves the day on screen, which the screenshot shows.
            }
        };
    }
}
