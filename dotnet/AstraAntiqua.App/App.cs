using AstraAntiqua.App.Pages;

namespace AstraAntiqua.App;

/// <summary>
/// Opens on the five doorways the first time, and on the day once a birth is
/// on the device. A change of culture rebuilds the shell, so every screen
/// takes the new ground and accent at once.
/// </summary>
public class App : Application
{
    protected override Window CreateWindow(IActivationState? activationState)
        => new(Root());

    private static Page Root() => AppState.Current.Birth is null && AppState.Current.Culture is null
        ? Onboarding()
        : new AppShell();

    private static Page Onboarding() => new NavigationPage(new CulturePage(onboarding: true))
    {
        BarBackgroundColor = Ink.Ground(null),
        BarTextColor = Ink.Bone,
    };

    /// <summary>The tabs, rebuilt in the culture now in force.</summary>
    public static void ShowMain() => SetRoot(new AppShell());

    /// <summary>Back to the doorways, after the record is deleted.</summary>
    public static void ShowOnboarding() => SetRoot(Onboarding());

    private static void SetRoot(Page page)
    {
        var window = Current?.Windows.FirstOrDefault();
        if (window is not null) window.Page = page;
    }
}
