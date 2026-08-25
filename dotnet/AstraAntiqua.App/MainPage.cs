using AstraAntiqua.Core.Astronomy;
using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.App;

/// <summary>
/// Pipeline proof, not the product: renders the current sky over Carthage
/// (36.8529 N, 10.3233 E) as text straight from AstraAntiqua.Core — the same
/// chart math and content the golden tests hold to parity with web. The real
/// identity (docs/design/handoff) is a separate design pass.
/// </summary>
public class MainPage : ContentPage
{
    public MainPage()
    {
        Title = "Astra Antiqua";
        BackgroundColor = Color.FromArgb("#171310");

        var store = ContentStore.Load();
        var utc = DateTime.UtcNow;
        var chart = Ephemeris.ComputeChart(utc);
        var (asc, _) = AscendantCalculator.Compute(utc, 36.8529, 10.3233);
        var (ascSign, ascDegree) = ZodiacMath.LongitudeToSign(asc);
        var ascSignIndex = (int)ascSign;

        var lines = new VerticalStackLayout { Padding = 24, Spacing = 10 };
        lines.Add(Label("ASTRA ANTIQVA", "#B59A55", 22));
        lines.Add(Label($"The sky over Carthage · {utc:yyyy-MM-dd HH:mm} UTC", "#9A917D", 12));
        lines.Add(Label($"Ascendant {ascSign} {ascDegree:F1}°", "#E6DECC", 14));

        foreach (var planet in PlanetInfo.Order)
        {
            var (sign, degree) = ZodiacMath.LongitudeToSign(chart[planet]);
            var house = WholeSignHouses.HouseOfLongitude(chart[planet], ascSignIndex);
            var deity = store.GetDeity(Culture.Carthage, planet);
            var received = PlanetInfo.IsReceived(planet) ? " · received" : "";
            lines.Add(Label(
                $"{planet} · {sign} {degree:F1}° · House {house}{received}\n{deity.Name}, {deity.Epithet}",
                "#D9D1BF", 14));
        }

        Content = new ScrollView { Content = lines };
    }

    private static Label Label(string text, string hex, double size) => new()
    {
        Text = text,
        TextColor = Color.FromArgb(hex),
        FontSize = size,
    };
}
