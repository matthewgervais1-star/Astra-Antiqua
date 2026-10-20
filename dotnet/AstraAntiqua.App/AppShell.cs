using AstraAntiqua.App.Pages;

namespace AstraAntiqua.App;

/// <summary>
/// The five tabs: today, the longer horizons, the long transits, the chart,
/// and everything else. Each tab's icon is a body glyph in the symbols face,
/// so the bar needs no image assets. The shell takes the culture's ground and
/// accent, and is rebuilt whole when the culture changes.
/// </summary>
public sealed class AppShell : Shell
{
    public AppShell()
    {
        var ground = Ink.Ground();
        var accent = Ink.Accent();
        Shell.SetBackgroundColor(this, ground);
        Shell.SetForegroundColor(this, accent);
        Shell.SetTitleColor(this, Ink.Bone);
        Shell.SetTabBarBackgroundColor(this, ground);
        Shell.SetTabBarForegroundColor(this, accent);
        Shell.SetTabBarTitleColor(this, accent);
        Shell.SetTabBarUnselectedColor(this, Ink.Dim);
        Shell.SetNavBarHasShadow(this, false);

        var tabs = new TabBar();
        tabs.Items.Add(Tab("Today", "☉", () => new DayPage()));
        tabs.Items.Add(Tab("Horizons", "☽", () => new HorizonsPage()));
        tabs.Items.Add(Tab("Transits", "♄", () => new TransitsPage()));
        tabs.Items.Add(Tab("Chart", "♃", () => new PlacementsPage()));
        tabs.Items.Add(Tab("More", "☿", () => new MorePage()));
        Items.Add(tabs);
    }

    private static ShellContent Tab(string title, string glyph, Func<Page> make) => new()
    {
        Title = title,
        // No Color: the tab bar tints the icon, accent when selected and dim when not.
        Icon = new FontImageSource { Glyph = glyph, FontFamily = Ink.Symbols, Size = 22 },
        ContentTemplate = new DataTemplate(() => make()),
    };
}
