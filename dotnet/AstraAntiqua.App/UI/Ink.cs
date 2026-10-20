using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.App;

/// <summary>
/// "The Instrument in the Temple": one flat ground and one muted accent per
/// culture, bone and prose inks, two signal colours, and 1px rules. The
/// grounds and accents come from shared/content/palettes.json; the inks are
/// the values web's tokens and Android's theme (ui/theme/Color.kt) share.
/// No gradients, no glass, no glow.
/// </summary>
public static class Ink
{
    // Faces, by alias (registered in MauiProgram).
    public const string Display = "Cinzel";
    public const string DisplayStrong = "CinzelSemiBold";
    public const string Prose = "Spectral";
    public const string ProseItalic = "SpectralItalic";
    public const string ProseLight = "SpectralLight";
    public const string Mono = "PlexMono";
    public const string MonoStrong = "PlexMonoMedium";
    public const string Symbols = "NotoSymbols";

    // Inks.
    public static readonly Color Bone = Color.FromArgb("#E6DECC");
    public static readonly Color ProseInk = Color.FromArgb("#D9D1BF");
    public static readonly Color Dim = Color.FromArgb("#9A917D");
    public static readonly Color Faint = Color.FromArgb("#6F6B60");

    // Signals. Conflict also carries retrograde and destructive actions.
    public static readonly Color Harmony = Color.FromArgb("#B59A55");
    public static readonly Color Conflict = Color.FromArgb("#B56B71");

    // Rules: 1px only, at two weights.
    public static readonly Color Rule = Color.FromArgb("#29E6DECC");
    public static readonly Color RuleRow = Color.FromArgb("#1CE6DECC");

    private static Palette PaletteFor(Culture? culture)
        => culture is { } c ? ContentStore.Shared.GetPalette(c) : ContentStore.Shared.NeutralPalette;

    public static Color Ground(Culture? culture) => Color.FromArgb(PaletteFor(culture).Ground);

    public static Color Accent(Culture? culture) => Color.FromArgb(PaletteFor(culture).Accent);

    /// <summary>The culture in force, or neutral before one is chosen.</summary>
    public static Color Ground() => Ground(AppState.Current.Culture);

    public static Color Accent() => Accent(AppState.Current.Culture);
}
