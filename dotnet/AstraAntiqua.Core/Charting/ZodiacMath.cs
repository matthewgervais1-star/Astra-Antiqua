using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Charting;

/// <summary>Port of web/src/data/sampleChart.ts longitudeToSign.</summary>
public static class ZodiacMath
{
    /// <summary>Normalizes into [0, 360) exactly as web does.</summary>
    public static double Normalize(double longitude)
    {
        var wrapped = longitude % 360.0;
        return wrapped < 0 ? wrapped + 360.0 : wrapped;
    }

    /// <summary>
    /// 30-degree blocks from 0 Aries. Throws on non-finite input rather than
    /// fabricating an Aries placement with a NaN degree (web's contract).
    /// </summary>
    public static (ZodiacSign Sign, double Degree) LongitudeToSign(double longitude)
    {
        if (double.IsNaN(longitude) || double.IsInfinity(longitude))
            throw new ArgumentException(
                $"LongitudeToSign received a non-finite longitude: {longitude}", nameof(longitude));

        var normalized = Normalize(longitude);
        var signIndex = (int)Math.Floor(normalized / 30.0);
        if (signIndex > 11) signIndex = 11; // normalized can be exactly 360 only via rounding
        var degree = normalized - signIndex * 30.0;
        return ((ZodiacSign)signIndex, degree);
    }
}
