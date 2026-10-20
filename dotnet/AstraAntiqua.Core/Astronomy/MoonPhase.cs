using AstraAntiqua.Core.Charting;
using CosineKitty;

namespace AstraAntiqua.Core.Astronomy;

/// <summary>The Moon's phase at an instant and the next quarter after it.</summary>
public sealed record MoonPhase(
    double Angle,
    double IlluminationFraction,
    string Name,
    bool IsWaxing,
    string NextQuarterName,
    DateTime NextQuarterDate);

/// <summary>Port of web/src/lib/moonPhase.ts.</summary>
public static class MoonPhaseCalculator
{
    private static double PhaseAngleAt(double ms)
    {
        var time = new AstroTime(Instant.FromMs(ms));
        var sun = CosineKitty.Astronomy.SunPosition(time).elon;
        var moon = CosineKitty.Astronomy.EclipticGeoMoon(time).lon;
        return ZodiacMath.Normalize(moon - sun);
    }

    private static string NameForAngle(double angle)
    {
        var a = ZodiacMath.Normalize(angle);
        if (a < 22.5) return "New Moon";
        if (a < 67.5) return "Waxing Crescent";
        if (a < 112.5) return "First Quarter";
        if (a < 157.5) return "Waxing Gibbous";
        if (a < 202.5) return "Full Moon";
        if (a < 247.5) return "Waning Gibbous";
        if (a < 292.5) return "Last Quarter";
        if (a < 337.5) return "Waning Crescent";
        return "New Moon";
    }

    private static (double Angle, string Name) NextQuarterAngle(double currentAngle)
    {
        var a = ZodiacMath.Normalize(currentAngle);
        if (a < 90) return (90, "First Quarter");
        if (a < 180) return (180, "Full Moon");
        if (a < 270) return (270, "Last Quarter");
        return (360, "New Moon");
    }

    /// <summary>Six-hour steps to the crossing, then thirty halvings: web's searchForAngle.</summary>
    private static double SearchForAngle(double startMs, double targetAngle)
    {
        const double stepMs = 6 * Instant.MsPerHour;
        const int maxIterations = 4 * 40;
        var prev = startMs;
        var prevDelta = ZodiacMath.Normalize(PhaseAngleAt(prev) - targetAngle);
        for (var i = 0; i < maxIterations; i++)
        {
            var next = Math.Truncate(prev) + stepMs;
            var nextDelta = ZodiacMath.Normalize(PhaseAngleAt(next) - targetAngle);
            if (prevDelta > 270 && nextDelta < 90)
            {
                var lo = Math.Truncate(prev);
                var hi = next;
                for (var j = 0; j < 30; j++)
                {
                    var mid = (lo + hi) / 2;
                    var midDelta = ZodiacMath.Normalize(PhaseAngleAt(mid) - targetAngle);
                    if (midDelta > 270) lo = mid;
                    else hi = mid;
                }
                return hi;
            }
            prev = next;
            prevDelta = nextDelta;
        }
        return prev;
    }

    public static MoonPhase Compute(DateTime utc)
    {
        var ms = Instant.ToMs(utc);
        var angle = PhaseAngleAt(ms);
        var illumination = (1 - Math.Cos(angle * Math.PI / 180.0)) / 2;
        var (nextAngle, nextName) = NextQuarterAngle(angle);
        var nextMs = SearchForAngle(ms, nextAngle);
        return new MoonPhase(
            angle,
            illumination,
            NameForAngle(angle),
            angle < 180,
            nextName,
            Instant.FromMs(nextMs));
    }
}
