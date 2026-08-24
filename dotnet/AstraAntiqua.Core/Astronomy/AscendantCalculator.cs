using AstraAntiqua.Core.Charting;
using CosineKitty;

namespace AstraAntiqua.Core.Astronomy;

/// <summary>
/// Ascendant and Midheaven — a port of web/src/lib/ascendant.ts (Meeus
/// chapter 13 with mean obliquity of date, J2000 approximation).
/// </summary>
public static class AscendantCalculator
{
    private const double MeanObliquityDeg = 23.4392911;
    private const double DegToRad = Math.PI / 180.0;
    private const double RadToDeg = 180.0 / Math.PI;

    public static (double Ascendant, double Midheaven) Compute(
        DateTime utc, double latitudeDeg, double longitudeDeg)
    {
        var time = new AstroTime(Ephemeris.AsUtc(utc));

        // Greenwich Sidereal Time in hours; LST = GST + east-longitude hours.
        var gstHours = CosineKitty.Astronomy.SiderealTime(time);
        var lstHours = ((gstHours + longitudeDeg / 15.0) % 24.0 + 24.0) % 24.0;
        var ramcDeg = lstHours * 15.0;

        var ramcRad = ramcDeg * DegToRad;
        var oblRad = MeanObliquityDeg * DegToRad;
        var latRad = latitudeDeg * DegToRad;

        // tan(MC) = tan(RAMC) / cos(obliquity)
        var mcDeg = ZodiacMath.Normalize(
            Math.Atan2(Math.Sin(ramcRad), Math.Cos(ramcRad) * Math.Cos(oblRad)) * RadToDeg);

        // tan(ASC) = -cos(RAMC) / (sin(RAMC) * cos(obl) + tan(lat) * sin(obl))
        var numer = -Math.Cos(ramcRad);
        var denom = Math.Sin(ramcRad) * Math.Cos(oblRad) + Math.Tan(latRad) * Math.Sin(oblRad);
        var ascDeg = ZodiacMath.Normalize(Math.Atan2(numer, denom) * RadToDeg);

        // atan2 can land on the western horizon; the ASC must be east. Rotate
        // by 180 when ASC-MC exceeds half a circle (web's same check).
        if (ZodiacMath.Normalize(ascDeg - mcDeg) > 180.0)
            ascDeg = ZodiacMath.Normalize(ascDeg + 180.0);

        return (ascDeg, mcDeg);
    }
}
