using Microsoft.Maui.Hosting;

namespace AstraAntiqua.App;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("cinzel_regular.ttf", Ink.Display);
                fonts.AddFont("cinzel_semibold.ttf", Ink.DisplayStrong);
                fonts.AddFont("spectral_regular.ttf", Ink.Prose);
                fonts.AddFont("spectral_regular_italic.ttf", Ink.ProseItalic);
                fonts.AddFont("spectral_light.ttf", Ink.ProseLight);
                fonts.AddFont("ibm_plex_mono_regular.ttf", Ink.Mono);
                fonts.AddFont("ibm_plex_mono_medium.ttf", Ink.MonoStrong);
                fonts.AddFont("noto_sans_symbols.ttf", Ink.Symbols);
            });

#if IOS
        Platforms.iOS.IosZoneLookup.Register();
#endif

        return builder.Build();
    }
}
